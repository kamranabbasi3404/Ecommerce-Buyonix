# AZURE BACKEND DEPLOYMENT GUIDE
## Buyonix E-Commerce - Backend Deployment

---

## 📋 TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Backend for Azure](#step-1-prepare-backend-for-azure)
3. [Step 2: Create App Service](#step-2-create-app-service)
4. [Step 3: Setup GitHub Integration](#step-3-setup-github-integration)
5. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
6. [Step 5: Add MongoDB Connection](#step-5-add-mongodb-connection)
7. [Step 6: Deploy](#step-6-deploy)
8. [Step 7: Verify Deployment](#step-7-verify-deployment)
9. [Monitoring](#monitoring)
10. [Fixing Common Issues](#fixing-common-issues)

---

## PREREQUISITES

✅ You must have completed:
- Local testing of backend (see LOCAL_TESTING_CHECKLIST.md)
- GitHub account created
- Backend code pushed to GitHub
- Azure account with student pack active
- $100 Azure credit available

---

## STEP 1: PREPARE BACKEND FOR AZURE

### 1.1 Create .gitignore (Don't upload sensitive data)

**File:** `Backend/.gitignore`

```
node_modules/
.env
.env.local
.env.*.local
dist/
coverage/
*.log
.DS_Store
```

### 1.2 Verify package.json

**File:** `Backend/package.json`

Must have:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Change to:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Important:** Azure runs `npm start`, so it must use `node server.js` (not nodemon)

### 1.3 Create Azure Startup Script

**File:** `Backend/web.config` (Windows App Service)

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}" />
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <fileExtensions>
          <fileExtension filename="web.config" allowed="false" />
        </fileExtensions>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
    <iisnode nodeProcessCommandLine="&quot;%programfiles%\nodejs\node.exe&quot;" />
  </system.webServer>
</configuration>
```

### 1.4 Commit and Push to GitHub

```bash
cd Backend
git add .
git commit -m "Prepare for Azure deployment"
git push origin main
```

---

## STEP 2: CREATE APP SERVICE

### 2.1 Create Resource Group

1. Go to **Azure Portal** → https://portal.azure.com
2. Click **"+ Create a resource"**
3. Search for **"Resource group"**
4. Click **"Create"**
5. Fill in:
   - **Subscription:** Azure for Students
   - **Resource group name:** `buyonix-production`
   - **Region:** Choose closest to your location (e.g., `East US`)
6. Click **"Review + create"** → **"Create"**
7. Wait for creation to complete ✅

### 2.2 Create App Service for Backend

1. Click **"+ Create a resource"**
2. Search for **"App Service"**
3. Click **"Create"**
4. Fill in the form:

   **Basics Tab:**
   - **Subscription:** Azure for Students
   - **Resource Group:** Select `buyonix-production` (created above)
   - **Name:** `buyonix-backend-api` (must be globally unique)
   - **Publish:** Code
   - **Runtime stack:** Node 20 LTS
   - **Operating System:** Linux
   - **Region:** Same as resource group (East US)
   - **App Service Plan:** 
     - Click **"Create new"**
     - **Name:** `buyonix-api-plan`
     - **Sku and size:** Select **Free F1** (for student pack)
     - Click **"OK"**

5. Click **"Review + create"**
6. Review everything looks correct
7. Click **"Create"**
8. Wait 2-3 minutes for deployment

**Success:** You'll see "Your deployment is complete" ✅

---

## STEP 3: SETUP GITHUB INTEGRATION

### 3.1 Connect GitHub Repository

1. Go to your newly created App Service
2. Left sidebar → Click **"Deployment Center"**
3. Select **"GitHub"** as source
4. Click **"Authorize"**
5. Sign in to your GitHub account when prompted
6. A popup appears asking permissions → Click **"Authorize"**
7. Select:
   - **Organization:** Your GitHub username
   - **Repository:** `buyonix-backend`
   - **Branch:** `main`
8. Click **"Save"**

**What happens:**
- Azure creates a GitHub Action workflow
- Every time you push to `main` branch, Azure automatically rebuilds and deploys
- You'll see deployment logs in "Deployment Center" → "GitHub Actions"

### 3.2 Monitor Deployment

1. Click **"Deployments"** tab
2. You should see a deployment in progress
3. Wait for it to complete (5-10 minutes for first deployment)
4. When complete, status shows ✅ "Success"

---

## STEP 4: CONFIGURE ENVIRONMENT VARIABLES

### 4.1 Add App Settings

1. In your App Service page, left sidebar click **"Configuration"**
2. You'll see two sections:
   - **Application settings** (what we need)
   - **Connection strings**

### 4.2 Add Each Environment Variable

Click **"+ New application setting"** for each:

| Name | Value | Notes |
|------|-------|-------|
| `NODE_ENV` | `production` | Important! |
| `PORT` | `8080` | Default for Azure |
| `FRONTEND_URL` | `https://buyonix-frontend-abc123.azurewebsites.net` | Update with your frontend URL |
| `BACKEND_URL` | `https://buyonix-backend-api.azurewebsites.net` | Your backend URL |
| `SESSION_SECRET` | Generate strong random string | Use: https://www.uuidgenerator.net/ |
| `DB_URI` | Your MongoDB connection string | See Step 5 below |
| `CLIENT_ID` | Your Google OAuth ID | From .env |
| `CLIENT_SECRET` | Your Google OAuth secret | From .env |
| `EMAIL_USER` | Gmail address | From .env |
| `EMAIL_PASS` | Gmail app password | From .env |
| `STRIPE_SECRET_KEY` | Your Stripe key | From .env |
| `GEMINI_API_KEY` | Your Gemini API key | From .env |

**Important Before Saving:**

For each setting:
1. Enter Name
2. Enter Value
3. Click **"Add"** (not save yet)
4. Repeat for all settings

When all settings added, click **"Save"** button at top

**Warning:** These variables are now stored safely in Azure, not in code!

---

## STEP 5: ADD MONGODB CONNECTION

### 5.1 Get MongoDB Connection String

1. Go to **MongoDB Atlas** → https://cloud.mongodb.com
2. Login to your account
3. Click your cluster **"Connect"**
4. Choose **"Connect your application"**
5. Select **Node.js** driver
6. Copy the connection string

**Format:**
```
mongodb+srv://Buyonix:buyonix.4321@buyonix.aoue5po.mongodb.net/buyonix?retryWrites=true&w=majority
```

### 5.2 Configure IP Whitelist

⚠️ **Azure IPs change, so allow all:**

1. In MongoDB Atlas, go to **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Enter `0.0.0.0/0`
5. Click **"Confirm"**

✅ Now Azure can connect to MongoDB

### 5.3 Add to Azure App Service

1. From "Configuration" page in Azure
2. Click **"+ New application setting"**
3. **Name:** `DB_URI`
4. **Value:** Paste your MongoDB connection string
5. Click **"Add"** then **"Save"**

---

## STEP 6: DEPLOY

### 6.1 Trigger Deployment

Option A: **Automatic (Recommended)**
```bash
cd Backend
git add .
git commit -m "Backend ready for Azure"
git push origin main
```

Azure automatically detects the push and deploys!

Option B: **Manual Redeploy**
1. In App Service → **Deployment Center**
2. Click **"Sync"** button
3. Wait for deployment to complete

### 6.2 Monitor Deployment

1. Go to **Deployment Center** → **GitHub Actions**
2. You'll see workflow running:
   - 🟡 In Progress (yellow)
   - ✅ Success (green checkmark)
   - ❌ Failed (red)

**First deployment takes 10-15 minutes**

**If failed:**
- Click on the failed workflow to see logs
- Common issues: Missing dependencies, Node version mismatch
- See "Fixing Common Issues" section below

---

## STEP 7: VERIFY DEPLOYMENT

### 7.1 Get Your Backend URL

1. Go to your App Service page
2. Look for **"Default domain"** at the top
3. It looks like: `https://buyonix-backend-api.azurewebsites.net`

**Copy this URL** - you'll need it for frontend

### 7.2 Test Backend Health

**In Browser:**
```
https://buyonix-backend-api.azurewebsites.net/auth/login/success
```

**Expected Response:**
```json
{
  "success": false,
  "message": "user not authenticated"
}
```

✅ **Backend is working!**

### 7.3 Test API Endpoints

**Get Products:**
```
https://buyonix-backend-api.azurewebsites.net/product/all
```

Should return product list.

**Check Logs:**
1. Go to App Service
2. Left sidebar → **"Log stream"**
3. You'll see real-time logs of requests
4. Look for errors

---

## MONITORING

### 8.1 Check Performance

1. Go to your App Service page
2. Left sidebar → **"Metrics"**
3. View:
   - Response time
   - Request count
   - Server errors
   - CPU usage

### 8.2 View Application Logs

1. Left sidebar → **"Log stream"**
2. Shows live logs of:
   - Connection attempts
   - API requests
   - Errors

### 8.3 Set Up Alerts (Optional)

1. Left sidebar → **"Alerts"**
2. Click **"Create"** → **"New alert rule"**
3. Set alert for:
   - High CPU usage
   - High response time
   - Server errors

---

## FIXING COMMON ISSUES

### Issue 1: "Site cannot be reached" / 500 Error

**Solution:**
1. Go to **App Service** → **Log stream**
2. Check for error messages
3. Common causes:
   - Missing environment variables (check Configuration)
   - Database connection failed (check DB_URI is correct)
   - Node version mismatch

**Fix:**
```
Check Configuration → ensure all vars added correctly
Redeploy: Go to Deployment Center → Click "Sync"
```

### Issue 2: "Cannot connect to MongoDB"

**Error in logs:**
```
MongoNetworkError: connect ENOTFOUND
```

**Solution:**
- Verify `DB_URI` is correct in Configuration
- Check MongoDB Atlas IP whitelist
- Ensure `0.0.0.0/0` is in allowed IPs
- Test connection string locally first

**Fix:**
```
1. Copy DB_URI from MongoDB Atlas
2. In Azure Configuration, update DB_URI
3. Click "Save"
4. Redeploy
```

### Issue 3: "Email not sending"

**Error in logs:**
```
Error: Invalid login
```

**Solution:**
- `EMAIL_USER` must be correct Gmail
- `EMAIL_PASS` must be APP PASSWORD, not regular password
- Generate new app password: https://myaccount.google.com/apppasswords

**Fix:**
```
1. If Gmail: Generate new App Password
2. Update EMAIL_PASS in Azure Configuration
3. Click "Save"
4. Redeploy
```

### Issue 4: "CORS errors from frontend"

**Error in browser console:**
```
Access to XMLHttpRequest blocked by CORS
```

**Solution:**
- `FRONTEND_URL` must be correct
- Must match exactly (including https://)

**Fix:**
```
1. Note your frontend URL
2. In Azure Configuration, update FRONTEND_URL
3. Click "Save"
4. Redeploy
```

### Issue 5: "Deployment fails immediately"

**Error in GitHub Actions:**
```
npm ERR! code ENOENT
```

**Solution:**
- Verify `package.json` has `"start": "node server.js"`
- Ensure no syntax errors in server.js
- Check node_modules not in Git (.gitignore)

**Fix:**
```
1. Fix the error locally
2. Commit and push: git push
3. Azure auto-redeploys
```

### Issue 6: "Response times very slow"

**Cause:**
- Free tier App Service Plan sleeps after 20 minutes inactivity
- First request after sleep takes longer

**Solution (Normal for Free tier):**
- Upgrade to Basic tier (paid) for continuous running
- Use keep-alive service like Uptime Robot (free)

---

## IMPORTANT NOTES

### ⚠️ Free Tier Limitations
- **Sleep:** App sleeps after 20 minutes with no requests (first request wakes it up)
- **No SLA:** No guaranteed uptime
- **Storage:** 1GB total
- **CPU:** Limited CPU allocation

### ✅ Best Practices for Azure
1. **Environment Separation:**
   - Keep .env for local development
   - Use Azure Configuration for production
   - Never commit .env to Git

2. **Secrets Management:**
   - Store passwords in Azure Key Vault (not just Configuration)
   - Rotate credentials regularly
   - Don't share connection strings

3. **Monitoring:**
   - Check logs regularly
   - Set up alerts for errors
   - Monitor database usage

4. **Backups:**
   - MongoDB Atlas handles backups automatically
   - But maintain your own backups for critical data

---

## ✅ DEPLOYMENT CHECKLIST

Before declaring deployment complete:

- [ ] Backend URL created (https://buyonix-backend-api.azurewebsites.net)
- [ ] GitHub workflows running green
- [ ] Environment variables added and saved
- [ ] Database connection working (check logs)
- [ ] Test endpoint returns data
- [ ] Email OTP sends successfully
- [ ] Google OAuth testing works
- [ ] No errors in Log stream
- [ ] Frontend URL updated in Configuration
- [ ] Metrics showing in Metrics tab

---

## NEXT STEPS

After backend deployment:

1. **Update Frontend:**
   - Update API URL to your Azure backend URL
   - Deploy frontend to Azure Static Web Apps

2. **Test Integration:**
   - Test full signup flow
   - Test login with OTP
   - Test forgot password
   - Test all product endpoints

3. **Monitor:**
   - Check logs daily
   - Set up alerts
   - Monitor costs

---

**Document Created:** May 2026
**Last Updated:** May 2026
**Version:** 1.0
