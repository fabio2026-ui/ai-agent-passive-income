# ⚙️ Configuration Templates

## Cloudflare Worker (wrangler.toml)
```toml
name = "service-name"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"
```

## Frontend Environment (.env)
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

## GitHub Actions (deploy.yml)
```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "deploy": "wrangler deploy",
    "preview": "wrangler dev"
  }
}
```

---

## Common Commands

### Cloudflare
```bash
# Login
npx wrangler login

# Deploy Worker
npx wrangler deploy

# Deploy Pages
npx wrangler pages publish dist

# Create KV namespace
npx wrangler kv:namespace create "NAME"

# Set secret
npx wrangler secret put SECRET_NAME
```

### Git
```bash
# Safe push (no secrets)
git add -A
git commit -m "message"
git push origin master

# Force push (orphan branch)
git push --force origin master
```

---
Last Updated: 2026-04-10
