# 🚀 API Security Scanner - Cloud Deployment Guide

Complete deployment guide for Railway and Render platforms.

---

## 📋 Prerequisites

- GitHub account
- Railway or Render account
- Stripe account (for payments)
- Domain name (optional, for custom domain)

---

## 🛤️ Option 1: Railway Deployment (Recommended)

Railway offers the best developer experience with automatic deploys and managed databases.

### Step 1: Fork/Clone the Repository

```bash
git clone https://github.com/yourusername/api-security-scanner.git
cd api-security-scanner
```

### Step 2: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your repository

### Step 3: Add PostgreSQL Database

1. Click **New** → **Database** → **Add PostgreSQL**
2. Railway will automatically provision the database
3. The `DATABASE_URL` environment variable will be auto-injected

### Step 4: Add Redis

1. Click **New** → **Database** → **Add Redis**
2. The `REDIS_URL` environment variable will be auto-injected

### Step 5: Configure Environment Variables

Go to your service → **Variables** tab, add:

```env
# Required
SECRET_KEY=your-super-secret-random-string-at-least-32-chars
FRONTEND_URL=https://your-app-name.up.railway.app

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional
CORS_ORIGINS=https://your-app-name.up.railway.app,https://yourdomain.com
LOG_LEVEL=info
MAX_SCANS_PER_MONTH_FREE=3
```

### Step 6: Update Dockerfile Path

1. Go to service settings
2. Set **Root Directory** to `saas`
3. Railway will automatically detect the Dockerfile

### Step 7: Deploy

1. Push to main branch → Auto-deploys
2. Or click **Deploy** in Railway dashboard

### Step 8: Custom Domain (Optional)

1. Go to service → **Settings** → **Domains**
2. Click **Generate Domain** for free .railway.app domain
3. Or add custom domain → Follow DNS instructions

---

## 🎨 Option 2: Render Deployment

Render offers free static site hosting and affordable web services.

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository

### Step 2: Configure Build Settings

```yaml
Name: api-scanner
Root Directory: saas
Environment: Docker
Dockerfile Path: ./Dockerfile
Plan: Starter ($7/month minimum)
```

### Step 3: Create PostgreSQL

1. Click **New** → **PostgreSQL**
2. Name: `api-scanner-db`
3. Plan: Free or Starter
4. Copy the **Internal Database URL**

### Step 4: Create Redis

1. Click **New** → **Redis**
2. Name: `api-scanner-redis`
3. Plan: Free or Starter
4. Copy the **Internal Redis URL**

### Step 5: Configure Environment Variables

In your Web Service → **Environment** tab:

```env
DATABASE_URL=postgres://user:pass@host:5432/dbname
REDIS_URL=redis://user:pass@host:6379
SECRET_KEY=your-super-secret-key
FRONTEND_URL=https://api-scanner.onrender.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Step 6: Deploy

Click **Create Web Service** → Auto-deploys on git push

---

## 💳 Stripe Setup Guide

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete onboarding
3. Switch to **Live mode** when ready

### 2. Create Products & Prices

#### Pro Plan ($29/month)
```bash
curl https://api.stripe.com/v1/prices \
  -u sk_live_...: \
  -d "unit_amount"=2900 \
  -d "currency"="usd" \
  -d "recurring[interval]"="month" \
  -d "product_data[name]"="API Scanner Pro"
```

#### Team Plan ($99/month)
```bash
curl https://api.stripe.com/v1/prices \
  -u sk_live_...: \
  -d "unit_amount"=9900 \
  -d "currency"="usd" \
  -d "recurring[interval]"="month" \
  -d "product_data[name]"="API Scanner Team"
```

Or use the Stripe Dashboard:
1. Products → Add Product
2. Set name, description, pricing
3. Select "Recurring" → "Monthly"
4. Save the Price ID (starts with `price_`)

### 3. Configure Webhook

1. Stripe Dashboard → Developers → Webhooks
2. **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Save the **Signing secret** (starts with `whsec_`)

---

## 🔒 Security Checklist

Before going live:

- [ ] Generate strong `SECRET_KEY` (32+ random characters)
- [ ] Enable Stripe live mode
- [ ] Configure webhook URL correctly
- [ ] Set up custom domain with HTTPS
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Add privacy policy & terms of service

---

## 📊 Monitoring & Logs

### Railway
- **Logs**: Service → **Deployments** → **View Logs**
- **Metrics**: Built-in dashboard
- **Alerts**: Configure in settings

### Render
- **Logs**: Service → **Logs** tab
- **Metrics**: Available on paid plans
- **Alerts**: Email notifications

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Auto-deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railway/cli@latest
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🆘 Troubleshooting

### Build Failures
```bash
# Check Docker build locally
docker build -t api-scanner -f saas/Dockerfile .
```

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check if database is provisioned
- Ensure network connectivity

### Stripe Webhook Failures
- Verify webhook URL is accessible
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Review webhook delivery attempts in Stripe dashboard

---

## 📈 Scaling

### Railway
- Upgrade to **Pro** plan for:
  - More RAM/CPU
  - Horizontal scaling
  - Priority support

### Render
- Upgrade plan tier for more resources
- Consider adding multiple instances

---

**🎉 You're now ready to accept paying customers!**

For support, contact: support@yourdomain.com
