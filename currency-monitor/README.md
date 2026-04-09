# Currency Exchange Rate Monitor

A Cloudflare Worker that monitors exchange rates and sends email alerts when target rates are reached.

## Features

- **Daily Exchange Rate Checks**: Automatically fetches latest EUR/USD/GBP rates
- **Email Alerts**: Get notified when your target rate is reached
- **Free Tier**: 3 alerts per user
- **Pro Tier**: €9/month for unlimited alerts

## API Endpoints

### Subscribe to an Alert
```bash
POST /api/subscribe
{
  "email": "user@example.com",
  "currency": "EUR",
  "targetRate": 1.15,
  "condition": "above"  // or "below"
}
```

### Get Current Rates
```bash
GET /api/rates
```

### Unsubscribe
```bash
POST /api/unsubscribe
{
  "email": "user@example.com",
  "alertId": "alert-uuid"
}
```

### Upgrade to Pro
```bash
POST /api/upgrade
{
  "email": "user@example.com",
  "paymentToken": "stripe_token"
}
```

## Deployment

```bash
npm run deploy
```