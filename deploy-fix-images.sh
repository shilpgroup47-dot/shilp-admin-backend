#!/bin/bash

# 🚀 Deploy Image Fix for Project Creation
# This script deploys the fixes for image handling in project creation

echo "🎯 Starting image fix deployment..."

# Create deployment timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOY_DIR="image_fix_deploy_${TIMESTAMP}"

echo "📦 Creating deployment package..."

# Create deployment directory
mkdir -p $DEPLOY_DIR

# Copy updated files
cp -r src/ $DEPLOY_DIR/
cp app.js $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp restart-app.sh $DEPLOY_DIR/
cp restart.php $DEPLOY_DIR/

# Create uploads directory structure
mkdir -p $DEPLOY_DIR/uploads/projects

echo "📁 Created deployment package: $DEPLOY_DIR"
echo ""
echo "🔧 MANUAL DEPLOYMENT STEPS:"
echo "1. Upload the contents of $DEPLOY_DIR/ to your cPanel backend directory"
echo "2. Ensure uploads/projects directory has write permissions (755)"
echo "3. Test the deployment with: https://backend.shilpgroup.com/test-uploads"
echo "4. Test project creation to verify images work correctly"
echo ""
echo "✅ Key fixes included:"
echo "   - Improved draft saving with image preservation"
echo "   - Fixed section navigation to maintain image URLs"
echo "   - Enhanced final project creation to use update when projectId exists"
echo "   - Improved backend image merge handling"
echo "   - Added uploads directory auto-creation"
echo "   - Added proper static file serving headers"
echo ""

# Create instruction file
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.txt << EOF
🚀 IMAGE FIX DEPLOYMENT INSTRUCTIONS

1. Upload all files in this folder to: /home/shilfmfe/server_running/backend.shilpgroup.com/

2. Ensure uploads directory permissions:
   chmod 755 uploads/
   chmod 755 uploads/projects/

3. Restart the Node.js application in cPanel

4. Test deployment:
   - Visit: https://backend.shilpgroup.com/test-uploads
   - Should show uploadsExists: true and projectsExists: true

5. Test project creation:
   - Go to admin panel
   - Create a new project with images
   - Save each section and verify images appear
   - Complete all sections and create final project
   - Verify project appears correctly on live site

KEY IMPROVEMENTS:
✅ Section saves now preserve all images from other sections
✅ Navigation between sections maintains image previews
✅ Final create button works correctly on live server
✅ Backend properly merges existing data during updates
✅ Uploads directory created automatically with proper permissions
EOF

echo "📋 Deployment instructions saved to: $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.txt"
echo "🎉 Deployment package ready!"