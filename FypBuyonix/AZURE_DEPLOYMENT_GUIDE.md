# 🚀 AZURE DEPLOYMENT GUIDE FOR BUYONIX E-COMMERCE APP

## Student Pack Deployment (Easy Steps)

---

## TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Your Application](#step-1-prepare-your-application)
3. [Step 2: Set Up Azure Services](#step-2-set-up-azure-services)
4. [Step 3: Deploy Backend](#step-3-deploy-backend)
5. [Step 4: Deploy Frontend](#step-4-deploy-frontend)
6. [Step 5: Connect Everything](#step-5-connect-everything)
7. [Testing Your Deployment](#testing-your-deployment)
8. [Troubleshooting](#troubleshooting)

---

## PREREQUISITES

### What You Need:
- ✅ Microsoft Azure Student Pack Account (Free $100 credit)
- ✅ Git installed on your computer
- ✅ Node.js installed
- ✅ npm or yarn package manager
- ✅ Your Buyonix application ready

### Create Free Azure Account:
1. Visit: https://azure.microsoft.com/en-us/free/students/
2. Click "Activate now"
3. Sign in with your student email
4. Complete verification
5. You'll get $100 free credit for 12 months

---

## STEP 1: PREPARE YOUR APPLICATION

### A. Update Backend for Production

**1.1 Update server.js**
```
Open: Backend/server.js

Change these lines:

From:
const PORT = process.env.PORT || 5000;

To:
const PORT = process.env.PORT || 8080;

And add this at the top:

// Allow requests from deployed frontend URL
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://your-frontend-url.azurewebsites.net'
];
```

**1.2 Update CORS Settings**
In your server.js, update CORS:

```javascript
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**1.3 Create .env file for Production**
Create file: `Backend/.env`

```
PORT=8080
DATABASE_URL=your_mongodb_connection_string
SESSION_SECRET=your_secure_random_string_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=your_stripe_key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.azurewebsites.net
```

### B. Update Frontend for Production

**1.4 Update API URLs**
Open: `Frontend/src/App.tsx` and `Frontend/src/components/Login.tsx`

Find all instances of:
```
http://localhost:5000
```

Replace with:
```
process.env.VITE_API_URL || 'https://your-backend-url.azurewebsites.net'
```

**1.5 Create Frontend .env file**
Create file: `Frontend/.env.production`

```
VITE_API_URL=https://your-backend-url.azurewebsites.net
VITE_APP_NAME=Buyonix
```

**1.6 Build Frontend**
In terminal, run:
```bash
cd Frontend
npm install
npm run build
```

This creates a `dist` folder with your static files.

---

## STEP 2: SET UP AZURE SERVICES

### A. Create Azure App Service for Backend

**2.1 Open Azure Portal**
- Go to: https://portal.azure.com
- Sign in with your student account

**2.2 Create App Service**
1. Click "+ Create a resource"
2. Search for "App Service"
3. Click "Create"
4. Fill in:
   - **Resource Group:** Create new → "buyonix-resources"
   - **Name:** "buyonix-backend" (must be unique, e.g., "buyonix-backend-yourname")
   - **Runtime stack:** Node 18 LTS
   - **Operating System:** Linux
   - **Region:** Choose closest to you
   - **App Service Plan:** Free F1 (for student pack)
5. Click "Review + Create" → "Create"
6. Wait 2-3 minutes for deployment

**2.3 Create App Service for Frontend**
1. Repeat steps 2.1-2.2
2. Use name: "buyonix-frontend" (or "buyonix-frontend-yourname")
3. Keep App Service Plan as Free F1
4. Click "Create"

### B. Create MongoDB Database (Free Tier)

**2.4 Set Up MongoDB Atlas**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account or sign in
4. Create free cluster:
   - Click "Create" → Select "Free" tier
   - Choose cloud provider (AWS recommended)
   - Choose region closest to you
   - Click "Create Cluster"
5. Wait 5-10 minutes for cluster creation

**2.5 Get MongoDB Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" driver
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<myFirstDatabase>` with "buyonix"

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/buyonix?retryWrites=true&w=majority
```

---

## STEP 3: DEPLOY BACKEND

### 3.1 Create GitHub Repository (Recommended)

**Why GitHub?** Azure can automatically deploy when you push code changes.

1. Go to: https://github.com
2. Create new repository named "buyonix-backend"
3. Initialize with README
4. Clone to your computer:
   ```bash
   git clone https://github.com/yourusername/buyonix-backend.git
   cd buyonix-backend
   ```
5. Copy all Backend files into this folder
6. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### 3.2 Configure Backend App Service

**In Azure Portal:**

1. Go to your "buyonix-backend" App Service
2. Left sidebar → Click "Deployment Center"
3. Choose "GitHub"
4. Sign in to your GitHub account
5. Select:
   - Organization: Your username
   - Repository: buyonix-backend
   - Branch: main
6. Click "Save"

This creates automatic deployment! Every time you push to GitHub, your backend updates automatically.

### 3.3 Add Environment Variables

In Azure Portal:

1. Go to "buyonix-backend" App Service
2. Left sidebar → Click "Configuration" (or "Settings")
3. Click "+ New application setting"
4. Add each variable from your `.env` file:

| Name | Value |
|------|-------|
| DATABASE_URL | mongodb+srv://... (your MongoDB URL) |
| SESSION_SECRET | Generate a random secure string |
| GOOGLE_CLIENT_ID | Your Google OAuth ID |
| GOOGLE_CLIENT_SECRET | Your Google OAuth secret |
| EMAIL_USER | Your Gmail address |
| EMAIL_PASS | Your Gmail app password |
| STRIPE_SECRET_KEY | Your Stripe key |
| NODE_ENV | production |
| FRONTEND_URL | https://buyonix-frontend-yourname.azurewebsites.net |

5. Click "Save" after adding each one

### 3.4 Deploy Backend

1. Go back to "Deployment Center"
2. Click "Sync" button
3. Wait 5-10 minutes
4. When complete, you'll see a green checkmark

**Your backend URL will be:** `https://buyonix-backend-yourname.azurewebsites.net`

### 3.5 Test Backend

Open this URL in browser:
```
https://buyonix-backend-yourname.azurewebsites.net/auth/login/success
```

You should see (even if error):
```json
{"success": false, "message": "user not authenticated"}
```

✅ **Backend is working!**

---

## STEP 4: DEPLOY FRONTEND

### 4.1 Create Frontend GitHub Repository

1. Create new GitHub repo: "buyonix-frontend"
2. Clone it and add all Frontend files
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### 4.2 Build & Deploy with Static Web Apps

**Why Static Web App?** Free, automatically builds and deploys your React app.

**In Azure Portal:**

1. Click "+ Create a resource"
2. Search for "Static Web App"
3. Click "Create"
4. Fill in:
   - **Name:** "buyonix-frontend"
   - **Resource Group:** Select "buyonix-resources" (same as backend)
   - **Hosting plan:** Select "Free"
   - **Region:** Same region as your backend
5. Click "Sign in with GitHub"
6. Authorize Azure
7. Select your repository:
   - Organization: Your GitHub username
   - Repository: buyonix-frontend
   - Branch: main
8. For Build presets, select: **React** (if not appearing, select "Custom")
9. Configure build details:
   - **App location:** Frontend
   - **API location:** (leave empty)
   - **Output location:** dist
10. Click "Review + Create" → "Create"

### 4.3 Update Frontend URL

After deployment completes:

1. Look for your Static Web App URL (something like): 
   ```
   https://buyonix-frontend-abc123.azurewebsites.net
   ```

2. Update your Backend environment variable:
   - Go to "buyonix-backend" App Service
   - Configuration
   - Find "FRONTEND_URL"
   - Update with your Static Web App URL
   - Click "Save"

3. Also update Frontend environment variable:
   - In "Frontend/.env.production":
     ```
     VITE_API_URL=https://buyonix-backend-yourname.azurewebsites.net
     ```
   - Push to GitHub (will trigger auto-rebuild)

---

## STEP 5: CONNECT EVERYTHING

### 5.1 Update Login Component API URLs

**In Frontend/src/components/Login.tsx:**

Change all API calls from:
```javascript
'http://localhost:5000/auth/...'
```

To:
```javascript
`${process.env.VITE_API_URL || 'http://localhost:5000'}/auth/...`
```

Example:
```javascript
const baseUrl = process.env.VITE_API_URL || 'http://localhost:5000';

const response = await fetch(`${baseUrl}/auth/send-login-otp`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(formData),
});
```

### 5.2 Update All Other Components

Do the same for:
- `SignUp.tsx`
- `ForgetPassword.tsx`
- `OTPVerification.tsx`
- Any other component making API calls

### 5.3 Push Changes to GitHub

```bash
cd Frontend
git add .
git commit -m "Update API URLs for production"
git push origin main
```

Static Web App will automatically rebuild and deploy!

---

## TESTING YOUR DEPLOYMENT

### 6.1 Check Frontend

1. Visit: `https://buyonix-frontend-abc123.azurewebsites.net`
2. You should see your Buyonix home page
3. Try navigating around (should not have any errors)

### 6.2 Check Backend

1. Visit: `https://buyonix-backend-yourname.azurewebsites.net/auth/login/success`
2. Should return JSON response (even if error)

### 6.3 Test Login Flow

1. On your frontend, go to Login page
2. Enter test email and password
3. Should receive OTP email
4. Enter OTP
5. Should successfully log in

### 6.4 Check Live URL

Your app is now live at:
```
https://buyonix-frontend-abc123.azurewebsites.net
```

Share this link with friends! 🎉

---

## TROUBLESHOOTING

### Problem 1: "Cannot GET /"
**Solution:** 
- Make sure output location in Static Web App is set to "dist"
- Frontend builds successfully locally

### Problem 2: API calls returning 403/404
**Solution:**
- Check CORS settings in backend
- Verify FRONTEND_URL environment variable is correct
- Ensure backend is running (check "Overview" in Azure console)

### Problem 3: MongoDB connection error
**Solution:**
- Verify DATABASE_URL is correct
- Make sure MongoDB database is created on Atlas
- Check if IP whitelist includes Azure (use 0.0.0.0/0 for testing)

### Problem 4: Email not sending
**Solution:**
- Verify EMAIL_USER and EMAIL_PASS are correct
- Enable "Less secure app access" in Gmail
- For Gmail: Use "App Password" instead of account password
- Check spam folder

### Problem 5: Long deployment times
**Solution:**
- This is normal for free tier (can take 10-15 minutes)
- Go to Deployment Center → Deployment logs to see progress
- Don't worry if it says "Not Started" at first

### Problem 6: Static Web App shows blank page
**Solution:**
- Check build details are correct (App location: Frontend, Output: dist)
- Run `npm run build` locally and verify dist folder exists
- Check GitHub Actions logs for build errors

---

## IMPORTANT NOTES

### ⚠️ Free Tier Limitations:
- **Uptime**: May sleep after 60 minutes of inactivity (normal)
- **Storage**: 1GB total
- **Bandwidth**: Limited
- **Database**: 512MB free on MongoDB Atlas

### 💡 Best Practices:
1. Always test locally before pushing to GitHub
2. Keep sensitive data in environment variables, NOT in code
3. Regularly check Azure costs (even though free tier, good habit)
4. Enable automatic backups for MongoDB

### 🔄 Updating Your App:
Going forward, just:
1. Make changes locally
2. Test and verify
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
4. Azure automatically builds and deploys!

---

## NEXT STEPS

After successful deployment:

1. **Test Everything:**
   - User signup
   - Login with OTP
   - Forget password
   - Product purchase
   - Seller registration

2. **Monitor Performance:**
   - Go to App Service → Metrics
   - Check response times
   - Monitor database usage

3. **Setup Custom Domain (Optional):**
   - Go to Custom domains in App Service
   - Point your domain to Azure

4. **Enable HTTPS (Automatic):**
   - Azure automatically provides free SSL certificate

5. **Regular Backups:**
   - Configure MongoDB backup schedule

---

## QUICK REFERENCE URLS

| Service | URL |
|---------|-----|
| Azure Portal | https://portal.azure.com |
| MongoDB Atlas | https://cloud.mongodb.com |
| GitHub | https://github.com |
| Your App | https://buyonix-frontend-yourname.azurewebsites.net |
| Backend API | https://buyonix-backend-yourname.azurewebsites.net |

---

## NEED HELP?

Common resources:
- Azure Documentation: https://docs.microsoft.com/en-us/azure/
- MongoDB Guide: https://docs.mongodb.com/
- React Deployment: https://vitejs.dev/guide/static-deploy.html

**Good luck! Your app will be live soon! 🚀**

---

**Document Created:** May 2026
**Application:** Buyonix E-Commerce Platform
**Hosting:** Microsoft Azure (Student Pack)
