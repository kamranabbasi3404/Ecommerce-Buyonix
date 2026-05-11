# ⚡ QUICK REFERENCE CARD - BACKEND DEPLOYMENT

## 3-STEP DEPLOYMENT PROCESS

```
┌──────────────────┐
│  1. TEST LOCAL   │
│  (1-2 hours)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. GITHUB PUSH   │
│ (10 minutes)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. AZURE DEPLOY  │
│ (20 min + wait)  │
└──────────────────┘
```

---

## BEFORE YOU START

**Have you got:**
- ✅ Node.js installed
- ✅ Backend code ready
- ✅ Azure student account
- ✅ MongoDB Atlas running
- ✅ GitHub account

**Not ready?** Set these up first!

---

## COMMAND QUICK REFERENCE

### 1. Local Testing
```bash
# Start backend
cd Backend
npm install        # First time only
npm start          # Runs on port 5000

# In browser:
http://localhost:5000/auth/login/success
# Expected: {"success": false, "message": "user not authenticated"}
```

### 2. GitHub Setup
```bash
cd Backend
git init
git add .
git commit -m "Backend ready for Azure"
git remote add origin https://github.com/YOU/buyonix-backend.git
git push -u origin main
```

### 3. Azure Portal
```
Login → https://portal.azure.com
Create → Resource Group (buyonix-production)
Create → App Service 
  - Name: buyonix-backend-api
  - Runtime: Node 20 LTS
  - Plan: Free F1
Connect → GitHub repo
Deploy → Automatic!
```

---

## ENVIRONMENT VARIABLES (Azure Configuration)

| Variable | Example | From |
|----------|---------|------|
| NODE_ENV | production | Set here |
| PORT | 8080 | Set here |
| DB_URI | mongodb+srv://... | MongoDB Atlas |
| SESSION_SECRET | random-string | Generate new |
| FRONTEND_URL | https://your-frontend.azurewebsites.net | Your frontend URL |
| BACKEND_URL | https://buyonix-backend-api.azurewebsites.net | Your backend URL |
| CLIENT_ID | ...apps.googleusercontent.com | .env file |
| CLIENT_SECRET | GOCSP... | .env file |
| EMAIL_USER | your@gmail.com | .env file |
| EMAIL_PASS | app-password | .env file |
| STRIPE_SECRET_KEY | sk_test... | .env file |
| GEMINI_API_KEY | AI... | .env file |

---

## TESTING COMMANDS (Curl/Postman)

### Test Auth
```bash
GET http://localhost:5000/auth/login/success
```

### Test Signup OTP
```bash
POST http://localhost:5000/auth/send-signup-otp
{
  "email": "test@gmail.com"
}
```

### Test Login OTP
```bash
POST http://localhost:5000/auth/send-login-otp
{
  "email": "test@gmail.com",
  "password": "password123"
}
```

### Test Products
```bash
GET http://localhost:5000/product/all
```

---

## DEPLOYMENT CHECKLIST

### Before Testing
- [ ] Backend code ready
- [ ] No syntax errors
- [ ] package.json has "start" script

### Before GitHub Push
- [ ] Backend tested locally
- [ ] All tests passed
- [ ] .gitignore created
- [ ] No .env in Git

### Before Azure Deploy
- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Azure Portal opened
- [ ] Student account verified

### After Azure Deploy
- [ ] Environment variables added
- [ ] Backend URL accessible
- [ ] Logs show no errors
- [ ] API endpoints respond

---

## COMMON ISSUES & QUICK FIXES

| Issue | Fix |
|-------|-----|
| "Cannot connect to DB" | Check DB_URI in Configuration |
| "CORS error" | Update FRONTEND_URL in Configuration |
| "Site can't be reached" | Check Log stream for errors |
| "OTP not sending" | Verify EMAIL_PASS is app password |
| "Google OAuth fails" | Check CLIENT_ID/CLIENT_SECRET |
| Very slow first request | Normal for free tier (it sleeps) |

---

## IMPORTANT FILES

**In Backend folder:**
```
📖 DEPLOYMENT_COMPLETE.md        ← Status summary (READ THIS FIRST)
🚀 DEPLOYMENT_ROADMAP.md          ← Quick process overview
✅ LOCAL_TESTING_CHECKLIST.md     ← How to test locally
📚 AZURE_BACKEND_DEPLOYMENT.md    ← Full guide with screenshots
⚙️ .env.production                ← Template for Azure vars
🔧 server.js                      ← Updated for production
🔧 passport.js                    ← Fixed for Azure
```

---

## URLS TO BOOKMARK

```
Azure Portal:           https://portal.azure.com
MongoDB Atlas:          https://cloud.mongodb.com
GitHub:                 https://github.com/login
Your Backend (after):   https://buyonix-backend-api.azurewebsites.net
```

---

## TIMELINE

| Step | Time | Action |
|------|------|--------|
| 1 | 5 min | Read DEPLOYMENT_COMPLETE.md |
| 2 | 30 min | Follow LOCAL_TESTING_CHECKLIST.md |
| 3 | 1 hour | Complete all local tests |
| 4 | 10 min | Create GitHub repo & push |
| 5 | 20 min | Create Azure App Service |
| 6 | 10 min | Add environment variables |
| 7 | 5-15 min | Wait for deployment |
| 8 | 5 min | Verify backend works |

**Total: ~2-3 hours** ✨

---

## SUCCESS INDICATORS

You're on track when:

```
✅ Local backend runs without errors
✅ curl http://localhost:5000/auth/login/success works
✅ Code pushed to GitHub successfully  
✅ Azure App Service created
✅ GitHub Actions shows deployment running
✅ Backend URL accessible
✅ Azure logs show no errors
✅ API endpoints return data
```

---

## DO'S & DON'TS

### ✅ DO:
- Test locally first
- Add environment variables in Azure
- Monitor logs regularly
- Keep .env files secure
- Read the full guides

### ❌ DON'T:
- Skip local testing
- Hardcode secrets in code
- Commit .env to Git
- Deploy without verifying
- Ignore error messages

---

## HELP NEEDED?

**Check these in order:**
1. Terminal/Browser console for error messages
2. Azure Log stream (App Service → Log stream)
3. AZURE_BACKEND_DEPLOYMENT.md → FIXING COMMON ISSUES
4. LOCAL_TESTING_CHECKLIST.md → Test results

---

## NEXT ACTION

**Right now, open:**
```
Backend/DEPLOYMENT_COMPLETE.md
```

**Then follow the DEPLOYMENT_ROADMAP.md**

**You've got this!** 🚀

---

**Print this card for quick reference during deployment!**
