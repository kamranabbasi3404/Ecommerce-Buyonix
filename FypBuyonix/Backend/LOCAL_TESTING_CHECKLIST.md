# BACKEND DEPLOYMENT - LOCAL TESTING CHECKLIST
## Buyonix E-Commerce Backend

---

## ✅ PRE-DEPLOYMENT VERIFICATION

Before deploying to Azure, verify everything works locally:

### 1. START YOUR BACKEND LOCALLY

```bash
cd Backend
npm install  # If dependencies not installed
npm start    # Runs with nodemon
```

**Expected Output:**
```
========================================
🚀 Server started successfully
Environment: development
Port: 5000
Database: Connected
CORS Origins: http://localhost:5173, http://localhost:5174, http://localhost:3000
========================================
```

✅ **Check:** Do you see all of this? If not, there's a database connection issue.

---

### 2. TEST DATABASE CONNECTION

**In Browser/Postman:**
```
GET http://localhost:5000/auth/login/success
```

**Expected Response:**
```json
{
  "success": false,
  "message": "user not authenticated"
}
```

❌ **If you get connection refused:**
- Check MongoDB URL in .env is correct
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for local testing)

---

### 3. TEST SIGNUP FLOW

**Step 1: Send OTP**
```bash
curl -X POST http://localhost:5000/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "test@gmail.com"
}
```

**Check your Email:** You should receive OTP code

❌ **If OTP not received:**
- Check EMAIL_USER and EMAIL_PASS are correct in .env
- Check spam folder
- For Gmail, use "App Password" not regular password

**Step 2: Verify OTP and Sign Up**
```bash
curl -X POST http://localhost:5000/auth/verify-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@gmail.com",
    "phone": "1234567890",
    "password": "password123",
    "otp": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "...",
    "displayName": "Test User",
    "email": "test@gmail.com"
  }
}
```

---

### 4. TEST LOGIN WITH OTP

**Step 1: Request OTP**
```bash
curl -X POST http://localhost:5000/auth/send-login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com", "password": "password123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "test@gmail.com"
}
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:5000/auth/verify-login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com", "otp": "123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "displayName": "Test User",
    "email": "test@gmail.com"
  }
}
```

---

### 5. TEST FORGOT PASSWORD

**Step 1: Send Forgot Password OTP**
```bash
curl -X POST http://localhost:5000/auth/send-forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:5000/auth/verify-forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com", "otp": "123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Step 3: Reset Password**
```bash
curl -X POST http://localhost:5000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "otp": "123456",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password."
}
```

---

### 6. TEST GOOGLE OAUTH

**In Browser:**
```
http://localhost:5000/auth/google
```

**Expected Behavior:**
- Redirects to Google login
- After authorizing, redirects back to http://localhost:5173 (or your frontend)
- User session created

❌ **If redirects fail:**
- Check CLIENT_ID and CLIENT_SECRET in .env
- Verify Google OAuth app has http://localhost:5000/auth/google/callback in authorized redirect URIs

---

### 7. TEST PRODUCT ENDPOINTS

```bash
# Get all products
curl http://localhost:5000/product/all

# Get product by ID
curl http://localhost:5000/product/:productId

# Get product recommendations
curl http://localhost:5000/product/recommendations/:userId
```

**Expected:** Should return product data or recommendations

---

### 8. TEST REAL-TIME CHAT (Socket.io)

**In Frontend Console:**
```javascript
const socket = io('http://localhost:5000');

// Should connect without errors
socket.on('connect', () => {
  console.log('Connected to chat');
});

// Join a room
socket.emit('join_room', 'conversationId123');

// Send message
socket.emit('send_message', {
  conversationId: 'conversationId123',
  senderId: 'userId123',
  senderType: 'user',
  message: 'Hello!'
});
```

**Expected:** Messages appear in real-time, no console errors

---

### 9. CHECK LOGS FOR ERRORS

In your terminal where Backend is running, you should see:
- ✅ No error messages
- ✅ No "undefined" values
- ✅ No CORS warnings
- ✅ Database queries completing successfully

**Red Flags:**
- ❌ `E11000` error = Duplicate email in database
- ❌ `ValidationError` = Missing required fields
- ❌ `MongoNetworkError` = Database connection failed
- ❌ `CORS` error = Frontend URL not in ALLOWED_ORIGINS

---

### 10. TEST WITH FRONTEND

**Start Frontend:**
```bash
cd Frontend
npm run dev
```

**Visit:** http://localhost:5173

**Test All Flows:**
1. ✅ Signup with email and OTP
2. ✅ Login with email, password, and OTP
3. ✅ Forgot password and reset
4. ✅ Google OAuth login
5. ✅ Product browsing
6. ✅ Real-time chat messages
7. ✅ Shopping cart operations
8. ✅ Checkout and payment

**No errors** in browser console or backend terminal?

---

## ✅ PRE-AZURE DEPLOYMENT CHECKLIST

Before pushing to Azure, ensure:

- [ ] Backend runs locally without errors
- [ ] All API endpoints respond correctly
- [ ] Database queries work properly
- [ ] Email OTP sending works
- [ ] Frontend connects to backend successfully
- [ ] Socket.io real-time chat works
- [ ] No console errors or warnings
- [ ] Git repository created and code pushed

---

## 📦 PREPARE FOR AZURE DEPLOYMENT

### 1. Create GitHub Repository

```bash
cd Backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/buyonix-backend.git
git push -u origin main
```

### 2. Verify Files Ready

Check these files exist:
- ✅ server.js (updated)
- ✅ passport.js (updated)
- ✅ .env (development)
- ✅ .env.production (for Azure)
- ✅ package.json
- ✅ All route files
- ✅ All model files

### 3. Create Production Environment Variables

**Note:** Do NOT commit .env files to Git!

**In Azure Portal, you will add:**
- DB_URI
- SESSION_SECRET (generate new strong one)
- FRONTEND_URL (your Azure Static Web App URL)
- BACKEND_URL (your Azure App Service URL)
- CLIENT_ID
- CLIENT_SECRET
- EMAIL_USER
- EMAIL_PASS
- STRIPE_SECRET_KEY
- GEMINI_API_KEY

---

## 🚀 READY FOR AZURE?

If all tests passed above, you're ready for Azure deployment!

**Next Steps:**
1. Go to [AZURE_DEPLOYMENT_GUIDE.md](../AZURE_DEPLOYMENT_GUIDE.md)
2. Follow the "STEP 3: DEPLOY BACKEND" section
3. Monitor the deployment in Azure Portal

---

## 🆘 TROUBLESHOOTING

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Verify connection string in .env
- Check MongoDB Atlas cluster is running
- Check IP whitelist includes your IP
- Test connection string in MongoDB Compass

### Issue: "OTP not sending via email"
**Solution:**
- Verify EMAIL_USER and EMAIL_PASS
- For Gmail: Generate App Password (enable 2FA first)
- Check spam/trash folder
- Review email service logs

### Issue: "CORS error when connecting frontend"
**Solution:**
- Add frontend URL to ALLOWED_ORIGINS in server.js
- Ensure credentials: true is set in CORS
- Test from same origin first (localhost)

### Issue: "Google OAuth callback fails"
**Solution:**
- Verify CLIENT_ID and CLIENT_SECRET
- Check Google OAuth app has correct redirect URI
- Verify http://localhost:5000/auth/google/callback is authorized

### Issue: "Session not persisting"
**Solution:**
- Check cookies are enabled in browser
- Verify httpOnly and secure flags in session config
- Test in incognito window
- Check CORS credentials settings

---

**Document Created:** May 2026
**Purpose:** Verify backend works before Azure deployment
