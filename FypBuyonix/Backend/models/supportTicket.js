const mongoose = require('mongoose');
const { Schema } = mongoose;

// Auto-increment counter for ticket IDs
const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const messageSchema = new Schema({
    sender: {
        type: String,
        enum: ['customer', 'agent'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const supportTicketSchema = new Schema({
    ticketId: {
        type: String,
        unique: true
    },
    senderType: {
        type: String,
        enum: ['user', 'seller'],
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    senderEmail: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Order Issue', 'Payment', 'Account', 'Product', 'Other'],
        default: 'Other'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    messages: [messageSchema]
}, {
    timestamps: true
});

// Auto-generate ticketId before saving
supportTicketSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                'ticketId',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.ticketId = `TKT-${String(counter.seq).padStart(3, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
