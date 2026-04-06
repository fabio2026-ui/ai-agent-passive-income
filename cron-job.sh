#!/bin/bash
# 小七持续执行守护进程
# 每30分钟自动执行一轮

WORKSPACE="/root/.openclaw/workspace/ai-agent-projects"
LOG_FILE="$WORKSPACE/logs/cron.log"

# 确保日志目录存在
mkdir -p "$WORKSPACE/logs"

echo "[$(date)] 🚀 小七持续执行启动" >> "$LOG_FILE"

cd "$WORKSPACE"

# 检查并执行内容生成
echo "[$(date)] 📝 执行内容生成..." >> "$LOG_FILE"
node auto-content-offline.js >> "$LOG_FILE" 2>&1

# Git自动提交
if [ -d .git ]; then
    echo "[$(date)] 🔄 Git提交..." >> "$LOG_FILE"
    git add -A
    git commit -m "Cron: Auto content update $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE" 2>&1 || true
fi

# 生成状态报告
echo "[$(date)] 📊 生成报告..." >> "$LOG_FILE"
ARTICLE_COUNT=$(ls -1 content/*.md 2>/dev/null | wc -l)
echo "当前文章数: $ARTICLE_COUNT" >> "$LOG_FILE"

echo "[$(date)] ✅ 执行完成" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
