#!/bin/bash
# 每日系统自检脚本 - 自动执行
# 每天运行，无需人工干预

LOG_FILE="/root/.openclaw/workspace/output/daily-check-$(date +%Y-%m-%d).log"

echo "========================================" | tee -a $LOG_FILE
echo "🤖 Daily System Check - $(date)" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# 1. API健康检查
echo -e "\n📡 API Health Check" | tee -a $LOG_FILE
APIS=(
    "https://eucrossborder-api.yhongwb.workers.dev/health"
    "https://ukcrossborder-api.yhongwb.workers.dev/health"
    "https://ustax-api.yhongwb.workers.dev/health"
    "https://catax-api.yhongwb.workers.dev/health"
    "https://amazon-calc-api.yhongwb.workers.dev/"
    "https://shopify-calc-api.yhongwb.workers.dev/health"
    "https://mentalhealth-gpt.yhongwb.workers.dev/health"
    "https://breath-ai-backend.yhongwb.workers.dev/api/health"
)

ONLINE=0
TOTAL=${#APIS[@]}

for API in "${APIS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API --max-time 5)
    if [ "$STATUS" == "200" ]; then
        echo "✅ $API" | tee -a $LOG_FILE
        ((ONLINE++))
    else
        echo "❌ $API (Status: $STATUS)" | tee -a $LOG_FILE
    fi
done

echo -e "\nAPI Status: $ONLINE/$TOTAL online" | tee -a $LOG_FILE

# 2. 本地服务检查
echo -e "\n🔧 Local Services" | tee -a $LOG_FILE
if curl -s http://localhost:8787/health > /dev/null; then
    echo "✅ Code Review Service (Port 8787)" | tee -a $LOG_FILE
else
    echo "❌ Code Review Service (Port 8787)" | tee -a $LOG_FILE
fi

if curl -s http://localhost:8788/health > /dev/null; then
    echo "✅ Enhanced Code Review (Port 8788)" | tee -a $LOG_FILE
else
    echo "❌ Enhanced Code Review (Port 8788)" | tee -a $LOG_FILE
fi

# 3. 磁盘空间检查
echo -e "\n💾 Disk Usage" | tee -a $LOG_FILE
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️  Disk usage is ${DISK_USAGE}% (HIGH)" | tee -a $LOG_FILE
else
    echo "✅ Disk usage is ${DISK_USAGE}% (OK)" | tee -a $LOG_FILE
fi

# 4. 内存检查
echo -e "\n🧠 Memory Usage" | tee -a $LOG_FILE
MEMORY=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY" -gt 80 ]; then
    echo "⚠️  Memory usage is ${MEMORY}% (HIGH)" | tee -a $LOG_FILE
else
    echo "✅ Memory usage is ${MEMORY}% (OK)" | tee -a $LOG_FILE
fi

# 5. 总结
echo -e "\n========================================" | tee -a $LOG_FILE
echo "✅ Daily check completed" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# 如果有问题，输出警告
if [ "$ONLINE" -lt "$TOTAL" ] || [ "$DISK_USAGE" -gt 80 ] || [ "$MEMORY" -gt 80 ]; then
    echo -e "\n⚠️  WARNINGS DETECTED - Check log for details" | tee -a $LOG_FILE
    exit 1
fi

exit 0
