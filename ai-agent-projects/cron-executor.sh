#!/bin/bash
# 小七AI Agent - 全自动定时执行系统
# 添加到crontab: crontab -e

# 执行日志
LOG_FILE="/root/.openclaw/workspace/ai-agent-projects/logs/cron-$(date +%Y%m%d).log"
PROJECT_DIR="/root/.openclaw/workspace/ai-agent-projects"

mkdir -p logs

echo "===== $(date) 自动执行 =====" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# 1. 监控报告
echo "[1/5] 运行监控..." >> "$LOG_FILE"
./monitor.sh >> "$LOG_FILE" 2>&1

# 2. 生成新内容 (每3天执行一次)
DAY=$(date +%d)
if [ $((DAY % 3)) -eq 0 ]; then
    echo "[2/5] 生成新内容..." >> "$LOG_FILE"
    node batch4-generator.js >> "$LOG_FILE" 2>&1 || node batch3-generator.js >> "$LOG_FILE" 2>&1
fi

# 3. 社媒内容生成 (每周一)
WEEKDAY=$(date +%u)
if [ "$WEEKDAY" = "1" ]; then
    echo "[3/5] 生成社媒内容..." >> "$LOG_FILE"
    node social-media-system.js >> "$LOG_FILE" 2>&1
fi

# 4. 自动Git提交
echo "[4/5] Git提交..." >> "$LOG_FILE"
git add -A
git commit -m "Auto: Cron update $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE" 2>&1
git push origin master >> "$LOG_FILE" 2>&1

# 5. 生成统计
echo "[5/5] 生成统计..." >> "$LOG_FILE"
echo "文章数: $(ls content/*.md 2>/dev/null | wc -l)" >> "$LOG_FILE"
echo "Git提交: $(git rev-list --count master 2>/dev/null)" >> "$LOG_FILE"

echo "===== 完成 $(date) =====" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
