# HabitAI 快速启动指南

## 🚀 一键启动

```bash
# 1. 进入项目目录
cd habit-ai-app

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

应用将在 http://localhost:5173 启动

## 📦 构建生产版本

```bash
# 构建
npm run build

# 预览生产版本
npm run preview
```

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t habit-ai .

# 运行容器
docker run -p 80:80 habit-ai
```

## ☁️ 部署到云平台

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🔧 环境变量

创建 `.env` 文件：

```env
# 可选：真实的AI API密钥
VITE_OPENAI_API_KEY=your_api_key_here

# 可选：支付网关配置
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
```

## 📱 PWA安装

1. 在Chrome/Edge中打开应用
2. 点击地址栏右侧的"安装"按钮
3. 或使用菜单 → 更多工具 → 创建快捷方式

## 🎯 功能特性

| 功能 | 免费版 | Premium |
|-----|-------|---------|
| 习惯数量 | 3个 | 无限 |
| AI教练 | 基础 | 完整 |
| 高级统计 | ❌ | ✅ |
| 主题皮肤 | 基础 | 全部 |
| 价格 | 免费 | $19.99/年 |

## 🛠️ 技术栈

- React 18 + TypeScript
- Tailwind CSS
- Zustand (状态管理)
- Framer Motion (动画)
- Vite PWA Plugin

## 📁 项目结构

```
habit-ai-app/
├── src/
│   ├── components/     # 可复用组件
│   ├── pages/         # 页面组件
│   ├── store/         # 状态管理
│   ├── services/      # 服务层
│   └── types/         # TypeScript类型
├── public/            # 静态资源
└── dist/             # 构建输出
```

## 📝 开发计划

- [x] 基础打卡功能
- [x] AI教练模块
- [x] 奖励系统
- [x] PWA支持
- [x] Premium订阅
- [ ] 真实AI API集成
- [ ] 云端同步
- [ ] 社交功能
- [ ] 多语言支持

## 🤝 贡献

欢迎提交Issue和PR！

## 📄 许可证

MIT License
