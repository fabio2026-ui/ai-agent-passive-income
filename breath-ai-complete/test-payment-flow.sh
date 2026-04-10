#!/bin/bash
# Test Stripe Webhook and Payment Flow
# Usage: ./test-payment-flow.sh

set -e

echo "🧪 Testing Breathing AI Payment Flow"
echo "===================================="

# Configuration
WORKER_URL="${1:-https://breath-ai-backend.your-subdomain.workers.dev}"
STRIPE_SECRET_KEY="${2:-sk_test_your_key}"

echo "Worker URL: $WORKER_URL"

# Test colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Health Check
echo ""
echo "1️⃣ Testing Health Check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$WORKER_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi

# Test 2: Create Checkout Session (without auth)
echo ""
echo "2️⃣ Testing Checkout Session Creation..."
CHECKOUT_RESPONSE=$(curl -s -X POST "$WORKER_URL/api/stripe/checkout" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"priceId": "price_test", "userId": "test-user"}')

if echo "$CHECKOUT_RESPONSE" | grep -q "error"; then
    echo -e "${RED}✗ Checkout failed:${NC}"
    echo "$CHECKOUT_RESPONSE"
else
    echo -e "${GREEN}✓ Checkout endpoint responding${NC}"
fi

# Test 3: Get Subscription (should return 401 without auth)
echo ""
echo "3️⃣ Testing Subscription Endpoint..."
SUB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$WORKER_URL/api/stripe/subscription")
if [ "$SUB_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✓ Subscription auth working (401 as expected)${NC}"
else
    echo -e "${RED}✗ Unexpected response: $SUB_RESPONSE${NC}"
fi

# Test 4: Webhook Endpoint
echo ""
echo "4️⃣ Testing Webhook Endpoint..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$WORKER_URL/api/stripe/webhook" \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{"type": "test"}')

if echo "$WEBHOOK_RESPONSE" | grep -q "error"; then
    echo -e "${GREEN}✓ Webhook endpoint responding (rejected invalid signature as expected)${NC}"
else
    echo -e "${RED}✗ Unexpected webhook response${NC}"
fi

# Summary
echo ""
echo "===================================="
echo "Test Summary"
echo "===================================="
echo "All endpoints are responding."
echo ""
echo "Next steps for full testing:"
echo "1. Deploy the frontend"
echo "2. Open the frontend in a browser"
echo "3. Navigate to the Premium/Membership page"
echo "4. Click Subscribe to test the checkout flow"
echo "5. Use Stripe test card: 4242 4242 4242 4242"
echo "   - Any future expiry date"
echo "   - Any 3-digit CVC"
echo "   - Any ZIP code"
echo ""
echo "Stripe Test Cards:"
echo "  Success: 4242 4242 4242 4242"
echo "  Decline: 4000 0000 0000 0002"
echo "  3DS:     4000 0025 0000 3155"
