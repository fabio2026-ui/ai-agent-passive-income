#!/bin/bash
# GitHub快速部署脚本
# 用户手动执行或提供Token后自动执行

set -e

echo "🚀 GitHub部署脚本"
echo "=================="
echo ""

# 配置
REPO_NAME="ai-agent-passive-income"
GITHUB_USERNAME=""  # 用户需要填写

echo "步骤1: 检查GitHub认证"
if ! gh auth status >/dev/null 2>&1; then
    echo "⚠️  未登录GitHub"
    echo ""
    echo "选项A: 交互式登录"
    echo "  gh auth login"
    echo ""
    echo "选项B: 使用Token"
    echo "  export GH_TOKEN='你的GitHub Token'"
    echo "  gh auth login --with-token < <<EOF"
    echo "  \$GH_TOKEN"
    echo "  EOF"
    echo ""
    exit 1
fi

echo "✅ GitHub已认证"
echo ""

# 获取用户名
GITHUB_USERNAME=$(gh api user -q .login)
echo "👤 用户: $GITHUB_USERNAME"
echo ""

# 检查仓库是否存在
echo "步骤2: 检查仓库..."
if gh repo view "$GITHUB_USERNAME/$REPO_NAME" >/dev/null 2>&1; then
    echo "✅ 仓库已存在: $GITHUB_USERNAME/$REPO_NAME"
else
    echo "📝 创建新仓库..."
    gh repo create "$REPO_NAME" --public --description "AI Agent被动收入系统 - 全自动内容生成与变现" --source=. --remote=origin --push
    echo "✅ 仓库已创建"
    exit 0
fi

# 添加remote
echo ""
echo "步骤3: 配置Git Remote..."
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote已配置"
else
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "✅ Remote已添加"
fi

# 推送代码
echo ""
echo "步骤4: 推送代码..."
git push -u origin master || git push -u origin main
echo "✅ 代码已推送"

# 启用GitHub Pages
echo ""
echo "步骤5: 启用GitHub Pages..."
gh api repos/$GITHUB_USERNAME/$REPO_NAME/pages \
  --method POST \
  --input -<<EOF
{
  "source": {
    "branch": "master",
    "path": "/"
  }
}
EOF
echo "✅ GitHub Pages已启用"

echo ""
echo "🎉 部署完成!"
echo ""
echo "访问地址:"
echo "  https://$GITHUB_USERNAME.github.io/$REPO_NAME"
echo ""
echo "GitHub仓库:"
echo "  https://github.com/$GITHUB_USERNAME/$REPO_NAME"
