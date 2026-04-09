# Etsy费用计算器

精准计算Etsy平台所有费用，支持15+国家，提供定价建议。

## 功能特性

- ✅ **完整费用计算**
  - 上架费 (Listing Fee)
  - 交易费 (6.5%)
  - 支付处理费 (各国不同，美国3%+$0.25)
  - 监管费 (欧盟/英国等0.4%-2.24%)
  - Etsy广告费 (可选，12-15%)

- ✅ **支持15+国家**
  - 美国、英国、德国、法国、意大利、西班牙、荷兰
  - 加拿大、澳大利亚、日本、新加坡、瑞典
  - 波兰、巴西、墨西哥

- ✅ **智能定价建议**
  - 根据成本和目标利润计算建议售价
  - 显示盈亏平衡价格
  - 支持手动测试指定售价

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **部署**: Cloudflare Pages

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 部署到Cloudflare Pages

### 方式1: 通过Wrangler CLI

```bash
# 安装Wrangler
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 部署
wrangler pages deploy dist
```

### 方式2: 通过Git集成

1. 将代码推送到GitHub/GitLab
2. 在Cloudflare Dashboard创建Pages项目
3. 连接Git仓库
4. 构建设置:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. 点击部署

### 方式3: 直接上传

1. 运行 `npm run build` 生成 `dist` 目录
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 Pages → 创建项目 → 直接上传
4. 上传 `dist` 文件夹内容

## 费用说明

| 费用类型 | 费率 | 说明 |
|---------|------|------|
| 上架费 | $0.20 | 每件商品上架收取，4个月有效期 |
| 交易费 | 6.5% | 基于售价+运费 |
| 支付处理费 | 2.5-4% + 固定费 | 各国不同 |
| 监管费 | 0-2.24% | 英国/欧盟等国家 |
| 广告费 | 12-15% | 可选，通过Etsy广告产生的订单 |

## 参考文档

- [Etsy Seller Fees](https://www.etsy.com/seller-handbook/article/fees-on-etsy/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

## License

MIT
