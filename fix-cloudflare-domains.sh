#!/bin/bash
# Cloudflare Pages/Workers 域名修复脚本
# 问题：5个域名DNS解析正常但连接超时
# 原因：Workers已部署但未绑定自定义域名
# 修复方案：更新wrangler.toml添加routes配置并重新部署

echo "========================================="
echo "Cloudflare 域名修复脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECTS_DIR="/root/ai-empire/projects"

# 域名到项目的映射
declare -A DOMAIN_MAP
declare -A WORKER_MAP

DOMAIN_MAP["eucrossborder.com"]="eucrossborder-api"
DOMAIN_MAP["crossbordercalculator.com"]="amazon-calculator"
DOMAIN_MAP["vatcalculator.uk"]="ukcrossborder-api"
DOMAIN_MAP["importduty-calculator.com"]="shopify-calculator"
DOMAIN_MAP["autax.com"]="autax-api"

WORKER_MAP["eucrossborder-api"]="eucrossborder-api"
WORKER_MAP["amazon-calculator"]="amazon-calc-api"
WORKER_MAP["ukcrossborder-api"]="ukcrossborder-api"
WORKER_MAP["shopify-calculator"]="shopify-calc-api"
WORKER_MAP["autax-api"]="autax-api"

echo "检测到以下域名-项目映射："
echo "-----------------------------------------"
for domain in "${!DOMAIN_MAP[@]}"; do
    project="${DOMAIN_MAP[$domain]}"
    worker="${WORKER_MAP[$project]}"
    echo -e "${GREEN}$domain${NC} -> $project (Worker: $worker)"
done
echo ""

# 检查wrangler认证状态
echo "检查Cloudflare认证状态..."
if ! npx wrangler whoami &>/dev/null; then
    echo -e "${RED}错误: 未登录Cloudflare${NC}"
    echo "请运行: npx wrangler login"
    echo ""
    echo "手动修复步骤:"
    echo "1. 运行 npx wrangler login 登录"
    echo "2. 运行此脚本进行自动修复"
    exit 1
fi

echo -e "${GREEN}已登录Cloudflare${NC}"
echo ""

# 修复每个项目
echo "开始修复项目..."
echo "========================================="

for domain in "${!DOMAIN_MAP[@]}"; do
    project="${DOMAIN_MAP[$domain]}"
    worker="${WORKER_MAP[$project]}"
    project_path="$PROJECTS_DIR/$project"
    
    echo ""
    echo "修复: $domain"
    echo "项目路径: $project_path"
    
    if [ ! -d "$project_path" ]; then
        echo -e "${RED}错误: 项目目录不存在 $project_path${NC}"
        continue
    fi
    
    cd "$project_path" || continue
    
    # 备份原配置
    if [ ! -f "wrangler.toml.bak" ]; then
        cp wrangler.toml wrangler.toml.bak
        echo "已备份 wrangler.toml"
    fi
    
    # 更新wrangler.toml添加routes
    cat > wrangler.toml << EOF
name = "$worker"
main = "src/index.ts"
compatibility_date = "2024-03-19"
account_id = "887661eb67cb99034bfc3f9bfef805c8"

# 自定义域名路由
[[routes]]
pattern = "$domain"
custom_domain = true

[[routes]]
pattern = "*.$domain"
custom_domain = true

[vars]
ENVIRONMENT = "production"
EOF
    
    echo -e "${GREEN}已更新 wrangler.toml${NC}"
    
    # 部署Worker
    echo "正在部署Worker: $worker ..."
    if npx wrangler deploy; then
        echo -e "${GREEN}✓ $domain 部署成功${NC}"
    else
        echo -e "${RED}✗ $domain 部署失败${NC}"
    fi
done

echo ""
echo "========================================="
echo "修复完成"
echo "========================================="
echo ""
echo "验证命令:"
for domain in "${!DOMAIN_MAP[@]}"; do
    echo "  curl -I https://$domain"
done
