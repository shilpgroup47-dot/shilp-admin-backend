const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const projectController = require('../controllers/projectController');
const projectValidation = require('../middleware/projectValidation');
const adminAuth = require('../middleware/adminAuth');
const { validateFileSize } = require('../middleware/fileSizeValidation');

const router = express.Router();

// 🚨 ULTRA-FAST STREAMING UPLOAD CONFIGURATION
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'projects');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 🚀 FAST filename generation - no complex processing
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${timestamp}_${randomId}${ext}`);
  }
});

// � ULTRA-FAST file validation - minimal checks
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'brochure') {
    cb(null, file.mimetype === 'application/pdf');
  } else {
    cb(null, file.mimetype.startsWith('image/'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024,  // 200MB per file (increased)
    files: 100,                   // Max 100 files
    fieldSize: 50 * 1024 * 1024,  // 50MB field size
    fieldNameSize: 500,           // Reduced field name size for speed
    headerPairs: 2000             // Increased header pairs
  }
});

// Define multer fields for file uploads - use .any() to accept any field names
const uploadFields = upload.any(); // Accept any file field names

// 🚨 ULTRA-FAST error handling for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'Upload failed';
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File too large (max 200MB)';
    if (err.code === 'LIMIT_FILE_COUNT') message = 'Too many files (max 100)';
    
    return res.status(400).json({
      success: false,
      message,
      code: err.code,
      timestamp: Date.now()
    });
  }
  
  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
      timestamp: Date.now()
    });
  }
  
  next(err);
};

// Public routes (no authentication required)

/**
 * @route   GET /api/projects
 * @desc    Get all projects with filtering by type
 * @access  Public
 * @query   type (residential, commercial, plot) - optional
 */
router.get('/', 
  projectController.getAllProjects
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Public
 */
router.get('/:id',
  projectController.getProjectById
);

// 🚀 ULTRA-FAST PROTECTED ROUTES - Optimized for speed

router.post('/', 
  adminAuth.authenticateAdmin,  // Simplified auth
  uploadFields,
  handleMulterError,
  projectController.createProject
);

router.put('/:id',
  adminAuth.authenticateAdmin,  // Simplified auth
  uploadFields,
  handleMulterError,
  projectController.updateProject
);

router.delete('/:id',
  adminAuth.authenticateAdmin,  // Simplified auth
  projectController.deleteProject
);

router.patch('/:id/toggle-status',
  adminAuth.authenticateAdmin,  // Simplified auth
  projectController.toggleProjectStatus
);

// 🚨 FAST error handler - no console.error delays
router.use((err, req, res, next) => {
  // Async logging to avoid blocking
  setImmediate(() => {
    console.error('Project error:', err.message);
  });
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error',
    timestamp: Date.now()
  });
});

module.exports = router;