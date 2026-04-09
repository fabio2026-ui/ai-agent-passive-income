# ContentAI 部署清单

## 前置准备

- [ ] 已注册 Cloudflare 账号
- [ ] 已安装 Node.js (v18+)
- [ ] 已安装 Wrangler CLI
- [ ] 已注册以下服务账号:
  - [ ] Moonshot AI (https://platform.moonshot.cn/)
  - [ ] Coinbase Commerce (https://commerce.coinbase.com/)
  - [ ] Resend (https://resend.com/)
  - [ ] (可选) NowPayments
  - [ ] (可选) Reddit App
  - [ ] (可选) Twitter Developer

## 第一步：配置环境

- [ ] 复制 `.env.example` 为 `.env`
- [ ] 填入所有 API 密钥到 `.env`
- [ ] 更新 `wrangler.toml` 中的 `APP_URL`
- [ ] 更新 `wrangler.toml` 中的域名配置

## 第二步：创建数据库

- [ ] 运行 `npx wrangler d1 create contentai-db`
- [ ] 复制返回的 database_id
- [ ] 更新 `wrangler.toml` 中的 `database_id`
- [ ] 运行 `npx wrangler d1 execute contentai-db --file=./scripts/schema.sql`

## 第三步：配置支付 Webhook

### Coinbase Commerce
- [ ] 登录 https://commerce.coinbase.com/settings
- [ ] 添加 Webhook URL: `https://your-domain.com/webhook/coinbase`
- [ ] 复制 Webhook Secret
- [ ] 更新到 `wrangler.toml`

### NowPayments (如使用)
- [ ] 登录 https://account.nowpayments.io/
- [ ] 设置 IPN URL: `https://your-domain.com/webhook/nowpayments`
- [ ] 复制 IPN Secret
- [ ] 更新到 `wrangler.toml`

## 第四步：部署

- [ ] 运行 `npm install`
- [ ] 运行 `npx wrangler deploy`
- [ ] 记录部署后的 Workers URL

## 第五步：自定义域名 (可选)

- [ ] 在 Cloudflare Dashboard 添加自定义域名
- [ ] 配置 DNS 记录指向 Workers
- [ ] 更新 `wrangler.toml` 中的 `APP_URL`

## 第六步：测试

- [ ] 访问首页 `https://your-domain.com/`
- [ ] 创建测试订单
- [ ] 检查邮箱是否收到确认邮件
- [ ] 使用 Coinbase 测试模式完成支付
- [ ] 确认订单状态变为 "paid"
- [ ] 等待 5-10 分钟，确认内容生成
- [ ] 检查邮箱是否收到内容
- [ ] 验证完整流程

## 第七步：生产配置

- [ ] 将 Coinbase 切换到生产模式
- [ ] 更新所有 API 密钥为生产环境
- [ ] 配置监控告警
- [ ] 设置定期数据库备份

## 第八步：获客启动

- [ ] 配置 Reddit API 密钥
- [ ] 测试 Reddit 自动发帖
- [ ] 配置 Twitter API 密钥
- [ ] 测试 Twitter 自动发布
- [ ] 设置定时任务 (Cron Trigger)

## 故障排查

### 订单未处理
1. 检查 Workers 日志: `npx wrangler tail`
2. 查看数据库订单状态
3. 检查定时任务是否正常运行

### 支付未到账
1. 检查 Webhook URL 配置
2. 查看 Webhook 日志
3. 验证签名配置

### 邮件未发送
1. 检查 Resend API 密钥
2. 查看邮件发送记录表
3. 检查邮箱域名验证状态

### AI 生成失败
1. 检查 Moonshot API 密钥
2. 查看生成记录表的错误信息
3. 检查 API 额度

## 安全建议

- [ ] 定期轮换 API 密钥
- [ ] 启用 Cloudflare DDoS 防护
- [ ] 监控异常订单模式
- [ ] 设置数据库访问限制

## 性能优化

- [ ] 启用 Cloudflare Cache
- [ ] 配置合适的 D1 查询索引
- [ ] 监控 Workers CPU 使用时间
- [ ] 优化图片和静态资源

## 完成部署 🎉

所有步骤完成后，你就拥有了一个全自动运行的 AI 内容生成系统！

---

**记住**: 系统会自动处理订单，但你应该定期:
- 查看订单和收入统计
- 监控 AI 生成质量
- 调整获客内容策略
- 更新系统和依赖
