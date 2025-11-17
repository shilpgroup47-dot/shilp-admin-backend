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

const { connectDatabase } = require('./config/database');

const app = express();

// -------- CORS (Only these domains allowed) --------
const allowedOrigins = [
  "https://admin.shilpgroup.com",
  "https://shilpgroup.com",
  "https://backend.shilpgroup.com",
  "http://localhost:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// -------- Body Parser --------
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: true, limit: "150mb" }));

// -------- Static --------
app.use('/uploads', express.static('uploads'));

// -------- Test Route --------
app.get('/', (req, res) => {
  res.status(200).send("Backend is running");
});

// -------- API Routes --------
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projecttree', projectTreeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', logRoutes);

// -------- Error Handler --------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success:false, error: err.message });
});

// -------- Connect DB Only --------
connectDatabase()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ❗ IMPORTANT: DO NOT USE app.listen() on cPanel
module.exports = app;
