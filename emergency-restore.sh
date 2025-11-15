#!/bin/bash

# 🚨 EMERGENCY SERVER RESTORE SCRIPT
# This will restore the server with minimal working configuration

echo "🚨 EMERGENCY: Restoring Backend Server..."
echo "Time: $(date)"

# Step 1: Navigate to server directory
cd /home/shilfmfe/server_running/backend.shilpgroup.com || {
    echo "❌ Cannot access server directory"
    exit 1
}

echo "📁 Current directory: $(pwd)"

# Step 2: Stop any crashed processes
echo "🛑 Stopping crashed processes..."
pkill -f "node src/server.js" 2>/dev/null && echo "✅ Stopped process" || echo "ℹ️ No process running"

# Step 3: Check for syntax errors
echo "🔍 Checking code syntax..."
if ! /opt/alt/alt-nodejs18/root/usr/bin/node --check src/server.js; then
    echo "❌ SYNTAX ERROR detected in server.js!"
    echo "🔄 Reverting to previous version..."
    git reset --hard HEAD~1
    echo "✅ Reverted to previous commit"
fi

# Step 4: Install/update dependencies
echo "📦 Installing dependencies..."
/opt/alt/alt-nodejs18/root/usr/bin/npm ci --production

# Step 5: Verify environment file
if [ ! -f .env ]; then
    echo "⚠️ .env file missing, creating from PRODUCTION.env..."
    cp PRODUCTION.env .env
fi

# Step 6: Test MongoDB connection
echo "🔗 Testing database connection..."
/opt/alt/alt-nodejs18/root/usr/bin/node -e "
require('dotenv').config();
const { MongoClient } = require('mongodb');
MongoClient.connect(process.env.DATABASE_URL)
  .then(() => { console.log('✅ DB Connected'); process.exit(0); })
  .catch(err => { console.log('❌ DB Error:', err.message); process.exit(1); });
" || {
    echo "❌ Database connection failed"
    echo "🔧 Check DATABASE_URL in .env file"
}

# Step 7: Start server with error logging
echo "🚀 Starting server..."
NODE_ENV=production PORT=8081 nohup /opt/alt/alt-nodejs18/root/usr/bin/node src/server.js > /home/shilfmfe/logs/emergency-restore.log 2>&1 &

# Step 8: Wait and verify
sleep 5

if pgrep -f "node src/server.js" > /dev/null; then
    PID=$(pgrep -f "node src/server.js")
    echo "✅ Server restored successfully!"
    echo "📊 Process ID: $PID"
    echo "📋 Logs: tail -f /home/shilfmfe/logs/emergency-restore.log"
    
    # Test basic endpoint
    sleep 2
    if curl -s --max-time 10 http://localhost:8081/api/health > /dev/null; then
        echo "🎉 API endpoints responding!"
    else
        echo "⚠️ Server running but API not responding - check logs"
    fi
else
    echo "❌ Server failed to start!"
    echo "📋 Error logs:"
    tail -10 /home/shilfmfe/logs/emergency-restore.log
    exit 1
fi

echo ""
echo "🔧 Emergency restore completed!"
echo "🌐 Backend should be available at: https://backend.shilpgroup.com"
echo "📊 Monitor: tail -f /home/shilfmfe/logs/emergency-restore.log"