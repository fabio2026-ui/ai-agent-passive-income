#!/bin/bash
# Auto Performance Monitor Hook
# 可添加到cron或心跳任务中

echo "[$(date)] Running performance check..."
cd /root/.openclaw/workspace
node scripts/performance-monitor.js > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "[$(date)] ✅ Performance check passed"
else
  echo "[$(date)] ❌ Performance check failed"
fi
