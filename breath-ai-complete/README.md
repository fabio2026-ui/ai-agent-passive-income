# Breath AI - 智能呼吸应用

一款具有竞争力的智能呼吸练习应用，集成心率监测、AI情绪适配、真实支付和双人同步功能。

## 🌟 核心功能

### 1. Apple Watch/智能手表心率同步
- 使用 Web Bluetooth API 连接智能手表
- 实时读取心率数据
- 心率变异性 (HRV) 计算
- 压力水平检测

### 2. AI 情绪适配引擎
- 根据实时心率自动选择呼吸模式
- 压力检测算法
- 个性化推荐
- 智能洞察

### 3. 真实支付系统
- Stripe 集成
- 订阅管理
- 一键取消（透明定价）
- 支持支付宝、微信支付、信用卡

### 4. 双人同步模式
- WebRTC 实时同步
- 情侣/亲子共同练习
- 实时心率共享
- 内置聊天功能

## 🛠 技术栈

- **前端**: React + TypeScript + Tailwind CSS + Vite
- **后端**: Cloudflare Workers + Stripe API
- **AI**: 规则引擎（基于心率区间）
- **通信**: Web Bluetooth API + WebRTC
- **图表**: Recharts

## 📦 安装和运行

### 前置要求
- Node.js 18+
- npm 或 yarn
- Cloudflare 账户（用于后端）
- Stripe 账户（用于支付）

### 1. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install
```

### 2. 配置环境变量

**前端** (frontend/.env):
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**后端** (Cloudflare Dashboard):
- `STRIPE_SECRET_KEY`: sk_test_...
- `STRIPE_WEBHOOK_SECRET`: whsec_...

### 3. 运行开发服务器

```bash
# 前端
cd frontend
npm run dev

# 后端 (另一个终端)
cd backend
npm run dev
```

### 4. 构建生产版本

```bash
# 前端
cd frontend
npm run build

# 部署后端
cd ../backend
npm run deploy
```

## 🚀 部署

### Cloudflare Workers 部署

1. 登录 Cloudflare:
```bash
npx wrangler login
```

2. 创建 KV 命名空间:
```bash
npx wrangler kv:namespace create "SUBSCRIPTIONS"
npx wrangler kv:namespace create "DUO_SESSIONS"
```

3. 更新 `wrangler.toml` 中的 namespace ID

4. 部署:
```bash
cd backend
npm run deploy
```

### 前端部署

构建后的文件位于 `frontend/dist/`，可部署到任何静态托管服务：
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

## 📱 支持的设备

### 心率监测
- Apple Watch (通过 Web Bluetooth)
- Polar H10/H9
- WHOOP
- Garmin 心率带
- 任何支持标准蓝牙心率服务的设备

### 浏览器要求
- Chrome 80+ (推荐)
- Edge 80+
- Android Chrome
- 不支持 Safari (iOS 限制蓝牙访问)

## 💰 定价策略

| 版本 | 价格 | 功能 |
|------|------|------|
| 免费版 | ¥0 | 基础呼吸练习，3种模式 |
| 专业版 | ¥28/月 | 心率监测，AI适配，全部模式 |
| 家庭版 | ¥48/月 | 双人同步，最多4家庭成员 |

**透明定价策略**: 一键取消，无隐藏费用，取消后仍可使用到当前周期结束。

## 🔧 项目结构

```
breath-ai/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── services/  # 业务逻辑
│   │   │   ├── bluetooth.ts    # 蓝牙心率
│   │   │   ├── aiEngine.ts     # AI推荐引擎
│   │   │   ├── stripe.ts       # 支付服务
│   │   │   └── duoSync.ts      # 双人同步
│   │   ├── App.tsx    # 主应用
│   │   └── ...
│   └── package.json
├── backend/           # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts   # 主入口
│   │   └── router.ts  # 路由
│   └── wrangler.toml
├── shared/            # 共享类型
│   └── types/
│       └── index.ts
└── README.md
```

## 📝 API 文档

### Stripe 相关
- `POST /api/stripe/checkout` - 创建结账会话
- `GET /api/stripe/subscription` - 获取订阅信息
- `DELETE /api/stripe/subscription` - 取消订阅
- `POST /api/stripe/subscription/reactivate` - 恢复订阅

### 双人同步
- `POST /api/duo/session` - 创建房间
- `GET /api/duo/session?code=XXX` - 获取房间信息
- `POST /api/duo/session/:id/join` - 加入房间

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License
