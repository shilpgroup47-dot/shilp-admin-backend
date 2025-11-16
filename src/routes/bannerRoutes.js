const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateAdmin } = require('../middleware/adminAuth');
const bannerController = require('../controllers/bannerController');

// Ensure upload directory exists with specific banners folder
const uploadDir = path.join(process.cwd(), 'uploads', 'banners');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Enhanced multer configuration with better file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with section and field info
    const { section, field } = req.params;
    const timestamp = Date.now();
    const uniqueId = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedOriginal = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    
    const filename = `${section}_${field}_${timestamp}_${uniqueId}_${sanitizedOriginal}${ext}`;
    cb(null, filename);
  }
});

// 🚀 OPTIMIZED file filter for faster validation
const fileFilter = (req, file, cb) => {
  // Quick MIME type check (faster than extension check)
  if (file.mimetype.startsWith('image/')) {
    // Allow common image types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported image format'), false);
    }
  } else {
    cb(new Error('Only image files allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024,  // 50MB limit (increased for better banner quality)
    files: 1,                    // Single file upload only
    fieldSize: 50 * 1024 * 1024, // Field size limit
    fieldNameSize: 1000          // Field name size
  }
});

// Get all banners
router.get('/', bannerController.getBanners);

// Debug endpoint to list uploaded files (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/files', authenticateAdmin, (req, res) => {
    try {
      const files = fs.readdirSync(uploadDir);
      const uploadDirParent = path.join(process.cwd(), 'uploads');
      let parentFiles = [];
      
      try {
        parentFiles = fs.readdirSync(uploadDirParent);
      } catch (e) {
        parentFiles = ['Directory does not exist'];
      }

      res.json({
        success: true,
        data: {
          uploadDir,
          uploadDirParent,
          filesInBannersDir: files.map(file => ({
            name: file,
            path: `/uploads/banners/${file}`,
            fullUrl: `${req.protocol}://${req.get('host')}/uploads/banners/${file}`,
            exists: fs.existsSync(path.join(uploadDir, file))
          })),
          filesInUploadsDir: parentFiles,
          currentWorkingDir: process.cwd()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to list files',
        details: error.message
      });
    }
  });
  
  // Test endpoint to directly serve a file
  router.get('/debug/test-image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found',
        filePath,
        exists: false
      });
    }
  });
}

// Upload banner image for specific section and field
router.post('/:section/:field', authenticateAdmin, upload.single('image'), bannerController.uploadBannerImage);

// Update alt text for a section
router.patch('/:section/alt', authenticateAdmin, bannerController.updateBannerAlt);
router.put('/:section/alt', authenticateAdmin, bannerController.updateBannerAlt);

// Update blogsDetail title and description
router.put('/blogsDetail/text', authenticateAdmin, bannerController.updateBlogsDetailText);

// Delete banner image for specific section and field
router.delete('/:section/:field', authenticateAdmin, bannerController.deleteBannerImage);

module.exports = router;
