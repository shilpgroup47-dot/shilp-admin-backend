const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Admin Schema (same as your model)
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

async function createNewAdmin() {
  try {
    // Connect to MongoDB with the database name included
    const uri = process.env.DATABASE_URL;
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(uri, {
      serverApi: { 
        version: '1', 
        strict: true, 
        deprecationErrors: true 
      }
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', mongoose.connection.db.databaseName);
    
    // Remove all existing admins
    console.log('🗑️  Removing all existing admins...');
    await Admin.deleteMany({});
    console.log('✅ All existing admins removed');
    
    // Create new admin with your credentials
    const email = 'shilpgroup47@gmail.com';
    const password = 'ShilpGroup@RealState11290';
    const username = 'shilpgroup47';
    
    console.log('🔐 Creating new admin...');
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin
    const newAdmin = new Admin({
      username: username,
      email: email,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });
    
    const savedAdmin = await newAdmin.save();
    console.log('✅ New admin created successfully!');
    console.log('');
    console.log('🎯 ADMIN CREDENTIALS:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Username:', username);
    console.log('🏷️  Role: super_admin');
    console.log('🆔 ID:', savedAdmin._id);
    console.log('');
    
    // Test login immediately
    console.log('🧪 Testing login...');
    const isPasswordValid = await bcrypt.compare(password, savedAdmin.password);
    console.log('✅ Password validation test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // Verify the admin exists in database
    const verifyAdmin = await Admin.findOne({ email: email });
    console.log('✅ Admin exists in database:', !!verifyAdmin);
    console.log('📍 Collection: admins');
    console.log('📁 Database:', mongoose.connection.db.databaseName);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.log('⚠️  Duplicate key error - admin might already exist with this email');
    }
  } finally {
    await mongoose.disconnect();
    console.log('💾 Database connection closed');
    process.exit(0);
  }
}

createNewAdmin();