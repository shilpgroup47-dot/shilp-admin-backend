const adminService = require('../services/adminService');
const { validationResult } = require('express-validator');

class AdminController {

  async login(req, res, next) {
    try {
   
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      const result = await adminService.login(email, password, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }


  async getProfile(req, res, next) {
    try {
      const result = await adminService.getProfile(req.admin.id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }


  async verifyToken(req, res, _next) {
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


      res.json({
        success: true,
        message: 'If an admin account with this email exists, a password reset link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();