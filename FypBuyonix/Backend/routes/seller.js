const router = require("express").Router();
const Seller = require('../models/seller');
const bcrypt = require('bcryptjs');
const { sendSellerApprovalEmail } = require('../utils/emailService');

// Seller Registration Route
router.post("/register", async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            password,
            businessName,
            businessType,
            businessAddress,
            storeName,
            storeDescription,
            primaryCategory,
            website,
            accountHolderName,
            bankName,
            accountNumber,
            iban,
            cnicNumber,
            taxNumber
        } = req.body;
        
        // Check if seller already exists
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({
                success: false,
                message: "Seller already exists with this email"
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create new seller
        const seller = new Seller({
            fullName,
            email,
            phone,
            password: hashedPassword,
            businessName,
            businessType,
            businessAddress: businessAddress || '',
            storeName,
            storeDescription,
            primaryCategory,
            website: website || '',
            accountHolderName,
            bankName,
            accountNumber,
            iban,
            cnicNumber,
            taxNumber,
            status: 'pending' // New sellers need admin approval
        });
        
        await seller.save();
        
        res.status(201).json({
            success: true,
            message: "Seller registration submitted successfully. Waiting for admin approval.",
            seller: {
                id: seller._id.toString(),
                fullName: seller.fullName,
                email: seller.email,
                storeName: seller.storeName,
                status: seller.status,
                createdAt: seller.createdAt
            }
        });
    } catch (error) {
        console.error("Seller registration error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating seller account"
        });
    }
});

// Seller Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find seller by email
        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        
        // Check if seller is approved
        if (seller.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: `Your account is ${seller.status}. Please wait for admin approval.`
            });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, seller.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        
        // Store seller info in session
        req.session.sellerId = seller._id.toString();
        req.session.sellerEmail = seller.email;
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            seller: {
                id: seller._id.toString(),
                fullName: seller.fullName,
                email: seller.email,
                storeName: seller.storeName,
                status: seller.status,
                createdAt: seller.createdAt
            }
        });
    } catch (error) {
        console.error("Seller login error:", error);
        res.status(500).json({
            success: false,
            message: "Error during login"
        });
    }
});

// Check seller authentication status
router.get("/check-auth", async (req, res) => {
    try {
        if (req.session && req.session.sellerId) {
            const seller = await Seller.findById(req.session.sellerId);
            if (seller) {
                return res.status(200).json({
                    success: true,
                    authenticated: true,
                    seller: {
                        id: seller._id.toString(),
                        fullName: seller.fullName,
                        email: seller.email,
                        storeName: seller.storeName,
                        status: seller.status
                    }
                });
            }
        }
        
        res.status(401).json({
            success: false,
            authenticated: false,
            message: "Not authenticated"
        });
    } catch (error) {
        console.error("Check auth error:", error);
        res.status(500).json({
            success: false,
            message: "Error checking authentication"
        });
    }
});

// Seller Logout Route
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ message: "Error during logout" });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    });
});

// Get all sellers (for admin purposes)
router.get("/all", async (req, res) => {
    try {
        const sellers = await Seller.find({}, { password: 0 }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            sellers: sellers
        });
    } catch (error) {
        console.error("Get sellers error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching sellers"
        });
    }
});

// Get pending sellers only (for admin)
router.get("/pending", async (req, res) => {
    try {
        const sellers = await Seller.find({ status: 'pending' }, { password: 0 }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            sellers: sellers
        });
    } catch (error) {
        console.error("Get pending sellers error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching pending sellers"
        });
    }
});

// Get seller by ID (for admin to view details)
router.get("/:id", async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id, { password: 0 });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }
        res.status(200).json({
            success: true,
            seller: seller
        });
    } catch (error) {
        console.error("Get seller error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching seller"
        });
    }
});

// Approve seller (admin only)
router.put("/:id/approve", async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }
        
        seller.status = 'approved';
        await seller.save();
        
        // Send approval email to seller
        try {
            await sendSellerApprovalEmail(seller.email, seller.fullName, seller.storeName);
            console.log(`Approval email sent to seller: ${seller.email}`);
        } catch (emailError) {
            // Log email error but don't fail the approval
            console.error('Error sending approval email:', emailError);
        }
        
        res.status(200).json({
            success: true,
            message: "Seller approved successfully",
            seller: {
                id: seller._id,
                fullName: seller.fullName,
                email: seller.email,
                storeName: seller.storeName,
                status: seller.status
            }
        });
    } catch (error) {
        console.error("Approve seller error:", error);
        res.status(500).json({
            success: false,
            message: "Error approving seller"
        });
    }
});

// Reject seller (admin only)
router.put("/:id/reject", async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }
        
        seller.status = 'rejected';
        await seller.save();
        
        res.status(200).json({
            success: true,
            message: "Seller rejected successfully",
            seller: {
                id: seller._id,
                fullName: seller.fullName,
                email: seller.email,
                storeName: seller.storeName,
                status: seller.status
            }
        });
    } catch (error) {
        console.error("Reject seller error:", error);
        res.status(500).json({
            success: false,
            message: "Error rejecting seller"
        });
    }
});

module.exports = router;

