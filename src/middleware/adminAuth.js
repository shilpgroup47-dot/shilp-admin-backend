const jwt = require('jsonwebtoken');
const adminService = require('../services/adminService');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access token required' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is for admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    // Verify admin still exists and is active
    const admin = await adminService.getProfile(decoded.id);
    
    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    };
    
    next();
  } catch (error) {
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
    
    return res.status(403).json({
      success: false,
      error: { message: 'Authentication failed' }
    });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    // For now, assume all admins have all permissions
    // You can implement proper permission checking here
    if (req.admin.role === 'admin' || req.admin.role === 'super-admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: { message: 'Insufficient permissions' }
    });
  };
};

// Legacy export for backward compatibility
const authenticateAdmin = verifyToken;

module.exports = { 
  authenticateAdmin, 
  verifyToken,
  requirePermission
};