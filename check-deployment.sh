#!/bin/bash

# Quick Deployment Status Check for backend.shilpgroup.com

echo "🔍 BACKEND DEPLOYMENT STATUS CHECK"
echo "=================================="
echo ""

BACKEND_URL="https://backend.shilpgroup.com"

# Check main domain
echo "📡 Testing main domain..."
main_response=$(curl -s -I $BACKEND_URL | head -n 1)
echo "Main domain: $main_response"

# Check restart.php
echo ""
echo "🔄 Testing restart endpoint..."
restart_response=$(curl -s -I $BACKEND_URL/restart.php | head -n 1)
echo "Restart endpoint: $restart_response"

# Check health endpoint
echo ""
echo "❤️ Testing health endpoint..."
health_response=$(curl -s -I $BACKEND_URL/api/health | head -n 1)
echo "Health endpoint: $health_response"

# Check if Node.js app is responding
echo ""
echo "🚀 Testing Node.js application..."
app_response=$(curl -s -w "%{http_code}" $BACKEND_URL/api/health || echo "000")
app_code=$(echo "$app_response" | tail -c 4)

if [ "$app_code" = "200" ]; then
    echo "✅ Node.js application is RUNNING!"
    echo "🎉 Deployment is SUCCESSFUL!"
else
    echo "❌ Node.js application is NOT running (HTTP $app_code)"
    echo "🔧 Please check cPanel Node.js configuration"
fi

echo ""
echo "📋 Quick Actions:"
echo "• Restart app: curl $BACKEND_URL/restart.php"
echo "• Check health: curl $BACKEND_URL/api/health"
echo "• View in browser: $BACKEND_URL"

echo ""
echo "📁 Files that should be uploaded:"
echo "• /server_running/backend.shilpgroup.com/app.js"
echo "• /server_running/backend.shilpgroup.com/src/"
echo "• /public_html/restart.php"