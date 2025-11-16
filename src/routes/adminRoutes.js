const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { validateLogin } = require('../middleware/adminValidation');

const router = express.Router();

// Enhanced Admin Login with Comprehensive Validation
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Enhanced validation with detailed error messages
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email is required' }
      });
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password is required' }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid email format' }
      });
    }
    
    // Direct MongoDB connection with enhanced error handling
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcrypt');
    const Admin = require('../models/Admin');
    
    // Enhanced admin search with error handling
    let admin;
    try {
      admin = await Admin.findOne({ 
        email: { $regex: new RegExp(`^${email.toLowerCase()}$`, 'i') }
      });
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        error: { message: 'Database connection error. Please try again later.' }
      });
    }
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }
    
    // Enhanced account status checks
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated. Please contact administrator.' }
      });
    }
    
    if (admin.isLocked) {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is locked. Please contact administrator.' }
      });
    }
    
    // Enhanced password verification
    let isValidPassword = false;

    try {
      if (!admin.password) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid email or password' }
        });
      }

      // Check if password is bcrypt hash
      if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$') || admin.password.startsWith('$2y$')) {
        isValidPassword = await bcrypt.compare(password, admin.password);
      } else {
        isValidPassword = admin.password === password;
      }
    } catch (passwordError) {
      // Try fallback plain-text comparison
      try {
        isValidPassword = admin.password === password;
      } catch (fallbackError) {
        return res.status(500).json({
          success: false,
          error: { message: 'Authentication system error. Please try again later.' }
        });
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }
    
    // Enhanced JWT token generation
    const tokenPayload = {
      id: admin._id.toString(),
      email: admin.email,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions || [
        'users.read', 'users.write', 'users.delete',
        'analytics.read', 'settings.read', 'settings.write',
        'system.manage', 'projects.create', 'projects.read',
        'projects.update', 'projects.delete', 'banners.create',
        'banners.read', 'banners.update', 'banners.delete'
      ],
      iat: Math.floor(Date.now() / 1000)
    };
    
    const jwtSecret = process.env.JWT_SECRET || 'shilp-group-admin-secret-key-2024';
    const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
    
    let token;
    try {
      token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: jwtExpiry });
    } catch (jwtError) {
      return res.status(500).json({
        success: false,
        error: { message: 'Token generation failed. Please try again later.' }
      });
    }
    
    const adminData = {
      id: admin._id.toString(),
      email: admin.email,
      username: admin.username,
      fullName: admin.fullName,
      role: admin.role,
      permissions: tokenPayload.permissions,
      isActive: admin.isActive
    };
    
    // Update last login timestamp
    try {
      await Admin.updateOne(
        { _id: admin._id },
        { lastLoginAt: new Date() }
      );
    } catch (updateError) {
      // Don't fail the login for this
    }
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: adminData,
        expiresIn: jwtExpiry
      }
    });
    
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { 
          message: 'Internal server error. Please try again later.',
          code: 'INTERNAL_LOGIN_ERROR'
        }
      });
    }
  }
});
router.post('/verify-token', adminController.verifyToken);
router.post('/forgot-password', adminController.forgotPassword);

// Protected route - Get admin profile (for token verification)
router.get('/profile', authenticateAdmin, adminController.getProfile);

module.exports = router;