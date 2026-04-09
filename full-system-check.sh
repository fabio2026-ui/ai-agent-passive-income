#!/bin/bash
# 🔍 全面系统检查 - 找出所有丢失的功能

echo "========================================"
echo "🔍 全面系统检查 - 找出所有丢失项"
echo "时间: $(date)"
echo "========================================"
echo ""

LOST_COUNT=0

# 1. 检查核心文案文件
echo "📄 [1/10] 核心文案文件..."
FILES=(
  "$HOME/ai-empire/launch/bio.txt"
  "$HOME/ai-empire/launch/title.txt"
  "$HOME/ai-empire/launch/description.txt"
  "$HOME/ai-empire/launch/faq.txt"
  "$HOME/ai-empire/launch/tags.txt"
  "$HOME/ai-empire/launch/scripts.txt"
  "$HOME/ai-empire/launch/proposals.txt"
  "$HOME/ai-empire/launch/social_scripts.txt"
  "$HOME/ai-empire/launch/checklist.txt"
  "$HOME/ai-empire/launch/tomorrow_checklist.txt"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    if [ "$SIZE" -gt 10 ]; then
      echo "  ✅ $(basename $file) ($SIZE bytes)"
    else
      echo "  ⚠️  $(basename $file) (文件存在但内容可能不完整)"
      ((LOST_COUNT++))
    fi
  else
    echo "  ❌ $(basename $file) - 丢失!"
    ((LOST_COUNT++))
  fi
done

echo ""

# 2. 检查自动化脚本
echo "⚙️  [2/10] 自动化脚本..."
SCRIPTS=(
  "$HOME/ai-empire/scripts/track-revenue.sh"
  "$HOME/ai-empire/scripts/weekly-report.sh"
  "$HOME/ai-empire/scripts/startup-check.sh"
  "$HOME/ai-empire/scripts/quick-deliver.sh"
  "$HOME/ai-empire/scripts/daily-tasks.sh"
  "$HOME/ai-empire/scripts/pricing-optimizer.sh"
  "$HOME/ai-empire/scripts/competitor-watch.sh"
  "$HOME/ai-empire/scripts/revenue-forecast.sh"
  "$HOME/ai-empire/scripts/backup-all.sh"
  "$HOME/ai-empire/scripts/monitor-health.sh"
)

for script in "${SCRIPTS[@]}"; do
  if [ -f "$script" ]; then
    echo "  ✅ $(basename $script)"
  else
    echo "  ❌ $(basename $script) - 丢失!"
    ((LOST_COUNT++))
  fi
done

echo ""

# 3. 检查素材库
echo "🎬 [3/10] 素材库..."
VIDEO_COUNT=$(ls $HOME/ai-empire/launch/assets/*.mp4 2>/dev/null | wc -l)
if [ $VIDEO_COUNT -ge 15 ]; then
  echo "  ✅ 视频素材: $VIDEO_COUNT 个"
else
  echo "  ❌ 视频素材不足: $VIDEO_COUNT 个 (需要15+)"
  ((LOST_COUNT++))
fi

echo ""

# 4. 检查基础工具
echo "🔧 [4/10] 基础工具..."
if command -v ffmpeg &> /dev/null; then
  echo "  ✅ FFmpeg: $(which ffmpeg)"
else
  echo "  ❌ FFmpeg: 未安装!"
  ((LOST_COUNT++))
fi

if command -v python3 &> /dev/null; then
  echo "  ✅ Python3: 已安装"
else
  echo "  ❌ Python3: 未安装!"
  ((LOST_COUNT++))
fi

echo ""

# 5. 检查API配置
echo "🔑 [5/10] API配置..."
if grep -q "PEXELS_API_KEY" ~/.bashrc ~/.zshrc 2>/dev/null; then
  echo "  ✅ Pexels API: 已持久化"
else
  echo "  ⚠️  Pexels API: 仅当前会话有效 (建议持久化)"
fi

echo ""

# 6. 检查系统文档
echo "📚 [6/10] 系统文档..."
DOCS=(
  "$HOME/ai-empire/system/SYSTEM_STATE.md"
  "$HOME/ai-empire/system/RESTORE_LOG.txt"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✅ $(basename $doc)"
  else
    echo "  ❌ $(basename $doc) - 丢失!"
    ((LOST_COUNT++))
  fi
done

echo ""

# 7. 检查项目库
echo "📦 [7/10] 项目库..."
if [ -d "$HOME/project-matrix" ]; then
  PROJECT_COUNT=$(ls $HOME/project-matrix/active/*.json 2>/dev/null | wc -l)
  echo "  ✅ 大项目库: $PROJECT_COUNT 个项目"
else
  echo "  ❌ 大项目库: 目录丢失!"
  ((LOST_COUNT++))
fi

if [ -d "$HOME/ai-business-empire" ]; then
  echo "  ✅ AI业务线: 目录存在"
else
  echo "  ❌ AI业务线: 目录丢失!"
  ((LOST_COUNT++))
fi

echo ""

# 8. 检查AI Life Copilot
echo "💻 [8/10] AI Life Copilot APP..."
if [ -f "$HOME/ai-app-factory-v3/products/ai_life_copilot/main.py" ]; then
  LINE_COUNT=$(wc -l < "$HOME/ai-app-factory-v3/products/ai_life_copilot/main.py")
  echo "  ✅ APP代码: $LINE_COUNT 行"
else
  echo "  ⚠️  APP代码: 需要确认路径"
fi

echo ""

# 9. 检查安全防护
echo "🛡️  [9/10] 安全防护..."
if [ -d "$HOME/ai-security-system" ]; then
  echo "  ✅ 安全系统: 已部署"
else
  echo "  ❌ 安全系统: 未部署!"
  ((LOST_COUNT++))
fi

echo ""

# 10. 检查备份系统
echo "💾 [10/10] 备份系统..."
if [ -d "$HOME/ai-empire/backup" ]; then
  BACKUP_COUNT=$(ls $HOME/ai-empire/backup/ 2>/dev/null | wc -l)
  echo "  ✅ 备份目录: $BACKUP_COUNT 个备份"
else
  echo "  ❌ 备份目录: 未创建!"
  ((LOST_COUNT++))
fi

echo ""
echo "========================================"
echo "📊 检查结果总结"
echo "========================================"
echo ""

if [ $LOST_COUNT -eq 0 ]; then
  echo "🎉 完美! 所有功能都正常，没有丢失!"
elif [ $LOST_COUNT -le 3 ]; then
  echo "⚠️  发现 $LOST_COUNT 项需要修复"
  echo "    建议: 立即修复"
else
  echo "🚨 警告! 发现 $LOST_COUNT 项丢失或异常!"
  echo "    建议: 全面恢复"
fi

echo ""
echo "========================================"
echo "查看详细报告: ~/ai-empire/system/FULL_CHECK_REPORT.txt"
echo "========================================"

# 保存报告
cp > "$HOME/ai-empire/system/FULL_CHECK_REPORT.txt"
