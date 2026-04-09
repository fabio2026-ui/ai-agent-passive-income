#!/bin/bash

# HabitAI App Deployment Script
# This script builds and prepares the app for deployment

echo "🚀 HabitAI Deployment Script"
echo "============================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Generate icons
echo -e "${YELLOW}Generating icons...${NC}"
node scripts/generate-icons.js

# Build the app
echo -e "${YELLOW}Building app...${NC}"
npm run build

# Copy PWA files to dist
echo -e "${YELLOW}Copying PWA files...${NC}"
cp public/manifest.json dist/
cp public/sw.js dist/
cp -r public/icons dist/

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "Deployment options:"
echo "1. Static hosting: Upload 'dist' folder to Netlify/Vercel"
echo "2. Local preview: npm run preview"
echo "3. Docker: docker build -t habit-ai ."
echo ""
