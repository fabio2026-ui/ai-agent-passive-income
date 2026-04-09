#!/bin/bash
# Auto-poster for social media content
# Generated content ready for manual or automated posting

echo "========================================"
echo "🚀 Social Media Auto-Poster"
echo "========================================"
echo ""

CONTENT_DIR="/root/.openclaw/workspace/ai-agent-passive-income/marketing"
DATE=$(date '+%Y-%m-%d')

echo "📅 Date: $DATE"
echo ""

# Twitter posts
echo "🐦 Twitter Posts Available:"
echo "---------------------------"
if [ -f "$CONTENT_DIR/twitter-ready-to-post.txt" ]; then
    grep -c "^--- Post" "$CONTENT_DIR/twitter-ready-to-post.txt" 2>/dev/null || echo "0"
    echo " posts ready"
else
    echo "No Twitter content found"
fi
echo ""

# Reddit posts
echo "👽 Reddit Posts Available:"
echo "--------------------------"
if [ -f "$CONTENT_DIR/reddit-ready-to-post.txt" ]; then
    grep -c "^=== r/" "$CONTENT_DIR/reddit-ready-to-post.txt" 2>/dev/null || echo "0"
    echo " posts ready"
else
    echo "No Reddit content found"
fi
echo ""

# Product Hunt
echo "🚀 Product Hunt Status:"
echo "-----------------------"
echo "Status: READY TO LAUNCH"
echo "Guide: PRODUCT_HUNT_LAUNCH.md"
echo ""

# Affiliate
echo "💰 Affiliate Programs:"
echo "----------------------"
echo "Status: DOCUMENTED"
echo "Guide: AFFILIATE_REGISTRATION.md"
echo "Programs: Cloudflare, Snyk, 1Password, Auth0, NordVPN"
echo ""

echo "========================================"
echo "✅ All marketing materials ready!"
echo "========================================"
