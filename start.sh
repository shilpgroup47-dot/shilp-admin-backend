#!/bin/bash

# Production startup script for cPanel Node.js
# This script will be used to start the application in production

echo "🚀 Starting Shilp Admin Backend in Production Mode..."

# Set production environment
export NODE_ENV=production

# Start the applications
exec node src/server.js