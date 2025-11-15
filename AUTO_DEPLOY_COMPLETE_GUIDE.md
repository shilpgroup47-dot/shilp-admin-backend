# 🚀 COMPLETE AUTO-DEPLOYMENT SETUP

## What This Does:
**Git Push → GitHub Actions → cPanel Webhook → Node.js Restart**

Every time you push to GitHub main branch:
1. ✅ GitHub Actions runs build check
2. ✅ GitHub triggers cPanel webhook  
3. ✅ cPanel pulls latest code
4. ✅ Node.js app automatically restarts
5. ✅ Your changes go live immediately!

## Setup Steps:

### 1. First-time Manual Deployment
Upload these files to cPanel via FTP/File Manager:
```
/home/shilfmfe/server_running/backend.shilpgroup.com/
├── src/                 (all source code)
├── package.json
├── package-lock.json
├── .env                 (copy from .env.example)
├── auto-deploy.sh
├── restart-app.sh
├── webhook.php
├── .cpanel.yml
└── uploads/            (with subdirectories)
```

### 2. Setup cPanel Environment
```bash
cd /home/shilfmfe/server_running/backend.shilpgroup.com/
chmod +x *.sh
cp .env.example .env
nano .env  # Add your MongoDB URI, JWT secret, etc.
npm ci --production
```

### 3. Upload Webhook to Public Domain
Upload `webhook.php` to your domain's public_html:
```
public_html/webhook.php
```

### 4. Configure GitHub Webhook
1. Go to GitHub Repository → Settings → Webhooks
2. Add webhook:
   - URL: `https://yourdomain.com/webhook.php`
   - Content type: `application/json`
   - Events: `Just the push event`
   - Active: ✅

### 5. Test the Complete Flow

#### Manual Test:
```bash
# Test webhook directly
curl -X POST -H "Content-Type: application/json" \
-d '{"ref":"refs/heads/main","repository":{"name":"shilp-admin-backend"}}' \
https://yourdomain.com/webhook.php
```

#### Full Test:
```bash
# Make a small change and push
echo "# Test $(date)" >> DEPLOYMENT_TEST.md
git add .
git commit -m "Test auto-deployment"
git push origin main
```

## What Happens When You Push:

```
1. git push origin main
   ↓
2. GitHub Actions starts
   ↓ 
3. Build check passes
   ↓
4. GitHub Actions calls webhook
   ↓
5. webhook.php executes auto-deploy.sh
   ↓
6. auto-deploy.sh pulls latest code
   ↓
7. Dependencies install/update
   ↓
8. Node.js app restarts
   ↓
9. Your changes are live! 🎉
```

## Monitoring & Logs

### Check App Status:
```bash
ps aux | grep "node src/server.js"
```

### Check Logs:
```bash
# App logs
tail -f /home/shilfmfe/logs/app.log

# Deployment logs  
tail -f /home/shilfmfe/logs/deploy.log

# Webhook logs
tail -f /home/shilfmfe/logs/webhook.log
```

### Manual Deployment:
```bash
cd /home/shilfmfe/server_running/backend.shilpgroup.com/
./auto-deploy.sh
```

### Manual App Restart:
```bash
./restart-app.sh
```

## Troubleshooting

### If auto-deployment doesn't work:
1. Check webhook logs: `tail -f /home/shilfmfe/logs/webhook.log`
2. Check if webhook.php is accessible: `curl https://yourdomain.com/webhook.php`
3. Verify GitHub webhook is configured correctly
4. Test manual deployment: `./auto-deploy.sh`

### If app doesn't start:
1. Check app logs: `tail -20 /home/shilfmfe/logs/app.log`
2. Verify .env file exists and has correct values
3. Check if port 8081 is free: `netstat -tulnp | grep 8081`
4. Manual restart: `./restart-app.sh`

### Common Issues:
- **Webhook not triggered**: Check GitHub webhook settings and URL
- **Permission denied**: `chmod +x *.sh`
- **Port in use**: Kill existing process: `pkill -f "node src/server.js"`
- **Dependencies fail**: Check Node.js version, run `npm ci --production`
- **MongoDB connection**: Verify connection string in .env

## Success Indicators:
- ✅ GitHub Actions shows green checkmark
- ✅ Webhook logs show successful deployment
- ✅ App logs show no errors
- ✅ `ps aux | grep node` shows running process
- ✅ API endpoints respond correctly

**After setup, every git push will automatically deploy and restart your app!** 🚀