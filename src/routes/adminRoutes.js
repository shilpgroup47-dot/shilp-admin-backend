const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { validateLogin } = require('../middleware/adminValidation');

const router = express.Router();

// Direct Emergency Login Implementation (replaces problematic main login)
router.post('/login', async (req, res) => {
  try {
    console.log('🔄 Admin login attempt with emergency logic...');
    
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' }
      });
    }
    
    // Direct MongoDB connection (bypass service layer issues)
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    const Admin = require('../models/Admin');
    
    console.log('🔍 Looking for admin:', email);
    
    // Find admin directly
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }
    
    console.log('👤 Admin found:', admin.username);
    
    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated' }
      });
    }
    
    // Password check - support both bcrypt-hashed and plain-text stored passwords
    const bcrypt = require('bcrypt');
    let isValidPassword = false;

    try {
      if (admin.password && typeof admin.password === 'string' && admin.password.startsWith('$2')) {
        // Likely a bcrypt hash
        isValidPassword = await bcrypt.compare(password, admin.password);
        console.log('🔐 Used bcrypt.compare for password verification');
      } else {
        // Fallback to plain-text comparison (legacy/emergency)
        isValidPassword = admin.password === password;
        console.log('🔐 Used plain-text comparison for password verification');
      }
    } catch (pwErr) {
      console.error('❌ Password verification error:', pwErr.message);
      // Fall back to simple equality if bcrypt fails for some reason
      isValidPassword = admin.password === password;
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }
    
    console.log('✅ Password valid, generating token...');
    
    // Generate JWT token
    const tokenPayload = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [
        'users.read', 'users.write', 'users.delete',
        'analytics.read', 'settings.read', 'settings.write',
        'system.manage', 'projects.create', 'projects.read',
        'projects.update', 'projects.delete', 'banners.create',
        'banners.read', 'banners.update', 'banners.delete'
      ]
    };
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'shilp-group-admin-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    const adminData = {
      id: admin._id,
      email: admin.email,
      username: admin.username,
      fullName: admin.fullName,
      role: admin.role,
      permissions: tokenPayload.permissions
    };
    
    console.log('✅ Login successful for:', admin.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: adminData,
        expiresIn: '7d'
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Login failed: ' + error.message
      }
    });
  }
});
router.post('/verify-token', adminController.verifyToken);
router.post('/forgot-password', adminController.forgotPassword);

// Protected route - Get admin profile (for token verification)
router.get('/profile', authenticateAdmin, adminController.getProfile);

module.exports = router;