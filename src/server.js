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
}));

app.options('*', cors());

// BODY PARSER
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// UPLOADS
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(uploadDir));

// ROOT TEST
app.get('/', (req, res) => {
  res.send('Backend is running');
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
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// CONNECT MONGO (no listening here)
connectDatabase()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ❗❗ DO NOT ADD app.listen()
// cPanel starts the server automatically

module.exports = app;
