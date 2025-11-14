const Admin = require('../models/Admin');

class AdminRepository {
  /**
   * Find admin by username or email
   * @param {string} identifier - Username or email
   * @returns {Promise<Object|null>}
   */
  async findByUsernameOrEmail(identifier) {
    try {
      const admin = await Admin.findOne({
        $or: [
          { username: identifier.toLowerCase() },
          { email: identifier.toLowerCase() }
        ]
      }).select('+password');
      
      return admin;
    } catch (error) {
      throw new Error(`Failed to find admin: ${error.message}`);
    }
  }

  /**
   * Find admin by email
   * @param {string} email - Admin email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    try {
      const admin = await Admin.findOne({
        email: email.toLowerCase()
      }).select('+password');
      
      return admin;
    } catch (error) {
      throw new Error(`Failed to find admin by email: ${error.message}`);
    }
  }

  /**
   * Find admin by ID
   * @param {string} id - Admin ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    try {
      const admin = await Admin.findById(id);
      return admin;
    } catch (error) {
      throw new Error(`Failed to find admin by ID: ${error.message}`);
    }
  }

  /**
   * Create new admin
   * @param {Object} adminData - Admin data
   * @returns {Promise<Object>}
   */
  async create(adminData) {
    try {
      const admin = new Admin(adminData);
      await admin.save();
      return admin;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`Admin with this ${field} already exists`);
      }
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  /**
   * Update admin by ID
   * @param {string} id - Admin ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    try {
      const admin = await Admin.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return admin;
    } catch (error) {
      throw new Error(`Failed to update admin: ${error.message}`);
    }
  }

  /**
   * Delete admin by ID
   * @param {string} id - Admin ID
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    try {
      const admin = await Admin.findByIdAndDelete(id);
      return admin;
    } catch (error) {
      throw new Error(`Failed to delete admin: ${error.message}`);
    }
  }

  /**
   * Get all admins with pagination
   * @param {Object} options - Pagination and filter options
   * @returns {Promise<Object>}
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const filter = {};
      if (role) filter.role = role;
      if (typeof isActive === 'boolean') filter.isActive = isActive;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [admins, total] = await Promise.all([
        Admin.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Admin.countDocuments(filter)
      ]);

      return {
        admins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch admins: ${error.message}`);
    }
  }

  /**
   * Update last login information
   * @param {string} id - Admin ID
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<Object|null>}
   */
  async updateLastLogin(id, ipAddress, userAgent) {
    try {
      const admin = await Admin.findById(id);
      if (admin) {
        await admin.updateLastLogin(ipAddress, userAgent);
        return admin;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  /**
   * Increment login attempts
   * @param {string} id - Admin ID
   * @returns {Promise<Object|null>}
   */
  async incrementLoginAttempts(id) {
    try {
      const admin = await Admin.findById(id).select('+loginAttempts +lockUntil');
      if (admin) {
        await admin.incrementLoginAttempts();
        return admin;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to increment login attempts: ${error.message}`);
    }
  }

  /**
   * Reset login attempts
   * @param {string} id - Admin ID
   * @returns {Promise<Object|null>}
   */
  async resetLoginAttempts(id) {
    try {
      const admin = await Admin.findById(id);
      if (admin) {
        await admin.resetLoginAttempts();
        return admin;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to reset login attempts: ${error.message}`);
    }
  }

  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @param {string} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>}
   */
  async usernameExists(username, excludeId = null) {
    try {
      const filter = { username: username.toLowerCase() };
      if (excludeId) {
        filter._id = { $ne: excludeId };
      }
      
      const admin = await Admin.findOne(filter);
      return !!admin;
    } catch (error) {
      throw new Error(`Failed to check username: ${error.message}`);
    }
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @param {string} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>}
   */
  async emailExists(email, excludeId = null) {
    try {
      const filter = { email: email.toLowerCase() };
      if (excludeId) {
        filter._id = { $ne: excludeId };
      }
      
      const admin = await Admin.findOne(filter);
      return !!admin;
    } catch (error) {
      throw new Error(`Failed to check email: ${error.message}`);
    }
  }
}

module.exports = new AdminRepository();