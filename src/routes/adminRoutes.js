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
    
    // Direct password comparison (plain text for emergency access)
    const isValidPassword = admin.password === password;
    
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