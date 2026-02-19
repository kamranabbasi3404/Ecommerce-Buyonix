const router = require("express").Router();
const Product = require('../models/product');
const User = require('../models/user');
const Seller = require('../models/seller');
const Interaction = require('../models/interaction');
const CFRecommender = require('../utils/cfRecommender');
const VisualSearchHelper = require('../utils/visualSearchHelper');
const fs = require('fs');
const path = require('path');

// Initialize CF recommender
const cfRecommender = new CFRecommender();

// Initialize Visual Search helper
const visualSearchHelper = new VisualSearchHelper();

// Get all products (for frontend home page) with pagination
router.get("/", async (req, res) => {
    try {
        // Get page and limit from query parameters, with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit parameters"
            });
        }

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Get total count of active products
        const totalProducts = await Product.countDocuments({ status: 'active' });

        // Fetch products with pagination
        const products = await Product.find({ status: 'active' })
            .populate('sellerId', 'storeName businessName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            products: products,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalProducts: totalProducts,
                limit: limit,
                hasNextPage: page < totalPages
            }
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching products"
        });
    }
});

// Get products by seller
router.get("/seller/:sellerId", async (req, res) => {
    try {
        const { sellerId } = req.params;
        const products = await Product.find({ sellerId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error("Get seller products error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching seller products"
        });
    }
});

// Get AI-powered personalized recommendations for a user
// Uses Collaborative Filtering (Matrix Factorization)
// NOTE: This route MUST be before /:id route to avoid being caught by the wildcard
router.get("/recommendations/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const numRecommendations = parseInt(req.query.num) || 5;

        // Initialize CF model on first call
        if (!cfRecommender.modelReady) {
            await cfRecommender.initialize();
        }

        // Get recommendations from CF model
        if (!cfRecommender.modelReady) {
            // CF model not available, return popular products as fallback
            const popularProducts = await Product.find({ status: 'active' })
                .populate('sellerId', 'storeName businessName')
                .sort({ rating: -1 })
                .limit(numRecommendations);

            return res.json({
                success: true,
                recommendations: popularProducts,
                source: 'popular_products_fallback'
            });
        }

        // Get CF recommendations
        const cfRecs = await cfRecommender.recommendForUser(userId, numRecommendations);

        // Fetch actual product details from database
        // CF model returns product_id numbers, convert to MongoDB ObjectId pattern
        const recommendations = [];

        for (const rec of cfRecs) {
            // Find product by ID
            const product = await Product.findById(rec.productId)
                .populate('sellerId', 'storeName businessName');

            if (product) {
                recommendations.push({
                    ...product.toObject(),
                    predictedRating: rec.predictedRating,
                    reason: 'Personalized recommendation based on user behavior'
                });
            }
        }

        // FALLBACK: If CF model returned empty (new user / no history), show popular products
        if (recommendations.length === 0) {
            const popularProducts = await Product.find({ status: 'active' })
                .populate('sellerId', 'storeName businessName')
                .sort({ rating: -1, reviewCount: -1 })
                .limit(numRecommendations);

            return res.json({
                success: true,
                count: popularProducts.length,
                recommendations: popularProducts.map(p => ({
                    ...p.toObject(),
                    reason: 'Trending product - try it out!'
                })),
                source: 'popular_products_fallback'
            });
        }

        res.json({
            success: true,
            count: recommendations.length,
            recommendations,
            source: 'collaborative_filtering_ai'
        });

    } catch (error) {
        console.error("Get recommendations error:", error);
        res.status(500).json({
            success: false,
            message: "Error getting recommendations",
            error: error.message
        });
    }
});

// Get single product by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'storeName businessName');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching product"
        });
    }
});

// Create new product
router.post("/", async (req, res) => {
    try {
        const {
            sellerId,
            name,
            description,
            category,
            price,
            originalPrice,
            discount,
            stock,
            images,
            colorVariants
        } = req.body;

        // Verify seller exists and is approved
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        if (seller.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: "Seller account must be approved to add products"
            });
        }

        // Calculate discount if originalPrice is provided
        let calculatedDiscount = discount || 0;
        if (originalPrice && originalPrice > price) {
            calculatedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
        }

        const product = new Product({
            sellerId,
            name,
            description,
            category,
            price,
            originalPrice: originalPrice || price,
            discount: calculatedDiscount,
            stock,
            images: images || [],
            colorVariants: colorVariants || [],
            status: stock > 0 ? 'active' : 'out_of_stock'
        });

        await product.save();

        // Auto-compute image embedding for fast visual search
        if (images && images.length > 0) {
            try {
                const features = await visualSearchHelper.extractFeatures(images[0]);
                await Product.findByIdAndUpdate(product._id, { imageEmbedding: features });
                console.log(`✅ Auto-computed embedding for new product: ${name}`);
            } catch (embeddingError) {
                // Non-critical - product still created, embedding can be computed later
                console.warn(`⚠️ Could not compute embedding for ${name}:`, embeddingError.message);
            }
        }

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: product
        });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating product"
        });
    }
});

