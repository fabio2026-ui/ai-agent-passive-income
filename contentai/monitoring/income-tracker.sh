#!/bin/bash
# ContentAI 收入追踪脚本
# 每日更新收入数据

INCOME_FILE="/root/.openclaw/workspace/contentai/reports/income-tracker.csv"
mkdir -p $(dirname $INCOME_FILE)

# 初始化文件
if [ ! -f "$INCOME_FILE" ]; then
    echo "date,source,amount,currency,notes" > "$INCOME_FILE"
fi

DATE=$(date +%Y-%m-%d)

echo "=== ContentAI 收入追踪 $DATE ==="
echo "当前收入记录:"
cat "$INCOME_FILE"
echo ""
echo "总计:"
tail -n +2 "$INCOME_FILE" | awk -F',' '{sum += $3} END {print "总收入: $" sum}'
