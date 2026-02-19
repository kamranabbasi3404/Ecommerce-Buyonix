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

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

//connect to mongodb
mongoose.connect(process.env.DB_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});

// Use express-session instead of cookie-session
app.use(
    session({
        name: "session",
        secret: "cyberwolve",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            secure: false,
            httpOnly: true,
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
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
server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
    console.log("🤖 AI-powered recommendations available at /product/recommendations/:userId");
    console.log("💬 Real-time chat enabled via Socket.io");
});

module.exports = app;
