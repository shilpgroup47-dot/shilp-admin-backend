# 🚀 cPanel Production Deployment Guide

## Quick Setup Steps

### 1. Upload Files to cPanel
Upload these files to `/home/shilfmfe/server_running/backend.shilpgroup.com/`:
- `src/` folder
- `package.json` & `package-lock.json`
- `auto-deploy.sh` & `restart-app.sh`
- `webhook.php` & `.cpanel.yml`
- `PRODUCTION.env` (rename to `.env`)

### 2. cPanel Terminal Commands
```bash
cd /home/shilfmfe/server_running/backend.shilpgroup.com
chmod +x *.sh
cp PRODUCTION.env .env
npm ci --production
mkdir -p /home/shilfmfe/logs uploads/{banners,blogs,projects,projecttree}
NODE_ENV=production PORT=8081 nohup node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &
```

### 3. Check Status
```bash
ps aux | grep "node src/server.js"
tail -f /home/shilfmfe/logs/app.log
curl http://localhost:8081/api/health
```

## Production Environment (.env)
```bash
NODE_ENV=production
PORT=8081
DATABASE_URL=mongodb+srv://shilpgroup47_db_user:vQ9tE9XlbMCcEZUC@cluster0.chfkuy8.mongodb.net/?appName=adminshilp
DATABASE_NAME=shilpadmin
JWT_SECRET=dfgdfgdfgdgdgdgdfgd-ghgfhfhfgh5gtr5yrhyeyye5e
CORS_ORIGIN=https://admin.shilpgroup.com,https://shilpgroup.com,http://localhost:5174
ADMIN_EMAIL=shilpgroup47@gmail.com
ADMIN_PASSWORD=ShilpGroup@RealState11290
```

## Troubleshooting
- **App not starting**: Check `tail -f /home/shilfmfe/logs/app.log`
- **CORS errors**: Add localhost to CORS_ORIGIN in .env
- **Port busy**: `pkill -f "node src/server.js"` then restart

## Auto-Deploy Setup
1. Upload `webhook.php` to domain's public_html
2. Add webhook in GitHub: `https://yourdomain.com/webhook.php`
3. Future pushes will auto-deploy