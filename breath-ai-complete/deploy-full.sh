#!/bin/bash
# Deploy Breathing AI with Stripe Payments to Cloudflare Workers
# Usage: ./deploy-full.sh

set -e

echo "🚀 Breathing AI Full Deployment"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: wrangler is not installed${NC}"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
echo -e "${YELLOW}Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}Not logged in. Please run: wrangler login${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated with Cloudflare${NC}"

# Set Stripe Secret Key as secret
echo ""
echo -e "${YELLOW}Setting up Stripe secrets...${NC}"
echo "Please enter your Stripe Secret Key (sk_test_... or sk_live_...):"
read -s STRIPE_SECRET_KEY

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}Error: Stripe Secret Key is required${NC}"
    exit 1
fi

echo ""
echo "Please enter your Stripe Webhook Secret (whsec_...):"
read -s STRIPE_WEBHOOK_SECRET

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}Warning: Webhook secret not provided. Webhooks will not work.${NC}"
    STRIPE_WEBHOOK_SECRET="placeholder"
fi

# Navigate to backend directory
cd backend

# Set secrets using wrangler
echo ""
echo -e "${YELLOW}Uploading secrets to Cloudflare...${NC}"
echo "$STRIPE_SECRET_KEY" | wrangler secret put STRIPE_SECRET_KEY
echo "$STRIPE_WEBHOOK_SECRET" | wrangler secret put STRIPE_WEBHOOK_SECRET

echo -e "${GREEN}✓ Secrets configured${NC}"

# Deploy the worker
echo ""
echo -e "${YELLOW}Deploying Cloudflare Worker...${NC}"
wrangler deploy

echo -e "${GREEN}✓ Worker deployed${NC}"

# Get the worker URL
echo ""
echo -e "${YELLOW}Getting deployment URL...${NC}"
WORKER_URL=$(wrangler deployment list 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)

if [ -z "$WORKER_URL" ]; then
    WORKER_URL="https://breath-ai-backend.your-subdomain.workers.dev"
fi

echo -e "${GREEN}✓ Worker URL: $WORKER_URL${NC}"

# Update frontend env
cd ../frontend
cat > .env << EOF
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_51TCfcBDRLWt3rKvbzr3TuuA2pZ4rUOyBExwBUOpGVY9pK8zKfPTGT9A5oxmmBTI7Asf1M5ozadpHTFSlQ1WTyMKG00rQNT5CxB

# Backend API URL
VITE_API_URL=$WORKER_URL

# Stripe Price IDs (update these after running setup-stripe-products.sh)
VITE_STRIPE_PREMIUM_PRICE_ID=price_premium_placeholder
VITE_STRIPE_PREMIUM_PLUS_PRICE_ID=price_premium_plus_placeholder
EOF

echo ""
echo -e "${GREEN}✓ Frontend environment configured${NC}"

# Build frontend
echo ""
echo -e "${YELLOW}Building frontend...${NC}"
npm install
npm run build

echo -e "${GREEN}✓ Frontend built${NC}"

# Deploy frontend to Cloudflare Pages (optional)
echo ""
echo -e "${YELLOW}Do you want to deploy frontend to Cloudflare Pages? (y/n)${NC}"
read -r DEPLOY_FRONTEND

if [ "$DEPLOY_FRONTEND" = "y" ] || [ "$DEPLOY_FRONTEND" = "Y" ]; then
    echo -e "${YELLOW}Deploying to Cloudflare Pages...${NC}"
    wrangler pages deploy dist
    echo -e "${GREEN}✓ Frontend deployed${NC}"
fi

# Output summary
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================"
echo "Backend URL: $WORKER_URL"
echo "Frontend: ./frontend/dist (built)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update stripe-price-ids.json with actual Price IDs from Stripe Dashboard"
echo "2. Update frontend .env with actual Price IDs"
echo "3. Configure Stripe Webhook endpoint: $WORKER_URL/api/stripe/webhook"
echo "4. Test the payment flow"
echo ""
echo -e "${YELLOW}Webhook Configuration:${NC}"
echo "Endpoint: $WORKER_URL/api/stripe/webhook"
echo "Events to listen for:"
echo "  - checkout.session.completed"
echo "  - invoice.payment_succeeded"
echo "  - customer.subscription.deleted"
echo "  - customer.subscription.updated"
echo ""
echo "Stripe Dashboard: https://dashboard.stripe.com/test/webhooks"
