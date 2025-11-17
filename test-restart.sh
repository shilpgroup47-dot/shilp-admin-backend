#!/bin/bash

# Test Auto Restart Script for backend.shilpgroup.com
echo "🧪 Testing auto restart functionality for backend.shilpgroup.com..."

BACKEND_URL="https://backend.shilpgroup.com"
RESTART_URL="$BACKEND_URL/restart.php"
HEALTH_URL="$BACKEND_URL/api/health"

echo ""
echo "🔍 Step 1: Testing if backend is reachable..."
response=$(curl -s -w "%{http_code}" $HEALTH_URL || echo "000")
http_code=$(echo "$response" | tail -c 4)

if [ "$http_code" = "200" ]; then
    echo "✅ Backend is reachable (HTTP $http_code)"
else
    echo "⚠️  Backend health check: HTTP $http_code"
    echo "Response: $response"
fi

echo ""
echo "🔄 Step 2: Testing restart functionality..."
restart_response=$(curl -s -w "%{http_code}" \
    -H "User-Agent: Manual-Test-Script" \
    $RESTART_URL || echo "000")

restart_code=$(echo "$restart_response" | tail -c 4)
restart_body=$(echo "$restart_response" | head -c -4)

echo "Restart HTTP Status: $restart_code"
echo "Restart Response: $restart_body"

if [ "$restart_code" = "200" ]; then
    echo "✅ Restart request successful!"
    
    echo ""
    echo "⏳ Step 3: Waiting for application to restart..."
    sleep 10
    
    echo "🔍 Step 4: Testing if backend is working after restart..."
    final_response=$(curl -s -w "%{http_code}" $HEALTH_URL || echo "000")
    final_code=$(echo "$final_response" | tail -c 4)
    
    if [ "$final_code" = "200" ]; then
        echo "✅ Backend is working perfectly after restart!"
        echo "🎉 Auto restart test PASSED!"
    else
        echo "❌ Backend health check failed after restart (HTTP $final_code)"
        echo "Response: $final_response"
    fi
else
    echo "❌ Restart failed (HTTP $restart_code)"
    echo "Response: $restart_body"
fi

echo ""
echo "📋 Manual restart command:"
echo "curl $RESTART_URL"

echo ""
echo "📋 Health check command:" 
echo "curl $HEALTH_URL"

echo ""
echo "🔗 Quick Links:"
echo "Backend: $BACKEND_URL"
echo "Restart: $RESTART_URL" 
echo "Health: $HEALTH_URL"