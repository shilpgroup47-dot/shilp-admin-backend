const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access token required' }
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find admin by ID from token
    const admin = await Admin.findById(decoded.id).select('+password');
    
    if (!admin) {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin not found' }
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: { message: 'Account is deactivated' }
      });
    }

    // Add admin info to request
    req.admin = {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || []
    };
    
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: { message: 'Invalid token' }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: { message: 'Token expired' }
      });
    }
    
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication error' }
    });
  }
};

// Legacy aliases for backward compatibility
const verifyToken = authenticateAdmin;

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin' || req.admin.role === 'admin') {
      return next();
    }

    // Check specific permission
    if (req.admin.permissions && req.admin.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: { message: 'Insufficient permissions' }
    });
  };
};

module.exports = { 
  authenticateAdmin, 
  verifyToken,
  requirePermission
};