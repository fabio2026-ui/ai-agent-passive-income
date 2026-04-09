#!/bin/bash
# Create GitHub repos via API
# Requires: GH_TOKEN environment variable

GITHUB_USER="fabio2026-ui"
REPOS=("MCP-Marketplace" "Codeguard-landing" "Contentai-landing" "Codeguard-blog")

echo "Creating GitHub repositories..."

for repo in "${REPOS[@]}"; do
    echo "Creating $repo..."
    curl -s -X POST \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"$repo\",\"private\":false}"
done

echo "Done!"