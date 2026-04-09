#!/bin/bash
# ContentAI 日常检查脚本
# 每日自动运行，检查项目状态

echo "=== ContentAI Daily Check $(date) ==="

# 检查产品健康
echo "检查产品状态..."
bash /root/.openclaw/workspace/contentai/monitoring/health-check.sh

# 备份CID
echo "备份CID..."
bash /root/.openclaw/workspace/contentai/monitoring/backup-cids.sh

# 检查GitHub Actions状态 (如果有仓库)
# curl -s https://api.github.com/repos/YOUR_USERNAME/contentai/actions/runs | jq '.workflow_runs[0].status'

echo "=== 检查完成 $(date) ==="
