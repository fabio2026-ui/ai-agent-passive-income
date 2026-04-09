# Infinite Memory System - AI Agent 无限记忆

实现类似 Claude Code + Obsidian 的无限记忆系统。

## 架构

### 四层记忆结构

```
┌─────────────────────────────────────┐
│  Core (核心记忆)                     │
│  - 用户偏好、重要决策、关键事实       │
│  - 永久保存，跨所有会话              │
├─────────────────────────────────────┤
│  Long-term (长期记忆)                │
│  - 项目历史、学习经验、常用模式       │
│  - 手动或自动升级                    │
├─────────────────────────────────────┤
│  Working (工作记忆)                  │
│  - 当前项目状态、进行中的任务         │
│  - 会话间保留，项目结束归档          │
├─────────────────────────────────────┤
│  Ephemeral (会话记忆)                │
│  - 当前对话的临时信息                 │
│  - 会话结束自动整理                  │
└─────────────────────────────────────┘
```

## 使用

```javascript
const InfiniteMemory = require('./infinite-memory');

const memory = new InfiniteMemory({
  baseDir: './memory',
  sessionId: 'session_001'
});

// 存储记忆
memory.store('重要决策内容', {
  layer: 'longterm',    // ephemeral | working | longterm | core
  type: 'decision',     // note | task | decision | fact
  tags: ['api', 'kimi']
});

// 检索记忆
const results = memory.search('API配置', {
  layers: ['core', 'longterm'],
  limit: 5
});

// 获取上下文
const context = memory.getContext('当前任务');

// 会话结束整理
await memory.consolidate();
```

## 与 AI Agent 集成

```javascript
// 在 orchestrator.js 中使用
const memory = new InfiniteMemory();

// 每次对话前加载上下文
const context = memory.getContext(userQuery);
const prompt = `
${context.summary ? '会话摘要: ' + context.summary : ''}

相关记忆:
${context.memories.map(m => `- ${m.content}`).join('\n')}

用户: ${userQuery}
`;

// 存储AI回复
memory.store(aiResponse, { type: 'note', tags: ['ai_response'] });
```
