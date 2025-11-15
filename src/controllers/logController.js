const fs = require("fs");
const path = require("path");

// Get application logs
exports.getLogs = (req, res) => {
  const logPath = "/home/shilfmfe/logs/app.log";
  const lines = req.query.lines || 100; // Default 100 lines

  try {
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({
        success: false,
        message: "🚫 Log file not found.",
        path: logPath
      });
    }

    // Read last N lines using tail command (more efficient for large files)
    const { exec } = require('child_process');
    exec(`tail -${lines} "${logPath}"`, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "❌ Error reading log file",
          error: error.message
        });
      }

      // For API response
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({
          success: true,
          logs: stdout,
          lines: lines,
          timestamp: new Date().toISOString()
        });
      }

      // For browser viewing
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>📊 Backend Logs - Shilp Group</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="refresh" content="10">
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              background: #1e1e1e; 
              color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #007cba, #005a87);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 20px;
              text-align: center;
            }
            .controls {
              background: #2d2d2d;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
            }
            .controls a {
              color: #007cba;
              text-decoration: none;
              margin: 0 10px;
              padding: 8px 15px;
              background: #3d3d3d;
              border-radius: 4px;
            }
            .controls a:hover {
              background: #007cba;
              color: white;
            }
            .log-container {
              background: #252525;
              border-radius: 8px;
              padding: 20px;
              overflow-x: auto;
              max-height: 70vh;
              overflow-y: auto;
              border: 1px solid #444;
            }
            .log-content {
              white-space: pre-wrap;
              font-size: 13px;
              line-height: 1.4;
            }
            .error { color: #dc3545; font-weight: bold; }
            .success { color: #28a745; font-weight: bold; }
            .warning { color: #ffc107; font-weight: bold; }
            .timestamp { color: #007cba; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Backend Application Logs</h1>
            <p>Real-time monitoring | Last updated: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="controls">
            <a href="?lines=50">50 Lines</a>
            <a href="?lines=100">100 Lines</a>
            <a href="?lines=200">200 Lines</a>
            <a href="?lines=500">500 Lines</a>
            <button onclick="location.reload()">🔄 Refresh</button>
          </div>

          <div class="log-container">
            <div class="log-content">${formatLogs(stdout)}</div>
          </div>

          <script>
            // Auto-scroll to bottom
            const container = document.querySelector('.log-container');
            container.scrollTop = container.scrollHeight;
            
            // Auto-refresh every 10 seconds
            setTimeout(() => location.reload(), 10000);
          </script>
        </body>
        </html>
      `;
      
      res.send(html);
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Server error reading log file",
      error: err.message
    });
  }
};

// Get error logs
exports.getErrorLogs = (req, res) => {
  const logPath = "/home/shilfmfe/logs/error.log";
  const lines = req.query.lines || 50;

  try {
    if (!fs.existsSync(logPath)) {
      return res.json({
        success: false,
        message: "🚫 Error log file not found.",
        path: logPath
      });
    }

    const { exec } = require('child_process');
    exec(`tail -${lines} "${logPath}"`, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "❌ Error reading error log file",
          error: error.message
        });
      }

      res.json({
        success: true,
        logs: stdout,
        lines: lines,
        timestamp: new Date().toISOString()
      });
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Server error reading error log file",
      error: err.message
    });
  }
};

// Get system status
exports.getStatus = (req, res) => {
  const { exec } = require('child_process');
  
  // Check if app process is running
  exec('ps aux | grep "node src/server.js" | grep -v grep', (error, stdout, stderr) => {
    const isRunning = stdout.trim() !== '';
    
    // Check log file info
    const logPath = "/home/shilfmfe/logs/app.log";
    let logInfo = {};
    
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      logInfo = {
        exists: true,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        modified: stats.mtime.toISOString()
      };
    } else {
      logInfo = { exists: false };
    }

    res.json({
      success: true,
      status: {
        application: {
          running: isRunning,
          process: stdout.trim() || 'Not running',
          port: process.env.PORT || 8081,
          environment: process.env.NODE_ENV || 'development',
          uptime: process.uptime()
        },
        logs: logInfo,
        server: {
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }
    });
  });
};

// Helper function to format logs with colors
function formatLogs(logs) {
  return logs
    .replace(/(\[ERROR\]|❌|Error:)/gi, '<span class="error">$1</span>')
    .replace(/(\[INFO\]|✅|SUCCESS)/gi, '<span class="success">$1</span>')
    .replace(/(\[WARN\]|⚠️|WARNING)/gi, '<span class="warning">$1</span>')
    .replace(/(\[\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^\]]*\])/g, '<span class="timestamp">$1</span>');
}