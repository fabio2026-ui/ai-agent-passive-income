# API聚合器订阅服务 - 开发计划

## 项目概述
- **目标**: 将12个税务API打包成统一接口
- **定价**: €29/月订阅
- **特性**: 多租户管理、速率限制、API密钥认证
- **技术栈**: Cloudflare Workers + Stripe订阅管理
- **时间线**: 1天完成MVP

## 目录结构
```
tax-api-aggregator/
├── src/
│   ├── index.ts              # 主入口
│   ├── router.ts             # 路由处理
│   ├── auth.ts               # 认证中间件
│   ├── api-clients/          # 12个税务API客户端
│   ├── handlers/             # API处理器
│   └── types.ts              # TypeScript类型
├── worker-configuration.d.ts # Cloudflare Workers类型
├── wrangler.toml             # Cloudflare配置
├── package.json
├── tsconfig.json
└── README.md
```

## 12个税务API模块
1. 增值税(VAT)计算
2. 企业所得税查询
3. 个人所得税计算
4. 关税查询
5. 消费税计算
6. 房产税查询
7. 印花税计算
8. 车船税查询
9. 资源税计算
10. 土地增值税查询
11. 城镇土地使用税
12. 环境保护税计算

## 数据库结构 (D1)
- tenants: 租户信息
- subscriptions: 订阅信息
- api_keys: API密钥管理
- usage_logs: 使用日志

## 订阅管理 (Stripe)
- Checkout Session创建
- Webhook处理订阅状态
- 客户门户管理

## 待办任务
- [x] 初始化项目
- [x] 创建基础架构
- [x] 实现认证系统
- [x] 实现12个税务API处理器
- [x] 集成Stripe订阅
- [x] 添加速率限制
- [x] 编写API文档
- [x] 创建Postman集合
- [x] 创建测试脚本
- [x] 编写部署文档

## 项目统计
- 源代码文件: 8个
- 总代码行数: ~2500行
- API端点: 17个
- 数据库表: 3个

## 部署步骤
1. 运行 `./deploy.sh` 或直接执行:
   ```bash
   npm install
   wrangler d1 create tax-api-db
   wrangler d1 migrations apply tax-api-db
   wrangler secret put STRIPE_SECRET_KEY
   wrangler secret put STRIPE_WEBHOOK_SECRET
   wrangler secret put JWT_SECRET
   wrangler deploy
   ```
2. 配置Stripe Webhook指向 `/webhooks/stripe`
3. 创建€29/月的产品定价
4. 测试API端点
