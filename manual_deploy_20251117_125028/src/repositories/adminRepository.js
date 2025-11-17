const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

class AdminRepository {

  async findByEmail(email) {
    try {
      const admin = await Admin.findOne({
        email: { $regex: new RegExp(`^${email.toLowerCase()}$`, 'i') }
      }).select('+password');
      
      return admin;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async findById(adminId) {
    try {
      const admin = await Admin.findById(adminId);
      return admin;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async verifyPassword(admin, password) {
    try {
      if (!admin.password) {
        return false;
      }

      // Check if password is bcrypt hash
      if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$') || admin.password.startsWith('$2y$')) {
        return await bcrypt.compare(password, admin.password);
      } else {
        // Plain text comparison for backward compatibility
        return admin.password === password;
      }
    } catch (error) {
      throw new Error(`Password verification error: ${error.message}`);
    }
  }

  async updateLastLogin(adminId) {
    try {
      await Admin.updateOne(
        { _id: adminId },
        { lastLoginAt: new Date() }
      );
    } catch (error) {
      // Don't throw error for this operation
      console.warn('Could not update last login:', error.message);
    }
  }

  async create(adminData) {
    try {
      const admin = new Admin(adminData);
      await admin.save();
      return admin;
    } catch (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  async update(adminId, updateData) {
    try {
      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
      return admin;
    } catch (error) {
      throw new Error(`Failed to update admin: ${error.message}`);
    }
  }

  async delete(adminId) {
    try {
      await Admin.findByIdAndDelete(adminId);
    } catch (error) {
      throw new Error(`Failed to delete admin: ${error.message}`);
    }
  }
}

module.exports = new AdminRepository();