const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bannerRoutes = require('./routes/bannerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const projectTreeRoutes = require('./routes/projectTreeRoutes');
const blogRoutes = require('./routes/blogRoutes');
const publicRoutes = require('./routes/publicRoutes');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/adminRoutes');
const logRoutes = require('./routes/logRoutes');
const jobOpeningRoutes = require('./routes/jobOpeningRoutes');

const { connectDatabase } = require('./config/database');

const app = express();

const allowedOrigins = [
  "https://admin.shilpgroup.com",
  "https://shilpgroup.com",
  "https://backend.shilpgroup.com",
  "http://localhost:5174",
  "http://localhost:5173", // Add shilp-group dev server
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:8080",
  "http://demo.shilpgroup.com",
  "https://demo.shilpgroup.com",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost on any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// -------- Body Parser --------
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: true, limit: "150mb" }));

// -------- Static Files --------
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

// Serve static files with proper headers
app.use('/uploads', express.static('uploads', {
  // Add proper headers for production
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// -------- Test Route --------
app.get('/', (req, res) => {
  res.status(200).send("Backend is running");
});

// Test uploads directory
app.get('/test-uploads', (req, res) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const projectsDir = path.join(uploadsDir, 'projects');
  
  const stats = {
    uploadsExists: fs.existsSync(uploadsDir),
    projectsExists: fs.existsSync(projectsDir),
    uploadsPath: uploadsDir,
    projectsPath: projectsDir,
    cwd: process.cwd()
  };
  
  res.json(stats);
});

// -------- API Routes --------
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projecttree', projectTreeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/job-openings', jobOpeningRoutes);
app.use('/api', logRoutes);

// -------- Error Handler --------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success:false, error: err.message });
})
connectDatabase()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ❗ IMPORTANT: DO NOT USE app.listen() on cPanel
// When run directly (development), start the HTTP server so `npm start` keeps the process alive.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

module.exports = app;
