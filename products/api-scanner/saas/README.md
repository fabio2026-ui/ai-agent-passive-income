# SecureScan API - SaaS Deployment

Complete SaaS deployment package for the API Security Scanner.

## 📦 Contents

```
saas/
├── Dockerfile                 # Production Docker image
├── docker-compose.yml         # Local development stack
├── nginx.conf                 # Nginx reverse proxy config
├── .env.example               # Environment variables template
├── backend/
│   └── main.py               # FastAPI main application
├── payment/
│   └── stripe_integration.py # Stripe billing integration
├── frontend/
│   ├── index.html            # Landing page
│   └── pricing.html          # Pricing page ($29/$99)
└── docs/
    └── DEPLOYMENT.md         # Full deployment guide
```

## 🚀 Quick Start

### Local Development

```bash
cd saas

# 1. Set up environment
cp .env.example .env
# Edit .env with your Stripe keys

# 2. Start services
docker-compose up -d

# 3. Access the app
# Frontend: http://localhost:3000
# API: http://localhost:8000
```

### Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Railway deployment
- Render deployment
- Stripe configuration
- Custom domain setup

## 💳 Pricing Tiers

| Plan | Price | Scans | Features |
|------|-------|-------|----------|
| Free | $0 | 3/month | Basic scanning |
| Pro | $29/mo | Unlimited | CI/CD, webhooks, PDF reports |
| Team | $99/mo | Unlimited | 10 users, SSO, dedicated support |

## 🔧 Configuration

Required environment variables:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📖 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Full deployment instructions
- [API Documentation](http://localhost:8000/docs) - Swagger UI (local dev)

## 🛡️ Security

- All API specs are encrypted at rest
- TLS 1.3 for all connections
- Stripe PCI compliance for payments
- No API responses stored

## 📝 License

Commercial - All rights reserved.
