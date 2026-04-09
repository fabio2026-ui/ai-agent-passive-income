#!/bin/bash
# SSH Deployment Script for GitHub
# Your SSH key: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOe1x7Q+j6fYx9XFg5uC++QdkNtqPIQKGWMimM67KwVn fabio2026-ui@github.com

GITHUB_USER="fabio2026-ui"

echo "🚀 Deploying all projects to GitHub via SSH..."
echo ""

# 1. MCP Marketplace
echo "📦 Deploying MCP Marketplace..."
cd /root/.openclaw/workspace/mcp-marketplace
if ! git remote | grep -q origin; then
    git remote add origin git@github.com:${GITHUB_USER}/mcp-marketplace.git
fi
git remote set-url origin git@github.com:${GITHUB_USER}/mcp-marketplace.git
git branch -m main 2>/dev/null || true
git push -u origin main --force
echo "✅ MCP Marketplace pushed!"
echo ""

# 2. CodeGuard Landing
echo "🛡️  Deploying CodeGuard Landing..."
cd /root/.openclaw/workspace/codeguard-landing
if ! git remote | grep -q origin; then
    git remote add origin git@github.com:${GITHUB_USER}/codeguard-landing.git
fi
git remote set-url origin git@github.com:${GITHUB_USER}/codeguard-landing.git
git branch -m main 2>/dev/null || true
git push -u origin main --force
echo "✅ CodeGuard Landing pushed!"
echo ""

# 3. ContentAI Landing
echo "✨ Deploying ContentAI Landing..."
cd /root/.openclaw/workspace/contentai-landing
if ! git remote | grep -q origin; then
    git remote add origin git@github.com:${GITHUB_USER}/contentai-landing.git
fi
git remote set-url origin git@github.com:${GITHUB_USER}/contentai-landing.git
git branch -m main 2>/dev/null || true
git push -u origin main --force
echo "✅ ContentAI Landing pushed!"
echo ""

# 4. SEO Content Blog
echo "📝 Deploying SEO Content Blog..."
cd /root/.openclaw/workspace/content
if ! git remote | grep -q origin; then
    git remote add origin git@github.com:${GITHUB_USER}/codeguard-blog.git
fi
git remote set-url origin git@github.com:${GITHUB_USER}/codeguard-blog.git
git branch -m main 2>/dev/null || true
git push -u origin main --force
echo "✅ Content Blog pushed!"
echo ""

echo "🎉 All projects deployed!"
echo ""
echo "Next steps:"
echo "1. Add CLOUDFLARE_API_TOKEN to GitHub Secrets for each repo"
echo "2. Deployment will happen automatically via GitHub Actions"
echo ""
echo "Expected URLs:"
echo "- https://mcp-marketplace.pages.dev"
echo "- https://codeguard-landing.pages.dev"
echo "- https://contentai-landing.pages.dev"
echo "- https://${GITHUB_USER}.github.io/codeguard-blog"