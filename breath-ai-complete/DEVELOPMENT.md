# Breath AI 开发文档

## 快速开始

```bash
# 1. 安装所有依赖
cd breath-ai
npm run install:all

# 2. 配置环境变量
cp frontend/.env.example frontend/.env
# 编辑 .env 文件，填入你的 Stripe 公钥

# 3. 启动开发服务器
# 终端 1 - 后端
cd backend && npm run dev

# 终端 2 - 前端
cd frontend && npm run dev
```

## 项目结构

```
breath-ai/
├── README.md              # 项目说明
├── DEPLOY.md              # 部署指南
├── DEVELOPMENT.md         # 开发文档 (本文件)
├── package.json           # 根 package.json
│
├── frontend/              # React 前端应用
│   ├── index.html         # HTML 入口
│   ├── package.json       # 前端依赖
│   ├── tsconfig.json      # TypeScript 配置
│   ├── vite.config.ts     # Vite 配置
│   ├── tailwind.config.js # Tailwind CSS 配置
│   ├── postcss.config.js  # PostCSS 配置
│   ├── .env.example       # 环境变量示例
│   └── src/
│       ├── main.tsx       # 应用入口
│       ├── App.tsx        # 主组件 (完整应用)
│       ├── index.css      # 全局样式
│       ├── vite-env.d.ts  # 类型声明
│       └── services/      # 业务服务
│           ├── bluetooth.ts   # 蓝牙心率服务
│           ├── aiEngine.ts    # AI 推荐引擎
│           ├── stripe.ts      # Stripe 支付
│           └── duoSync.ts     # 双人同步 (WebRTC)
│
├── backend/               # Cloudflare Workers 后端
│   ├── package.json       # 后端依赖
│   ├── tsconfig.json      # TypeScript 配置
│   ├── wrangler.toml      # Wrangler 配置
│   └── src/
│       ├── index.ts       # 主入口
│       └── router.ts      # 路由工具
│
└── shared/                # 共享类型定义
    └── types/
        └── index.ts       # 所有类型定义
```

## 核心功能详解

### 1. 蓝牙心率监测

**文件**: `frontend/src/services/bluetooth.ts`

功能:
- 使用 Web Bluetooth API 连接设备
- 解析心率数据 (支持 8-bit 和 16-bit 格式)
- 计算心率变异性 (HRV) 使用 RMSSD 算法
- 检测压力水平

支持的设备:
- Apple Watch
- Polar 心率带
- WHOOP
- Garmin
- Fitbit
- 任何支持标准 GATT 心率服务的设备

使用:
```typescript
import { heartRateMonitor } from './services/bluetooth';

// 请求设备
const device = await heartRateMonitor.requestDevice();

// 连接
await heartRateMonitor.connect();

// 监听数据
heartRateMonitor.onData((data) => {
  console.log('心率:', data.heartRate);
  console.log('HRV:', data.hrv);
});
```

### 2. AI 情绪适配引擎

**文件**: `frontend/src/services/aiEngine.ts`

功能:
- 基于规则的推荐系统
- 根据心率区间推荐呼吸模式
- 压力检测算法
- 时间感知 (早晚不同推荐)

呼吸模式:
- `calm`: 4-7-8 放松呼吸
- `stress-relief`: 4-4-6 减压呼吸
- `energy`: 4-4-4-4 盒式呼吸
- `sleep`: 4-7-8 睡眠呼吸
- `focus`: 6-0-6 专注呼吸
- `recovery`: 5-5-5 恢复呼吸

使用:
```typescript
import { aiEngine, breathingConfigs } from './services/aiEngine';

// 添加心率读数
aiEngine.addReading({
  timestamp: Date.now(),
  heartRate: 85,
  hrv: 35
});

// 获取推荐
const recommendation = aiEngine.getRecommendation();
console.log('推荐模式:', recommendation.pattern);
console.log('置信度:', recommendation.confidence);
console.log('原因:', recommendation.reason);
```

### 3. Stripe 支付系统

**文件**: `frontend/src/services/stripe.ts` + `backend/src/index.ts`

