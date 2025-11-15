# Manual cPanel Deployment Guide

## Complete Setup for Production Deployment

### 1. Upload Files to cPanel
Upload these files to your cPanel directory `/home/shilfmfe/server_running/backend.shilpgroup.com/`:

1. **auto-deploy.sh** - Main deployment script
2. **restart-app.sh** - App restart script  
3. **webhook-simple.php** - Simple webhook (rename to webhook.php)
4. **.cpanel.yml** - cPanel configuration
5. **All project files** - Upload entire project

### 2. Set Permissions
In cPanel File Manager or SSH, set these permissions:
```bash
chmod +x auto-deploy.sh
chmod +x restart-app.sh
chmod 755 webhook-simple.php
chmod -R 755 uploads/
```

### 3. Create Log Directory
```bash
mkdir -p /home/shilfmfe/logs
chmod 755 /home/shilfmfe/logs
```

### 4. Setup Environment
1. Copy `.env.example` to `.env`
2. Edit `.env` with your production settings:
   ```
   NODE_ENV=production
   PORT=8081
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### 5. Install Dependencies
```bash
cd /home/shilfmfe/server_running/backend.shilpgroup.com
npm ci --production
```

### 6. Start Application
```bash
NODE_ENV=production PORT=8081 nohup node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &
```

### 7. Setup Auto-Deploy (Optional)
1. Upload `webhook-simple.php` to your domain's public_html
2. In GitHub repository settings, add webhook:
   - URL: `https://yourdomain.com/webhook-simple.php`
   - Content type: `application/json`
   - Events: Just push events

### 8. Testing
- Check if app is running: `ps aux | grep "node src/server.js"`
- Check logs: `tail -f /home/shilfmfe/logs/app.log`
- Test API: Visit your backend URL

### 9. Manual Update Process
When you need to update:
```bash
cd /home/shilfmfe/server_running/backend.shilpgroup.com
./auto-deploy.sh
```

Or manually:
```bash
# Stop app
pkill -f "node src/server.js"

# Update code
git pull

# Install dependencies
npm ci --production

# Start app
NODE_ENV=production PORT=8081 nohup node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &
```

## Troubleshooting

### If app won't start:
1. Check logs: `tail -20 /home/shilfmfe/logs/app.log`
2. Check if port is in use: `netstat -tlnp | grep 8081`
3. Verify environment: `cat .env`
4. Check permissions: `ls -la`

### If webhook doesn't work:
1. Check webhook logs: `tail -10 /home/shilfmfe/logs/webhook.log`
2. Verify PHP file permissions
3. Test webhook manually from GitHub

### Common Issues:
- **Port already in use**: Kill existing process with `pkill -f "node src/server.js"`
- **Permission denied**: Set proper permissions with `chmod +x *.sh`
- **MongoDB connection**: Verify connection string in `.env`
- **Missing dependencies**: Run `npm ci --production`

## Production Checklist
- ✅ Environment variables configured
- ✅ MongoDB connection working
- ✅ All scripts executable
- ✅ Uploads directory created
- ✅ Logs directory created
- ✅ Application running on correct port
- ✅ Webhook configured (if using auto-deploy)