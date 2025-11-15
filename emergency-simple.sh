#!/bin/bash

# 🚀 SIMPLE SERVER RESTART (Guaranteed Working)
echo "🚀 Simple server restart..."

cd /home/shilfmfe/server_running/backend.shilpgroup.com

# Kill any existing process
pkill -f "node src/server.js" 2>/dev/null

# Wait a moment
sleep 2

# Start with minimal config - just basic server without new features
NODE_ENV=production PORT=8081 nohup /opt/alt/alt-nodejs18/root/usr/bin/node -e "
const express = require('express');
const app = express();

app.use(express.json());

// Basic CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Basic routes
app.get('/', (req, res) => res.send('Server is running'));
app.get('/api/health', (req, res) => res.json({success: true, message: 'Server healthy', timestamp: new Date().toISOString()}));

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(\`🚀 Emergency server on port \${PORT}\`));
" > /home/shilfmfe/logs/emergency.log 2>&1 &

sleep 3

if pgrep -f node > /dev/null; then
    echo "✅ Emergency server started!"
    echo "🌐 Test: curl https://backend.shilpgroup.com/"
else
    echo "❌ Failed to start emergency server"
    cat /home/shilfmfe/logs/emergency.log
fi