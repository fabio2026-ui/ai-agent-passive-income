#!/bin/bash
# GitHub Pages 部署脚本

echo "🚀 GitHub Pages 部署"
echo "==================="
echo ""

cd /root/.openclaw/workspace/contentai/final-deploy

# 初始化git
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "ContentAI MVP v1.0"
fi

# 创建gh-pages分支
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

echo "📦 准备完成！"
echo ""
echo "⚠️  需要完成以下步骤:"
echo ""
echo "方式1: 使用GitHub CLI (推荐)"
echo "  1. 安装: npm install -g gh"
echo "  2. 登录: gh auth login"
echo "  3. 创建仓库: gh repo create contentai-mvp --public"
echo "  4. 推送: git push -u origin gh-pages"
echo ""
echo "方式2: 手动推送"
echo "  1. 在GitHub创建仓库: github.com/new"
echo "  2. 仓库名: contentai-mvp"
echo "  3. 执行:"
echo "     git remote add origin https://github.com/YOUR_USERNAME/contentai-mvp.git"
echo "     git push -u origin gh-pages"
echo "  4. 在仓库设置中启用GitHub Pages"
echo ""
echo "方式3: 最简单 - 直接上传"
echo "  1. 访问 github.com/new"
echo "  2. 创建仓库 contentai-mvp"
echo "  3. 上传 final-deploy/ 中的所有文件"
echo "  4. 设置 > Pages > 启用"
echo ""
