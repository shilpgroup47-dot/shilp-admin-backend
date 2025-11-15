const adminService = require('../services/adminService');
const { validationResult } = require('express-validator');

class AdminController {

  async login(req, res, next) {
    // Set timeout for the entire request
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.log('⏰ Login request timeout');
        res.status(408).json({
          success: false,
          error: { message: 'Request timeout - please try again' }
        });
      }
    }, 25000); // 25 second timeout
    
    try {
      console.log('🔍 Login attempt started:', req.body.email);
   
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        clearTimeout(timeoutId);
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

      console.log('🔍 Calling adminService.login...');
      
      // Add promise race with timeout
      const loginPromise = adminService.login(email, password, ipAddress, userAgent);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AdminService timeout after 20 seconds')), 20000)
      );
      
      const result = await Promise.race([loginPromise, timeoutPromise]);

      console.log('✅ Login successful for:', email);
      clearTimeout(timeoutId);
      
      if (!res.headersSent) {
        res.json({
          success: true,
          message: 'Login successful',
          data: result
        });
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      clearTimeout(timeoutId);
      
      if (!res.headersSent) {
        // Handle specific error types
        if (error.message.includes('timeout')) {
          return res.status(408).json({
            success: false,
            error: { message: 'Login request timed out. Please try the emergency login endpoint.' }
          });
        }
        
        if (error.message.includes('EMAIL_NOT_FOUND')) {
          return res.status(401).json({
            success: false,
            error: { message: 'Email not found' }
          });
        }
        
        if (error.message.includes('INVALID_PASSWORD')) {
          return res.status(401).json({
            success: false,
            error: { message: 'Invalid password' }
          });
        }
        
        // Generic error
        res.status(500).json({
          success: false,
          error: { 
            message: 'Login failed: ' + error.message,
            suggestion: 'Try using /api/emergency/emergency-login endpoint'
          }
        });
      }
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