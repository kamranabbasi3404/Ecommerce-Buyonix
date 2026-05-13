require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const authRoute = require("./routes/auth");
const sellerRoute = require("./routes/seller");
const passportSetup = require("./passport");
const CFRecommender = require("./utils/cfRecommender");
const { Message, Conversation } = require("./models/chat");
const { MongoBinary } = require("mongodb-memory-server");
const session = require("express-session");
const MongoStore = require("connect-mongo");


// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const SESSION_SECRET = process.env.SESSION_SECRET || "cyberwolve";

// CORS origins - support both development and production
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://ecommerce-buyonix.vercel.app",
    process.env.FRONTEND_URL || "http://localhost:5173"
];

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with production-safe CORS
const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

//connect to mongodb
mongoose.connect(process.env.DB_URI).then(() => {
    console.log("✓ Connected to MongoDB");
}).catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
});

// Use express-session instead of cookie-session
app.use(
    session({
        name: "session",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.Create({mongoUrl: process.env.DB_URI}),
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            secure: NODE_ENV === "production", // HTTPS only in production
            httpOnly: true,
            sameSite: NODE_ENV === "production" ? "none" : "lax",
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        methods: "GET,POST,PUT,DELETE,PATCH",
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use("/auth", authRoute);
app.use("/seller", sellerRoute);
app.use("/product", require("./routes/product"));
app.use("/order", require("./routes/order"));
app.use("/payment", require("./routes/payment"));
app.use("/bargain", require("./routes/bargain"));
app.use("/chat", require("./routes/chat"));
app.use("/support", require("./routes/support"));

const port = process.env.PORT || 5000;

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a conversation room
    socket.on("join_room", (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined room ${conversationId}`);
    });

    // Leave a room
    socket.on("leave_room", (conversationId) => {
        socket.leave(conversationId);
    });

    // Send message
    socket.on("send_message", async (data) => {
        try {
            const { conversationId, senderId, senderType, message } = data;

            // Save message to database
            const newMessage = new Message({
                conversationId,
                senderId,
                senderType,
                message
            });
            await newMessage.save();

            // Update conversation
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: message.substring(0, 100),
                lastMessageAt: new Date(),
                $inc: {
                    [senderType === 'user' ? 'sellerUnread' : 'userUnread']: 1
                }
            });

            // Broadcast to room
            io.to(conversationId).emit("receive_message", {
                _id: newMessage._id,
                conversationId,
                senderId,
                senderType,
                message,
                createdAt: newMessage.createdAt
            });
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // Typing indicator
    socket.on("typing", (data) => {
        socket.to(data.conversationId).emit("user_typing", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Initialize AI models on server startup
const cfRecommender = new CFRecommender();
cfRecommender.initialize().then((success) => {
    if (success) {
        console.log("✓ AI Recommendation engine initialized");
    } else {
        console.log("⚠️  AI Recommendation engine initialization failed (non-critical)");
    }
});

// Use server.listen instead of app.listen for Socket.io
server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Server started successfully`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`Database: Connected`);
    console.log(`CORS Origins: ${ALLOWED_ORIGINS.join(", ")}`);
    console.log(`========================================\n`);
    console.log("🤖 AI-powered recommendations available at /product/recommendations/:userId");
    console.log("💬 Real-time chat enabled via Socket.io");
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close();
        process.exit(0);
    });
});

module.exports = app;
