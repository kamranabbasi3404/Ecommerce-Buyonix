const router = require("express").Router();
const { Message, Conversation } = require('../models/chat');
const User = require('../models/user');
const Seller = require('../models/seller');
const { sendChatNotificationEmail } = require('../utils/emailService');

/**
 * Get all conversations for a user
 * GET /chat/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const conversations = await Conversation.find({ userId })
            .sort({ lastMessageAt: -1 });

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching conversations",
            error: error.message
        });
    }
});

/**
 * Get all conversations for a seller
 * GET /chat/seller/:sellerId
 */
router.get("/seller/:sellerId", async (req, res) => {
    try {
        const { sellerId } = req.params;

        const conversations = await Conversation.find({ sellerId })
            .sort({ lastMessageAt: -1 });

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching conversations",
            error: error.message
        });
    }
});

/**
 * Get or create a conversation between user and seller
 * POST /chat/conversation
 */
router.post("/conversation", async (req, res) => {
    try {
        const { userId, sellerId, userName, sellerName } = req.body;

        if (!userId || !sellerId) {
            return res.status(400).json({
                success: false,
                message: "userId and sellerId are required"
            });
        }

        // Find existing or create new conversation
        let conversation = await Conversation.findOne({ userId, sellerId });

        if (!conversation) {
            conversation = new Conversation({
                userId,
                sellerId,
                userName: userName || 'User',
                sellerName: sellerName || 'Seller'
            });
            await conversation.save();
        }

        res.status(200).json({
            success: true,
            conversation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating conversation",
            error: error.message
        });
    }
});

/**
 * Get messages for a conversation
 * GET /chat/messages/:conversationId
 */
router.get("/messages/:conversationId", async (req, res) => {
    try {
        const { conversationId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching messages",
            error: error.message
        });
    }
});

/**
 * Send a message (backup for socket)
 * POST /chat/message
 */
router.post("/message", async (req, res) => {
    try {
        const { conversationId, senderId, senderType, message } = req.body;

        if (!conversationId || !senderId || !senderType || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newMessage = new Message({
            conversationId,
            senderId,
            senderType,
            message
        });

        await newMessage.save();

        // Update conversation
        const conversation = await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message.substring(0, 100),
            lastMessageAt: new Date(),
            $inc: {
                [senderType === 'user' ? 'sellerUnread' : 'userUnread']: 1
            }
        }, { new: true });

        // Send email notification asynchronously (don't block response)
        if (conversation) {
            (async () => {
                try {
                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                    const messagePreview = message.substring(0, 50);

                    if (senderType === 'user') {
                        // User sent message - notify seller
                        const seller = await Seller.findById(conversation.sellerId);
                        if (seller?.email) {
                            await sendChatNotificationEmail(
                                seller.email,
                                seller.storeName || seller.businessName || 'Seller',
                                conversation.userName,
                                messagePreview,
                                `${frontendUrl}/seller-chats`
                            );
                        }
                    } else {
                        // Seller sent message - notify user
                        const user = await User.findById(conversation.userId);
                        if (user?.email) {
                            await sendChatNotificationEmail(
                                user.email,
                                user.name || 'Customer',
                                conversation.sellerName,
                                messagePreview,
                                `${frontendUrl}/my-chats`
                            );
                        }
                    }
                } catch (emailError) {
                    console.error('Error sending chat notification email:', emailError);
                }
            })();
        }

        res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error sending message",
            error: error.message
        });
    }
});

/**
 * Mark messages as read
 * POST /chat/read
 */
router.post("/read", async (req, res) => {
    try {
        const { conversationId, readerType } = req.body;

        const updateField = readerType === 'user' ? 'userUnread' : 'sellerUnread';

        await Conversation.findByIdAndUpdate(conversationId, {
            [updateField]: 0
        });

        res.status(200).json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error marking as read",
            error: error.message
        });
    }
});

module.exports = router;
