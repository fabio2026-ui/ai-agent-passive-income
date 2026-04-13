#!/bin/bash
# DevSecOps Hub Bot - Quick Setup Script
# Run this script to set up the bot quickly

echo "🚀 DevSecOps Hub Bot Setup"
echo "=========================="
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>/dev/null || python --version 2>/dev/null)
echo "Found: $python_version"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists."
else
    python3 -m venv venv 2>/dev/null || python -m venv venv
    echo "✅ Virtual environment created."
fi

# Activate virtual environment
echo ""
echo "🔌 Activating virtual environment..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
echo "✅ Virtual environment activated."

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet
echo "✅ Dependencies installed."

# Create data directory
echo ""
echo "📁 Creating data directory..."
mkdir -p data
echo "✅ Data directory created."

# Check for .env file
echo ""
echo "⚙️  Checking configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file found."
else
    echo "⚠️  .env file not found!"
    echo ""
    echo "Please create a .env file with your Discord bot token."
    echo "You can copy the template:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env and add your DISCORD_TOKEN."
    echo ""
    echo "📝 How to get your Discord bot token:"
    echo "  1. Go to https://discord.com/developers/applications"
    echo "  2. Click 'New Application'"
    echo "  3. Go to 'Bot' section"
    echo "  4. Click 'Add Bot'"
    echo "  5. Copy the token under 'Token'"
    echo ""
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the bot, run:"
echo "  source venv/bin/activate && python bot.py"
echo ""
echo "For more information, see README.md"