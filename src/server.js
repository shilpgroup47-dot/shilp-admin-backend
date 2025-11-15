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

// --------------------------------------------------
//  ⭐ SECURITY
// --------------------------------------------------
app.use(helmet());
app.use(compression());

// --------------------------------------------------
//  ⭐ CORS CONFIG — SIMPLE + 100% ERROR-FREE
// --------------------------------------------------
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [];

console.log('🔍 Allowed Origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman, mobile apps etc.

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`❌ Origin blocked by CORS: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Allow OPTIONS for all
app.options('*', cors());

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
