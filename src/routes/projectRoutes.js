const express = require('express');
const multer = require('multer');
const path = require('path');
const projectController = require('../controllers/projectController');
const projectValidation = require('../middleware/projectValidation');
const adminAuth = require('../middleware/adminAuth');
const { validateFileSize } = require('../middleware/fileSizeValidation');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage for processing

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.fieldname === 'brochure') {
    // PDF only for brochure
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Brochure must be a PDF file'), false);
    }
  } else {
    // Images for all other fields
    if (file.mimetype.startsWith('image/') || 
        (file.fieldname.includes('amenity') && file.mimetype === 'image/svg+xml')) {
      cb(null, true);
    } else {
      cb(new Error(`${file.fieldname} must be an image file`), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB limit per file
    files: 100 // Maximum 100 files per request
  }
});

// Define multer fields for file uploads - use .any() to accept any field names
const uploadFields = upload.any(); // Accept any file field names

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.log('Multer error occurred:', err.code, err.message);
  console.log('File details:', req.files ? Object.keys(req.files) : 'No files');
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 250MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 100 files allowed per request.'
      });
    }
    // Removed LIMIT_UNEXPECTED_FILE error - allow any file field names
    // if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Unexpected file field. Please check the allowed file fields.'
    //   });
    // }
  }
  
  if (err.message.includes('must be')) {
    return res.status(400).json({
      success: false,
      message: err.message
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

// Protected routes (authentication required)

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Admin only)
 * @files   Accept any file field names for project uploads
 */
router.post('/', 
  adminAuth.verifyToken,
  adminAuth.requirePermission('projects.create'),
  uploadFields,
  handleMulterError,
  validateFileSize,
  projectValidation.createProject,
  projectController.createProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update an existing project
 * @access  Private (Admin only)
 * @files   Accept any file field names for project uploads
 */
router.put('/:id',
  adminAuth.verifyToken,
  adminAuth.requirePermission('projects.update'),
  uploadFields,
  handleMulterError,
  validateFileSize,
  projectValidation.updateProject,
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project and all its files
 * @access  Private (Admin only)
 */
router.delete('/:id',
  adminAuth.verifyToken,
  adminAuth.requirePermission('projects.delete'),
  projectController.deleteProject
);

/**
 * @route   PATCH /api/projects/:id/toggle-status
 * @desc    Toggle project active/inactive status
 * @access  Private (Admin only)
 */
router.patch('/:id/toggle-status',
  adminAuth.verifyToken,
  adminAuth.requirePermission('projects.update'),
  projectController.toggleProjectStatus
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Project routes error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = router;