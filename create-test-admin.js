#!/usr/bin/env node

/**
 * 🚀 Admin User Creation Script
 * Creates a test admin user for development and testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import Admin model
const Admin = require('./src/models/Admin');

async function createTestAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test admin credentials
    const testAdmin = {
      username: 'testadmin',
      email: 'test@admin.com',
      password: 'TestAdmin123!',
      fullName: 'Test Administrator',
      role: 'admin',
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
      ]
    };

    console.log('🔍 Checking if test admin already exists...');
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { email: testAdmin.email },
        { username: testAdmin.username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Test admin already exists!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Username: ${existingAdmin.username}`);
      console.log('🗑️  Removing existing admin...');
      await Admin.deleteOne({ _id: existingAdmin._id });
      console.log('✅ Existing admin removed');
    }

    console.log('🔐 Hashing password...');
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(testAdmin.password, saltRounds);

    console.log('👤 Creating new test admin...');
    const newAdmin = new Admin({
      username: testAdmin.username,
      email: testAdmin.email,
      password: hashedPassword,
      fullName: testAdmin.fullName,
      role: testAdmin.role,
      isActive: testAdmin.isActive,
      permissions: testAdmin.permissions,
      createdAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      isLocked: false
    });

    await newAdmin.save();
    console.log('✅ Test admin created successfully!');
    
    console.log('\n🎯 Test Admin Credentials:');
    console.log('================================');
    console.log(`📧 Email: ${testAdmin.email}`);
    console.log(`🔑 Password: ${testAdmin.password}`);
    console.log(`👤 Username: ${testAdmin.username}`);
    console.log(`📛 Full Name: ${testAdmin.fullName}`);
    console.log(`🔐 Role: ${testAdmin.role}`);
    console.log('================================');

    // Also create the production admin if it doesn't exist
    console.log('\n🔍 Checking production admin...');
    const prodEmail = process.env.ADMIN_EMAIL;
    const prodPassword = process.env.ADMIN_PASSWORD;
    const prodUsername = process.env.ADMIN_USERNAME;
    const prodFullName = process.env.ADMIN_FULLNAME;

    if (prodEmail && prodPassword) {
      const existingProdAdmin = await Admin.findOne({ email: prodEmail });
      
      if (!existingProdAdmin) {
        console.log('👑 Creating production admin...');
        const prodHashedPassword = await bcrypt.hash(prodPassword, saltRounds);
        
        const prodAdmin = new Admin({
          username: prodUsername || 'admin',
          email: prodEmail,
          password: prodHashedPassword,
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
        console.log(`📧 Production Email: ${prodEmail}`);
        console.log(`👤 Production Username: ${prodUsername}`);
      } else {
        console.log('✅ Production admin already exists');
      }
    }

    console.log('\n🧪 Testing login functionality...');
    const loginTest = await Admin.findOne({ email: testAdmin.email });
    const passwordValid = await loginTest.comparePassword(testAdmin.password);
    
    if (passwordValid) {
      console.log('✅ Password verification test passed!');
    } else {
      console.log('❌ Password verification test failed!');
    }

    console.log('\n🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createTestAdmin();