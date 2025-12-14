#!/bin/bash

# TCG Arena Web - Linux Deploy Script
# Run this on the production server

set -e

echo "=========================================="
echo "  TCG Arena Web - Deploy Script"
echo "=========================================="

# Show current PM2 status
echo ""
echo "📋 Current PM2 processes:"
pm2 list

# Stop the web app
echo ""
echo "🛑 Stopping tcgarena-web..."
pm2 stop tcgarena-web || echo "Process not running, continuing..."

# Pull latest changes
echo ""
echo "📥 Pulling latest changes from git..."
git pull

# Install dependencies if needed
echo ""
echo "📦 Installing dependencies..."
npm install

# Start the web app
echo ""
echo "🚀 Starting tcgarena-web..."
pm2 start "npm run dev -- --host 0.0.0.0 --port 3000" --name tcgarena-web

# Show PM2 status
echo ""
echo "✅ Deploy completed! Current status:"
pm2 list

echo ""
echo "=========================================="
echo "  Deploy finished successfully!"
echo "=========================================="
