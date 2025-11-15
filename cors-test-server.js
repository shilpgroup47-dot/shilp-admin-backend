const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

console.log('🔍 CORS Configuration:');
console.log('📋 Allowed Origins:', allowedOrigins);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', PORT);

app.use(cors({
  origin: function (origin, callback) {
    console.log(`🔗 Request from origin: ${origin}`);
    
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) {
      console.log('✅ No origin - allowing');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Origin ${origin} is allowed`);
      return callback(null, true);
    }
    
    console.log(`❌ Origin ${origin} is NOT allowed`);
    console.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json());

// Test routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORS Test Server is running',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'no-origin'
  });
});

app.post('/api/admin/login', (req, res) => {
  console.log('📨 Login request received from:', req.headers.origin);
  res.json({
    message: 'CORS is working! This is a test response.',
    data: {
      user: 'test-user',
      token: 'test-token'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Test Server running on port ${PORT}`);
  console.log(`🌐 Test URL: http://localhost:${PORT}/api/health`);
});