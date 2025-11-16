#!/bin/bash

# Quick Server Status and Restart Script for cPanel

echo "🔍 Checking Node.js Application Status..."

# Check if application is responding
echo "🌐 Testing application response..."
if curl -s --max-time 5 https://backend.shilpgroup.com/ | grep -q "Test server is running"; then
    echo "✅ Application is running and responding"
    exit 0
else
    echo "❌ Application is not responding (503 error)"
fi

# Check for running Node.js processes
echo ""
echo "🔍 Checking for Node.js processes..."
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Node.js process found, but not responding properly"
    echo "🔄 Killing existing process..."
    pkill -f "node.*server.js"
    sleep 2
else
    echo "❌ No Node.js process found"
fi

# Navigate to app directory
cd /home/shilfmfe/server_running/backend.shilpgroup.com || {
    echo "❌ Cannot find application directory"
    exit 1
}

# Start the application
echo ""
echo "🚀 Starting Node.js application..."

# Check for PM2
if command -v pm2 &> /dev/null; then
    echo "✅ Using PM2..."
    pm2 delete backend 2>/dev/null || true
    pm2 start src/server.js --name "backend" --env production
    pm2 save
else
    echo "✅ Using direct node command..."
    nohup node src/server.js > logs/app.log 2>&1 &
    echo $! > app.pid
fi

echo ""
echo "⏳ Waiting for application to start..."
sleep 5

# Test again
if curl -s --max-time 10 https://backend.shilpgroup.com/ | grep -q "Test server is running"; then
    echo "✅ Application successfully started and responding!"
    echo ""
    echo "🧪 Test login:"
    echo 'curl -X POST "https://backend.shilpgroup.com/api/admin/login" -H "Content-Type: application/json" -d '"'"'{"email":"shilpgroup47@gmail.com","password":"ShilpGroup@RealState11290"}'"'"''
else
    echo "❌ Application started but still not responding properly"
    echo "📝 Check logs: tail -f logs/app.log"
fi