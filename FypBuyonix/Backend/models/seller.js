const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerSchema = new Schema({
    // Account Information
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    // Business Information
    businessName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true
    },
    businessAddress: {
        type: String,
        default: ''
    },

    // Store Information
    storeName: {
        type: String,
        required: true
    },
    storeDescription: {
        type: String,
        required: true
    },
    primaryCategory: {
        type: String,
        required: true
    },
    website: {
        type: String,
        default: ''
    },

    // Banking Information
    accountHolderName: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    iban: {
        type: String,
        required: true
    },

    // Verification Information
    cnicNumber: {
        type: String,
        required: true
    },
    taxNumber: {
        type: String,
        required: true
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
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
sellerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);

