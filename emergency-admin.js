#!/usr/bin/env node

/**
 * 🚨 EMERGENCY LOGIN FIX
 * Direct database admin creation for production
 */

const { MongoClient } = require('mongodb');

async function createEmergencyAdmin() {
  let client;
  
  try {
    console.log('🚨 Emergency Admin Creation');
    console.log('============================');
    
    // Connect to MongoDB
    const uri = process.env.DATABASE_URL || 'mongodb+srv://shilpgroup47_db_user:vQ9tE9XlbMCcEZUC@cluster0.chfkuy8.mongodb.net/?appName=adminshilp';
    const dbName = process.env.DATABASE_NAME || 'shilpadmin';
    
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(dbName);
    const adminsCollection = db.collection('admins');
    
    // Admin credentials from environment
    const adminEmail = 'shilpgroup47@gmail.com';
    const adminPassword = 'ShilpGroup@RealState11290'; // We'll store plain text for now, fix later
    
    console.log('🔍 Checking existing admin...');
    const existingAdmin = await adminsCollection.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('✅ Admin already exists:', adminEmail);
      
      // Update password to plain text temporarily (emergency fix)
      await adminsCollection.updateOne(
        { email: adminEmail },
        { 
          $set: { 
            password: adminPassword, // Plain text for emergency
            passwordType: 'plain', // Mark as plain text
            isActive: true,
            role: 'super-admin',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('🔧 Updated admin with plain text password (TEMPORARY)');
      
    } else {
      // Create new admin
      const newAdmin = {
        username: 'shilpgroup47',
        email: adminEmail,
        password: adminPassword, // Plain text for emergency
        passwordType: 'plain',
        fullName: 'Shilp Group Admin',
        role: 'super-admin',
        isActive: true,
        permissions: [
          'users.read', 'users.write', 'users.delete',
          'projects.create', 'projects.read', 'projects.update', 'projects.delete',
          'banners.create', 'banners.read', 'banners.update', 'banners.delete'
        ],
        createdAt: new Date(),
        loginAttempts: 0,
        isLocked: false
      };
      
      await adminsCollection.insertOne(newAdmin);
      console.log('✅ Emergency admin created with plain text password');
    }
    
    console.log('============================');
    console.log('🎯 Login Credentials:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️ WARNING: Password is plain text (temporary fix)');
    console.log('============================');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Load environment
require('dotenv').config();
createEmergencyAdmin();