#!/bin/bash
# ContentAI 每日健康检查脚本
# 检查所有IPFS部署的网站可访问性

LOG_FILE="/root/.openclaw/workspace/contentai/monitoring/logs/health-$(date +%Y%m%d).log"
mkdir -p $(dirname $LOG_FILE)

echo "=== ContentAI Health Check $(date) ===" | tee -a $LOG_FILE

# 检查的网站列表
SITES=(
    "https://dweb.link/ipfs/QmdEWJUbT6nMgbsx1ftnUBLW8kHZAXwRStp3ZjLCHQdRZD/"
    "https://dweb.link/ipfs/QmY1uqWwP9gPtJTwv1toZVzzp2ppRXXRjEKKuhHRY7esBn/"
    "https://dweb.link/ipfs/QmY9Vg9K8khR91HD81STJwdGT8iUaKd6bY6X8SzREieA6s/"
)

for site in "${SITES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$site")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ]; then
        echo "✅ $(echo $site | cut -d'/' -f6): UP" | tee -a $LOG_FILE
    else
        echo "❌ $(echo $site | cut -d'/' -f6): DOWN (HTTP $STATUS)" | tee -a $LOG_FILE
    fi
done

echo "检查完成: $(date)" | tee -a $LOG_FILE
