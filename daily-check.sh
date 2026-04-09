#!/bin/bash
# 每日系统自检脚本
# 自动检查API、服务、资源状态

LOG_FILE="/root/.openclaw/workspace/output/daily-check-$(date +%Y-%m-%d).log"

echo "========================================"
echo "🤖 Daily System Check - $(date)"
echo "========================================"

# API检查
APIS=(
    "eucrossborder-api.yhongwb.workers.dev/health"
    "ukcrossborder-api.yhongwb.workers.dev/health"
    "ustax-api.yhongwb.workers.dev/health"
    "catax-api.yhongwb.workers.dev/health"
)

ONLINE=0
for API in "${APIS[@]}"; do
    if curl -s "https://$API" --max-time 3 > /dev/null; then
        echo "✅ $API"
        ((ONLINE++))
    else
        echo "❌ $API"
    fi
done

echo "APIs Online: $ONLINE/${#APIS[@]}"
echo "Check completed!"
