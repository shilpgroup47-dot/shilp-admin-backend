#!/bin/bash

# FTP Deployment Script for cPanel
echo "🚀 Starting FTP deployment to cPanel..."

# FTP Configuration
FTP_SERVER="ftp.shilpgroup.com"
FTP_USER="shilfmfe@backend.shilpgroup.com"
FTP_PATH="/home/shilfmfe/server_running/backend.shilpgroup.com"

echo "📋 FTP Server: $FTP_SERVER"
echo "👤 FTP User: $FTP_USER"
echo "📂 Remote Path: $FTP_PATH"

# Check if lftp is available
if ! command -v lftp &> /dev/null; then
    echo "❌ lftp not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install lftp
    else
        echo "Please install lftp manually or use FileZilla/Cyberduck for FTP upload"
        echo "Files to upload are ready in current directory"
        exit 1
    fi
fi

# Prompt for FTP password
echo "🔑 Enter FTP password for $FTP_USER:"
read -s FTP_PASS

# Create deployment package
echo "📦 Preparing files for upload..."

# Create temporary directory for clean upload
mkdir -p temp_deploy
cp -r src temp_deploy/
cp package.json temp_deploy/
cp package-lock.json temp_deploy/
cp .env.example temp_deploy/
cp auto-deploy.sh temp_deploy/
cp restart-app.sh temp_deploy/
cp webhook.php temp_deploy/
cp .cpanel.yml temp_deploy/
cp -r uploads temp_deploy/

# Create .env for production
cp .env.example temp_deploy/.env

echo "✅ Files prepared in temp_deploy/"

# FTP Upload using lftp
echo "📤 Uploading files via FTP..."

lftp -c "
set ssl:verify-certificate no;
open ftp://$FTP_USER:$FTP_PASS@$FTP_SERVER;
lcd temp_deploy;
cd $FTP_PATH;
mirror --reverse --delete --verbose .;
quit;
"

if [ $? -eq 0 ]; then
    echo "✅ FTP upload completed successfully!"
    echo "📋 Next steps:"
    echo "1. Login to cPanel Terminal"
    echo "2. Run: cd $FTP_PATH"
    echo "3. Run: chmod +x *.sh"
    echo "4. Run: npm ci --production"
    echo "5. Run: ./auto-deploy.sh"
else
    echo "❌ FTP upload failed"
    echo "💡 Alternative: Use FileZilla or Cyberduck to upload temp_deploy/ contents"
fi

# Cleanup
rm -rf temp_deploy
echo "🧹 Cleanup completed"