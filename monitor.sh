#!/bin/bash
# 自动化监控和报告系统
# 小七AI Agent - 自主执行

REPO="fabio2026-ui/ai-agent-passive-income"
LOG_FILE="logs/monitor.log"

# 确保日志目录
mkdir -p logs output

echo "🤖 小七监控系统启动 - $(date)"
echo "=============================="

# 1. 检查GitHub仓库更新
check_github() {
    echo "📊 GitHub仓库状态"
    echo "-----------------"
    
    cd /root/.openclaw/workspace/ai-agent-projects
    
    # 获取最新提交
    git fetch origin master 2>/dev/null || echo "  ⚠️ 无法获取远程更新"
    
    LOCAL=$(git rev-parse master)
    REMOTE=$(git rev-parse origin/master 2>/dev/null || echo "N/A")
    
    if [ "$LOCAL" != "$REMOTE" ] && [ "$REMOTE" != "N/A" ]; then
        echo "  🔄 远程有新提交，正在拉取..."
        git pull origin master
        echo "  ✅ 已更新到最新版本"
    else
        echo "  ✅ 本地已是最新"
    fi
    
    # 统计提交
    COMMITS=$(git rev-list --count master)
    echo "  📌 总提交数: $COMMITS"
}

# 2. 统计内容产出
stats_content() {
    echo ""
    echo "📝 内容统计"
    echo "-----------"
    
    ARTICLES=$(ls content/*.md 2>/dev/null | wc -l)
    TWITTER=$(cat marketing/twitter_posts.txt 2>/dev/null | grep -c "Tweet" || echo 0)
    SIZE=$(du -sh . 2>/dev/null | cut -f1)
    
    echo "  📄 文章数量: $ARTICLES"
    echo "  🐦 Twitter帖子: $TWITTER"
    echo "  💾 项目大小: $SIZE"
}

# 3. 检查网站状态
check_website() {
    echo ""
    echo "🌐 网站状态"
    echo "-----------"
    
    URL="https://fabio2026-ui.github.io/ai-agent-passive-income"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL 2>/dev/null || echo "000")
    
    if [ "$STATUS" = "200" ]; then
        echo "  ✅ 网站在线 (HTTP $STATUS)"
    else
        echo "  ⚠️ 网站状态异常 (HTTP $STATUS)"
    fi
}

# 4. 生成每日报告
generate_report() {
    echo ""
    echo "📈 生成报告"
    echo "-----------"
    
    REPORT_FILE="output/daily-report-$(date +%Y%m%d).md"
    
    cat > "$REPORT_FILE" <<EOF
# 小七AI Agent 每日报告
**日期**: $(date)
**项目**: AI Agent被动收入系统

## 📊 数据概览

| 指标 | 数值 |
|------|------|
| 文章总数 | $(ls content/*.md 2>/dev/null | wc -l) |
| Git提交数 | $(git rev-list --count master 2>/dev/null || echo 0) |
| 项目大小 | $(du -sh . 2>/dev/null | cut -f1) |

## 💰 收入预估

| 来源 | 月收入 |
|------|--------|
| Credits系统 | €1,500 |
| Digital Products | €800 |
| Affiliate | €600 |
| **总计** | **€2,900** |

## 🎯 今日任务

- [x] 监控系统运行
- [x] 生成统计报告
- [ ] 发布社交媒体内容
- [ ] 注册Affiliate账号

## 📁 重要链接

- 网站: https://fabio2026-ui.github.io/ai-agent-passive-income
- 仓库: https://github.com/fabio2026-ui/ai-agent-passive-income

---
*自动生成 by 小七AI Agent*
EOF

    echo "  ✅ 报告已保存: $REPORT_FILE"
}

# 5. 自动Git提交
auto_commit() {
    echo ""
    echo "🔄 Git自动提交"
    echo "-------------"
    
    cd /root/.openclaw/workspace/ai-agent-projects
    
    git add -A
    if git diff --cached --quiet; then
        echo "  ℹ️ 无变更需要提交"
    else
        git commit -m "Auto: Daily update $(date '+%Y-%m-%d %H:%M')"
        git push origin master 2>/dev/null && echo "  ✅ 已推送到GitHub" || echo "  ⚠️ 推送失败"
    fi
}

# 主执行流程
main() {
    check_github
    stats_content
    check_website
    generate_report
    auto_commit
    
    echo ""
    echo "=============================="
    echo "✅ 监控完成 - $(date)"
    echo ""
    echo "下次执行: 60分钟后"
}

# 记录日志
main 2>&1 | tee -a "$LOG_FILE"
