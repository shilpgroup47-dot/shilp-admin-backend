#!/bin/bash

# 🚀 Complete cPanel Production Deployment Script
# Run this on cPanel terminal after uploading files

echo "🚀 Starting Production Deployment..."

# Step 1: Navigate to correct directory
cd /home/shilfmfe/server_running/backend.shilpgroup.com
echo "📁 Current directory: $(pwd)"

# Step 2: Create production environment
echo "⚙️ Setting up production environment..."
cp PRODUCTION.env .env
echo "✅ Environment file created"

# Step 3: Install dependencies
echo "📦 Installing production dependencies..."
/opt/alt/alt-nodejs10/root/usr/bin/npm ci --production
echo "✅ Dependencies installed"

# Step 4: Create necessary directories
echo "📁 Creating directories..."
mkdir -p /home/shilfmfe/logs
mkdir -p uploads/banners uploads/blogs uploads/projects uploads/projecttree
chmod 755 uploads uploads/*/ 2>/dev/null || true
echo "✅ Directories created"

# Step 5: Stop existing processes
echo "⏹️ Stopping existing processes..."
pkill -f "node src/server.js" 2>/dev/null && echo "Stopped existing process" || echo "No existing process"

# Step 6: Start production server
echo "🚀 Starting production server..."
NODE_ENV=production PORT=8081 nohup /opt/alt/alt-nodejs10/root/usr/bin/node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &

# Step 7: Wait and verify
sleep 3
if pgrep -f "node src/server.js" > /dev/null; then
    echo "✅ Server started successfully!"
    echo "🌐 Backend running on port 8081"
    echo "📊 Process ID: $(pgrep -f 'node src/server.js')"
else
    echo "❌ Server failed to start"
    echo "📋 Check logs:"
    tail -10 /home/shilfmfe/logs/app.log
    exit 1
fi

# Step 8: Show useful commands
echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📊 Useful Commands:"
echo "   Check status: ps aux | grep 'node src/server.js'"
echo "   View logs: tail -f /home/shilfmfe/logs/app.log"
echo "   Test API: curl http://localhost:8081/api/health"
echo "   Restart: pkill -f 'node src/server.js' && NODE_ENV=production PORT=8081 nohup /opt/alt/alt-nodejs10/root/usr/bin/node src/server.js > /home/shilfmfe/logs/app.log 2>&1 &"
echo ""
echo "🌐 Your API endpoints:"
echo "   Health: https://backend.shilpgroup.com/api/health"
echo "   Logs: https://backend.shilpgroup.com/api/logs"
echo "   Status: https://backend.shilpgroup.com/api/status"