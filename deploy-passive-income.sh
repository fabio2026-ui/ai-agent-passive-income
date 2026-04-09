#!/bin/bash
# 被动收入系统自动部署脚本
# 一键部署所有资产

set -e

echo "🚀 CodeGuard 被动收入系统部署"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查GitHub仓库
REPOS=(
    "security-scanner-cli"
    "codeguard-extension"
)

echo "📦 检查GitHub仓库..."
for repo in "${REPOS[@]}"; do
    if git ls-remote "git@github.com:fabio2026-ui/$repo.git" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $repo 已存在"
    else
        echo -e "${YELLOW}!${NC} $repo 需要创建"
        echo "   访问: https://github.com/new?name=$repo"
    fi
done

echo ""
echo "🔗 推送项目到GitHub..."

# 推送CLI
if [ -d "/root/.openclaw/workspace/security-scanner-cli" ]; then
    cd /root/.openclaw/workspace/security-scanner-cli
    if git remote | grep -q origin; then
        echo -e "${GREEN}✓${NC} security-scanner-cli 已配置远程"
    else
        git remote add origin "git@github.com:fabio2026-ui/security-scanner-cli.git"
    fi
    git push -u origin main 2>/dev/null && echo -e "${GREEN}✓${NC} security-scanner-cli 已推送" || echo -e "${RED}✗${NC} security-scanner-cli 推送失败"
fi

# 推送Extension
if [ -d "/root/.openclaw/workspace/codeguard-extension" ]; then
    cd /root/.openclaw/workspace/codeguard-extension
    if git remote | grep -q origin; then
        echo -e "${GREEN}✓${NC} codeguard-extension 已配置远程"
    else
        git remote add origin "git@github.com:fabio2026-ui/codeguard-extension.git"
    fi
    git push -u origin main 2>/dev/null && echo -e "${GREEN}✓${NC} codeguard-extension 已推送" || echo -e "${RED}✗${NC} codeguard-extension 推送失败"
fi

echo ""
echo "☁️  检查Cloudflare部署状态..."

URLS=(
    "https://codeguard-landing.pages.dev"
    "https://mcp-marketplace.pages.dev"
    "https://contentai-landing.pages.dev"
    "https://fabio2026-ui.github.io/codeguard-blog"
)

for url in "${URLS[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓${NC} $url (Online)"
    else
        echo -e "${YELLOW}!${NC} $url (Status: $status)"
    fi
done

echo ""
echo "📊 被动收入系统状态"
echo "==================="
echo ""
echo "✅ 已完成的资产:"
echo "   • 23篇SEO文章"
echo "   • 5个Reddit帖子模板"
echo "   • 4套Twitter内容"
echo "   • 1个Lead Magnet系统"
echo "   • Chrome扩展代码"
echo "   • 开源CLI代码"
echo ""
echo "🟡 待完成的设置:"
echo "   • 注册Affiliate账号 (Snyk, 1Password)"
echo "   • 创建GitHub仓库 (2个)"
echo "   • 提交Chrome扩展到商店"
echo "   • 设置邮件自动化"
echo ""
echo "💰 预期收入: €300-1750/月"
echo ""
echo "下一步: 完成上述🟡任务后，系统将自动运转"

# 创建收入追踪文件
mkdir -p /root/.openclaw/workspace/income-tracking
cat > /root/.openclaw/workspace/income-tracking/$(date +%Y-%m).md << EOF
# 收入追踪 - $(date +%Y年%m月)

## 目标: €300

## Affiliate收入
- [ ] Snyk: €0
- [ ] 1Password: €0
- [ ] Cloudflare: €0
- [ ] DigitalOcean: €0
- [ ] Auth0: €0

## 产品收入
- [ ] CodeGuard AI: €0

## 其他
- [ ] BuyMeACoffee: €0

## 总计: €0 / €300
EOF

echo ""
echo "✅ 收入追踪表已创建"
echo "📁 位置: /root/.openclaw/workspace/income-tracking/$(date +%Y-%m).md"