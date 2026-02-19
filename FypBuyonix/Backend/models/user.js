const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    // Fields for traditional email/password login (optional for OAuth)
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true // Allows multiple documents with null/undefined email
    },
    password: {
        type: String,
        required: false
    },
    displayName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false
    },
    // Field for Google OAuth (crucial for linking the Google profile)
    googleId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
