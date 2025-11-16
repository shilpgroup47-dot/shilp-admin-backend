const adminService = require('../services/adminService');
const { validationResult } = require('express-validator');

class AdminController {

  async login(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: errors.array()[0].msg || 'Validation failed',
            field: errors.array()[0].path || 'unknown'
          }
        });
      }

      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      const result = await adminService.login(email, password, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });

    } catch (error) {
      if (!res.headersSent) {
        // Handle specific error types with single response format
        let statusCode = 500;
        let message = 'Internal server error';

        if (error.message.includes('Invalid credentials') || error.message.includes('EMAIL_NOT_FOUND') || error.message.includes('INVALID_PASSWORD')) {
          statusCode = 401;
          message = 'Invalid email or password';
        } else if (error.message.includes('Account deactivated') || error.message.includes('Account locked')) {
          statusCode = 401;
          message = error.message;
        } else if (error.message.includes('Database') || error.message.includes('Connection')) {
          statusCode = 503;
          message = 'Service temporarily unavailable. Please try again later.';
        } else if (error.message.includes('timeout')) {
          statusCode = 408;
          message = 'Request timeout. Please try again.';
        }

        res.status(statusCode).json({
          success: false,
          error: {
            message: message
          }
        });
      }
    }
  }

  async getProfile(req, res, next) {
    try {
      const adminId = req.admin.id;
      const profile = await adminService.getProfile(adminId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          error: { message: 'Token is required' }
        });
      }

      const result = await adminService.verifyToken(token);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' }
      });
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email is required' }
        });
      }

      await adminService.forgotPassword(email);
      
      res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();