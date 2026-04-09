#!/bin/bash
# 小七全自动部署脚本
# 无需人工干预，持续执行

echo "🚀 小七全自动执行系统启动"
echo "=============================="
echo ""

WORKSPACE="/root/.openclaw/workspace/ai-agent-projects"
cd "$WORKSPACE"

# 创建必要的目录
mkdir -p content output logs marketing products

# 功能1: 内容生成
generate_content() {
    echo "📝 [$(date)] 开始生成内容..."
    node auto-content-generator.js > "logs/content_$(date +%Y%m%d_%H%M%S).log" 2>&1
    echo "✅ 内容生成完成"
}

# 功能2: 检查系统状态
check_status() {
    echo "📊 [$(date)] 系统状态检查"
    
    # 检查API可用性
    if curl -s https://api.deepseek.com/v1/models -H "Authorization: Bearer $DEEPSEEK_API_KEY" > /dev/null; then
        echo "  ✅ DeepSeek API: 正常"
    else
        echo "  ❌ DeepSeek API: 异常"
    fi
    
    # 检查磁盘空间
    DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | tr -d '%')
    if [ "$DISK_USAGE" -lt 80 ]; then
        echo "  ✅ 磁盘空间: ${DISK_USAGE}% (正常)"
    else
        echo "  ⚠️  磁盘空间: ${DISK_USAGE}% (警告)"
    fi
    
    # 检查生成的内容数量
    CONTENT_COUNT=$(ls -1 content/ 2>/dev/null | wc -l)
    echo "  📄 已生成内容: $CONTENT_COUNT 篇"
}

# 功能3: 自动提交到Git
auto_git_commit() {
    echo "🔄 [$(date)] Git自动提交..."
    
    git add -A
    
    # 检查是否有变更
    if git diff --cached --quiet; then
        echo "  ℹ️  无变更需要提交"
        return
    fi
    
    # 提交
    git commit -m "Auto: Content update $(date '+%Y-%m-%d %H:%M')"
    
    # 尝试推送 (如果有remote)
    if git remote get-url origin > /dev/null 2>&1; then
        git push origin main 2>/dev/null || echo "  ⚠️  推送失败 (无权限)"
    else
        echo "  ℹ️  未配置remote"
    fi
    
    echo "  ✅ Git提交完成"
}

# 功能4: 清理旧日志
cleanup_logs() {
    echo "🧹 [$(date)] 清理旧日志..."
    find logs -name "*.log" -mtime +7 -delete 2>/dev/null
    find content -name "*.md" -mtime +30 -delete 2>/dev/null
    echo "  ✅ 清理完成"
}

# 功能5: 生成状态报告
generate_report() {
    echo "📈 [$(date)] 生成状态报告..."
    
    REPORT_FILE="output/status_report_$(date +%Y%m%d).md"
    
    cat > "$REPORT_FILE" << EOF
# 小七AI Agent 执行报告
**生成时间**: $(date)

## 系统状态
- 运行模式: 全自动
- 当前主机: $(hostname)
- 工作目录: $WORKSPACE

## 内容产出
- 总文章数: $(ls -1 content/ 2>/dev/null | wc -l)
- 今日新增: $(find content -name "*.md" -mtime -1 2>/dev/null | wc -l)
- 总推文数: $(ls -1 marketing/ 2>/dev/null | wc -l)

## Git状态
$(git status --short 2>/dev/null || echo "未初始化")

## 下一步任务
- [ ] 审核新生成的内容
- [ ] 发布到社交媒体
- [ ] 追踪用户反馈
- [ ] 优化转化率

---
*自动生成 by 小七AI Agent*
EOF

    echo "  ✅ 报告已保存: $REPORT_FILE"
}

# 主执行循环
main_loop() {
    echo "🔄 主执行循环启动 (每30分钟执行一次)"
    echo "按 Ctrl+C 停止"
    echo ""
    
    while true; do
        echo ""
        echo "=============================="
        echo "⏰ 执行周期: $(date)"
        echo "=============================="
        
        check_status
        generate_content
        auto_git_commit
        generate_report
        
        # 每小时清理一次日志
        if [ $(date +%H) -eq 0 ] && [ $(date +%M) -lt 30 ]; then
            cleanup_logs
        fi
        
        echo ""
        echo "😴 休眠30分钟..."
        sleep 1800
    done
}

# 单次执行模式
single_run() {
    echo "▶️  单次执行模式"
    check_status
    generate_content
    auto_git_commit
    generate_report
    echo ""
    echo "✅ 单次执行完成"
}

# 命令行参数处理
case "${1:-}" in
    loop)
        main_loop
        ;;
    status)
        check_status
        ;;
    content)
        generate_content
        ;;
    git)
        auto_git_commit
        ;;
    report)
        generate_report
        ;;
    *)
        echo "小七全自动执行系统"
        echo ""
        echo "用法: $0 [命令]"
        echo ""
        echo "命令:"
        echo "  loop     - 持续循环执行 (每30分钟)"
        echo "  status   - 检查系统状态"
        echo "  content  - 立即生成内容"
        echo "  git      - 立即提交Git"
        echo "  report   - 生成状态报告"
        echo ""
        echo "示例:"
        echo "  $0 loop    # 启动全自动模式"
        echo "  $0 content # 只生成一次内容"
        echo ""
        
        # 默认执行单次
        single_run
        ;;
esac
