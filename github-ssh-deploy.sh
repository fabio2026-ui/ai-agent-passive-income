#!/bin/bash
# GitHub SSH部署脚本
# 用户: fabio2026-ui

echo "🚀 GitHub SSH部署"
echo "=================="
echo ""

# 配置
GITHUB_USER="fabio2026-ui"
REPO_NAME="ai-agent-passive-income"
PROJECT_DIR="/root/.openclaw/workspace/ai-agent-projects"

echo "👤 GitHub用户: $GITHUB_USER"
echo "📁 仓库名称: $REPO_NAME"
echo ""

# 检查SSH
echo "🔑 检查SSH配置..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ SSH认证成功"
else
    echo "❌ SSH认证失败"
    exit 1
fi

# 检查仓库是否存在
echo ""
echo "📋 检查仓库..."
if git ls-remote git@github.com:$GITHUB_USER/$REPO_NAME.git 2>/dev/null | grep -q "HEAD"; then
    echo "✅ 仓库已存在"
    REPO_EXISTS=true
else
    echo "⚠️  仓库不存在，需要创建"
    REPO_EXISTS=false
fi

echo ""
echo "🎯 下一步操作"
echo "-------------"

if [ "$REPO_EXISTS" = false ]; then
    echo ""
    echo "选项1: 快速创建仓库 (推荐)"
    echo "--------------------------"
    echo "1. 访问以下链接创建仓库:"
    echo ""
    echo "   https://github.com/new"
    echo ""
    echo "2. 填写信息:"
    echo "   仓库名称: $REPO_NAME"
    echo "   描述: AI Agent被动收入系统 - 全自动内容生成与变现"
    echo "   公开/私有: 公开"
    echo "   不要勾选 README 或 .gitignore"
    echo ""
    echo "3. 创建后，运行以下命令推送:"
    echo ""
    echo "   cd $PROJECT_DIR"
    echo "   git remote add origin git@github.com:$GITHUB_USER/$REPO_NAME.git"
    echo "   git push -u origin master"
    echo ""
    
    echo "选项2: 使用Bundle导入"
    echo "---------------------"
    echo "1. 访问: https://github.com/new/import"
    echo "2. 选择 'Upload an existing repository'"
    echo "3. 上传文件: /root/.openclaw/workspace/ai-agent-passive-income.bundle"
    echo ""
fi

echo ""
echo "📦 已准备的文件"
echo "---------------"
echo "Bundle文件: /root/.openclaw/workspace/ai-agent-passive-income.bundle (1.6MB)"
echo "包含: 完整Git历史 + 8篇文章 + 所有代码"
echo ""

echo "🔗 有用的链接"
echo "-------------"
echo "创建仓库: https://github.com/new"
echo "导入仓库: https://github.com/new/import"
echo "SSH密钥: https://github.com/settings/keys"
echo ""

# 创建一键推送脚本
cat > $PROJECT_DIR/push-to-github.sh <<EOF
#!/bin/bash
# 一键推送到GitHub

cd $PROJECT_DIR
git remote add origin git@github.com:$GITHUB_USER/$REPO_NAME.git 2>/dev/null || true
git push -u origin master --force

echo ""
echo "✅ 推送完成!"
echo "仓库地址: https://github.com/$GITHUB_USER/$REPO_NAME"
EOF

chmod +x $PROJECT_DIR/push-to-github.sh

echo "✅ 已创建推送脚本: $PROJECT_DIR/push-to-github.sh"
echo ""
echo "仓库创建后，运行: ./push-to-github.sh"
