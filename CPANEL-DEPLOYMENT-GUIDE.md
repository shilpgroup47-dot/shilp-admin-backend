# cPanel Deployment Guide for Shilp Admin Backend

## 🚨 Fixed Issues:
1. ✅ **app.js** now included in deployment package
2. ✅ **restart.php** script for automated restarts
3. ✅ **Improved deployment workflow** with retry logic
4. ✅ **Manual deployment option** available

## 📋 Pre-Deployment Checklist

### 1. GitHub Repository Secrets
Set these secrets in your GitHub repository (Settings > Secrets and Variables > Actions):

```
CPANEL_FTP_SERVER=your-cpanel-ftp-server.com
CPANEL_FTP_USERNAME=your-ftp-username
CPANEL_FTP_PASSWORD=your-ftp-password
CPANEL_FTP_SERVER_DIR=/path/to/your/backend/directory/
```

### 2. cPanel Node.js App Setup
1. **Create Node.js App in cPanel:**
   - Go to cPanel → Node.js Apps
   - Click "Create Application"
   - App Root: `/server_running/backend.shilpgroup.com`
   - App URL: `backend.shilpgroup.com`
   - Application startup file: `app.js`
   - Node.js version: `18` or higher

2. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8081
   JWT_SECRET=your-jwt-secret
   DATABASE_URL=your-database-connection
   ```

### 3. File Structure in cPanel
```
/home/shilfmfe/server_running/backend.shilpgroup.com/
├── app.js                 ← Main entry point (CRITICAL!)
├── src/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   └── services/
├── package.json
├── package-lock.json
├── .env
├── restart-app.sh
└── uploads/

/home/shilfmfe/public_html/
└── restart.php           ← For automated restarts
```

## 🚀 Deployment Options

### Option 1: Automatic Deployment (GitHub Actions)
- Push to `main` branch
- GitHub Actions will automatically deploy
- Includes retry logic for restarts
- Health checks included

### Option 2: Manual Deployment
```bash
# Run the manual deployment script
./manual-deploy.sh

# Then upload files via cPanel File Manager:
# 1. Upload contents to: /server_running/backend.shilpgroup.com/
# 2. Upload restart.php to: /public_html/
# 3. Visit: https://backend.shilpgroup.com/restart.php
```

### Option 3: FTP Deployment
```bash
# Use any FTP client to upload:
# - All files to: /server_running/backend.shilpgroup.com/
# - restart.php to: /public_html/
```

## 🔄 Restart Methods

### Method 1: Via restart.php (Recommended)
```bash
curl https://backend.shilpgroup.com/restart.php
```

### Method 2: Via cPanel Node.js Apps
1. Go to cPanel → Node.js Apps
2. Find your app
3. Click "Stop" then "Start"

### Method 3: Via SSH (if available)
```bash
cd /home/shilfmfe/server_running/backend.shilpgroup.com
./restart-app.sh
```

## ✅ Verification Steps

### 1. Check if app.js exists:
```bash
ls -la /home/shilfmfe/server_running/backend.shilpgroup.com/app.js
```

### 2. Test health endpoint:
```bash
curl https://backend.shilpgroup.com/api/health
```

### 3. Check logs:
```bash
tail -f /home/shilfmfe/logs/app.log
tail -f /home/shilfmfe/logs/restart.log
```

### 4. Check process:
```bash
ps aux | grep node
```

## 🔧 Troubleshooting

### Issue: "app.js not found"
**Solution:** Ensure `app.js` is uploaded to the root directory

### Issue: "Application won't start"
**Solutions:**
1. Check Node.js version (should be 18+)
2. Verify `app.js` has correct permissions (755)
3. Check environment variables
4. Review error logs

### Issue: "restart.php returns 403"
**Solution:** Check IP restrictions in restart.php

### Issue: "Database connection failed"
**Solutions:**
1. Verify `.env` file has correct database credentials
2. Check if database server allows connections from your app server
3. Test database connection manually

## 📁 Critical Files Explanation

### `app.js` - Main Entry Point
```javascript
// This file is REQUIRED for cPanel Node.js apps
const app = require('./src/server.js');
module.exports = app;
```

### `restart.php` - Restart Script
- Handles automated restarts from GitHub Actions
- Includes security checks
- Provides detailed logging

### `.env` - Environment Configuration
```
NODE_ENV=production
PORT=8081
JWT_SECRET=your-secret-here
DATABASE_URL=your-database-url
```

## 🎯 Next Steps After Deployment

1. **Test all endpoints:** Use Postman or curl to verify APIs work
2. **Check admin functionality:** Ensure admin login works
3. **Test file uploads:** Verify banner/blog/project uploads work
4. **Monitor logs:** Keep an eye on logs for any errors
5. **Set up monitoring:** Consider setting up uptime monitoring

## 📞 Support Commands

```bash
# Check deployment status
curl -s https://backend.shilpgroup.com/api/health | jq

# Force restart
curl https://backend.shilpgroup.com/restart.php

# Check if all files are deployed
ls -la /home/shilfmfe/server_running/backend.shilpgroup.com/

# View recent logs
tail -20 /home/shilfmfe/logs/app.log
```

---

**✅ The deployment should now work correctly with app.js being properly deployed and automatic restarts functioning!**