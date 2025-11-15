# 🚀 cPanel Auto-Refresh & Node.js Restart Setup Guide

## 🎯 Complete Solution: Auto-Deploy + Auto-Restart

### ✅ What This Setup Does:

1. **🔄 Auto-Refresh**: Git push karne par cPanel mein code automatically update
2. **⚡ Auto-Restart**: File upload ke baad Node.js application restart 
3. **💾 Preserve Uploads**: User uploaded files kabhi delete nahi honge
4. **📊 Logging**: Complete deployment aur upload activity logs
5. **🔍 Health Monitoring**: Application status verification

---

## 📂 Files Created for Auto-Refresh:

### **1. auto-deploy.sh** - Main Auto-Deployment Script
```bash
# Features:
- Git pull from main branch
- Preserve existing uploads
- Install dependencies
- Restart Node.js application
- Health check verification
- Complete logging
```

### **2. webhook.php** - GitHub Webhook Handler
```php
# Features:
- Secure signature verification
- JSON payload validation
- Main branch push detection
- Auto-deployment triggering
- Response status reporting
```

### **3. restart-app.sh** - Node.js Restart Script
```bash
# Features:
- Safe process termination
- PID management
- Application startup
- Health check validation
- Error handling
```

### **4. postUploadHandler.js** - File Upload Auto-Refresh
```javascript
// Features:
- Post-upload actions
- Cache clearing
- Logging uploads
- Optional restart triggers
- Webhook notifications
```

---

## 🛠️ cPanel Setup Steps:

### **Step 1: Upload Files to cPanel**
```bash
# Upload these files to your cPanel:
public_html/webhook.php          # GitHub webhook handler
public_html/api/auto-deploy.sh   # Main deployment script
public_html/api/restart-app.sh   # Application restart script
```

### **Step 2: Set File Permissions**
```bash
# In cPanel Terminal:
cd /home/yourusername/public_html/api
chmod +x auto-deploy.sh
chmod +x restart-app.sh
chmod 644 ../webhook.php

# Create necessary directories:
mkdir -p /home/yourusername/logs
mkdir -p /home/yourusername/backups
```

### **Step 3: Configure GitHub Webhook**
1. **GitHub Repository** → **Settings** → **Webhooks**
2. **Add Webhook**:
   ```
   Payload URL: https://yourdomain.com/webhook.php
   Content type: application/json
   Secret: your_secure_webhook_secret
   Events: Just the push event
   Active: ✅ Checked
   ```

### **Step 4: Update Webhook Secret**
```php
// Edit webhook.php file:
$secret = 'your_actual_webhook_secret_here';
```

### **Step 5: Configure Paths**
```bash
# Edit auto-deploy.sh and restart-app.sh:
# Replace 'yourusername' with your actual cPanel username
DEPLOY_PATH="/home/YOUR_USERNAME/public_html/api"
```

---

## 🔧 How Auto-Refresh Works:

### **Git Push Workflow:**
```
Local Code → Git Push → GitHub → Webhook → cPanel → Auto-Deploy → Node.js Restart
```

### **File Upload Workflow:**
```
File Upload → Success Response → Post-Upload Handler → Cache Clear → Auto-Restart
```

---

## ⚙️ Configuration Options:

### **1. Enable Auto-Restart After File Upload**
```javascript
// In your upload routes, add:
const postUploadHandler = require('./middleware/postUploadHandler');

// Apply middleware:
app.use('/api/upload', postUploadHandler({
    restartCommand: '/home/yourusername/public_html/api/restart-app.sh',
    clearCache: true,
    logUploads: true
}));
```

### **2. Manual Restart Command**
```bash
# From cPanel Terminal:
cd /home/yourusername/public_html/api
./restart-app.sh
```

### **3. Manual Deployment**
```bash
# From cPanel Terminal:
cd /home/yourusername/public_html/api
./auto-deploy.sh
```

---

## 📊 Monitoring & Logs:

### **View Deployment Logs:**
```bash
tail -f /home/yourusername/logs/auto-deploy.log
tail -f /home/yourusername/logs/webhook.log
```

### **View Application Logs:**
```bash
tail -f /home/yourusername/logs/app.log
tail -f /home/yourusername/logs/restart.log
```

### **View Upload Logs:**
```bash
tail -f /home/yourusername/public_html/api/logs/uploads.log
```

---

## 🔍 Testing the Setup:

### **Test 1: Git Push Auto-Deploy**
```bash
# Make a small change and push:
echo "// Test change" >> README.md
git add .
git commit -m "Test auto-deploy"
git push origin main

# Check webhook response:
curl https://yourdomain.com/webhook.php
```

### **Test 2: Manual Restart**
```bash
# SSH into cPanel and run:
cd /home/yourusername/public_html/api
./restart-app.sh
```

### **Test 3: Health Check**
```bash
# Test if application is running:
curl http://localhost:8081/api/health
# OR
curl https://yourdomain.com/api/health
```

---

## 🚨 Troubleshooting:

### **If Auto-Deploy Fails:**
```bash
# Check webhook logs:
cat /home/yourusername/logs/webhook.log

# Check deployment logs:
cat /home/yourusername/logs/auto-deploy.log

# Manually run deployment:
cd /home/yourusername/public_html/api
./auto-deploy.sh
```

### **If Node.js Won't Start:**
```bash
# Check application logs:
cat /home/yourusername/logs/app.log

# Check process status:
ps aux | grep node

# Manual restart:
./restart-app.sh
```

### **If Uploads Are Missing:**
```bash
# Check if uploads backup exists:
ls -la uploads_backup_*

# Restore from backup:
cp -R uploads_backup_*/* uploads/
```

---

## ✅ Success Indicators:

When everything works correctly, you'll see:

1. **Git Push**: Automatic deployment within 10-30 seconds
2. **File Upload**: Application restart notification in logs  
3. **Health Check**: HTTP 200 response from `/api/health`
4. **Logs**: Clear deployment and restart timestamps
5. **Uploads**: User files preserved across deployments

---

## 🎉 Final Result:

- ✅ **Push code** → **Auto-deploy** in cPanel
- ✅ **Upload file** → **Auto-restart** Node.js  
- ✅ **Zero downtime** for users
- ✅ **Complete logging** for monitoring
- ✅ **Safe deployments** with backup/restore

**Your cPanel will now auto-refresh and restart whenever needed!** 🚀