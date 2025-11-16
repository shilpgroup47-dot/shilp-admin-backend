const jwt = require('jsonwebtoken');
const adminRepository = require('../repositories/adminRepository');

class AdminService {

  async login(email, password, ipAddress, userAgent) {
    try {
      // Find admin by email
      const admin = await adminRepository.findByEmail(email);

      if (!admin) {
        throw new Error('Invalid credentials');
      }

      // Check account status
      if (admin.isLocked) {
        throw new Error('Account locked. Please contact administrator.');
      }

      if (!admin.isActive) {
        throw new Error('Account deactivated. Please contact administrator.');
      }

      // Verify password
      const isPasswordValid = await adminRepository.verifyPassword(admin, password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const tokenPayload = {
        id: admin._id.toString(),
        email: admin.email,
        username: admin.username,
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
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Update last login
      await adminRepository.updateLastLogin(admin._id);

      return {
        token,
        admin: {
          id: admin._id.toString(),
          email: admin.email,
          username: admin.username,
          fullName: admin.fullName,
          role: admin.role,
          permissions: tokenPayload.permissions,
          isActive: admin.isActive
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };

    } catch (error) {
      throw error;
    }
  }

  async getProfile(adminId) {
    try {
      const admin = await adminRepository.findById(adminId);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      return {
        id: admin._id.toString(),
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'shilp-group-admin-secret-key-2024'
      );

      const admin = await adminRepository.findById(decoded.id);
      
      if (!admin || !admin.isActive) {
        throw new Error('Invalid token');
      }

      return {
        id: admin._id.toString(),
        email: admin.email,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async forgotPassword(email) {
    try {
      const admin = await adminRepository.findByEmail(email);
      
      if (!admin) {
        // Don't reveal whether email exists for security
        return true;
      }

      // Here you would typically send an email with reset token
      // For now, just return success
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminService();