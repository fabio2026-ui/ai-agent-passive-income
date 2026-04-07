#!/bin/bash
# 一键推送到GitHub

cd /root/.openclaw/workspace/ai-agent-projects
git remote add origin git@github.com:fabio2026-ui/ai-agent-passive-income.git 2>/dev/null || true
git push -u origin master --force

echo ""
echo "✅ 推送完成!"
echo "仓库地址: https://github.com/fabio2026-ui/ai-agent-passive-income"
