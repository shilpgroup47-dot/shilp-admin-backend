const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const router = express.Router();

// 🚨 Emergency Login Route - Direct Database Access
router.post('/emergency-login', async (req, res) => {
  console.log('🚨 Emergency login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' }
      });
    }
    
    // Direct database connection (bypass adminService)
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    
    const db = client.db(process.env.DATABASE_NAME);
    const admin = await db.collection('admins').findOne({ email: email });
    
    await client.close();
    
    if (!admin) {
      console.log('❌ Admin not found:', email);
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }
    
    if (!admin.isActive) {
      console.log('❌ Admin inactive:', email);
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated' }
      });
    }
    
    // Password check (supports both plain text and hashed)
    let passwordValid = false;
    
    if (admin.passwordType === 'plain') {
      passwordValid = (admin.password === password);
      console.log('🔍 Plain text password check:', passwordValid);
    } else {
      // Try bcrypt if available
      try {
        const bcrypt = require('bcrypt');
        passwordValid = await bcrypt.compare(password, admin.password);
        console.log('🔍 Bcrypt password check:', passwordValid);
      } catch (bcryptError) {
        console.log('⚠️ Bcrypt failed, fallback to plain text');
        passwordValid = (admin.password === password);
      }
    }
    
    // Emergency override for production admin
    if (!passwordValid && email === 'shilpgroup47@gmail.com' && password === 'ShilpGroup@RealState11290') {
      passwordValid = true;
      console.log('🚨 Emergency override activated');
    }
    
    if (!passwordValid) {
      console.log('❌ Password invalid for:', email);
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    console.log('✅ Emergency login successful:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: token,
        admin: {
          id: admin._id.toString(),
          email: admin.email,
          username: admin.username,
          fullName: admin.fullName,
          role: admin.role,
          permissions: admin.permissions || []
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });
    
  } catch (error) {
    console.error('❌ Emergency login error:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed: ' + error.message
      }
    });
  }
});

// 🔧 Simplified Login (Alternative to main login)
router.post('/simple-login', async (req, res) => {
  console.log('🔧 Simple login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    // Hardcoded admin for emergency (remove after fixing main login)
    if (email === 'shilpgroup47@gmail.com' && password === 'ShilpGroup@RealState11290') {
      const token = jwt.sign(
        {
          id: 'emergency-admin-id',
          email: email,
          role: 'super-admin',
          permissions: ['users.read', 'users.write', 'projects.create', 'projects.read', 'projects.update', 'projects.delete']
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      console.log('✅ Simple login successful');
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: token,
          admin: {
            id: 'emergency-admin-id',
            email: email,
            username: 'shilpgroup47',
            fullName: 'Shilp Group Admin',
            role: 'super-admin'
          }
        }
      });
    }
    
    res.status(401).json({
      success: false,
      error: { message: 'Invalid credentials' }
    });
    
  } catch (error) {
    console.error('❌ Simple login error:', error.message);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' }
    });
  }
});

module.exports = router;