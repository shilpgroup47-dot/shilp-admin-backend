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

// CORS — Allow All
app.use(cors());
app.options('*', cors());

// Body Parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static Files
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(uploadDir));

// Root Test
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projecttree', projectTreeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', logRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    error: { message: err.message },
  });
});

// MongoDB Connect
connectDatabase()
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ❗ IMPORTANT: DO NOT START SERVER HERE
// cPanel Application Manager automatically runs the app
// NO app.listen()
// NO startServer()

module.exports = app;
