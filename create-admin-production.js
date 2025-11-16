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

async function createAdmin() {
  try {
    // Connect to MongoDB with the database name included
    const uri = process.env.DATABASE_URL;
    console.log('Connecting to MongoDB:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📍 Current database:', mongoose.connection.db.databaseName);
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@shilpgroup.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists, removing...');
      await Admin.deleteOne({ email: 'admin@shilpgroup.com' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);
    
    // Create new admin
    const newAdmin = new Admin({
      username: 'admin',
      email: 'admin@shilpgroup.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });
    
    await newAdmin.save();
    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@shilpgroup.com');
    console.log('🔑 Password: 12345678');
    console.log('🏷️  Role: super_admin');
    
    // Verify the admin was created
    const createdAdmin = await Admin.findOne({ email: 'admin@shilpgroup.com' });
    console.log('✅ Verification: Admin exists in database:', !!createdAdmin);
    console.log('📍 Database:', mongoose.connection.db.databaseName);
    console.log('📁 Collection:', createdAdmin?.constructor?.collection?.name);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('💾 Database connection closed');
    process.exit(0);
  }
}

createAdmin();