#!/bin/bash
# 🔍 系统健康检查脚本

LOG="$HOME/ai-empire/system/health.log"

echo "========================================" | tee -a $LOG
echo "🔍 系统健康检查 - $(date)" | tee -a $LOG
echo "========================================" | tee -a $LOG

# 检查基础工具
echo "[基础工具]" | tee -a $LOG
command -v ffmpeg &> /dev/null && echo "✅ FFmpeg: $(which ffmpeg)" | tee -a $LOG || echo "❌ FFmpeg: 未安装" | tee -a $LOG
command -v python3 &> /dev/null && echo "✅ Python3: 已安装" | tee -a $LOG || echo "❌ Python3: 未安装" | tee -a $LOG

# 检查文件
echo "" | tee -a $LOG
echo "[文件完整性]" | tee -a $LOG
[ -f "$HOME/ai-empire/launch/bio.txt" ] && echo "✅ bio.txt" | tee -a $LOG || echo "❌ bio.txt 丢失" | tee -a $LOG
[ -f "$HOME/ai-empire/launch/title.txt" ] && echo "✅ title.txt" | tee -a $LOG || echo "❌ title.txt 丢失" | tee -a $LOG

# 检查素材
VIDEO_COUNT=$(ls $HOME/ai-empire/launch/assets/*.mp4 2>/dev/null | wc -l)
echo "" | tee -a $LOG
echo "[素材库] $VIDEO_COUNT 个视频" | tee -a $LOG

echo "" | tee -a $LOG
echo "========================================" | tee -a $LOG
