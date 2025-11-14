#!/bin/bash

# Webhook handler for GitHub auto-deployment
# Place this script in your cPanel and configure GitHub webhook

# Configuration
REPO_URL="https://github.com/shilpgroup47-dot/shilp-admin-backend.git"
DEPLOY_PATH="/home/yourusername/public_html/api"
BACKUP_PATH="/home/yourusername/backups"

echo "🚀 Starting deployment..."

# Create backup of current deployment
echo "📦 Creating backup..."
mkdir -p $BACKUP_PATH
cp -r $DEPLOY_PATH $BACKUP_PATH/backup-$(date +%Y%m%d_%H%M%S)

# Pull latest changes
echo "📥 Pulling latest changes..."
cd $DEPLOY_PATH
git pull origin main

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