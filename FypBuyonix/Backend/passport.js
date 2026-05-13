const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require("passport");
const User = require('./models/user');

// Dynamic callback URL based on environment
const NODE_ENV = process.env.NODE_ENV || "development";
const CALLBACK_URL = NODE_ENV === "production" 
    ? `${process.env.BACKEND_URL.replace(/\/$/, '')}/auth/google/callback`
    : "http://localhost:5000/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["profile", "email"],
    },

    async function (accessToken, refreshToken, profile, done) {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return the user
          return done(null, user);
        }

        // Check if user exists with this email (for users who might have signed up with email first)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("Deserialization error:", error);
    done(error, null);
  }
});