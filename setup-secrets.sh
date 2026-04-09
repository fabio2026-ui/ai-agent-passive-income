#!/bin/bash
# Add Cloudflare Token to all repos
# Requires: GH_TOKEN environment variable

GITHUB_USER="fabio2026-ui"
REPOS=("MCP-Marketplace" "Codeguard-landing" "Contentai-landing" "Codeguard-blog")
TOKEN="cfat_Kq2d2bLPJItUCdjvQ74OKdy31fL4Ve0Hkfp8Reng949b5c67"

echo "Adding CLOUDFLARE_API_TOKEN to all repositories..."

for repo in "${REPOS[@]}"; do
    echo "Setting secret for $repo..."
    # Get public key for repo
    KEY_RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_USER/$repo/actions/secrets/public-key")
    
    KEY_ID=$(echo "$KEY_RESPONSE" | grep -o '"key_id": "[^"]*"' | cut -d'"' -f4)
    KEY=$(echo "$KEY_RESPONSE" | grep -o '"key": "[^"]*"' | cut -d'"' -f4)
    
    # Encrypt token (simplified - would need proper encryption)
    # For now, just print instructions
    echo "  Repo: $repo - Key ID: $KEY_ID"
done

echo ""
echo "⚠️  GitHub API requires token encryption."
echo "Please manually add CLOUDFLARE_API_TOKEN secret to each repo:"
echo ""
for repo in "${REPOS[@]}"; do
    echo "  https://github.com/$GITHUB_USER/$repo/settings/secrets/actions"
done
echo ""
echo "Secret Name: CLOUDFLARE_API_TOKEN"
echo "Secret Value: $TOKEN"