# Currency Exchange Rate Monitor - Deployment Guide

## Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Node.js** installed
3. **Wrangler CLI** installed: `npm install -g wrangler`

## Setup Steps

### 1. Login to Cloudflare

```bash
wrangler login
```

### 2. Create D1 Database

```bash
wrangler d1 create currency-monitor-db
```

Update `wrangler.toml` with the database ID from the output.

### 3. Create KV Namespace

```bash
wrangler kv:namespace create "CACHE"
```

Update `wrangler.toml` with the namespace ID.

### 4. Apply Database Schema

```bash
wrangler d1 execute currency-monitor-db --file=./schema.sql
```

### 5. Set Environment Secrets

```bash
# Required for exchange rates (get free API key from exchangerate-api.com)
wrangler secret put EXCHANGE_API_KEY

# Required for email notifications (get API key from resend.com)
wrangler secret put RESEND_API_KEY

# For payments (optional, for Pro tier)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

### 6. Deploy

```bash
npm run deploy
```

## API Usage

### Get Current Rates
```bash
curl https://your-worker.your-subdomain.workers.dev/api/rates
```

### Subscribe to Alert
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "currency": "EUR",
    "targetRate": 0.92,
    "condition": "above"
  }'
```

### Get Your Alerts
```bash
curl "https://your-worker.your-subdomain.workers.dev/api/alerts?email=user@example.com"
```

### Unsubscribe
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "alertId": "your-alert-id"
  }'
```

## Cron Schedule

The worker is configured to run daily at 9:00 AM UTC. To modify:

Edit `wrangler.toml`:
```toml
[[triggers]]
crons = ["0 9 * * *"]  # Daily at 9 AM UTC
```

## Free API Options

1. **ExchangeRate-API** (free tier): https://www.exchangerate-api.com/
2. **Frankfurter API** (free, no key needed): https://api.frankfurter.app/latest

To use Frankfurter (no API key needed), modify the `getExchangeRates` function in `src/index.ts`.