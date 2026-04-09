# AI日记Pro

一款智能情绪记录与AI总结分析的 React PWA 应用。

## ✨ 功能特性

### 核心功能
- 📝 **情绪日记** - 记录每日心情和想法
- 😊 **8种情绪类型** - 开心、感恩、平静、兴奋、焦虑、难过、生气、疲惫
- 🏷️ **标签管理** - 为日记添加自定义标签
- 📊 **情绪统计** - 追踪情绪变化趋势

### AI 功能 (Pro版)
- 🤖 **智能情绪分析** - AI 自动分析日记内容
- 📝 **自动总结生成** - 生成简洁的日记摘要
- 📈 **情绪趋势预测** - 基于历史数据预测情绪走向
- 💡 **个性化建议** - 提供针对性的改善建议
- 📋 **情绪周报** - 每周生成完整的情绪分析报告

### PWA 特性
- 📱 **可安装** - 支持添加到主屏幕
- 🌐 **离线访问** - 无网络也能记录日记
- 🔔 **每日提醒** - 定时提醒记录日记
- 💾 **本地存储** - 数据安全存储在本地

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 💰 订阅定价

- **免费版** - 基础日记功能
- **月度 Pro** - $4.99/月
- **年度 Pro** - $29.99/年 (推荐，省50%)

### Pro 功能包含
- ✅ 无限 AI 情绪分析
- ✅ 智能总结与洞察
- ✅ 高级隐私保护
- ✅ 云端备份同步
- ✅ 自定义主题
- ✅ 优先客服支持

## 🛠 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据库**: Dexie (IndexedDB)
- **PWA**: Vite PWA Plugin
- **图表**: Recharts
- **动画**: Framer Motion

## 📁 项目结构

```
ai-diary-pro/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 组件
│   │   ├── EmotionSelector.tsx
│   │   ├── EmotionChart.tsx
│   │   ├── EmotionDistributionChart.tsx
│   │   ├── EmotionTrendChart.tsx
│   │   ├── AISummaryCard.tsx
│   │   ├── Navigation.tsx
│   │   └── Layout.tsx
│   ├── pages/              # 页面
│   │   ├── Home.tsx
│   │   ├── Write.tsx
│   │   ├── History.tsx
│   │   ├── Stats.tsx
│   │   ├── AIFeatures.tsx
│   │   ├── Subscription.tsx
│   │   ├── Settings.tsx
│   │   └── Onboarding.tsx
│   ├── store/              # 状态管理
│   │   └── appStore.ts
│   ├── db/                 # 数据库
│   │   └── database.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🔐 隐私说明

- 所有日记数据存储在本地 IndexedDB
- AI 分析在本地完成，不上传云端
- 用户完全掌控自己的数据

## 📄 许可证

MIT License
