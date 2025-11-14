# 🚀 Production Deployment Guide - cPanel Node.js

## 📋 Pre-requisites

### cPanel Requirements
- ✅ Node.js enabled in cPanel
- ✅ Git access
- ✅ SSL certificate installed
- ✅ Domain/subdomain configured

### Local Setup
- ✅ Project code pushed to GitHub
- ✅ Production environment variables ready

---

## 🔧 Step-by-Step Deployment Process

### **Step 1: cPanel Node.js Setup**

1. **Login to cPanel**
   ```
   https://yourdomain.com/cpanel
   ```

2. **Access Node.js App**
   - Go to "Software" → "Node.js App"
   - Click "Create Application"

3. **Configure Node.js App**
   ```
   Node.js Version: 18.x (or latest LTS)
   Application Mode: Production
   Application Root: public_html/api
   Application URL: api.yourdomain.com (or subdomain)
   Application Startup File: src/server.js
   ```

4. **Environment Variables**
   - Add all variables from `.env.example`
   - **CRITICAL**: Use secure values for production

### **Step 2: GitHub Repository Connection**

1. **Generate SSH Key in cPanel Terminal**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@domain.com"
   cat ~/.ssh/id_rsa.pub
   ```

2. **Add SSH Key to GitHub**
   - Go to GitHub → Settings → SSH Keys
   - Add the public key

3. **Clone Repository**
   ```bash
   cd ~/public_html
   git clone git@github.com:shilpgroup47-dot/shilp-admin-backend.git api
   cd api
   ```

### **Step 3: Production Environment Setup**

1. **Create Production Environment File**
   ```bash
   cp .env.example .env.production
   nano .env.production
   ```

2. **Update Production Variables**
   ```env
   NODE_ENV=production
   PORT=8081
   DATABASE_URL=your_production_mongodb_url
   JWT_SECRET=your_secure_64_byte_random_string
   CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
   ```

3. **Set Permissions**
   ```bash
   chmod +x start.sh
   chmod +x deploy.sh
   mkdir -p uploads/{banners,blogs,projects,projecttree}
   chmod 755 uploads uploads/*
   ```

### **Step 4: Install Dependencies**

```bash
cd ~/public_html/api
npm ci --production
```

### **Step 5: Start Application**

1. **In cPanel Node.js App Interface**
   - Click "Start App"
   - Monitor logs for any errors

2. **Verify Installation**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

### **Step 6: Setup Auto-Deployment (GitHub Webhooks)**

1. **Create Webhook Handler**
   ```bash
   # Create webhook endpoint in your cPanel
   nano ~/public_html/webhook.php
   ```

2. **Webhook PHP Script**
   ```php
   <?php
   // Simple webhook handler
   if ($_POST['payload']) {
       shell_exec('cd /home/yourusername/public_html/api && ./deploy.sh > /dev/null 2>&1 &');
       echo "Deployment triggered";
   }
   ?>
   ```

3. **Configure GitHub Webhook**
   - Go to GitHub Repository → Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/webhook.php`
   - Select "Push events"

---

## 🔒 Security Checklist

### **Environment Security**
- [ ] ❌ Never commit `.env` or `.env.production`
- [ ] ✅ Use strong JWT secrets (64+ characters)
- [ ] ✅ Secure database credentials
- [ ] ✅ Restrict CORS origins to production domains

### **File Permissions**
```bash
# Set secure file permissions
find ~/public_html/api -type f -exec chmod 644 {} \;
find ~/public_html/api -type d -exec chmod 755 {} \;
chmod 600 ~/public_html/api/.env.production
chmod +x ~/public_html/api/{start.sh,deploy.sh}
```

### **Database Security**
- [ ] ✅ MongoDB Atlas IP whitelist configured
- [ ] ✅ Database user with minimal required permissions
- [ ] ✅ Connection string secured

---

## 🔄 Auto-Deployment Workflow

```
Developer Push → GitHub → Webhook → cPanel → Auto Deploy → App Restart
```

### **Manual Deployment**
```bash
cd ~/public_html/api
./deploy.sh
```

### **Manual Restart**
```bash
# In cPanel Node.js interface
# Or via command line if PM2 is configured
pm2 restart all
```

---

## 📊 Monitoring & Logs

### **View Application Logs**
```bash
# cPanel Node.js logs are available in the interface
# Or check system logs
tail -f ~/logs/api_error.log
```

### **Health Monitoring**
- Monitor endpoint: `https://api.yourdomain.com/api/health`
- Setup uptime monitoring (UptimeRobot, etc.)

---

## 🐛 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   lsof -i :8081
   kill -9 <PID>
   ```

2. **Permission Errors**
   ```bash
   chmod -R 755 ~/public_html/api
   chown -R username:username ~/public_html/api
   ```

3. **Node.js Version Issues**
   - Ensure cPanel Node.js version matches your development
   - Update `package.json` engines field

4. **Database Connection Failed**
   - Verify MongoDB Atlas IP whitelist
   - Check connection string format
   - Test connection: `node -e "console.log(process.env.DATABASE_URL)"`

### **Emergency Rollback**
```bash
cd ~/public_html/api
git log --oneline -10  # Find previous commit
git reset --hard <commit_hash>
npm ci --production
# Restart application
```

---

## 📞 Support Commands

### **Quick Status Check**
```bash
curl https://api.yourdomain.com/api/health
```

### **View Current Version**
```bash
cd ~/public_html/api
git log --oneline -1
```

### **Check Running Processes**
```bash
ps aux | grep node
```

---

## 🚀 Post-Deployment Verification

### **API Endpoints Test**
```bash
# Health check
curl https://api.yourdomain.com/api/health

# Public routes
curl https://api.yourdomain.com/api/public/projects

# Admin login (test with actual credentials)
curl -X POST https://api.yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@domain.com","password":"password"}'
```

### **Frontend Integration**
- Update frontend API base URL to production
- Test CORS configuration
- Verify file upload functionality

---

**✅ Deployment Complete!** Your Node.js backend is now live on cPanel with auto-deployment configured.