// Update product
router.put("/:id", async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            originalPrice,
            discount,
            stock,
            images,
            colorVariants,
            status
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (category) product.category = category;
        if (price !== undefined) product.price = price;
        if (originalPrice !== undefined) product.originalPrice = originalPrice;
        if (discount !== undefined) product.discount = discount;
        if (stock !== undefined) {
            product.stock = stock;
            // Auto-update status based on stock only if status is not explicitly provided
            if (status === undefined) {
                if (stock === 0 && product.status === 'active') {
                    product.status = 'out_of_stock';
                } else if (stock > 0 && product.status === 'out_of_stock') {
                    product.status = 'active';
                }
            }
        }
        if (images) product.images = images;
        if (colorVariants !== undefined) product.colorVariants = colorVariants;
        if (status !== undefined) product.status = status;

        // Recalculate discount if prices changed
        if (originalPrice && price && originalPrice > price) {
            product.discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        }

        await product.save();

        // Re-compute embedding if images changed
        if (images && images.length > 0) {
            try {
                const features = await visualSearchHelper.extractFeatures(images[0]);
                await Product.findByIdAndUpdate(product._id, { imageEmbedding: features });
                console.log(`✅ Re-computed embedding for updated product: ${product.name}`);
            } catch (embeddingError) {
                console.warn(`⚠️ Could not re-compute embedding for ${product.name}:`, embeddingError.message);
            }
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: product
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating product"
        });
    }
});

// Delete product
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting product"
        });
    }
});

// Get model statistics (for debugging/reporting)
router.get("/ai/model-stats", async (req, res) => {
    try {
        if (!cfRecommender.modelReady) {
            await cfRecommender.initialize();
        }

        const stats = await cfRecommender.getModelStats();

        res.json({
            success: true,
            model: {
                type: 'Collaborative Filtering (SVD)',
                status: cfRecommender.modelReady ? 'ready' : 'not_ready',
                ...stats
            }
        });

    } catch (error) {
        console.error("Get model stats error:", error);
        res.status(500).json({
            success: false,
            message: "Error getting model statistics"
        });
    }
});

// Debug endpoint to check model training status and actual user/product counts
router.get("/ai/debug", async (req, res) => {
    try {
        // Get actual counts from database
        const actualUserCount = await User.countDocuments({});
        const actualProductCount = await Product.countDocuments({ status: 'active' });

        // Get model stats
        let modelStats = {};
        try {
            modelStats = await cfRecommender.getModelStats();
        } catch (error) {
            modelStats = { error: error.message };
        }

        res.json({
            success: true,
            debug: {
                // Actual database counts
                database: {
                    actualUsers: actualUserCount,
                    actualProducts: actualProductCount
                },
                // Model status
                model: {
                    isReady: cfRecommender.modelReady,
                    ...modelStats
                },
                // Comparison
                comparison: {
                    userCountMatch: actualUserCount === modelStats.n_users,
                    productCountMatch: actualProductCount === modelStats.n_products,
                    modelNeedsRetraining: actualUserCount !== modelStats.n_users || actualProductCount !== modelStats.n_products,
                    message: actualUserCount === modelStats.n_users && actualProductCount === modelStats.n_products
                        ? '✅ Model is in sync with database'
                        : '⚠️ Model needs retraining - counts don\'t match!'
                },
                // File status
                modelFile: {
                    exists: fs.existsSync(path.join(__dirname, '..', 'ai_models', 'cf_model.pkl')),
                    path: path.join(__dirname, '..', 'ai_models', 'cf_model.pkl')
                }
            }
        });

    } catch (error) {
        console.error("Get debug info error:", error);
        res.status(500).json({
            success: false,
            message: "Error getting debug information",
            error: error.message
        });
    }
});

