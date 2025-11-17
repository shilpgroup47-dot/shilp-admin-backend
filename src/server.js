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

// SECURITY
app.use(helmet());
app.use(compression());

// CORS (only allowed domains)
const allowedOrigins = [
  'https://admin.shilpgroup.com',
  'https://shilpgroup.com',
  'https://backend.shilpgroup.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options('*', cors());

// BODY PARSING
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

// STATIC FILES
app.use('/uploads', express.static('uploads'));

// ROOT
app.get('/', (req, res) => {
  res.send("Backend is running");
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

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ error: err.message });
});

// CONNECT MONGO ONLY
connectDatabase()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// DO NOT USE app.listen() - cPanel does this
module.exports = app;
