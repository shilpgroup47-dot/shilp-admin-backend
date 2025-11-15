#!/usr/bin/env node

/**
 * 🚨 DIRECT MONGODB ADMIN FIX
 * This script will directly connect to MongoDB and fix the admin user
 */

const { MongoClient } = require('mongodb');

const DATABASE_URL = 'mongodb+srv://shilpgroup47_db_user:vQ9tE9XlbMCcEZUC@cluster0.chfkuy8.mongodb.net/?appName=adminshilp';
const DATABASE_NAME = 'shilpadmin';

async function fixAdminUser() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB directly...');
    client = new MongoClient(DATABASE_URL);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const adminsCollection = db.collection('admins');
    
    console.log('🔍 Checking existing admin users...');
    const existingAdmins = await adminsCollection.find({}).toArray();
    console.log('📊 Found', existingAdmins.length, 'admin(s)');
    
    // List existing admins
    existingAdmins.forEach(admin => {
      console.log(`👤 Admin: ${admin.email} | Active: ${admin.isActive} | Password Type: ${admin.password ? (admin.password.startsWith('$2') ? 'hashed' : 'plain') : 'none'}`);
    });
    
    // Create/update production admin
    const adminEmail = 'shilpgroup47@gmail.com';
    const adminPassword = 'ShilpGroup@RealState11290';
    
    console.log('🛠️ Creating/updating production admin...');
    
    const adminDoc = {
      username: 'shilpgroup47',
      email: adminEmail,
      password: adminPassword, // Plain text for emergency access
      passwordType: 'plain', 
      fullName: 'Shilp Group Admin',
      role: 'super-admin',
      isActive: true,
      permissions: [
        'users.read', 'users.write', 'users.delete',
        'analytics.read',
        'settings.read', 'settings.write',
        'system.manage',
        'projects.create', 'projects.read', 'projects.update', 'projects.delete',
        'banners.create', 'banners.read', 'banners.update', 'banners.delete'
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      isLocked: false,
      lockUntil: null
    };
    
    const result = await adminsCollection.replaceOne(
      { email: adminEmail },
      adminDoc,
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      console.log('✅ New admin created');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Existing admin updated');
    } else {
      console.log('ℹ️ Admin already exists and is current');
    }
    
    // Verify the admin
    const verifyAdmin = await adminsCollection.findOne({ email: adminEmail });
    console.log('🔍 Verification - Admin found:', !!verifyAdmin);
    console.log('📧 Email:', verifyAdmin?.email);
    console.log('👤 Username:', verifyAdmin?.username);
    console.log('🔐 Password Type:', verifyAdmin?.passwordType);
    console.log('✅ Active:', verifyAdmin?.isActive);
    console.log('🔓 Locked:', verifyAdmin?.isLocked);
    
    console.log('');
    console.log('🎯 LOGIN CREDENTIALS:');
    console.log('=====================');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️ Password Type: Plain text (for emergency access)');
    console.log('=====================');
    
    console.log('');
    console.log('🧪 TEST COMMAND:');
    console.log('curl -X POST "https://backend.shilpgroup.com/api/admin/login" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Origin: http://localhost:5174" \\');
    console.log('  -d \'{"email":"' + adminEmail + '","password":"' + adminPassword + '"}\'');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
fixAdminUser()
  .then(() => {
    console.log('✅ Admin fix completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });