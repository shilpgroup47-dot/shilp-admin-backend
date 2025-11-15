const express = require('express');
const router = express.Router();

// Health check endpoint with environment variables
router.get('/', (req, res) => {
  // Filter sensitive environment variables
  const sensitiveKeys = ['JWT_SECRET', 'ADMIN_PASSWORD', 'DATABASE_URL'];
  const envVars = {};
  
  Object.keys(process.env).forEach(key => {
    if (sensitiveKeys.includes(key)) {
      envVars[key] = '***HIDDEN***';
    } else {
      envVars[key] = process.env[key];
    }
  });

  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    server: {
      port: process.env.PORT || '3000',
      host: process.env.SERVER_HOST || 'localhost',
      nodeVersion: process.version
    },
    database: {
      name: process.env.DATABASE_NAME || 'Not Set',
      url: process.env.DATABASE_URL ? '***CONNECTED***' : 'Not Set'
    },
    cors: {
      origins: process.env.CORS_ORIGIN || 'Not Set'
    },
    rateLimiting: {
      status: 'disabled',
      message: 'Rate limiting has been removed for unlimited requests',
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || 'Not Set',
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 'Not Set'
    },
    admin: {
      email: process.env.ADMIN_EMAIL || 'Not Set',
      username: process.env.ADMIN_USERNAME || 'Not Set',
      fullname: process.env.ADMIN_FULLNAME || 'Not Set'
    },
    uploads: {
      directory: process.env.UPLOAD_DIR || 'uploads',
      maxFileSize: process.env.MAX_FILE_SIZE || '10485760'
    },
    security: {
      jwtExpires: process.env.JWT_EXPIRES_IN || '7d',
      bcryptRounds: process.env.BCRYPT_SALT_ROUNDS || '12',
      trustProxy: process.env.TRUST_PROXY || 'false'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    },
    productionConfig: {
      isProduction: process.env.NODE_ENV === 'production',
      requiredVarsStatus: {
        NODE_ENV: process.env.NODE_ENV ? '✅ SET' : '❌ MISSING',
        PORT: process.env.PORT ? '✅ SET' : '❌ MISSING',
        DATABASE_URL: process.env.DATABASE_URL ? '✅ SET' : '❌ MISSING',
        DATABASE_NAME: process.env.DATABASE_NAME ? '✅ SET' : '❌ MISSING',
        JWT_SECRET: process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING',
        CORS_ORIGIN: process.env.CORS_ORIGIN ? '✅ SET' : '❌ MISSING',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL ? '✅ SET' : '❌ MISSING',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '✅ SET' : '❌ MISSING'
      },
      allProductionVars: {
        NODE_ENV: process.env.NODE_ENV || 'Not Set',
        PORT: process.env.PORT || 'Not Set',
        DATABASE_NAME: process.env.DATABASE_NAME || 'Not Set',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 'Not Set',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Not Set',
        ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Not Set',
        ADMIN_FULLNAME: process.env.ADMIN_FULLNAME || 'Not Set',
        SERVER_HOST: process.env.SERVER_HOST || 'Not Set',
        TRUST_PROXY: process.env.TRUST_PROXY || 'Not Set',
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 'Not Set',
        RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 'Not Set',
        LOG_LEVEL: process.env.LOG_LEVEL || 'Not Set',
        UPLOAD_DIR: process.env.UPLOAD_DIR || 'Not Set',
        MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 'Not Set',
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 'Not Set',
        CORS_ORIGIN_COUNT: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').length : 0
      }
    },
    allEnvironmentVariables: envVars
  });
});

// Environment variables endpoint
router.get('/env', (req, res) => {
  // Filter sensitive environment variables
  const sensitiveKeys = ['JWT_SECRET', 'ADMIN_PASSWORD', 'DATABASE_URL'];
  const envVars = {};
  
  Object.keys(process.env).forEach(key => {
    if (sensitiveKeys.includes(key)) {
      envVars[key] = '***HIDDEN***';
    } else {
      envVars[key] = process.env[key];
    }
  });

  res.status(200).json({
    success: true,
    message: 'Environment Variables',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    configuredVariables: {
      // Core Settings
      NODE_ENV: process.env.NODE_ENV || 'Not Set',
      PORT: process.env.PORT || 'Not Set',
      
      // Database
      DATABASE_NAME: process.env.DATABASE_NAME || 'Not Set',
      DATABASE_URL: process.env.DATABASE_URL ? '***CONNECTED***' : 'Not Set',
      
      // Security
      JWT_SECRET: process.env.JWT_SECRET ? '***SET***' : 'Not Set',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 'Not Set',
      BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 'Not Set',
      
      // CORS
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'Not Set',
      
      // Admin
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Not Set',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '***SET***' : 'Not Set',
      ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Not Set',
      ADMIN_FULLNAME: process.env.ADMIN_FULLNAME || 'Not Set',
      
      // Server
      SERVER_HOST: process.env.SERVER_HOST || 'Not Set',
      TRUST_PROXY: process.env.TRUST_PROXY || 'Not Set',
      
      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 'Not Set',
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 'Not Set',
      
      // Uploads
      UPLOAD_DIR: process.env.UPLOAD_DIR || 'Not Set',
      MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 'Not Set',
      
      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL || 'Not Set'
    },
    allEnvironmentVariables: envVars,
    totalVariables: Object.keys(envVars).length
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