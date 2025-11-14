const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateAdmin } = require('../middleware/adminAuth');
const projectTreeController = require('../controllers/projectTreeController');

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'projecttree');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for single image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueId = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedOriginal = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    
    const filename = `projecttree_${timestamp}_${uniqueId}_${sanitizedOriginal}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Single file upload
  }
});

// Public routes
router.get('/', projectTreeController.getAllProjectTrees);
router.get('/statistics', projectTreeController.getStatistics);
router.get('/:id', projectTreeController.getProjectTreeById);

// Protected routes (require admin authentication)
router.post('/', authenticateAdmin, upload.single('image'), projectTreeController.createProjectTree);
router.put('/:id', authenticateAdmin, upload.single('image'), projectTreeController.updateProjectTree);
router.delete('/:id', authenticateAdmin, projectTreeController.deleteProjectTree);

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File is too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Only one file is allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next();
});

module.exports = router;
