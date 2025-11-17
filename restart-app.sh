#!/bin/bash

# cPanel Node.js Application Restart Script
# Use this script to restart your Node.js app in cPanel environment

# Configuration - Updated for your cPanel path
APP_PATH="/home/shilfmfe/server_running/backend.shilpgroup.com"
LOG_FILE="/home/shilfmfe/logs/restart.log"
PID_FILE="/home/shilfmfe/backend.pid"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log_message "🔄 Starting Node.js application restart..."

# Navigate to application directory
cd $APP_PATH

# Kill existing process
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat $PID_FILE)
    if kill -0 $OLD_PID 2>/dev/null; then
        log_message "⏹️ Stopping existing process (PID: $OLD_PID)"
        kill $OLD_PID
        sleep 3
        
        # Force kill if still running
        if kill -0 $OLD_PID 2>/dev/null; then
            kill -9 $OLD_PID
            log_message "🔨 Force killed process $OLD_PID"
        fi
    fi
    rm -f $PID_FILE
fi

# Kill any remaining node processes for this app
pkill -f "node app.js" 2>/dev/null && log_message "🧹 Cleaned up remaining processes"
pkill -f "node src/server.js" 2>/dev/null && log_message "🧹 Cleaned up remaining server processes"

# Set environment variables
export NODE_ENV=production
export PORT=8081

# Create logs directory if it doesn't exist
mkdir -p /home/shilfmfe/logs

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    log_message "📦 Installing dependencies..."
    npm install --production 2>&1 | tee -a $LOG_FILE
fi

# Check if app.js exists
if [ ! -f "app.js" ]; then
    log_message "❌ app.js not found in $APP_PATH"
    echo "ERROR: app.js not found"
    exit 1
fi

# Check if .env file exists, create from example if needed
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_message "📋 Created .env from .env.example"
    else
        log_message "⚠️ No .env or .env.example file found"
    fi
fi

# Start new process using app.js (cPanel entry point)
log_message "🚀 Starting new Node.js process with app.js..."
nohup node app.js > /home/shilfmfe/logs/app.log 2>&1 &
NEW_PID=$!

# Save new PID
echo $NEW_PID > $PID_FILE
log_message "✅ New Node.js process started with PID: $NEW_PID"

# Wait for application to initialize
sleep 5

# Verify process is still running
if kill -0 $NEW_PID 2>/dev/null; then
    log_message "✅ Application restart successful!"
    
    # Test health endpoint
    if command -v curl >/dev/null 2>&1; then
        HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8081/api/health 2>/dev/null)
        if [[ $HEALTH_RESPONSE == *"200" ]]; then
            log_message "🔍 Health check passed (HTTP 200)"
        else
            log_message "⚠️ Health check failed or unexpected response"
        fi
    fi
    
    echo "SUCCESS: Application restarted with PID $NEW_PID"
    exit 0
else
    log_message "❌ Application failed to start!"
    echo "ERROR: Application failed to start"
    exit 1
fi