#!/bin/bash

# 🛠️ SAFE SERVER FIX - Remove problematic testRoutes temporarily

echo "🛠️ Applying safe fix to server..."

cd /home/shilfmfe/server_running/backend.shilpgroup.com

# Backup current server.js
cp src/server.js src/server.js.backup

# Create temporary fixed server.js without testRoutes
cat > src/server.js.temp << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const bannerRoutes = require('./routes/bannerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const projectTreeRoutes = require('./routes/projectTreeRoutes');
const blogRoutes = require('./routes/blogRoutes');
const publicRoutes = require('./routes/publicRoutes');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/adminRoutes');
const logRoutes = require('./routes/logRoutes');

const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'];

console.log('🔍 Allowed Origins:', allowedOrigins);
console.log('🌍 Environment:', process.env.NODE_ENV);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`🔍 Request from origin: ${origin}`);
      
      if (!origin) {
        console.log('✅ No origin - allowing request');
        return callback(null, true);
      }

      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log('✅ Localhost origin - allowing request');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log('✅ Origin in allowed list - allowing request');
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Development mode - allowing request');
        return callback(null, true);
      }

      console.log(`❌ Origin blocked by CORS: ${origin}`);
      console.log('📋 Allowed origins:', allowedOrigins);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.options('*', (req, res) => {
  console.log(`🔄 OPTIONS request from: ${req.headers.origin}`);
  
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  console.log('✅ OPTIONS response sent');
  res.sendStatus(204);
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

app.use(
  '/uploads',
  (req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  },
  express.static(uploadDir)
);

app.get('/', (req, res) => {
  res.status(200).send('Test server is running');
});

app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projecttree', projectTreeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', logRoutes);

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
    },
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Server start failed:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

startServer();

module.exports = app;
EOF

# Replace with fixed version
mv src/server.js.temp src/server.js

# Kill existing processes
pkill -f "node src/server.js" 2>/dev/null

# Start server
echo "🚀 Starting fixed server..."
NODE_ENV=production PORT=8081 nohup /opt/alt/alt-nodejs18/root/usr/bin/node src/server.js > /home/shilfmfe/logs/fixed-server.log 2>&1 &

sleep 3

if pgrep -f "node src/server.js" > /dev/null; then
    echo "✅ Fixed server started successfully!"
    echo "🌐 Testing endpoints..."
    
    # Test root
    if curl -s --max-time 10 http://localhost:8081/ | grep -q "running"; then
        echo "✅ Root endpoint working"
    fi
    
    # Test health
    if curl -s --max-time 10 http://localhost:8081/api/health | grep -q "success"; then
        echo "✅ Health endpoint working"
    fi
    
    echo "🎉 Server restoration complete!"
else
    echo "❌ Server still failed to start"
    echo "📋 Logs:"
    tail -10 /home/shilfmfe/logs/fixed-server.log
fi