// Get related products for checkout page based on user history
// Returns products similar to what the user has interacted with
router.get("/related/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const numProducts = parseInt(req.query.num) || 5;

        // Initialize CF model on first call
        if (!cfRecommender.modelReady) {
            await cfRecommender.initialize();
        }

        // Get personalized recommendations from CF model
        let relatedProducts = [];

        if (cfRecommender.modelReady) {
            try {
                // Get recommendations from CF model
                const cfRecs = await cfRecommender.recommendForUser(userId, numProducts);

                // Fetch actual product details from database
                for (const rec of cfRecs) {
                    const product = await Product.findById(rec.productId)
                        .populate('sellerId', 'storeName businessName');

                    if (product) {
                        relatedProducts.push({
                            ...product.toObject(),
                            predictedRating: rec.predictedRating,
                            reason: 'Based on your shopping history'
                        });
                    }
                }
            } catch (cfError) {
                console.warn('CF model error, falling back to category-based:', cfError.message);
            }
        }

        // If CF didn't work or returned few results, add category-based recommendations
        if (relatedProducts.length < numProducts) {
            try {
                const categoryProducts = await Product.find({ status: 'active' })
                    .populate('sellerId', 'storeName businessName')
                    .sort({ rating: -1, createdAt: -1 })
                    .limit(numProducts - relatedProducts.length);

                // Avoid duplicates
                const existingIds = new Set(relatedProducts.map(p => p._id.toString()));
                const newProducts = categoryProducts.filter(p => !existingIds.has(p._id.toString()));

                relatedProducts = relatedProducts.concat(newProducts.map(p => ({
                    ...p.toObject(),
                    reason: 'Popular in your preferred categories'
                })));
            } catch (error) {
                console.warn('Error fetching category-based products:', error.message);
            }
        }

        res.json({
            success: true,
            count: relatedProducts.length,
            relatedProducts,
            source: cfRecommender.modelReady ? 'collaborative_filtering_ai' : 'popularity_based'
        });

    } catch (error) {
        console.error("Get related products error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching related products",
            error: error.message
        });
    }
});

/**
 * POST /product/ai/retrain
 * Manually retrain the AI recommendation model
 * Perfect for FYP demo - examiner can see model being retrained in real-time
 * 
 * Usage:
 * curl -X POST http://localhost:5000/product/ai/retrain
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Model retrained with current database counts",
 *   "stats": {
 *     "n_users": 10,
 *     "n_products": 47,
 *     "training_date": "2025-12-21T16:30:00.000000"
 *   }
 * }
 */
router.post("/ai/retrain", async (req, res) => {
    try {
        console.log('📊 Retrain request received');
        const result = await cfRecommender.retrain();

        res.status(200).json({
            success: true,
            message: "✓ Model retrained successfully",
            timestamp: new Date().toISOString(),
            stats: result.stats
        });
    } catch (error) {
        console.error('❌ Retrain failed:', error.message);
        res.status(500).json({
            success: false,
            message: "Failed to retrain model",
            error: error.message
        });
    }
});

/**
 * POST /product/:productId/view
 * Track when a user views a product
 * 
 * Body: { userId: "user_id" }
 * This is used by CF algorithm to learn user preferences
 */
router.post("/:productId/view", async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        // Create interaction record
        const interaction = new Interaction({
            userId: userId,
            productId: productId,
            action: 'view',
            weight: 1
        });

        await interaction.save();

        res.status(200).json({
            success: true,
            message: "Product view tracked",
            interaction: {
                action: 'view',
                weight: 1
            }
        });
    } catch (error) {
        console.error('Error tracking product view:', error);
        res.status(500).json({
            success: false,
            message: "Error tracking product view",
            error: error.message
        });
    }
});

/**
 * POST /product/:productId/cart
 * Track when a user adds product to cart
 * Weight: 2 points (stronger signal than view)
 */
router.post("/:productId/cart", async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        const interaction = new Interaction({
            userId: userId,
            productId: productId,
            action: 'cart',
            weight: 2
        });

        await interaction.save();

        res.status(200).json({
            success: true,
            message: "Cart interaction tracked",
            interaction: {
                action: 'cart',
                weight: 2
            }
        });
    } catch (error) {
        console.error('Error tracking cart interaction:', error);
        res.status(500).json({
            success: false,
            message: "Error tracking cart interaction",
            error: error.message
        });
    }
});

/**
 * POST /product/:productId/save
 * Track when a user saves/likes a product
 * Weight: 3 points (strong signal of interest)
 */
router.post("/:productId/save", async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        const interaction = new Interaction({
            userId: userId,
            productId: productId,
            action: 'save',
            weight: 3
        });

        await interaction.save();

        res.status(200).json({
            success: true,
            message: "Save interaction tracked",
            interaction: {
                action: 'save',
                weight: 3
            }
        });
    } catch (error) {
        console.error('Error tracking save interaction:', error);
        res.status(500).json({
            success: false,
            message: "Error tracking save interaction",
            error: error.message
        });
    }
});

