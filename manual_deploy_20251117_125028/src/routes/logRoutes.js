const express = require('express');
const logController = require('../controllers/logController');
const router = express.Router();

// Get application logs (browser or API)
router.get('/logs', logController.getLogs);

// Get error logs (API only)
router.get('/logs/errors', logController.getErrorLogs);

// Get system status
router.get('/status', logController.getStatus);

// Health check with logs info
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      logs: '/api/logs - View application logs',
      errors: '/api/logs/errors - View error logs only',
      status: '/api/status - System status and info'
    },
    note: 'Visit /api/logs in browser for visual log viewer'
  });
});

module.exports = router;