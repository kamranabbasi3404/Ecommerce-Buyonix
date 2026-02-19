const router = require("express").Router();
const passport = require("passport");
const User = require('../models/user');
const OTP = require('../models/otp');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../utils/emailService');

// Google Auth Routes
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
}));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: "/auth/login/failed",
    })
);

// Check if user is authenticated (using session)
router.get("/login/success", (req, res) => {
    if (req.user) {
        // req.user contains the full User object deserialized from MongoDB
        res.status(200).json({
            success: true,
            message: "successful",
            user: {
                id: req.user.id,
                displayName: req.user.displayName,
                email: req.user.email,
                // Do not send sensitive data like googleId or password hash
            },
        });
    } else {
        res.status(401).json({
            success: false,
            message: "user not authenticated",
        });
    }
});

// Logout route
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Error during logout" });
        }
        // IMPORTANT: If you are using express-session and cookie-session (as in your original context), 
        // req.session.destroy() or setting req.session = null is often needed after req.logout()
        // If you use express-session:
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
                return res.status(500).json({ message: "Error destroying session" });
            }
            res.clearCookie('connect.sid'); // Clear the session cookie (default name for express-session)
            res.redirect(process.env.CLIENT_URL);
        });
    });
});

// Login failed route
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "user failed to authenticate.",
    });
});

// Send OTP for Signup
router.post("/send-signup-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email. Please login instead."
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTP for this email and purpose
        await OTP.deleteMany({ email, purpose: 'signup' });

        // Create new OTP
        const otpRecord = new OTP({
            email,
            otp,
            purpose: 'signup',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        await otpRecord.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp);
            res.status(200).json({
                success: true,
                message: "OTP sent to your email",
                email: email
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            await OTP.deleteOne({ _id: otpRecord._id });
            res.status(500).json({
                success: false,
                message: "Failed to send OTP email. Please check your email address and try again."
            });
        }
    } catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Error sending OTP"
        });
    }
});

// Verify OTP and Complete Signup
router.post("/verify-signup-otp", async (req, res) => {
    try {
        const { fullName, email, phone, password, otp } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !otp) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, password, and OTP are required"
            });
        }

        // Find and verify OTP
        const otpRecord = await OTP.findOne({
            email,
            purpose: 'signup',
            verified: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP. Please request a new one."
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // Check if user already exists (double check)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = new User({
            displayName: fullName,
            email,
            password: hashedPassword,
            phone
        });

        await user.save();

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Delete OTP after successful signup
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: user._id,
                displayName: user.displayName,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating user"
        });
    }
});

// Send OTP for Login
router.post("/send-login-otp", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if user has a password
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account was created with Google. Please use Google Sign-In to login."
            });
        }

        // Verify password first
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTP for this email and purpose
        await OTP.deleteMany({ email, purpose: 'login' });

        // Create new OTP
        const otpRecord = new OTP({
            email,
            otp,
            purpose: 'login',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        await otpRecord.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp);
            res.status(200).json({
                success: true,
                message: "OTP sent to your email",
                email: email
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            await OTP.deleteOne({ _id: otpRecord._id });
            res.status(500).json({
                success: false,
                message: "Failed to send OTP email. Please check your email address and try again."
            });
        }
    } catch (error) {
        console.error("Send login OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Error sending OTP"
        });
    }
});

// Verify OTP and Complete Login
router.post("/verify-login-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // Find and verify OTP
        const otpRecord = await OTP.findOne({
            email,
            purpose: 'login',
            verified: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP. Please request a new one."
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Delete OTP after successful login
        await OTP.deleteOne({ _id: otpRecord._id });

        // Create session
        if (req.login && typeof req.login === 'function') {
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Login failed"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    user: {
                        id: user._id,
                        displayName: user.displayName,
                        email: user.email,
                        phone: user.phone,
                        createdAt: user.createdAt
                    }
                });
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    displayName: user.displayName,
                    email: user.email,
                    phone: user.phone,
                    createdAt: user.createdAt
                }
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Error during login. Please try again."
        });
    }
});

// Get all users (for admin purposes)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users"
        });
    }
});

module.exports = router;