/**
 * POST /product/:productId/purchase
 * Track when a user purchases a product and leaves a rating
 * Weight: 5 + rating*2 (strongest signal)
 * 
 * Body: { userId: "user_id", rating: 4 }
 * Rating is optional (1-5 stars)
 */
router.post("/:productId/purchase", async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId, rating } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        let weight = 5;
        if (rating) {
            weight += rating * 2; // Rating 5 = +10 bonus
        }

        const interaction = new Interaction({
            userId: userId,
            productId: productId,
            action: 'purchase',
            rating: rating || null,
            weight: weight
        });

        await interaction.save();

        res.status(200).json({
            success: true,
            message: "Purchase interaction tracked",
            interaction: {
                action: 'purchase',
                rating: rating || null,
                weight: weight
            }
        });
    } catch (error) {
        console.error('Error tracking purchase:', error);
        res.status(500).json({
            success: false,
            message: "Error tracking purchase",
            error: error.message
        });
    }
});

/**
 * GET /product/interactions/summary
 * Get summary of all interactions (for admin/debugging)
 * Shows total interactions by type
 */
router.get("/interactions/summary", async (req, res) => {
    try {
        const summary = await Interaction.aggregate([
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                    avgWeight: { $avg: '$weight' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalInteractions = await Interaction.countDocuments();
        const uniqueUsers = await Interaction.distinct('userId');
        const uniqueProducts = await Interaction.distinct('productId');

        res.status(200).json({
            success: true,
            summary: {
                totalInteractions,
                uniqueUsers: uniqueUsers.length,
                uniqueProducts: uniqueProducts.length,
                byAction: summary
            }
        });
    } catch (error) {
        console.error('Error getting interaction summary:', error);
        res.status(500).json({
            success: false,
            message: "Error getting interaction summary",
            error: error.message
        });
    }
});

/**
 * POST /product/visual-search
 * AI-powered visual search - find products similar to an uploaded image
 * Uses ResNet50 deep learning model for image feature extraction
 * 
 * Body: { image: "base64_encoded_image" } or { imageUrl: "url_to_image" }
 * Optional: { topN: 10 } - number of results to return (default: 10)
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 5,
 *   "results": [
 *     { "product": {...}, "similarity": 0.89 },
 *     ...
 *   ]
 * }
 */
router.post("/visual-search", async (req, res) => {
    try {
        const { image, imageUrl, topN = 10 } = req.body;

        // Validate input
        if (!image && !imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Please provide either 'image' (base64) or 'imageUrl'"
            });
        }

        const queryImage = image || imageUrl;

        // Get all active products with images
        const products = await Product.find({
            status: 'active',
            images: { $exists: true, $ne: [] }
        }).populate('sellerId', 'storeName businessName');

        if (products.length === 0) {
            return res.json({
                success: true,
                count: 0,
                results: [],
                message: "No products with images found"
            });
        }

        // Try to use pre-computed embeddings for fast search (all products in seconds!)
        const productsWithEmbeddings = await Product.find({
            status: 'active',
            images: { $exists: true, $ne: [] },
            imageEmbedding: { $exists: true, $ne: null, $not: { $size: 0 } }
        }).select('+imageEmbedding').populate('sellerId', 'storeName businessName');

        let similarityResults;

        if (productsWithEmbeddings.length > 10) {
            // FAST PATH: Use pre-computed embeddings
            console.log(`⚡ Fast visual search: using ${productsWithEmbeddings.length} pre-computed embeddings`);

            // Extract query image features first
            const queryFeatures = await visualSearchHelper.extractFeatures(queryImage);

            // Compare with all embeddings instantly (pure math, no image loading!)
            const results = [];
            for (const product of productsWithEmbeddings) {
                const similarity = visualSearchHelper.cosineSimilarity(queryFeatures, product.imageEmbedding);
                results.push({
                    productId: product._id.toString(),
                    similarity: similarity
                });
            }

            // Sort and get top results
            results.sort((a, b) => b.similarity - a.similarity);
            similarityResults = results.slice(0, topN);

        } else {
            // SLOW PATH: Compute on-demand (fallback)
            console.log(`🔍 Visual search: computing on-demand for ${products.length} products`);

            const MAX_PRODUCTS_TO_COMPARE = 20;
            const productsToSearch = products.slice(0, MAX_PRODUCTS_TO_COMPARE);

            const productImages = productsToSearch.map(p => ({
                productId: p._id.toString(),
                imageUrl: p.images[0]
            }));

            similarityResults = await visualSearchHelper.findSimilarProducts(
                queryImage,
                productImages,
                topN
            );
        }

        // Build response with full product details
        // Filter by minimum similarity threshold to avoid unrelated products
        const MIN_SIMILARITY_THRESHOLD = 0.75; // 75% minimum match required
        const results = [];
        for (const match of similarityResults) {
            // Skip low-confidence matches
            if (match.similarity < MIN_SIMILARITY_THRESHOLD) {
                continue;
            }
            const product = products.find(p => p._id.toString() === match.productId) ||
                productsWithEmbeddings.find(p => p._id.toString() === match.productId);
            if (product) {
                const prodObj = product.toObject();
                delete prodObj.imageEmbedding; // Don't send embedding to frontend
                results.push({
                    product: prodObj,
                    similarity: Math.round(match.similarity * 100) / 100
                });
            }
        }

        res.json({
            success: true,
            count: results.length,
            results: results,
            source: productsWithEmbeddings.length > 10 ? 'embeddings_fast' : 'on_demand'
        });

    } catch (error) {
        console.error('Visual search error:', error);

        // Check if it's a Python/TensorFlow error
        if (error.message.includes('TensorFlow') || error.message.includes('Python')) {
            return res.status(503).json({
                success: false,
                message: "Visual search AI model not available. Please ensure Python and TensorFlow are installed.",
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Error performing visual search",
            error: error.message
        });
    }
});

/**
 * GET /product/visual-search/health
 * Check if visual search AI model is ready
 */
router.get("/visual-search/health", async (req, res) => {
    try {
        const health = await visualSearchHelper.healthCheck();
        res.json({
            success: true,
            visualSearch: health
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: "Visual search not available",
            error: error.message
        });
    }
});

/**
 * POST /product/visual-search/compute-embeddings
 * Compute and store image embeddings for all products (one-time admin operation)
 * This enables fast visual search for all products
 */
router.post("/visual-search/compute-embeddings", async (req, res) => {
    try {
        // Get all products without embeddings
        const products = await Product.find({
            status: 'active',
            images: { $exists: true, $ne: [] },
            $or: [
                { imageEmbedding: { $exists: false } },
                { imageEmbedding: null },
                { imageEmbedding: { $size: 0 } }
            ]
        });

        console.log(`📊 Computing embeddings for ${products.length} products...`);

        let processed = 0;
        let failed = 0;

        for (const product of products) {
            try {
                const imageSource = product.images[0];
                const features = await visualSearchHelper.extractFeatures(imageSource);

                await Product.findByIdAndUpdate(product._id, {
                    imageEmbedding: features
                });

                processed++;
                console.log(`✅ ${processed}/${products.length} - ${product.name}`);
            } catch (err) {
                failed++;
                console.error(`❌ Failed: ${product.name} - ${err.message}`);
            }
        }

        res.json({
            success: true,
            message: `Embeddings computed for ${processed} products`,
            processed,
            failed,
            total: products.length
        });

    } catch (error) {
        console.error('Compute embeddings error:', error);
        res.status(500).json({
            success: false,
            message: "Error computing embeddings",
            error: error.message
        });
    }
});

// ============ REVIEW ENDPOINTS ============

const Review = require('../models/review');

/**
 * Get all reviews for a product
 * GET /product/:productId/reviews
 */
router.get("/:productId/reviews", async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ productId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments({ productId });

        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reviews",
            error: error.message
        });
    }
});

/**
 * Add a review for a product
 * POST /product/:productId/reviews
 */
router.post("/:productId/reviews", async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId, rating, comment, userName } = req.body;

        if (!userId || !rating) {
            return res.status(400).json({
                success: false,
                message: "userId and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ productId, userId });
        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment || existingReview.comment;
            existingReview.userName = userName || existingReview.userName;
            await existingReview.save();

            // Recalculate product rating
            const allReviews = await Review.find({ productId });
            const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / allReviews.length;

            product.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
            await product.save();

            return res.status(200).json({
                success: true,
                message: "Review updated successfully",
                review: existingReview,
                newRating: product.rating,
                reviewCount: allReviews.length
            });
        }

        // Create new review
        const review = new Review({
            productId,
            userId,
            rating,
            comment: comment || '',
            userName: userName || 'Anonymous'
        });

        await review.save();

        // Update product rating
        const allReviews = await Review.find({ productId });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / allReviews.length;

        product.rating = Math.round(avgRating * 10) / 10;
        product.reviewCount = allReviews.length;
        await product.save();

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review,
            newRating: product.rating,
            reviewCount: product.reviewCount
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error adding review",
            error: error.message
        });
    }
});

module.exports = router;


