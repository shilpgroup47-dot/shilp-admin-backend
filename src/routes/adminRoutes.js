const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { validateLogin } = require('../middleware/adminValidation');

const router = express.Router();

// Public routes - Only essential admin API
router.post('/login', validateLogin, adminController.login);
router.post('/verify-token', adminController.verifyToken);
router.post('/forgot-password', adminController.forgotPassword);

// Protected route - Get admin profile (for token verification)
router.get('/profile', authenticateAdmin, adminController.getProfile);

module.exports = router;