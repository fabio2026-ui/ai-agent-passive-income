#!/bin/bash
# Quick Deploy Script for Currency Exchange Rate Monitor

set -e

echo "🚀 Currency Exchange Rate Monitor - Deployment Script"
echo "======================================================"
echo ""

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx not found. Please install Node.js first."
    exit 1
fi

# Check if logged in
echo "Checking Cloudflare authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "🔐 Please login to Cloudflare first:"
    echo "   npx wrangler login"
    exit 1
fi

echo "✅ Authenticated with Cloudflare"
echo ""

# Step 1: Create D1 Database
echo "📦 Step 1: Creating D1 Database..."
DB_OUTPUT=$(npx wrangler d1 create currency-monitor-db 2>&1 || true)

if echo "$DB_OUTPUT" | grep -q "database_id"; then
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+')
    echo "   Database ID: $DB_ID"
    
    # Update wrangler.toml
    sed -i "s/database_id = \"[^\"]*\"/database_id = \"$DB_ID\"/" wrangler.toml
    echo "   ✅ Updated wrangler.toml with database ID"
else
    echo "   ⚠️  Database may already exist or there was an error"
    echo "   Check your Cloudflare dashboard for the database ID"
fi

echo ""

# Step 2: Create KV Namespace
echo "📦 Step 2: Creating KV Namespace..."
KV_OUTPUT=$(npx wrangler kv:namespace create "CACHE" 2>&1 || true)

if echo "$KV_OUTPUT" | grep -q "id"; then
    KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+')
    echo "   KV ID: $KV_ID"
    
    # Update wrangler.toml
    sed -i "s/id = \"[^\"]*\"/id = \"$KV_ID\"/" wrangler.toml
    echo "   ✅ Updated wrangler.toml with KV namespace ID"
else
    echo "   ⚠️  KV namespace may already exist"
fi

echo ""

# Step 3: Apply Database Schema
echo "📦 Step 3: Applying database schema..."
npx wrangler d1 execute currency-monitor-db --file=./schema.sql --remote

echo ""

# Step 4: Set up secrets (optional prompts)
echo "📦 Step 4: Setting up secrets..."
echo ""
echo "   To enable email notifications, set up Resend:"
echo "   1. Go to https://resend.com and create an account"
echo "   2. Get your API key"
echo "   3. Run: npx wrangler secret put RESEND_API_KEY"
echo ""
echo "   To use exchangerate-api.com (optional - free tier uses Frankfurter):"
echo "   1. Go to https://www.exchangerate-api.com/"
echo "   2. Get your free API key"
echo "   3. Run: npx wrangler secret put EXCHANGE_API_KEY"
echo ""

# Step 5: Deploy
echo "📦 Step 5: Deploying worker..."
npx wrangler deploy

echo ""
echo "======================================================"
echo "✅ Deployment Complete!"
echo ""
echo "Your Currency Exchange Rate Monitor is now live at:"
echo "   https://currency-monitor.YOUR_SUBDOMAIN.workers.dev"
echo ""
echo "Next steps:"
echo "   1. Visit the URL above to see the dashboard"
echo "   2. Set up your first rate alert"
echo "   3. Configure email notifications with Resend"
echo "======================================================"