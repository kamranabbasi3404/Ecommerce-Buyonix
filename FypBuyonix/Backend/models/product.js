const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    // Seller reference
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },

    // Product basic information
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },

    // Pricing
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Inventory
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    // Images
    images: [{
        type: String, // URL or base64
        required: true
    }],

    // Color variants (optional) - each variant has color name, hex code, and image
    colorVariants: [{
        colorName: { type: String, required: true },  // "Amber Gold"
        colorCode: { type: String, required: true },  // "#FFD700"
        image: { type: String, required: true }       // base64 or URL
    }],

    // Pre-computed image embedding for fast visual search
    // Stored as array of floats (MobileNetV2 produces 1280-dim vectors)
    imageEmbedding: {
        type: [Number],
        default: null,
        select: false // Don't include in normal queries, only when needed
    },

    // Ratings and reviews
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
        default: 'active'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

