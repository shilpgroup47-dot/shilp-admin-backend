#!/bin/bash

# Production deployment script for cPanel
# Run this script after cloning the repository

echo "🚀 Setting up production environment..."

# Create production environment file
if [ ! -f .env.production ]; then
    echo "📝 Creating production environment file..."
    cp .env.example .env.production
    echo "⚠️  Please edit .env.production with your production values"
    echo "   nano .env.production"
fi

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/{banners,blogs,projects,projecttree}

# Set permissions
echo "🔐 Setting file permissions..."
chmod 755 uploads uploads/*
chmod 600 .env.production
chmod +x start.sh deploy.sh

# Create logs directory
mkdir -p ~/logs

echo "✅ Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your production values"
echo "2. Start the Node.js app in cPanel interface"
echo "3. Test: curl https://yourdomain.com/api/health"