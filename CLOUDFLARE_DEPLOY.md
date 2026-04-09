# 🚀 Cloudflare Deployment Guide

## Account Information
- **Account ID**: `887661eb67cb99034bfc3f9bfef805c8`
- **API Token**: `cfat_Kq2d2bLPJItUCdjvQ74OKdy31fL4Ve0Hkfp8Reng949b5c67`

## Steps to Deploy

### 1. Create GitHub Repositories

Create 3 repositories on GitHub:
1. `mcp-marketplace`
2. `codeguard-landing`
3. `contentai-landing`

### 2. Add Cloudflare Token to GitHub Secrets

For each repository:
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: `cfat_Kq2d2bLPJItUCdjvQ74OKdy31fL4Ve0Hkfp8Reng949b5c67`
5. Click "Add secret"

### 3. Push Code

```bash
# MCP Marketplace
cd /root/.openclaw/workspace/mcp-marketplace
git remote add origin https://github.com/YOUR_USERNAME/mcp-marketplace.git
git branch -m main
git push -u origin main

# CodeGuard Landing
cd /root/.openclaw/workspace/codeguard-landing
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/codeguard-landing.git
git branch -m main
git push -u origin main

# ContentAI Landing
cd /root/.openclaw/workspace/contentai-landing
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/contentai-landing.git
git branch -m main
git push -u origin main
```

### 4. Create Cloudflare Pages Projects

1. Go to https://dash.cloudflare.com/
2. Navigate to "Pages"
3. Click "Create a project"
4. Choose "Upload assets"
5. Create projects with these names:
   - `mcp-marketplace`
   - `codeguard-landing`
   - `contentai-landing`

### 5. Automatic Deployment

Once pushed, GitHub Actions will automatically deploy to Cloudflare Pages!

## Expected URLs

- `https://mcp-marketplace.pages.dev`
- `https://codeguard-landing.pages.dev`
- `https://contentai-landing.pages.dev`

## Projects Ready to Deploy

| Project | Location | Status |
|---------|----------|--------|
| MCP Marketplace | `/root/.openclaw/workspace/mcp-marketplace` | ✅ Ready |
| CodeGuard Landing | `/root/.openclaw/workspace/codeguard-landing` | ✅ Ready |
| ContentAI Landing | `/root/.openclaw/workspace/contentai-landing` | ✅ Ready |
| SEO Content Blog | `/root/.openclaw/workspace/content` | ✅ Ready |

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Verify `CLOUDFLARE_API_TOKEN` secret is set
3. Ensure Cloudflare Pages projects exist
4. Check that API token has "Cloudflare Pages: Edit" permission
