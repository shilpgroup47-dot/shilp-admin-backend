#!/bin/bash

# Deploy to cPanel Production Server
echo "🚀 Deploying to production server..."

# Step 1: Upload files via FTP/File Manager
echo "📁 Upload these files to your cPanel File Manager:"
echo "   - Upload entire project to: /public_html/backend.shilpgroup.com/"
echo "   - Make sure src/ folder contains all updated files"
echo ""

# Step 2: Install dependencies
echo "📦 Run this in cPanel Terminal:"
echo "   cd public_html/backend.shilpgroup.com"
echo "   npm install"
echo ""

# Step 3: Start/Restart Node.js Application
echo "🔄 Restart Node.js application:"
echo "   1. Go to cPanel > Setup Node.js App"
echo "   2. Find your app (backend.shilpgroup.com)"
echo "   3. Click 'Restart' button"
echo "   4. OR run: node src/server.js"
echo ""

# Step 4: Test the deployment
echo "🧪 Test endpoints:"
echo "   curl https://backend.shilpgroup.com/"
echo "   curl https://backend.shilpgroup.com/api/health"
echo "   curl -X POST https://backend.shilpgroup.com/api/admin/login \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"email\":\"admin@shilpgroup.com\",\"password\":\"12345678\"}'"
echo ""

echo "✅ Deployment guide complete!"
echo "🔗 Admin panel should work at: https://admin.shilpgroup.com"