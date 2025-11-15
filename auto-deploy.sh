#!/bin/bash

# Enhanced Auto-Deployment Script for cPanel
# This script will be triggered by GitHub webhook and restart Node.js app

# Configuration - Updated for your cPanel path
DEPLOY_PATH="/home/shilfmfe/server_running/backend.shilpgroup.com"
BACKUP_PATH="/home/shilfmfe/backups"
LOG_FILE="/home/shilfmfe/logs/auto-deploy.log"
PID_FILE="/home/shilfmfe/backend.pid"

# Create log directory
mkdir -p /home/shilfmfe/logs

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
    echo "$1"
}

log_message "🚀 Starting auto-deployment and refresh process..."

# Stop existing Node.js process
if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    if kill -0 $PID 2>/dev/null; then
        log_message "⏹️ Stopping existing Node.js process (PID: $PID)"
        kill $PID
        sleep 2
        # Force kill if still running
        if kill -0 $PID 2>/dev/null; then
            kill -9 $PID
            log_message "🔨 Force killed process $PID"
        fi
    fi
    rm -f $PID_FILE
fi

# Backup existing uploads directory (preserve user files)
log_message "💾 Backing up uploads directory..."
if [ -d "$DEPLOY_PATH/uploads" ]; then
    cp -R $DEPLOY_PATH/uploads $DEPLOY_PATH/uploads_backup_$(date +%Y%m%d_%H%M%S)
    log_message "✅ Uploads backup created"
fi

# Navigate to deployment directory
cd $DEPLOY_PATH

# Pull latest changes from Git
log_message "📥 Pulling latest changes from Git..."
git pull origin main 2>&1 >> $LOG_FILE

# Restore uploads directory
log_message "🔄 Restoring uploads directory..."
LATEST_BACKUP=$(ls -1t uploads_backup_* 2>/dev/null | head -n 1)
if [ -n "$LATEST_BACKUP" ]; then
    rm -rf uploads
    mv $LATEST_BACKUP uploads
    log_message "✅ Uploads directory restored from $LATEST_BACKUP"
else
    # Create uploads structure if it doesn't exist
    mkdir -p uploads/{banners,blogs,projects,projecttree}
    log_message "📁 Created uploads directory structure"
fi

# Set proper permissions
chmod 755 uploads
chmod 755 uploads/* 2>/dev/null || true
log_message "🔐 Set uploads permissions"

# Install/update dependencies
log_message "📦 Installing production dependencies..."
npm ci --production --silent 2>&1 >> $LOG_FILE

# Start Node.js application in background
log_message "🚀 Starting Node.js application..."
cd $DEPLOY_PATH

# Set production environment
export NODE_ENV=production

# Start the application and capture PID
nohup node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &
APP_PID=$!

# Save PID for future reference
echo $APP_PID > $PID_FILE
log_message "✅ Node.js application started with PID: $APP_PID"

# Clean up old backups (keep only last 3)
find /home/shilfmfe -name "uploads_backup_*" -type d | sort | head -n -3 | xargs rm -rf 2>/dev/null

# Verify application is running
sleep 5
if kill -0 $APP_PID 2>/dev/null; then
    log_message "✅ Auto-deployment completed successfully!"
    log_message "🌐 Application is running on PID: $APP_PID"
    
    # Test health endpoint
    if command -v curl >/dev/null 2>&1; then
        HEALTH_CHECK=$(curl -s http://localhost:8081/api/health 2>/dev/null || echo "failed")
        log_message "🔍 Health check: $HEALTH_CHECK"
    fi
else
    log_message "❌ Application failed to start!"
    exit 1
fi

log_message "🎉 Auto-refresh and restart completed!"