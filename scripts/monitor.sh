#!/bin/bash
# 小七全自动监控系统
# 每小时检查关键指标

WORK_DIR="/root/.openclaw/workspace/ai-agent-projects"
LOG_FILE="$WORK_DIR/logs/monitor-$(date +%Y-%m-%d).log"
REPORT_FILE="$WORK_DIR/logs/weekly-report.md"

mkdir -p "$WORK_DIR/logs"

echo "🔍 $(date '+%Y-%m-%d %H:%M:%S') - 开始监控扫描" >> "$LOG_FILE"

# 检查GitHub Stars
curl -s https://api.github.com/repos/fabio2026-ui/ai-agent-passive-income | \
  jq -r '{stars: .stargazers_count, forks: .forks_count, updated: .updated_at}' 2>/dev/null > "$WORK_DIR/logs/github-stats.json" || echo "GitHub API 检查失败" >> "$LOG_FILE"

STARS=$(jq -r '.stars // 0' "$WORK_DIR/logs/github-stats.json" 2>/dev/null || echo "0")
FORKS=$(jq -r '.forks // 0' "$WORK_DIR/logs/github-stats.json" 2>/dev/null || echo "0")

echo "⭐ GitHub Stars: $STARS" >> "$LOG_FILE"
echo "🍴 GitHub Forks: $FORKS" >> "$LOG_FILE"

# 检查网站状态
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://fabio2026-ui.github.io/ai-agent-passive-income 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ]; then
  echo "✅ 网站状态: 在线 ($HTTP_CODE)" >> "$LOG_FILE"
else
  echo "⚠️  网站状态: 异常 ($HTTP_CODE)" >> "$LOG_FILE"
fi

# 统计内容数量
ARTICLE_COUNT=$(find "$WORK_DIR" -name "*.md" -type f 2>/dev/null | wc -l)
echo "📝 文章总数: $ARTICLE_COUNT" >> "$LOG_FILE"

# 检查是否需要通知用户
if [ "$STARS" -ge 50 ]; then
  echo "🎉 触发条件: GitHub Stars >= 50" >> "$LOG_FILE"
  echo "⏰ 建议: 准备Product Hunt发布" >> "$LOG_FILE"
fi

# 生成每日摘要
cat > "$WORK_DIR/logs/latest-status.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "github_stars": $STARS,
  "github_forks": $FORKS,
  "article_count": $ARTICLE_COUNT,
  "website_status": "$HTTP_CODE",
  "autonomous_mode": true
}
EOF

echo "✅ 监控完成: $(date '+%H:%M:%S')" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
