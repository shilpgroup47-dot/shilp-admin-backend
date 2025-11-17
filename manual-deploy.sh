#!/bin/bash

# Manual cPanel Deployment Script
# Run this script to manually deploy the application to cPanel

echo "🚀 Starting manual cPanel deployment..."

# Configuration
DEPLOY_DIR="manual_deploy_$(date +%Y%m%d_%H%M%S)"
FTP_SERVER="your-cpanel-ftp-server.com"
FTP_USERNAME="your-ftp-username"
FTP_PASSWORD="your-ftp-password"
REMOTE_DIR="/path/to/your/cpanel/directory"

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p $DEPLOY_DIR

# Copy essential files
echo "📁 Copying files..."
cp app.js $DEPLOY_DIR/
cp -r src $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp .env.example $DEPLOY_DIR/.env
cp .cpanel.yml $DEPLOY_DIR/
cp restart-app.sh $DEPLOY_DIR/
cp restart.php $DEPLOY_DIR/
cp loader.cjs $DEPLOY_DIR/

# Create uploads structure
mkdir -p $DEPLOY_DIR/uploads/{banners,blogs,projects,projecttree}

# Make scripts executable
chmod +x $DEPLOY_DIR/*.sh

echo "✅ Deployment package created in: $DEPLOY_DIR"
echo ""
echo "📋 Next steps:"
echo "1. Upload all files from '$DEPLOY_DIR' to your cPanel file manager"
echo "2. Place 'restart.php' in your public_html directory"
echo "3. Set up environment variables in .env file"
echo "4. Run the restart script or visit: https://yourdomain.com/restart.php"
echo ""
echo "📂 Files to upload:"
ls -la $DEPLOY_DIR/
echo ""
echo "🔧 Important cPanel settings:"
echo "- Main entry file: app.js"
echo "- Node.js version: 18 or higher"
echo "- Application URL: your backend domain"
echo "- Application startup file: app.js"

# Cleanup option
read -p "🗑️ Delete deployment package directory? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf $DEPLOY_DIR
    echo "✅ Deployment package cleaned up"
fi

echo "🎉 Manual deployment preparation complete!"