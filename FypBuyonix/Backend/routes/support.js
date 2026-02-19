const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/supportTicket');
const { sendSupportReplyEmail } = require('../utils/emailService');

// POST /support/create — Submit a new ticket
router.post('/create', async (req, res) => {
    try {
        const { senderType, senderId, senderName, senderEmail, subject, category, priority, message } = req.body;

        if (!senderType || !senderId || !senderName || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const ticket = new SupportTicket({
            senderType,
            senderId,
            senderName,
            senderEmail: senderEmail || '',
            subject,
            category: category || 'Other',
            priority: priority || 'Medium',
            messages: [{
                sender: 'customer',
                text: message,
                time: new Date()
            }]
        });

        await ticket.save();

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticket: {
                id: ticket.ticketId,
                subject: ticket.subject,
                status: ticket.status,
                createdAt: ticket.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ success: false, message: 'Error creating ticket' });
    }
});

// GET /support/queries — Get all tickets (admin)
router.get('/queries', async (req, res) => {
    try {
        const { senderType, status } = req.query;
        const filter = {};

        if (senderType && senderType !== 'all') {
            filter.senderType = senderType;
        }
        if (status && status !== 'all') {
            filter.status = status;
        }

        const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 });

        const formatted = tickets.map(t => ({
            id: t.ticketId,
            issue: t.subject,
            customer: t.senderName,
            email: t.senderEmail,
            senderType: t.senderType,
            priority: t.priority,
            status: t.status,
            category: t.category,
            date: t.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            messages: t.messages.map(m => ({
                sender: m.sender,
                text: m.text,
                time: m.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }))
        }));

        res.json({ success: true, tickets: formatted });
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        res.status(500).json({ success: false, message: 'Error fetching tickets' });
    }
});

// GET /support/my-tickets — Get tickets for a specific user/seller
router.get('/my-tickets', async (req, res) => {
    try {
        const { senderId, senderType } = req.query;

        if (!senderId || !senderType) {
            return res.status(400).json({ success: false, message: 'senderId and senderType are required' });
        }

        const tickets = await SupportTicket.find({ senderId, senderType }).sort({ createdAt: -1 });

        const formatted = tickets.map(t => ({
            id: t.ticketId,
            subject: t.subject,
            category: t.category,
            priority: t.priority,
            status: t.status,
            date: t.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            messages: t.messages.map(m => ({
                sender: m.sender,
                text: m.text,
                time: m.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }))
        }));

        res.json({ success: true, tickets: formatted });
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ success: false, message: 'Error fetching tickets' });
    }
});

// POST /support/:ticketId/reply — Reply to a ticket
router.post('/:ticketId/reply', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { text, sender } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Reply text is required' });
        }

        const ticket = await SupportTicket.findOne({ ticketId });
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.messages.push({
            sender: sender || 'agent',
            text,
            time: new Date()
        });

        // Auto-update status to In Progress if admin replies on an Open ticket
        if (sender === 'agent' && ticket.status === 'Open') {
            ticket.status = 'In Progress';
        }

        await ticket.save();

        // Send email notification asynchronously (don't block response)
        if (sender === 'agent' && ticket.senderEmail) {
            const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            const viewUrl = ticket.senderType === 'seller'
                ? `${frontendUrl}/seller-support`
                : `${frontendUrl}/support`;

            sendSupportReplyEmail(
                ticket.senderEmail,
                ticket.senderName,
                ticket.ticketId,
                ticket.subject,
                text.substring(0, 100),
                viewUrl
            ).catch(err => console.error('Support email notification error:', err));
        }

        res.json({
            success: true,
            message: 'Reply added successfully',
            ticket: {
                id: ticket.ticketId,
                status: ticket.status,
                messages: ticket.messages.map(m => ({
                    sender: m.sender,
                    text: m.text,
                    time: m.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }))
            }
        });
    } catch (error) {
        console.error('Error replying to ticket:', error);
        res.status(500).json({ success: false, message: 'Error replying to ticket' });
    }
});

// PUT /support/:ticketId/status — Update ticket status
router.put('/:ticketId/status', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        if (!status || !['Open', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const ticket = await SupportTicket.findOneAndUpdate(
            { ticketId },
            { status },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Status updated',
            ticket: { id: ticket.ticketId, status: ticket.status }
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
});

module.exports = router;
