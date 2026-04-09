# HabitAI - AI习惯养成应用

一个功能完整的React PWA应用，包含打卡、奖励系统和AI教练功能。

## 功能特性

### 核心功能
- 📝 **习惯管理** - 创建、编辑、归档习惯
- ✅ **每日打卡** - 一键打卡，连续天数追踪
- 🎯 **目标设定** - 每日/每周/自定义频率
- 🔔 **智能提醒** - 自定义提醒时间

### AI功能
- 🤖 **AI教练** - 智能建议和鼓励
- 💡 **习惯建议** - 基于目标的个性化推荐
- 📊 **数据分析** - 智能洞察和趋势分析

### 奖励系统
- ⭐ **积分系统** - 打卡获得积分
- 🏆 **成就系统** - 解锁各种成就
- 🎁 **奖励商店** - 用积分兑换奖励

### PWA特性
- 📱 **离线可用** - Service Worker支持
- 🏠 **可安装** - 支持添加到主屏幕
- 🔔 **推送通知** - 打卡提醒
- 💾 **本地存储** - Zustand + localStorage

### 付费功能
- 👑 **Premium订阅** - $19.99/年
- ♾️ **无限习惯** - 不受数量限制
- 🤖 **高级AI功能** - 完整的AI教练
- 📊 **高级统计** - 深度数据分析

## 技术栈

- **框架**: React 18 + TypeScript
- **路由**: React Router v6
- **状态管理**: Zustand (持久化)
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图表**: Recharts
- **PWA**: Vite PWA Plugin
- **构建**: Vite

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
habit-ai-app/
├── public/
│   ├── manifest.json      # PWA配置
│   ├── sw.js             # Service Worker
│   └── icons/            # 应用图标
├── src/
│   ├── components/       # 组件
│   │   ├── BottomNav.tsx
│   │   ├── HabitCard.tsx
│   │   ├── AddHabitModal.tsx
│   │   └── AIChat.tsx
│   ├── pages/           # 页面
│   │   ├── Home.tsx
│   │   ├── Habits.tsx
│   │   ├── Stats.tsx
│   │   ├── Rewards.tsx
│   │   ├── Profile.tsx
│   │   └── Premium.tsx
│   ├── store/           # 状态管理
│   │   └── index.ts
│   ├── services/        # 服务
│   │   └── ai.ts
│   ├── types/           # 类型定义
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## PWA配置

应用支持完整的PWA功能：

- Web App Manifest
- Service Worker (离线支持)
- 可安装到主屏幕
- 推送通知支持

## AI服务

当前使用模拟AI服务，可以替换为真实的AI API：

```typescript
// src/services/ai.ts
// 替换为真实的AI API调用
```

## 支付集成

当前为模拟支付流程，生产环境需要集成真实支付网关：

- Stripe
- PayPal
- 或本地化支付方案

## 许可证

MIT
