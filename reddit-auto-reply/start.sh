#!/bin/bash

# Breath AI Reddit Auto-Reply System - Startup Script

echo "🚀 Starting Breath AI Reddit Auto-Reply System..."
echo "================================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create a .env file with your Reddit API credentials."
    echo "Copy from .env.example:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env with your credentials from https://www.reddit.com/prefs/apps"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
mkdir -p logs data

# Run the auto-reply system
echo ""
echo "🤖 Starting auto-reply monitoring..."
echo ""
node src/autoReply.js
