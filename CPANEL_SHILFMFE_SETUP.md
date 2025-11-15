# 🚀 cPanel Deployment Guide for backend.shilpgroup.com

## 📍 Your Specific Configuration

### **Path Information:**
- **Deployment Path**: `/home/shilfmfe/server_running/backend.shilpgroup.com/`
- **User**: `shilfmfe`
- **Domain**: `backend.shilpgroup.com`
- **Logs**: `/home/shilfmfe/logs/`
- **Backups**: `/home/shilfmfe/backups/`

---

## 🛠️ Step-by-Step Setup

### **Step 1: cPanel Terminal Setup**
```bash
# Login to cPanel Terminal and create directories
mkdir -p /home/shilfmfe/logs
mkdir -p /home/shilfmfe/backups
mkdir -p /home/shilfmfe/server_running

# Navigate to server_running directory
cd /home/shilfmfe/server_running

# Clone your repository
git clone https://github.com/shilpgroup47-dot/shilp-admin-backend.git backend.shilpgroup.com

# Navigate to project directory
cd backend.shilpgroup.com
```

### **Step 2: Set File Permissions**
```bash
# Make scripts executable
chmod +x auto-deploy.sh
chmod +x restart-app.sh
chmod +x deploy.sh

# Set proper permissions for logs and uploads
chmod 755 /home/shilfmfe/logs
mkdir -p uploads/{banners,blogs,projects,projecttree}
chmod 755 uploads uploads/*
```

### **Step 3: Environment Setup**
```bash
# Create production environment file
cp .env.example .env
nano .env

# Add your production configuration:
NODE_ENV=production
PORT=8081
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://backend.shilpgroup.com,https://admin.shilpgroup.com
```

### **Step 4: Install Dependencies**
```bash
# Install production dependencies
npm ci --production
```

### **Step 5: Setup Webhook Handler**
```bash
# Copy webhook to public_html (if you have one)
cp webhook.php /home/shilfmfe/public_html/

# OR create in subdomain directory if needed
mkdir -p /home/shilfmfe/public_html/backend.shilpgroup.com
cp webhook.php /home/shilfmfe/public_html/backend.shilpgroup.com/
```

---

## 🔧 GitHub Webhook Configuration

### **Webhook URL Options:**
- **Main Domain**: `https://shilpgroup.com/webhook.php`
- **Subdomain**: `https://backend.shilpgroup.com/webhook.php`
- **Direct Path**: `https://yourdomain.com/webhook.php`

### **GitHub Webhook Settings:**
```
Repository → Settings → Webhooks → Add webhook

Payload URL: https://backend.shilpgroup.com/webhook.php
Content type: application/json
Secret: set_your_secure_secret_here
Which events: Just the push event
Active: ✅ Checked
```

---

## 🚀 Auto-Deployment Commands

### **Manual Deployment:**
```bash
# SSH into cPanel and run:
cd /home/shilfmfe/server_running/backend.shilpgroup.com
./auto-deploy.sh
```

### **Manual Restart:**
```bash
# Restart Node.js application:
cd /home/shilfmfe/server_running/backend.shilpgroup.com
./restart-app.sh
```

### **Check Status:**
```bash
# Check if application is running:
npm run status
# OR
ps aux | grep "node src/server.js"
```

### **View Logs:**
```bash
# Application logs:
tail -f /home/shilfmfe/logs/app.log

# Deployment logs:
tail -f /home/shilfmfe/logs/auto-deploy.log

# Restart logs:
tail -f /home/shilfmfe/logs/restart.log

# Webhook logs:
tail -f /home/shilfmfe/logs/webhook.log
```

---

## ⚡ NPM Scripts Available

```bash
# Start application
npm start

# Start in production mode
npm run start:production

# Restart application (uses restart-app.sh)
npm run restart

# Run auto-deployment (uses auto-deploy.sh)
npm run auto-deploy

# Check application status
npm run status

# View live logs
npm run logs
```

---

## 🔍 Testing the Setup

### **Test 1: Manual Start**
```bash
cd /home/shilfmfe/server_running/backend.shilpgroup.com
npm start
# Should start on port 8081
```

### **Test 2: Health Check**
```bash
# Test if API is responding:
curl http://localhost:8081/api/health
# OR
curl https://backend.shilpgroup.com/api/health
```

### **Test 3: Auto-Deploy**
```bash
# Make a small change and push to GitHub:
echo "// Test auto-deploy" >> README.md
git add .
git commit -m "Test auto-deployment"
git push origin main

# Check webhook logs:
tail -f /home/shilfmfe/logs/webhook.log
```

---

## 📂 File Structure in cPanel

```
/home/shilfmfe/
├── server_running/
│   └── backend.shilpgroup.com/        ← Your main code here
│       ├── src/
│       ├── uploads/
│       ├── auto-deploy.sh
│       ├── restart-app.sh
│       ├── deploy.sh
│       └── package.json
├── logs/
│   ├── app.log                        ← Application logs
│   ├── auto-deploy.log               ← Deployment logs
│   ├── restart.log                   ← Restart logs
│   └── webhook.log                   ← Webhook logs
├── backups/                          ← Code backups
└── public_html/
    └── webhook.php                   ← GitHub webhook handler
```

---

## 🎯 Auto-Deploy Workflow

```
1. Developer pushes code to GitHub
2. GitHub triggers webhook → https://backend.shilpgroup.com/webhook.php
3. Webhook executes → /home/shilfmfe/server_running/backend.shilpgroup.com/auto-deploy.sh
4. Script does:
   ✅ Backup existing uploads
   ✅ Git pull latest code
   ✅ Restore uploads
   ✅ npm ci --production
   ✅ Kill old Node.js process
   ✅ Start new Node.js process
   ✅ Verify health check
```

---

## ✅ Success Indicators

When everything is working:

```bash
# Check running process:
ps aux | grep "node src/server.js"
# Should show: node src/server.js

# Check health:
curl http://localhost:8081/api/health
# Should return: {"success":true,"message":"Server is running"}

# Check logs:
tail -f /home/shilfmfe/logs/app.log
# Should show: ✅ Successfully connected to MongoDB!
#             🚀 Server running on port 8081
```

---

## 🚨 Common Issues & Solutions

### **Issue: Permission Denied**
```bash
# Fix permissions:
chmod +x /home/shilfmfe/server_running/backend.shilpgroup.com/*.sh
chmod 755 /home/shilfmfe/server_running/backend.shilpgroup.com/uploads
```

### **Issue: Port Already in Use**
```bash
# Kill existing processes:
pkill -f "node src/server.js"
# Then restart:
./restart-app.sh
```

### **Issue: MongoDB Connection Failed**
```bash
# Check .env file:
cat .env | grep DATABASE_URL
# Update with correct MongoDB Atlas connection string
```

### **Issue: Webhook Not Working**
```bash
# Check webhook file exists:
ls -la /home/shilfmfe/public_html/webhook.php

# Test webhook manually:
curl -X POST https://backend.shilpgroup.com/webhook.php

# Check logs:
tail -f /home/shilfmfe/logs/webhook.log
```

---

## 🎉 Ready for Production!

After setup completion, your backend will:
- ✅ **Auto-deploy** on every Git push
- ✅ **Auto-restart** Node.js application  
- ✅ **Preserve uploads** during deployments
- ✅ **Install dependencies** automatically
- ✅ **Log everything** for monitoring

**Domain**: https://backend.shilpgroup.com  
**API Health**: https://backend.shilpgroup.com/api/health