const jwt = require('jsonwebtoken');
const adminRepository = require('../repositories/adminRepository');
const Admin = require('../models/Admin');

class AdminService {

async login(email, password, ipAddress, userAgent) {
  // Find admin by email
  const admin = await adminRepository.findByEmail(email);

  // 🧩 Case 1: Email not found
  if (!admin) {
    const error = new Error('Email not found. Please check your email and try again.');
    error.code = 'EMAIL_NOT_FOUND';
    throw error;
  }

  // 🧩 Case 2: Account locked
  if (admin.isLocked) {
    const error = new Error('Account is temporarily locked due to multiple failed login attempts');
    error.code = 'ACCOUNT_LOCKED';
    throw error;
  }

  // 🧩 Case 3: Account deactivated
  if (!admin.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.code = 'ACCOUNT_INACTIVE';
    throw error;
  }

  // 🧩 Case 4: Invalid password
  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    await adminRepository.incrementLoginAttempts(admin._id);
    const error = new Error('Incorrect password. Please try again.');
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  // ✅ Success: Reset attempts and update login info
  await adminRepository.resetLoginAttempts(admin._id);
  await adminRepository.updateLastLogin(admin._id, ipAddress, userAgent);

  // Generate JWT token
  const token = this.generateToken(admin);

  const adminData = {
    id: admin._id,
    username: admin.username,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    permissions: admin.permissions,
    lastLogin: new Date(),
  };

  return {
    admin: adminData,
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };
}


  /**
   * Create new admin
   * @param {Object} adminData - Admin data
   * @returns {Promise<Object>}
   */
  async createAdmin(adminData) {
    const { username, email, password, fullName, role = 'admin' } = adminData;

    // Check if username or email already exists
    const [usernameExists, emailExists] = await Promise.all([
      adminRepository.usernameExists(username),
      adminRepository.emailExists(email)
    ]);

    if (usernameExists) {
      throw new Error('Username already exists');
    }

    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Get default permissions for role
    const permissions = Admin.getDefaultPermissions(role);

    // Create admin
    const admin = await adminRepository.create({
      username,
      email,
      password,
      fullName,
      role,
      permissions
    });

    return {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      permissions: admin.permissions,
      createdAt: admin.createdAt
    };
  }

  /**
   * Get admin profile
   * @param {string} adminId - Admin ID
   * @returns {Promise<Object>}
   */
  async getProfile(adminId) {
    const admin = await adminRepository.findById(adminId);
    
    if (!admin) {
      throw new Error('Admin not found');
    }

    return {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
  }

  /**
   * Update admin profile
   * @param {string} adminId - Admin ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>}
   */
  async updateProfile(adminId, updateData) {
    const { username, email, fullName } = updateData;

    // Check if admin exists
    const existingAdmin = await adminRepository.findById(adminId);
    if (!existingAdmin) {
      throw new Error('Admin not found');
    }

    // Check for duplicate username/email (excluding current admin)
    if (username && username !== existingAdmin.username) {
      const usernameExists = await adminRepository.usernameExists(username, adminId);
      if (usernameExists) {
        throw new Error('Username already exists');
      }
    }

    if (email && email !== existingAdmin.email) {
      const emailExists = await adminRepository.emailExists(email, adminId);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Update admin
    const updatedAdmin = await adminRepository.updateById(adminId, {
      username,
      email,
      fullName
    });

    return {
      id: updatedAdmin._id,
      username: updatedAdmin.username,
      email: updatedAdmin.email,
      fullName: updatedAdmin.fullName,
      role: updatedAdmin.role,
      permissions: updatedAdmin.permissions,
      updatedAt: updatedAdmin.updatedAt
    };
  }

  /**
   * Get all admins with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async getAllAdmins(options = {}) {
    const result = await adminRepository.findAll(options);
    
    // Transform admin data to exclude sensitive information
    const admins = result.admins.map(admin => ({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));

    return {
      admins,
      pagination: result.pagination
    };
  }

  /**
   * Update admin role and permissions
   * @param {string} adminId - Admin ID
   * @param {string} role - New role
   * @param {Array} permissions - Custom permissions (optional)
   * @returns {Promise<Object>}
   */
  async updateRole(adminId, role, permissions = null) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const updateData = { role };
    
    // Use custom permissions or default permissions for role
    updateData.permissions = permissions || Admin.getDefaultPermissions(role);

    const updatedAdmin = await adminRepository.updateById(adminId, updateData);

    return {
      id: updatedAdmin._id,
      username: updatedAdmin.username,
      email: updatedAdmin.email,
      fullName: updatedAdmin.fullName,
      role: updatedAdmin.role,
      permissions: updatedAdmin.permissions,
      updatedAt: updatedAdmin.updatedAt
    };
  }

  /**
   * Deactivate/activate admin account
   * @param {string} adminId - Admin ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>}
   */
  async updateActiveStatus(adminId, isActive) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const updatedAdmin = await adminRepository.updateById(adminId, { isActive });

    return {
      id: updatedAdmin._id,
      username: updatedAdmin.username,
      isActive: updatedAdmin.isActive,
      updatedAt: updatedAdmin.updatedAt
    };
  }

  /**
   * Delete admin
   * @param {string} adminId - Admin ID
   * @returns {Promise<boolean>}
   */
  async deleteAdmin(adminId) {
    const admin = await adminRepository.deleteById(adminId);
    return !!admin;
  }

  /**
   * Verify JWT token and get admin data
   * @param {string} token - JWT token
   * @returns {Promise<Object>}
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await adminRepository.findById(decoded.id);
      
      if (!admin || !admin.isActive) {
        throw new Error('Invalid token or account deactivated');
      }

      return {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   * @param {Object} admin - Admin object
   * @returns {string}
   */
  generateToken(admin) {
    const payload = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      type: 'admin'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  /**
   * Check if admin has permission
   * @param {Array} adminPermissions - Admin's permissions
   * @param {string} requiredPermission - Required permission
   * @returns {boolean}
   */
  hasPermission(adminPermissions, requiredPermission) {
    return adminPermissions.includes(requiredPermission) || 
           adminPermissions.includes('system.manage');
  }
}

module.exports = new AdminService();