功能:
- Stripe Checkout 集成
- 订阅管理
- 一键取消
- 发票查询
- 支付方式更新

定价:
- 免费版: ¥0
- 专业版: ¥28/月
- 家庭版: ¥48/月

前端使用:
```typescript
import { stripeService } from './services/stripe';

// 订阅
await stripeService.redirectToCheckout('price_xxx');

// 获取订阅信息
const subscription = await stripeService.getSubscription();

// 取消订阅
await stripeService.cancelSubscription();
```

### 4. 双人同步模式

**文件**: `frontend/src/services/duoSync.ts`

功能:
- WebRTC P2P 连接
- 房间系统 (邀请码)
- 实时数据同步
- 内置聊天

使用:
```typescript
import { duoSyncManager } from './services/duoSync';

// 创建房间 (Host)
const { inviteCode } = await duoSyncManager.createSession(userId, {
  onConnect: () => console.log('Connected!'),
  onData: (data) => console.log('Received:', data),
  onDisconnect: () => console.log('Disconnected'),
  onError: (err) => console.error('Error:', err)
});

// 加入房间 (Guest)
await duoSyncManager.joinSession(inviteCode, userId, callbacks);

// 发送数据
duoSyncManager.sendBreathPhase('inhale', 0.5);
duoSyncManager.sendHeartbeat(75, 40);
```

## 状态管理

应用使用 React 的 `useState` 进行本地状态管理，没有使用 Redux 等复杂状态管理库，保持代码简洁。

主要状态:
- `currentView`: 当前视图 (breathe/heart/duo/premium/settings)
- `subscription`: 用户订阅信息
- `isActive`: 呼吸练习是否进行中
- `phase`: 当前呼吸阶段
- `heartRate`: 实时心率
- `isConnected`: 设备连接状态

## 响应式设计

应用使用 Tailwind CSS 进行响应式设计，针对移动端进行了优化:
- 最大宽度: 448px (移动优先)
- 触摸友好的按钮尺寸
- 底部导航栏

## 构建优化

Vite 配置中包含代码分割:
```javascript
manualChunks: {
  vendor: ['react', 'react-dom'],
  charts: ['recharts'],
  stripe: ['@stripe/stripe-js']
}
```

## 测试

### 本地测试
```bash
# 安装依赖
npm install

# 启动前端
cd frontend && npm run dev

# 启动后端 (另一个终端)
cd backend && npm run dev
```

### 测试 Stripe
使用 Stripe 提供的测试卡号:
- `4242 4242 4242 4242` - 成功支付
- `4000 0000 0000 0002` - 支付失败
- 任何未来日期 + 任意 3 位 CVC

### 测试蓝牙
需要:
1. Chrome 或 Edge 浏览器
2. 支持 Web Bluetooth 的设备
3. 蓝牙心率监测器或智能手表

## 部署检查清单

- [ ] 配置 Stripe 生产密钥
- [ ] 创建 Cloudflare KV 命名空间
- [ ] 部署 Cloudflare Workers
- [ ] 配置 Stripe Webhook
- [ ] 构建前端
- [ ] 部署前端到 CDN
- [ ] 配置自定义域名
- [ ] 启用 HTTPS
- [ ] 测试完整流程

## 故障排除

### 蓝牙无法连接
- 确保使用 HTTPS (localhost 除外)
- 确保使用 Chrome/Edge
- 检查设备是否支持标准心率服务

### 支付失败
- 检查 Stripe 密钥是否正确
- 检查 Webhook 是否配置
- 查看 Cloudflare Workers 日志

### 双人同步失败
- 检查网络连接
- 确保使用家庭版订阅
- 检查防火墙设置

## 扩展建议

1. **添加更多呼吸模式**: 在 `breathingConfigs` 中添加新配置
2. **添加用户历史**: 使用 IndexedDB 存储本地数据
3. **添加推送通知**: 使用 Web Push API
4. **添加社交分享**: 集成微信/微博分享
5. **添加成就系统**: 增加用户粘性
