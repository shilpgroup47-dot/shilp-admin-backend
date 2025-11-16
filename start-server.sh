#!/bin/bash

# cPanel Node.js Application Startup Commands
# Run these commands in cPanel Terminal or SSH

echo "🔄 Starting Node.js Application on cPanel..."

# Navigate to application directory
echo "📁 Navigating to application directory..."
cd /home/shilfmfe/server_running/backend.shilpgroup.com

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Start the application
echo "🚀 Starting Node.js application..."

# Option 1: Start with PM2 (recommended for production)
if command -v pm2 &> /dev/null; then
    echo "✅ Using PM2 to start application..."
    pm2 stop backend || true
    pm2 delete backend || true
    pm2 start src/server.js --name "backend" --env production
    pm2 save
    pm2 list
else
    # Option 2: Start with nohup (background process)
    echo "✅ Using nohup to start application..."
    nohup node src/server.js > app.log 2>&1 &
    echo $! > app.pid
    echo "📝 Application PID saved to app.pid"
fi

echo "✅ Application startup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check if application is running: curl https://backend.shilpgroup.com/"
echo "2. View logs: tail -f app.log (or pm2 logs backend)"
echo "3. Check process: ps aux | grep node"

# Test the application
echo ""
echo "🧪 Testing application..."
sleep 3
curl -s https://backend.shilpgroup.com/ || echo "❌ Application not responding yet"