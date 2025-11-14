const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    rateLimiting: {
      status: 'disabled',
      message: 'Rate limiting has been removed for unlimited requests'
    }
  });
});

// Database health check
router.get('/db', async (req, res) => {
  try {
    // Add database connection check here if needed
    res.status(200).json({
      success: true,
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message || 'Unknown error',
    });
  }
});

module.exports = router;