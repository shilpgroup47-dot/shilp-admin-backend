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

// 🚨 EMERGENCY: Create production admin (remove after use)
router.post('/emergency-create-admin', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const Admin = require('../models/Admin');
    
    const prodEmail = process.env.ADMIN_EMAIL;
    const prodPassword = process.env.ADMIN_PASSWORD;
    
    if (!prodEmail || !prodPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Admin credentials not found in environment' }
      });
    }

    const existing = await Admin.findOne({ email: prodEmail });
    if (existing) {
      return res.json({
        success: true,
        message: 'Admin already exists',
        data: { email: prodEmail }
      });
    }

    const hashedPassword = await bcrypt.hash(prodPassword, 12);
    
    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: prodEmail,
      password: hashedPassword,
      fullName: process.env.ADMIN_FULLNAME || 'Admin',
      role: 'super-admin',
      isActive: true,
      permissions: ['users.read', 'users.write', 'projects.create', 'projects.read', 'projects.update', 'projects.delete'],
      createdAt: new Date()
    });

    await admin.save();

    res.json({
      success: true,
      message: 'Production admin created',
      data: { email: prodEmail, username: admin.username }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

module.exports = router;