#!/bin/bash
# GitHub Pages 修复脚本
# 运行此脚本检查并修复部署

echo "🔍 检查 GitHub Pages 状态..."

# 检查 gh-pages 分支是否存在
if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
    echo "✅ gh-pages 分支存在"
else
    echo "❌ gh-pages 分支不存在，正在创建..."
    git checkout --orphan gh-pages
    git rm -rf .
    cp /root/.openclaw/workspace/ai-agent-projects/products/api-scanner/saas/frontend/*.html .
    git add .
    git commit -m "Deploy to GitHub Pages"
    git push origin gh-pages
fi

# 显示当前分支内容
echo ""
echo "📁 gh-pages 分支内容:"
git ls-tree origin/gh-pages

echo ""
echo "✅ 文件已就绪"
echo ""
echo "⚠️  现在需要你在 GitHub 上完成最后一步:"
echo ""
echo "1. 访问: https://github.com/fabio2026-ui/ai-agent-passive-income/settings/pages"
echo ""
echo "2. 在 'Build and deployment' 部分:"
echo "   Source: Deploy from a branch"
echo "   Branch: gh-pages / (root)"
echo ""
echo "3. 点击 'Save'"
echo ""
echo "4. 等待 2-5 分钟"
echo ""
echo "5. 访问: https://fabio2026-ui.github.io/ai-agent-passive-income"
echo ""
echo "📧 配置自定义域名:"
echo "   Custom domain: scanner.eucrossborder.com"
echo "   ✅ Enforce HTTPS"
