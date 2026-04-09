# Cloudflare Pages 域名紧急修复报告

## 📋 问题摘要

**时间**: 2026-03-21 14:57 GMT+1  
**问题**: 5个Cloudflare Pages/Workers域名DNS解析正常但连接超时

## 🔍 受影响的域名

| 域名 | 项目路径 | Worker名称 | 状态 |
|------|----------|------------|------|
| eucrossborder.com | /root/ai-empire/projects/eucrossborder-api | eucrossborder-api | ❌ 超时 |
| crossbordercalculator.com | /root/ai-empire/projects/amazon-calculator | amazon-calc-api | ❌ 超时 |
| vatcalculator.uk | /root/ai-empire/projects/ukcrossborder-api | ukcrossborder-api | ❌ 超时 |
| importduty-calculator.com | /root/ai-empire/projects/shopify-calculator | shopify-calc-api | ❌ 超时 |
| autax.com | /root/ai-empire/projects/autax-api | autax-api | ❌ 超时 |

## 🔬 根因分析

### 发现的问题

1. **代码存在**: 所有5个项目都有完整的源代码
2. **Worker已部署**: 项目都已部署到Cloudflare Workers (workers.dev子域名可用)
3. **DNS配置正确**: 域名DNS记录指向Cloudflare (172.67.141.76)
4. **关键问题**: **wrangler.toml中缺少自定义域名路由配置**

### 具体证据

所有项目的wrangler.toml中routes部分都被注释掉了：

```toml
# [[routes]]
# pattern = "eucrossborder.com"
# custom_domain = true
```

这导致：
- Workers只能通过 `*.workers.dev` 访问
- 自定义域名DNS指向Cloudflare，但没有路由到对应的Worker
- 结果：连接超时

## 🛠️ 修复方案

### 方案1: 自动修复 (推荐)

运行修复脚本：

```bash
cd /root/.openclaw/workspace

# 1. 先登录Cloudflare
npx wrangler login

# 2. 运行修复脚本
./fix-cloudflare-domains.sh
```

脚本将自动：
1. 为每个项目更新wrangler.toml，添加routes配置
2. 重新部署所有Workers到自定义域名
3. 验证部署状态

### 方案2: 手动修复

如果不想使用脚本，可以手动修复每个项目：

```bash
# 以 eucrossborder-api 为例
cd /root/ai-empire/projects/eucrossborder-api

# 备份原配置
cp wrangler.toml wrangler.toml.bak

# 编辑wrangler.toml，取消routes注释并更新域名
cat > wrangler.toml << 'EOF'
name = "eucrossborder-api"
main = "src/index.ts"
compatibility_date = "2024-03-19"
account_id = "887661eb67cb99034bfc3f9bfef805c8"

[[routes]]
pattern = "eucrossborder.com"
custom_domain = true

[[routes]]
pattern = "*.eucrossborder.com"
custom_domain = true

[vars]
ENVIRONMENT = "production"
EOF

# 部署
npx wrangler deploy
```

对其他4个项目重复上述步骤。

## 📁 项目代码位置

| 域名 | 代码位置 | 说明 |
|------|----------|------|
| eucrossborder.com | /root/ai-empire/projects/eucrossborder-api | 完整API+Landing Page |
| crossbordercalculator.com | /root/ai-empire/projects/amazon-calculator | 简化版FBA计算器 |
| vatcalculator.uk | /root/ai-empire/projects/ukcrossborder-api | UK VAT计算器 |
| importduty-calculator.com | /root/ai-empire/projects/shopify-calculator | Shopify费用计算器 |
| autax.com | /root/ai-empire/projects/autax-api | 澳洲税务API |

## ✅ 验证修复

修复后验证命令：

```bash
# 检查HTTP响应
curl -I https://eucrossborder.com
curl -I https://crossbordercalculator.com
curl -I https://vatcalculator.uk
curl -I https://importduty-calculator.com
curl -I https://autax.com

# 期望结果: HTTP 200 OK
```

## 📝 后续建议

1. **监控**: 修复后建议设置Uptime监控
2. **备份**: 所有wrangler.toml已自动备份为 `.bak` 文件
3. **文档**: 建议在项目中添加DEPLOY.md记录部署流程
4. **CI/CD**: 考虑设置GitHub Actions自动部署

## 🔐 注意事项

- 运行修复前需要 `npx wrangler login` 登录Cloudflare
- 所有项目使用相同的Cloudflare Account ID: `887661eb67cb99034bfc3f9bfef805c8`
- 修复过程可能需要2-3分钟
- DNS传播可能需要几分钟到几小时
