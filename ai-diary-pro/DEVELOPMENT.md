# AI日记Pro - 开发指南

## 安装和运行

```bash
# 进入项目目录
cd ai-diary-pro

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目特性

### 1. PWA 支持
- 可安装到主屏幕
- 离线访问能力
- Service Worker 自动更新

### 2. 数据存储
- 使用 IndexedDB 存储日记数据
- Dexie.js 提供便捷的 API
- 数据完全本地，保护隐私

### 3. 订阅系统
- 免费版：基础日记功能
- Pro版：AI 分析、高级统计等功能
- 价格：$29.99/年 或 $4.99/月

### 4. 响应式设计
- 移动端优先设计
- 桌面端侧边栏导航
- 触摸友好的交互

## 扩展 AI 功能

当前 AI 功能使用模拟数据，接入真实 AI API：

```typescript
// 在 appStore.ts 中修改 generateAISummary
async generateAISummary(entryId: string) {
  const entry = await db.entries.get(Number(entryId))
  if (!entry) return null
  
  // 调用你的 AI API
  const response = await fetch('/api/ai/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: entry.content, emotion: entry.emotion })
  })
  
  return await response.json()
}
```

## 部署

### 静态托管
构建后的 `dist` 目录可部署到任何静态托管服务：
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

### 注意事项
- 确保配置 HTTPS (PWA 要求)
- 配置正确的 MIME 类型
- Service Worker 需要同域部署
