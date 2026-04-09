# Video Agent - 视频理解与任务执行

专门处理视频链接读取、内容理解和执行用户任务的 AI Agent。

## 功能

- 📺 解析视频链接 (YouTube, Bilibili, TikTok, 抖音, 西瓜视频)
- 📝 提取字幕/转录文字
- 🖼️ 提取关键帧截图
- 🧠 理解视频内容
- ✅ 执行基于视频的任务

## 快速开始

```bash
# 解析视频并提取内容
node video-agent.js "https://www.youtube.com/watch?v=xxx" --task summarize

# 提取字幕
node video-agent.js "https://bilibili.com/video/BVxxx" --task transcript

# 根据视频内容执行任务
node video-agent.js "<链接>" --task "总结要点并生成3条推文"
```

## API

```javascript
const VideoAgent = require('./video-agent');

const agent = new VideoAgent();

// 解析视频
const video = await agent.parse('https://youtube.com/watch?v=xxx');

// 获取内容
const content = await agent.extract(video);

// 执行任务
const result = await agent.execute(content, '生成摘要');
```
