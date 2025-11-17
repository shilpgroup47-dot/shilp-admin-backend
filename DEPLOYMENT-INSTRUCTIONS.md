# 🚀 IMMEDIATE DEPLOYMENT STEPS for backend.shilpgroup.com

## ✅ STEP 1: Upload Files to cPanel

### Files to Upload to `/home/shilfmfe/server_running/backend.shilpgroup.com/`:
```
manual_deploy_20251117_125028/
├── app.js ← CRITICAL MAIN FILE!
├── src/ (entire folder)
├── package.json
├── package-lock.json
├── .env
├── restart-app.sh
└── uploads/ (create if not exists)
```

### File to Upload to `/home/shilfmfe/public_html/`:
```
restart.php ← For auto restart functionality
```

## ✅ STEP 2: cPanel Node.js App Setup

1. **Go to cPanel → Node.js Apps**
2. **Create Application** with these settings:
   - **App Root**: `/server_running/backend.shilpgroup.com`
   - **App URL**: `backend.shilpgroup.com`
   - **Application startup file**: `app.js`
   - **Node.js version**: `18.x` or higher

3. **Environment Variables** (Add these in cPanel):
   ```
   NODE_ENV=production
   PORT=8081
   JWT_SECRET=your-secret-here
   DATABASE_URL=your-database-connection-string
   ```

## ✅ STEP 3: Test Deployment

After uploading and configuring, test these URLs:

```bash
# Test if backend is running
curl https://backend.shilpgroup.com/api/health

# Test restart functionality  
curl https://backend.shilpgroup.com/restart.php

# Manual restart if needed
curl -X POST https://backend.shilpgroup.com/restart.php
```

## ✅ STEP 4: Enable Auto Restart from GitHub

The GitHub Actions workflow is already configured to automatically:
1. Deploy code when you push to `main` branch
2. Call `https://backend.shilpgroup.com/restart.php` to restart the application

## 🔧 TROUBLESHOOTING

### If backend returns 404:
1. Check if `app.js` exists in `/server_running/backend.shilpgroup.com/`
2. Verify Node.js app is configured correctly in cPanel
3. Check if Node.js app is started in cPanel

### If restart.php returns 404:
1. Make sure `restart.php` is in `/public_html/` directory
2. Check file permissions (should be 644)

### If application won't start:
1. Check Node.js logs in cPanel
2. Verify environment variables are set
3. Check if `.env` file has correct database credentials

## 🎯 QUICK COMMANDS

```bash
# Test current deployment
./test-restart.sh

# Create new deployment package  
./manual-deploy.sh

# Check if files exist after upload
curl -I https://backend.shilpgroup.com/restart.php
curl -I https://backend.shilpgroup.com/api/health
```

## 📁 CURRENT DEPLOYMENT PACKAGE

Your deployment files are ready in:
**`manual_deploy_20251117_125028/`**

Simply upload these files to cPanel and configure Node.js app as described above!

---
**🎉 Once deployed, your GitHub pushes will automatically update and restart the backend at https://backend.shilpgroup.com**