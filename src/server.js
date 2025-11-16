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
// const testRoutes = require('./routes/testRoutes'); // Temporarily disabled

const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
//  ⭐ SECURITY
// --------------------------------------------------
app.use(helmet());
app.use(compression());

// --------------------------------------------------
//  ⭐ CORS CONFIG — COMPLETELY OPEN FOR PRODUCTION
// --------------------------------------------------
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('� CORS: All origins allowed - No restrictions');

// Ultra-permissive CORS - Allow ANY origin for production
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Allow OPTIONS for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log('✅ Localhost origin - allowing request');
        return callback(null, true);
      }

// --------------------------------------------------
//  ⭐ BODY PARSER
// --------------------------------------------------
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// --------------------------------------------------
//  ⭐ STATIC UPLOADS (CORS FIXED)
// --------------------------------------------------
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

app.use(
  '/uploads',
  (req, res, next) => {
    // Allow all origins for uploads
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  },
  express.static(uploadDir)
);

// --------------------------------------------------
//  ⭐ ROOT QUICK TEST ENDPOINT
//   Simple plain-text response so visiting / shows a lightweight
//   confirmation (useful for load-balancers, uptime checks).
// --------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).send('Test server is running');
});

// --------------------------------------------------
//  ⭐ API ROUTES
// --------------------------------------------------
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projecttree', projectTreeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', logRoutes);
// app.use('/api/test', testRoutes); // Temporarily disabled

// --------------------------------------------------
//  ⭐ GLOBAL ERROR HANDLER
// --------------------------------------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
    },
  });
});

// --------------------------------------------------
//  ⭐ START SERVER
// --------------------------------------------------
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

// --------------------------------------------------
//  ⭐ PROCESS ERROR HANDLERS
// --------------------------------------------------
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

// --------------------------------------------------
startServer();

module.exports = app;
