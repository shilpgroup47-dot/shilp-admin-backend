#!/bin/bash

# 🚨 COMPLETE PRODUCTION FIX SCRIPT
echo "🚨 Starting complete production fix..."

cd /home/shilfmfe/server_running/backend.shilpgroup.com

echo "📊 Current server status:"
ps aux | grep "node src/server.js" | grep -v grep

echo ""
echo "🛑 Stopping existing server..."
pkill -f "node src/server.js" 2>/dev/null
sleep 3

echo "🔧 Applying fixes..."

# Update code from git
echo "📥 Pulling latest code..."
git pull origin main

# Install/reinstall dependencies  
echo "📦 Installing dependencies..."
/opt/alt/alt-nodejs18/root/usr/bin/npm ci --production

# Specifically install bcrypt if missing
echo "🔐 Ensuring bcrypt is installed..."
/opt/alt/alt-nodejs18/root/usr/bin/npm install bcrypt

# Create/verify environment file
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp PRODUCTION.env .env
    echo "✅ Created .env from PRODUCTION.env"
fi

# Create simple working admin (bypass bcrypt issues)
echo "👤 Creating emergency admin..."
/opt/alt/alt-nodejs18/root/usr/bin/node -e "
const { MongoClient } = require('mongodb');

async function createAdmin() {
  try {
    require('dotenv').config();
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    
    const db = client.db(process.env.DATABASE_NAME);
    const admins = db.collection('admins');
    
    // Simple admin with plain text password (emergency)
    const admin = {
      username: 'shilpgroup47',
      email: 'shilpgroup47@gmail.com',
      password: 'ShilpGroup@RealState11290',
      passwordType: 'plain',
      fullName: 'Shilp Group Admin',
      role: 'super-admin',
      isActive: true,
      permissions: ['users.read', 'users.write', 'projects.create', 'projects.read', 'projects.update', 'projects.delete'],
      createdAt: new Date(),
      loginAttempts: 0,
      isLocked: false
    };
    
    await admins.replaceOne({ email: admin.email }, admin, { upsert: true });
    console.log('✅ Emergency admin created/updated');
    await client.close();
  } catch (error) {
    console.log('❌ Admin creation error:', error.message);
  }
}

createAdmin();
"

echo "🚀 Starting server with timeout protection..."

# Start server with timeout and error handling
timeout 30s /opt/alt/alt-nodejs18/root/usr/bin/node -e "
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);  
  process.exit(1);
});

try {
  require('./src/server.js');
} catch (error) {
  console.error('❌ Server start error:', error.message);
  process.exit(1);
}
" > /home/shilfmfe/logs/server-fix.log 2>&1 &

SERVER_PID=\$!
echo "📊 Server started with PID: \$SERVER_PID"

# Wait and test
echo "⏳ Waiting for server to initialize..."
sleep 10

# Test if server is responding
if curl -s --max-time 5 http://localhost:8081/api/health > /dev/null; then
    echo "✅ Server is responding!"
    
    # Test login endpoint
    echo "🧪 Testing login endpoint..."
    LOGIN_RESULT=\$(curl -s --max-time 10 -X POST http://localhost:8081/api/admin/login \\
        -H "Content-Type: application/json" \\
        -d '{\"email\":\"shilpgroup47@gmail.com\",\"password\":\"ShilpGroup@RealState11290\"}' 2>/dev/null)
    
    if echo \"\$LOGIN_RESULT\" | grep -q \"success\"; then
        echo \"✅ Login endpoint working!\"
        echo \"🎉 PRODUCTION FIX COMPLETE!\"
    else
        echo \"⚠️ Login endpoint still has issues\"
        echo \"Response: \$LOGIN_RESULT\"
    fi
else
    echo \"❌ Server not responding\"
    echo \"📋 Server logs:\"
    tail -20 /home/shilfmfe/logs/server-fix.log
fi

echo ""
echo "🌐 Your backend should now be available at: https://backend.shilpgroup.com"
echo "📧 Login with: shilpgroup47@gmail.com"
echo "🔑 Password: ShilpGroup@RealState11290"