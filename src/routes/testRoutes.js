const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const router = express.Router();

// 🧪 Test endpoint to create admin user (for development only)
router.post('/create-test-admin', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: { message: 'Test admin creation not allowed in production' }
      });
    }

    console.log('🧪 Creating test admin user...');

    // Test admin credentials
    const testAdmin = {
      username: 'testadmin',
      email: 'test@admin.com', 
      password: 'TestAdmin123!',
      fullName: 'Test Administrator',
      role: 'admin'
    };

    // Check if test admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { email: testAdmin.email },
        { username: testAdmin.username }
      ]
    });

    if (existingAdmin) {
      console.log('🗑️ Removing existing test admin...');
      await Admin.deleteOne({ _id: existingAdmin._id });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(testAdmin.password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({
      username: testAdmin.username,
      email: testAdmin.email,
      password: hashedPassword,
      fullName: testAdmin.fullName,
      role: testAdmin.role,
      isActive: true,
      permissions: [
        'users.read',
        'users.write',
        'analytics.read',
        'projects.create',
        'projects.read', 
        'projects.update',
        'projects.delete',
        'banners.create',
        'banners.read',
        'banners.update',
        'banners.delete'
      ],
      createdAt: new Date(),
      loginAttempts: 0,
      isLocked: false
    });

    await newAdmin.save();

    console.log('✅ Test admin created successfully!');
    
    // Test password validation
    const passwordValid = await newAdmin.comparePassword(testAdmin.password);

    res.json({
      success: true,
      message: 'Test admin created successfully',
      data: {
        credentials: {
          email: testAdmin.email,
          password: testAdmin.password,
          username: testAdmin.username
        },
        passwordTest: passwordValid ? 'PASSED' : 'FAILED',
        adminId: newAdmin._id
      }
    });

  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Failed to create test admin',
        details: error.message
      }
    });
  }
});

// 👑 Create production admin endpoint
router.post('/create-production-admin', async (req, res) => {
  try {
    console.log('👑 Creating production admin user...');

    const prodEmail = process.env.ADMIN_EMAIL;
    const prodPassword = process.env.ADMIN_PASSWORD;
    const prodUsername = process.env.ADMIN_USERNAME;
    const prodFullName = process.env.ADMIN_FULLNAME;

    if (!prodEmail || !prodPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Production admin credentials not found in environment variables' }
      });
    }

    // Check if production admin already exists
    const existingAdmin = await Admin.findOne({ email: prodEmail });
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Production admin already exists',
        data: {
          email: existingAdmin.email,
          username: existingAdmin.username,
          created: false
        }
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(prodPassword, saltRounds);

    // Create production admin
    const prodAdmin = new Admin({
      username: prodUsername || 'admin',
      email: prodEmail,
      password: hashedPassword,
      fullName: prodFullName || 'Production Admin',
      role: 'super-admin',
      isActive: true,
      permissions: [
        'users.read',
        'users.write',
        'users.delete',
        'analytics.read',
        'settings.read',
        'settings.write',
        'system.manage',
        'projects.create',
        'projects.read',
        'projects.update',
        'projects.delete',
        'banners.create',
        'banners.read',
        'banners.update',
        'banners.delete'
      ],
      createdAt: new Date()
    });

    await prodAdmin.save();

    console.log('✅ Production admin created!');

    res.json({
      success: true,
      message: 'Production admin created successfully',
      data: {
        email: prodEmail,
        username: prodUsername,
        role: 'super-admin',
        created: true,
        adminId: prodAdmin._id
      }
    });

  } catch (error) {
    console.error('❌ Error creating production admin:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create production admin',
        details: error.message
      }
    });
  }
});

// 📋 List all admins (for debugging)
router.get('/list-admins', async (req, res) => {
  try {
    const admins = await Admin.find({}, {
      username: 1,
      email: 1,
      fullName: 1,
      role: 1,
      isActive: 1,
      createdAt: 1,
      lastLogin: 1
    });

    res.json({
      success: true,
      message: 'Admin list retrieved',
      data: {
        count: admins.length,
        admins: admins
      }
    });

  } catch (error) {
    console.error('❌ Error listing admins:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

module.exports = router;