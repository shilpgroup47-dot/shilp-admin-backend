#!/usr/bin/env node

// Simple debug script to test specific admin endpoints
const https = require('https');

async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'backend.shilpgroup.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    console.log(`\n🔍 Testing ${method} ${path}`);
    
    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          console.log(`✅ JSON Response:`, parsed);
        } catch (e) {
          console.log(`📝 HTML Response (first 200 chars):`, body.substring(0, 200));
        }
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error:`, err.message);
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('🔧 Admin Routes Debug Test');
  
  // Test different admin endpoints
  await testEndpoint('/api/admin/verify-token', 'POST', { token: 'fake-token' });
  await testEndpoint('/api/admin/profile', 'GET');
  
  // The problematic endpoint
  await testEndpoint('/api/admin/login', 'POST', { 
    email: 'test@test.com', 
    password: 'testpassword123' 
  });
  
  console.log('\n🏁 Tests completed');
}

main().catch(console.error);