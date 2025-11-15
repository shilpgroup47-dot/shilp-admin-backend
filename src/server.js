const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bannerRoutes = require('./routes/bannerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const projectTreeRoutes = require('./routes/projectTreeRoutes');
const blogRoutes = require('./routes/blogRoutes');
const publicRoutes = require('./routes/publicRoutes');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

console.log('🔍 CORS Configuration:');
console.log('📋 Allowed Origins:', allowedOrigins);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);

app.use(cors({
  origin: function (origin, callback) {
    console.log(`🔗 Request from origin: ${origin}`);
    
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) {
      console.log('✅ No origin - allowing');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Origin ${origin} is allowed`);
      return callback(null, true);
    }
    
    console.log(`❌ Origin ${origin} is NOT allowed`);
    console.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static Files - Uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cache-Control', 'public, max-age=31536000');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, express.static(uploadDir, {
  fallthrough: false,
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 404 Handler for uploads
app.use('/uploads', (err, req, res, next) => {
  if (err && err.status === 404) {
    res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  } else {
    next(err);
  }
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projecttree', projectTreeRoutes);
app.use('/api/blogs', blogRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error'
    }
  });
});

// Start Server
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

// Error Handlers
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

// Start
startServer();

module.exports = app;