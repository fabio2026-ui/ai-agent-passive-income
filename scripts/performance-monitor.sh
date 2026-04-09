#!/bin/bash
# Frontend Performance Optimization Loop
# 前端性能优化循环脚本

set -e

REPORT_DIR="/root/ai-empire/quality-reports"
WORKSPACE_DIR="/root/.openclaw/workspace"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo " 前端性能优化监控循环"
echo " 时间: $TIMESTAMP"
echo "================================"

# Projects to monitor
PROJECTS=(
  "ai-diet-coach"
  "ai-diary-pro"
  "breath-ai"
  "habit-ai-app"
  "focus-forest-ai"
)

# Function to check if project has lazy loading
check_lazy_loading() {
  local project=$1
  local app_file="$WORKSPACE_DIR/$project/src/App.tsx"
  
  if [[ ! -f "$app_file" ]]; then
    app_file="$WORKSPACE_DIR/$project/src/App.jsx"
  fi
  
  if [[ -f "$app_file" ]]; then
    if grep -q "React.lazy" "$app_file" || grep -q "lazy(" "$app_file"; then
      echo -e "${GREEN}✅ 懒加载已启用${NC}"
      return 0
    else
      echo -e "${RED}❌ 未启用懒加载${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW}⚠️ 未找到 App 文件${NC}"
    return 1
  fi
}

# Function to check if project has performance utils
check_performance_utils() {
  local project=$1
  local perf_file="$WORKSPACE_DIR/$project/src/utils/performance.ts"
  
  if [[ -f "$perf_file" ]]; then
    echo -e "${GREEN}✅ 性能监控工具已安装${NC}"
    return 0
  else
    echo -e "${RED}❌ 缺少性能监控工具${NC}"
    return 1
  fi
}

# Function to check vite config optimization
check_vite_config() {
  local project=$1
  local vite_config="$WORKSPACE_DIR/$project/vite.config.ts"
  
  if [[ ! -f "$vite_config" ]]; then
    vite_config="$WORKSPACE_DIR/$project/vite.config.js"
  fi
  
  if [[ -f "$vite_config" ]]; then
    if grep -q "manualChunks" "$vite_config"; then
      echo -e "${GREEN}✅ 代码分割已配置${NC}"
      return 0
    else
      echo -e "${YELLOW}⚠️ 未配置 manualChunks${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW}⚠️ 未找到 Vite 配置${NC}"
    return 1
  fi
}

# Function to check index.html optimization
check_html_optimization() {
  local project=$1
  local html_file="$WORKSPACE_DIR/$project/index.html"
  
  if [[ -f "$html_file" ]]; then
    if grep -q "preconnect" "$html_file"; then
      echo -e "${GREEN}✅ HTML 已优化${NC}"
      return 0
    else
      echo -e "${YELLOW}⚠️ HTML 未优化${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW}⚠️ 未找到 HTML 文件${NC}"
    return 1
  fi
}

# Function to generate project report
generate_project_report() {
  local project=$1
  echo ""
  echo "---"
  echo "检查项目: $project"
  echo "---"
  
  check_lazy_loading "$project"
  check_performance_utils "$project"
  check_vite_config "$project"
  check_html_optimization "$project"
}

# Main execution
echo ""
echo "📊 检查所有项目优化状态..."
echo ""

TOTAL_PROJECTS=0
OPTIMIZED_PROJECTS=0

for project in "${PROJECTS[@]}"; do
  TOTAL_PROJECTS=$((TOTAL_PROJECTS + 1))
  generate_project_report "$project"
  
  # Check if all optimizations are in place
  if check_lazy_loading "$project" >/dev/null 2>&1 && \
     check_performance_utils "$project" >/dev/null 2>&1; then
    OPTIMIZED_PROJECTS=$((OPTIMIZED_PROJECTS + 1))
  fi
done

echo ""
echo "================================"
echo " 检查完成"
echo " 已优化项目: $OPTIMIZED_PROJECTS / $TOTAL_PROJECTS"
echo "================================"

# Generate summary report
SUMMARY_FILE="$REPORT_DIR/performance-check-$TIMESTAMP.json"
cat > "$SUMMARY_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "totalProjects": $TOTAL_PROJECTS,
  "optimizedProjects": $OPTIMIZED_PROJECTS,
  "projects": [
$(for project in "${PROJECTS[@]}"; do
    echo "    {"
    echo "      \"name\": \"$project\","
    
    if check_lazy_loading "$project" >/dev/null 2>&1; then
      echo "      \"lazyLoading\": true,"
    else
      echo "      \"lazyLoading\": false,"
    fi
    
    if check_performance_utils "$project" >/dev/null 2>&1; then
      echo "      \"performanceUtils\": true,"
    else
      echo "      \"performanceUtils\": false,"
    fi
    
    if check_vite_config "$project" >/dev/null 2>&1; then
      echo "      \"codeSplitting\": true"
    else
      echo "      \"codeSplitting\": false"
    fi
    
    if [[ "$project" == "${PROJECTS[-1]}" ]]; then
      echo "    }"
    else
      echo "    },"
    fi
  done)
  ],
  "recommendations": [
    "定期运行 Lighthouse 性能测试",
    "监控 Core Web Vitals 指标",
    "检查 Bundle 体积变化",
    "验证 Service Worker 更新"
  ]
}
EOF

echo ""
echo "📄 报告已保存: $SUMMARY_FILE"

# Update latest symlink
ln -sf "$SUMMARY_FILE" "$REPORT_DIR/performance-check-latest.json"

# Show summary
echo ""
echo "🔄 下一轮检查将在 30 分钟后执行"
echo "   (实际cron设置: */30 * * * *)"
echo ""
