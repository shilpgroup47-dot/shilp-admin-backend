#!/bin/bash

# 🔧 PRODUCTION DEBUG AND FIX SCRIPT
echo "🔧 Debugging production server issue..."

# Check what's actually running
echo "📊 Current processes:"
ps aux | grep node

echo ""
echo "📋 Server logs (last 20 lines):"
tail -20 /home/shilfmfe/logs/app.log

echo ""
echo "🔍 Testing specific endpoints:"

# Test health (should work)
echo "Testing /api/health:"
curl -s http://localhost:8081/api/health | head -c 100

echo ""
echo "Testing /api/admin/profile (should return 401):"
curl -s http://localhost:8081/api/admin/profile | head -c 100

echo ""
echo "Testing /api/admin/login (the problematic one):"
curl -s -X POST http://localhost:8081/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}' | head -c 200

echo ""
echo "🔧 Attempting to fix the login issue..."

# Check if bcrypt is properly installed
if ! /opt/alt/alt-nodejs18/root/usr/bin/node -e "require('bcrypt')" 2>/dev/null; then
    echo "❌ bcrypt module not found! Installing..."
    npm install bcrypt
fi

# Check admin validation middleware
if [ ! -f "src/middleware/adminValidation.js" ]; then
    echo "❌ adminValidation.js missing!"
fi

# Restart with verbose logging
echo "🔄 Restarting server with debug mode..."
pkill -f "node src/server.js"
sleep 2

# Start with explicit error catching
NODE_ENV=production PORT=8081 /opt/alt/alt-nodejs18/root/usr/bin/node -e "
const app = require('./src/server.js');
console.log('🚀 Server started with enhanced error handling');
" > /home/shilfmfe/logs/debug-server.log 2>&1 &

sleep 3

echo "✅ Debug complete. Check /home/shilfmfe/logs/debug-server.log for details."