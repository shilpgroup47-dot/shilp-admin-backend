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

// � ULTRA-PERFORMANCE SETTINGS
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.disable('etag'); // Disable etag for faster responses
app.set('view cache', false); // Disable view caching
app.set('case sensitive routing', true);
app.set('strict routing', false);

// 🚀 NODE.JS PERFORMANCE TWEAKS
process.env.UV_THREADPOOL_SIZE = 128; // Increase thread pool
process.env.NODE_OPTIONS = '--max-old-space-size=4096'; // 4GB memory limit

// 🚨 ULTRA-FAST MIDDLEWARE CHAIN

// SECURITY - Optimized
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow file uploads
  contentSecurityPolicy: false     // Disable for better performance
}));

// COMPRESSION - High level for better performance
app.use(compression({ 
  level: 9,           // Maximum compression
  threshold: 1024,    // Only compress files larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// SIMPLE CORS (Only 3 domains)
const allowedOrigins = [
  'https://admin.shilpgroup.com',
  'https://shilpgroup.com', 
  'https://backend.shilpgroup.com',
  'http://localhost:5174'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', cors());

// BODY PARSER - Optimized for large files
app.use(express.json({ 
  limit: '150mb',           // Increased for large images
  strict: false,            // Allow any JSON-parseable type
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '150mb',           // Increased for large images
  parameterLimit: 100000    // Increased parameter limit
}));

// UPLOADS
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(uploadDir));

// ROOT TEST
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// 🚀 ULTRA-FAST REQUEST HANDLING
app.use((req, res, next) => {
  // Set custom timeouts for different routes
  if (req.path.includes('/upload') || req.method === 'POST') {
    req.setTimeout(300000); // 5 minutes for uploads
    res.setTimeout(300000);
  } else {
    req.setTimeout(100000);  // 30 seconds for regular requests
    res.setTimeout(30000);
  }
  
  // Add response headers for faster processing
  res.set({
    'Keep-Alive': 'timeout=30, max=1000',
    'Connection': 'keep-alive',
    'X-Powered-By': 'ShilpGroup-Optimized'
  });
  
  next();
});

// ROUTES
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projecttree', projectTreeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', logRoutes);

// 🚨 OPTIMIZED ERROR HANDLER - Fast response
app.use((err, req, res, next) => {
  // Quick error logging without console.error delay
  process.nextTick(() => {
    console.error("❌ Error:", err.message);
  });
  
  // Send immediate response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ 
    success: false,
    error: err.message || "Server Error",
    timestamp: Date.now()
  });
});

// 🚨 HANDLE REQUEST TIMEOUTS
app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(408).json({
      success: false,
      error: "Request timeout",
      message: "Request took too long to process"
    });
  }
});

// CONNECT MONGO (no listening here)
connectDatabase()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ❗❗ DO NOT ADD app.listen()
// cPanel starts the server automatically

module.exports = app;
