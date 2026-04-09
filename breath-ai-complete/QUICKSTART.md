# Breath AI 快速开始

## 🚀 5分钟启动指南

### 1. 安装依赖 (1分钟)

```bash
cd breath-ai-complete

# 安装所有依赖
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. 配置环境变量 (1分钟)

创建前端环境文件:
```bash
cd ../frontend
cp .env.example .env
```

编辑 `.env`:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_你的测试密钥
VITE_API_URL=http://localhost:8787
```

**注意**: 如果不配置 Stripe，支付功能将无法使用，但其他功能仍然可用。

### 3. 启动开发服务器 (2分钟)

**终端 1 - 启动后端:**
```bash
cd backend
npm run dev
```
后端将在 http://localhost:8787 启动

**终端 2 - 启动前端:**
```bash
cd frontend
npm run dev
```
前端将在 http://localhost:5173 启动

### 4. 开始使用 (1分钟)

1. 打开浏览器访问 http://localhost:5173
2. 点击"呼吸"开始基础练习
3. 点击"心率"连接蓝牙设备 (需 Chrome/Edge)
4. AI 会根据心率自动推荐呼吸模式

## 📱 功能测试

### 测试呼吸练习
- 点击底部"呼吸"标签
- 选择呼吸模式
- 点击播放按钮开始

### 测试心率监测
- 需要 Chrome 或 Edge 浏览器
- 需要蓝牙心率设备 (或模拟器)
- 点击"心率"标签 → "连接"

### 测试双人同步
- 需要两个浏览器窗口
- 订阅家庭版
- 一个创建房间，另一个加入

## 🔧 常见问题

### 问题: 前端无法连接到后端
**解决**: 检查 `frontend/.env` 中的 `VITE_API_URL` 是否正确

### 问题: Stripe 支付失败
**解决**: 配置正确的 Stripe 测试密钥，或使用测试卡号 `4242 4242 4242 4242`

### 问题: 蓝牙无法连接
**解决**: 
- 确保使用 Chrome 或 Edge
- 确保使用 HTTPS (localhost 除外)
- 检查设备是否支持标准心率服务

### 问题: 双人同步连接失败
**解决**: 检查网络连接，确保没有防火墙阻挡

## 📝 下一步

1. **配置 Stripe**: 创建账户并获取 API 密钥
2. **部署后端**: 使用 Cloudflare Workers
3. **部署前端**: 使用 Vercel/Netlify/Cloudflare Pages

详细说明请参考:
- `README.md` - 完整项目说明
- `DEPLOY.md` - 部署指南
- `DEVELOPMENT.md` - 开发文档

## 🎉 恭喜!

你已经成功启动了 Breath AI 开发环境!

现在可以:
- 修改代码并实时预览
- 测试所有差异化功能
- 准备生产部署

有问题? 查看 `DEVELOPMENT.md` 中的故障排除部分。
