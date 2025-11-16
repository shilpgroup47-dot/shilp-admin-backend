const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { validateLogin } = require('../middleware/adminValidation');

const router = express.Router();

// Enhanced Admin Login with Comprehensive Validation
router.post('/login', async (req, res) => {
  try {
    console.log('🔄 Admin login attempt starting...');
    console.log('📧 Request body keys:', Object.keys(req.body));
    
    const { email, password } = req.body;
    
    // Enhanced validation with detailed error messages
    if (!email) {
      console.log('❌ Validation failed: Email missing');
      return res.status(400).json({
        success: false,
        error: { message: 'Email is required' }
      });
    }
    
    if (!password) {
      console.log('❌ Validation failed: Password missing');
      return res.status(400).json({
        success: false,
        error: { message: 'Password is required' }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: Invalid email format');
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
    
    console.log('🔍 Searching for admin with email:', email.toLowerCase());
    
    // Enhanced admin search with error handling
    let admin;
    try {
      admin = await Admin.findOne({ 
        email: { $regex: new RegExp(`^${email.toLowerCase()}$`, 'i') }
      });
    } catch (dbError) {
      console.error('❌ Database query error:', dbError.message);
      return res.status(500).json({
        success: false,
        error: { message: 'Database connection error' }
      });
    }
    
    if (!admin) {
      console.log('❌ Admin not found for email:', email);
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }
    
    console.log('👤 Admin found:', {
      username: admin.username,
      email: admin.email,
      isActive: admin.isActive,
      role: admin.role,
      passwordType: admin.password?.startsWith('$2') ? 'bcrypt-hashed' : 'plain-text'
    });
    
    // Enhanced account status checks
    if (!admin.isActive) {
      console.log('❌ Account inactive for:', admin.email);
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated. Please contact administrator.' }
      });
    }
    
    if (admin.isLocked) {
      console.log('❌ Account locked for:', admin.email);
      return res.status(401).json({
        success: false,
        error: { message: 'Account is locked. Please contact administrator.' }
      });
    }
    
    // Enhanced password verification with detailed logging
    let isValidPassword = false;
    let passwordMethod = 'unknown';

    try {
      if (!admin.password) {
        console.log('❌ No password stored for admin');
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid email or password' }
        });
      }

      // Check if password is bcrypt hash
      if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$') || admin.password.startsWith('$2y$')) {
        console.log('🔐 Attempting bcrypt password verification...');
        passwordMethod = 'bcrypt';
        isValidPassword = await bcrypt.compare(password, admin.password);
        console.log('🔐 Bcrypt verification result:', isValidPassword);
      } else {
        console.log('🔐 Attempting plain-text password verification...');
        passwordMethod = 'plain-text';
        isValidPassword = admin.password === password;
        console.log('🔐 Plain-text verification result:', isValidPassword);
      }
    } catch (passwordError) {
      console.error('❌ Password verification error:', passwordError.message);
      // Try fallback plain-text comparison
      try {
        isValidPassword = admin.password === password;
        passwordMethod = 'fallback-plain-text';
        console.log('🔐 Fallback verification result:', isValidPassword);
      } catch (fallbackError) {
        console.error('❌ Fallback verification failed:', fallbackError.message);
        return res.status(500).json({
          success: false,
          error: { message: 'Password verification system error' }
        });
      }
    }

    if (!isValidPassword) {
      console.log(`❌ Invalid password for ${admin.email} (method: ${passwordMethod})`);
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }
    
    console.log(`✅ Password valid for ${admin.email} (method: ${passwordMethod})`);
    
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
      console.log('✅ JWT token generated successfully');
    } catch (jwtError) {
      console.error('❌ JWT generation error:', jwtError.message);
      return res.status(500).json({
        success: false,
        error: { message: 'Token generation failed' }
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
    
    console.log('✅ Login successful for:', admin.email);
    console.log('📊 Response data prepared');
    
    // Update last login timestamp
    try {
      await Admin.updateOne(
        { _id: admin._id },
        { lastLoginAt: new Date() }
      );
      console.log('📅 Last login timestamp updated');
    } catch (updateError) {
      console.warn('⚠️ Could not update last login:', updateError.message);
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
    console.error('❌ Login system error:', error);
    console.error('🔍 Error stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { 
          message: 'Login system error. Please try again or contact support.',
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