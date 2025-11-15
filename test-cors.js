#!/usr/bin/env node

const https = require('https');

// Test function to make a request with proper headers
function testCORS(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174',
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    console.log(`\n🧪 Testing ${method} ${url}`);
    console.log(`📤 Origin: http://localhost:5174`);

    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`🔧 Headers:`);
      
      Object.keys(res.headers).forEach(key => {
        if (key.includes('access-control') || key.includes('cors')) {
          console.log(`   ${key}: ${res.headers[key]}`);
        }
      });

      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`📝 Response: ${responseData.substring(0, 200)}...`);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🚀 CORS Testing Suite\n');

  try {
    // Test 1: OPTIONS preflight
    await testCORS('https://backend.shilpgroup.com/api/admin/login', 'OPTIONS');
    
    // Test 2: GET health (should work)
    await testCORS('https://backend.shilpgroup.com/api/health', 'GET');
    
    // Test 3: POST login (the failing endpoint)
    await testCORS('https://backend.shilpgroup.com/api/admin/login', 'POST', {
      email: 'test@test.com',
      password: 'testpassword123'
    });

    console.log('\n✅ All tests completed');
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
  }
}

runTests();