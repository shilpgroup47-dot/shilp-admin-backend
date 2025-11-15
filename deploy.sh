#!/bin/bash

# Webhook handler for GitHub auto-deployment
# Place this script in your cPanel and configure GitHub webhook

# Configuration - Updated for your cPanel path
REPO_URL="https://github.com/shilpgroup47-dot/shilp-admin-backend.git"
DEPLOY_PATH="/home/shilfmfe/server_running/backend.shilpgroup.com"
BACKUP_PATH="/home/shilfmfe/backups"

echo "🚀 Starting deployment..."

# Create backup of current deployment (excluding uploads to save space)
echo "📦 Creating code backup..."
mkdir -p $BACKUP_PATH
rsync -av --exclude='uploads/' --exclude='node_modules/' $DEPLOY_PATH/ $BACKUP_PATH/backup-$(date +%Y%m%d_%H%M%S)/

# Backup uploads directory separately (preserve user files)
echo "💾 Preserving uploads directory..."
if [ -d "$DEPLOY_PATH/uploads" ]; then
    cp -R $DEPLOY_PATH/uploads $DEPLOY_PATH/uploads_temp_backup
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
cd $DEPLOY_PATH
git pull origin main

# Restore uploads directory (keep existing user files)
echo "🔄 Restoring uploads directory..."
if [ -d "$DEPLOY_PATH/uploads_temp_backup" ]; then
    rm -rf $DEPLOY_PATH/uploads
    mv $DEPLOY_PATH/uploads_temp_backup $DEPLOY_PATH/uploads
    echo "✅ Uploads directory restored"
else
    # Create uploads structure if it doesn't exist
    mkdir -p $DEPLOY_PATH/uploads/{banners,blogs,projects,projecttree}
    echo "📁 Uploads directory structure created"
fi

# Set proper permissions for uploads
chmod 755 $DEPLOY_PATH/uploads
chmod 755 $DEPLOY_PATH/uploads/* 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Restart application (if using PM2 or similar)
echo "🔄 Restarting application..."
# For cPanel Node.js, you might need to restart manually
# Or use PM2: pm2 restart all

echo "✅ Deployment completed successfully!"

# Optional: Send notification
# curl -X POST "https://hooks.slack.com/your/webhook" -d '{"text":"Deployment completed!"}'