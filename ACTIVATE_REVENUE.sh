#!/bin/bash
# 收入激活自动化脚本
# 小七生成 - 2026-04-10
# 目标: 75分钟激活全部收入来源

set -e

echo "💰 收入激活自动化"
echo "=================="
echo ""
echo "预估时间: 75分钟"
echo "预估成本: $5"
echo "预期收入: €2,050+/月"
echo ""

# 创建激活日志
LOG="activation-$(date +%Y%m%d-%H%M%S).log"
exec > >("$LOG") 2>>1

echo "开始时间: $(date)"
echo ""

# ====================
# 任务1: Affiliate账号 (20分钟)
# ====================
echo "🎯 任务1: Affiliate账号注册"
echo "------------------------------"

echo ""
echo "DigitalOcean Referral Program:"
echo "  链接: https://www.digitalocean.com/referral-program"
echo "  收益: $25/注册 + 10%循环12个月"
echo "  你需要: 填写邮箱、姓名、网站"
echo "  预填信息: affiliate/digitalocean-pre-filled.txt"
echo ""

echo "ExpressVPN Affiliate:"
echo "  链接: https://www.expressvpn.com/affiliates"
echo "  收益: $13-36/销售，90天Cookie"
echo "  你需要: 填写基本信息，等待审核"
echo ""

echo "Coursera Affiliate:"
echo "  链接: https://www.coursera.support/s/article/360051200151"
echo "  收益: 45%佣金（行业最高）"
echo "  你需要: 申请加入Impact平台"
echo ""

echo "⚡ 快速操作:"
echo "  1. 打开3个链接（并行）"
echo "  2. 复制预填信息粘贴"
echo "  3. 提交申请"
echo "  4. 查收验证邮件"
echo ""
read -p "按Enter完成此任务..."

# ====================
# 任务2: Chrome扩展发布 (10分钟)
# ====================
echo ""
echo "📦 任务2: Chrome扩展发布"
echo "------------------------------"

echo ""
echo "步骤:"
echo "  1. 访问: https://chrome.google.com/webstore/devconsole"
echo "  2. 支付: $5 开发者注册费"
echo "  3. 上传: chrome-extension-v1.0.0.zip"
echo "  4. 填写: 名称、描述、截图"
echo "  5. 提交审核"
echo ""
echo "预估审核: 1-3天"
echo ""

echo "⚡ 快速操作:"
echo "  - 扩展包已准备: chrome-extension-v1.0.0.zip"
echo "  - 描述文案: CHROME_EXTENSION_PUBLISH_GUIDE.md"
echo ""
read -p "按Enter完成此任务..."

# ====================
# 任务3: API扫描器部署 (20分钟)
# ====================
echo ""
echo "🚀 任务3: API扫描器SaaS部署"
echo "------------------------------"

echo ""
echo "平台选择: Railway (推荐) 或 Render"
echo ""
echo "Railway部署:"
echo "  1. 注册: https://railway.app"
echo "  2. 连接GitHub仓库"
echo "  3. 选择项目: ai-agent-projects/products/api-scanner/saas"
echo "  4. 添加环境变量 (见.env.example)"
echo "  5. 部署"
echo ""
echo "Stripe设置:"
echo "  1. 注册: https://stripe.com"
echo "  2. 获取API Key"
echo "  3. 配置Webhook"
echo "  4. 设置定价: Free/Pro/Team"
echo ""
echo "完整指南: products/api-scanner/saas/docs/DEPLOYMENT.md"
echo ""
read -p "按Enter完成此任务..."

# ====================
# 任务4: 数字产品上架 (15分钟)
# ====================
echo ""
echo "💎 任务4: 数字产品上架"
echo "------------------------------"

echo ""
echo "平台: Gumroad (推荐)"
echo "链接: https://gumroad.com"
echo ""
echo "上架产品:"
echo "  1. SOC2合规工具包 ($29)"
echo "      文件: products/security-toolkit/"
echo ""
echo "  2. API安全指南 ($39)"
echo "      内容: content/tech-deep-dives/tech-11-api-security-best-practices.md"
echo ""
echo "  3. 安全审计模板 ($19)"
echo "      文件: products/security-toolkit/02-Security-Audit-Template.md"
echo ""
echo "⚡ 快速操作:"
echo "  - 注册Gumroad"
echo "  - 创建产品"
echo "  - 上传文件"
echo "  - 设置价格"
echo "  - 获取购买链接"
echo ""
read -p "按Enter完成此任务..."

# ====================
# 任务5: Discord付费社区 (10分钟)
# ====================
echo ""
echo "👥 任务5: Discord付费社区"
echo "------------------------------"

echo ""
echo "工具: Stripe + Discord Bot"
echo ""
echo "步骤:"
echo "  1. 配置Stripe订阅产品"
echo "     - Starter: €9/月"
echo "     - Pro: €29/月"
echo "     - Enterprise: €99/月"
echo ""
echo "  2. 部署付费机器人"
echo "     代码: community/discord-bot/"
echo "     功能: 自动角色分配"
echo ""
echo "  3. 设置会员专属频道"
echo "     配置: community/paid-launch/README.md"
echo ""
echo "完整指南: community/paid-launch/"
echo ""
read -p "按Enter完成此任务..."

# ====================
# 总结
# ====================
echo ""
echo "✅ 收入激活完成！"
echo "=================="
echo ""
echo "预计24-72小时内开始产生收入"
echo ""
echo "监控指标:"
echo "  - Affiliate后台点击/转化"
echo "  - Chrome扩展安装数"
echo "  - API扫描器注册数"
echo "  - 数字产品销售"
echo "  - 社区会员增长"
echo ""
echo "日志保存: $LOG"
echo ""
echo "激活时间: $(date)"
