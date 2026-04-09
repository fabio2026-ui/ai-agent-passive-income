#!/bin/bash
# Auto-promotion script for CodeGuard
# Runs continuously to promote on various platforms

echo "🚀 Starting CodeGuard Auto-Promotion System"
echo "=========================================="
echo ""

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check deployment status
check_deployment() {
    log "Checking GitHub Pages deployment..."
    
    URLS=(
        "https://codeguard-landing.pages.dev/pricing.html"
        "https://codeguard-landing.pages.dev/buy.html"
        "https://codeguard-landing.pages.dev/crypto-payment.html"
    )
    
    for url in "${URLS[@]}"; do
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        if [ "$status" = "200" ]; then
            log "✅ $url - LIVE"
        else
            log "⏳ $url - Pending ($status)"
        fi
    done
}

# Generate daily content
generate_content() {
    log "Generating daily promotional content..."
    
    # Create dated content folder
    mkdir -p "content/daily/$(date +%Y-%m-%d)"
    
    # Generate Twitter thread ideas
    cat > "content/daily/$(date +%Y-%m-%d)/twitter-ideas.txt" <<EOF
Twitter Post Ideas for $(date +%Y-%m-%d):

1. Security tip of the day
2. Customer testimonial (when available)
3. Behind the scenes: How AI finds vulnerabilities
4. Comparison: CodeGuard vs expensive enterprise tools
5. Fun fact: Most common vulnerability we find

Links to include:
- https://codeguard-landing.pages.dev
- https://buy.stripe.com/00w6oHg82ffA81f4o4gQE0l
EOF

    log "✅ Content generated for today"
}

# Monitor API health
monitor_apis() {
    log "Monitoring API health..."
    
    APIS=(
        "https://codeguard-ai-prod.yhongwb.workers.dev"
        "https://mentalhealth-gpt-api.yhongwb.workers.dev"
        "https://breath-ai.yhongwb.workers.dev"
    )
    
    for api in "${APIS[@]}"; do
        status=$(curl -s -o /dev/null -w "%{http_code}" "$api" 2>/dev/null || echo "000")
        if [ "$status" = "200" ]; then
            log "✅ $api - Healthy"
        else
            log "❌ $api - Down ($status)"
        fi
    done
}

# Main execution
main() {
    log "Auto-promotion system starting..."
    
    check_deployment
    generate_content
    monitor_apis
    
    log "=========================================="
    log "System ready. Revenue streams active:"
    log "  - Stripe Pro: https://buy.stripe.com/00w6oHg82ffA81f4o4gQE0l"
    log "  - Crypto BTC: bc1q6d6zffkv4h6g7qjx8g6527g3tz3qptnxg5cuvg"
    log "  - Crypto ETH: 0xb8ff64CDE31013D2c4Ad6c11B12F0e7b54EfECCB"
    log "=========================================="
}

main "$@"