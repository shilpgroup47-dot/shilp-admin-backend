const fs = require('fs');
const path = require('path');

// Middleware to handle post-upload actions (auto-refresh, cache clearing, etc.)
const postUploadHandler = (options = {}) => {
  const {
    restartCommand = null,
    clearCache = true,
    logUploads = true,
    notifyWebhook = null
  } = options;

  return (req, res, next) => {
    // Store original res.json to intercept responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Check if this was a successful file upload
      if (data && data.success && req.file) {
        const uploadInfo = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          destination: req.file.destination,
          timestamp: new Date().toISOString(),
          userAgent: req.get('User-Agent'),
          ip: req.ip
        };

        // Log upload if enabled
        if (logUploads) {
          const logEntry = `${uploadInfo.timestamp} - File uploaded: ${uploadInfo.originalName} -> ${uploadInfo.filename} (${uploadInfo.size} bytes)\n`;
          const logPath = path.join(process.cwd(), 'logs', 'uploads.log');
          
          // Ensure logs directory exists
          const logDir = path.dirname(logPath);
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }
          
          fs.appendFileSync(logPath, logEntry);
          console.log('📁 File upload logged:', uploadInfo.originalName);
        }

        // Clear cache if enabled
        if (clearCache) {
          // Clear require cache for uploaded files (if applicable)
          // This helps with immediate visibility of changes
          const cachePattern = new RegExp(req.file.destination);
          Object.keys(require.cache).forEach(key => {
            if (cachePattern.test(key)) {
              delete require.cache[key];
            }
          });
        }

        // Trigger restart command if specified
        if (restartCommand && process.env.NODE_ENV === 'production') {
          const { exec } = require('child_process');
          exec(restartCommand, (error, stdout, stderr) => {
            if (error) {
              console.error('❌ Restart command failed:', error);
            } else {
              console.log('🔄 Application restart triggered after file upload');
              if (stdout) console.log('Restart output:', stdout);
            }
          });
        }

        // Notify webhook if specified
        if (notifyWebhook) {
          const https = require('https');
          const http = require('http');
          
          const webhookData = JSON.stringify({
            event: 'file_uploaded',
            file: uploadInfo,
            timestamp: uploadInfo.timestamp
          });

          const url = new URL(notifyWebhook);
          const protocol = url.protocol === 'https:' ? https : http;
          
          const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(webhookData)
            }
          };

          const req = protocol.request(options, (res) => {
            console.log('📡 Webhook notification sent:', res.statusCode);
          });

          req.on('error', (error) => {
            console.error('❌ Webhook notification failed:', error);
          });

          req.write(webhookData);
          req.end();
        }

        // Add upload info to response
        if (data.data) {
          data.data.uploadInfo = uploadInfo;
        }
      }

      // Call original res.json with potentially modified data
      return originalJson.call(this, data);
    };

    next();
  };
};

// Export the middleware
module.exports = postUploadHandler;