# 🚀 Test Admin Credentials

## Production Admin (Already in Environment)
```
📧 Email: shilpgroup47@gmail.com
🔑 Password: ShilpGroup@RealState11290
👤 Username: shilpgroup47
📛 Full Name: Shilp Group Admin
🔐 Role: super-admin
```

## Test Admin (For Development)
```
📧 Email: test@admin.com  
🔑 Password: TestAdmin123!
👤 Username: testadmin
📛 Full Name: Test Administrator
🔐 Role: admin
```

## Simple Admin for Frontend Testing
```
📧 Email: admin@test.com
🔑 Password: admin123456
👤 Username: admin
📛 Full Name: Simple Admin
🔐 Role: admin
```

## How to Create Test Admin

### Method 1: Using API Endpoint (After Deploy)
```bash
# Create production admin
curl -X POST https://backend.shilpgroup.com/api/test/create-production-admin

# Create test admin  
curl -X POST https://backend.shilpgroup.com/api/test/create-test-admin

# List all admins
curl -X GET https://backend.shilpgroup.com/api/test/list-admins
```

### Method 2: Direct Database Script
```bash
# Run the MongoDB script
node create-test-admin.js
```

## Test Login

### Frontend Test
```javascript
// Use these credentials in your frontend login form
const testCredentials = {
  email: "test@admin.com",
  password: "TestAdmin123!"
};
```

### API Test  
```bash
# Test login endpoint
curl -X POST https://backend.shilpgroup.com/api/admin/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5174" \
  -d '{
    "email": "test@admin.com",
    "password": "TestAdmin123!"
  }'
```

## Current Issue
❌ The `/api/admin/login` endpoint is returning 503 errors in production
✅ CORS is properly configured
✅ Other endpoints work fine

## Next Steps
1. Deploy updated code with test routes
2. Create admin users via API
3. Test login functionality
4. Fix any remaining issues