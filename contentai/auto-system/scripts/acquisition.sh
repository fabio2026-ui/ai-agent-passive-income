#!/bin/bash
# ContentAI 自动化获客脚本
# 可以设置为定时任务执行

API_BASE="${API_BASE:-https://your-domain.com}"
ADMIN_TOKEN="${ADMIN_TOKEN:-your_admin_token}"

echo "🚀 ContentAI 自动化获客"
echo "========================"

# 发布 Reddit 帖子
echo "📢 发布 Reddit 帖子..."
curl -X POST "${API_BASE}/api/admin/process" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"action": "reddit_post"}'
echo ""

# 等待 5 秒
sleep 5

# 发布 Twitter 推文
echo "🐦 发布 Twitter 推文..."
curl -X POST "${API_BASE}/api/admin/process" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"action": "twitter_post"}'
echo ""

echo "✅ 获客任务完成"
