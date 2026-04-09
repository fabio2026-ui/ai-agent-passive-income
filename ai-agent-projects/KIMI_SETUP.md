# 使用Kimi API驱动AI Agent

## ✅ Kimi API已配置

### API端点
```
https://api.moonshot.cn/v1/chat/completions
```

### 支持的模型
- `moonshot-v1-8k` - 8K上下文
- `moonshot-v1-32k` - 32K上下文
- `moonshot-v1-128k` - 128K上下文

---

## 🚀 立即启动

### 方法1: 使用Kimi API
```bash
cd /root/.openclaw/workspace/ai-agent-projects

export AI_PROVIDER=kimi
export AI_API_KEY=your_kimi_api_key
export AI_MODEL=moonshot-v1-8k

node orchestrator.js
```

### 方法2: 使用已配置的Kimi
```bash
export AI_PROVIDER=kimi
export AI_BASE_URL=https://api.moonshot.cn/v1
export AI_MODEL=moonshot-v1-8k

# API Key从环境获取
node orchestrator.js
```

---

## 🎯 Kimi的优势

| 特性 | Kimi | 说明 |
|------|------|------|
| 中文理解 | ⭐⭐⭐⭐⭐ | 国产模型，中文最优 |
| 长上下文 | ⭐⭐⭐⭐⭐ | 支持128K tokens |
| 代码能力 | ⭐⭐⭐⭐ | 优秀的代码生成 |
| 价格 | ⭐⭐⭐⭐ | 国内API，稳定快速 |

---

## 💡 Kimi驱动的Agent示例

### 内容工厂使用Kimi
```javascript
const AIProvider = require('./src/ai-provider.js');

const ai = new AIProvider({
  provider: 'kimi',
  apiKey: process.env.AI_API_KEY,
  model: 'moonshot-v1-8k'
});

// 生成中文安全文章
const article = await ai.generateContent(`
  写一篇关于XSS攻击防护的技术文章。
  要求：
  1. 1500字左右
  2. 适合中国开发者阅读
  3. 包含代码示例
  4. 结尾推荐Snyk工具
`);
```

---

## 📊 Kimi vs 其他API

| 对比项 | Kimi | Claude | Gemini |
|--------|------|--------|--------|
| 中文 | 🥇 最佳 | 良好 | 良好 |
| 速度 | 快 | 中等 | 快 |
| 代码 | 优秀 | 最佳 | 良好 |
| 价格 | 中等 | 高 | 免费 |
| 稳定性 | 🥇 国内稳定 | 需梯子 | 需梯子 |

---

## 🔧 配置选项

### .env文件
```bash
# 使用Kimi
AI_PROVIDER=kimi
AI_API_KEY=sk-your-kimi-key
AI_MODEL=moonshot-v1-8k
AI_BASE_URL=https://api.moonshot.cn/v1
```

### 环境变量
```bash
export AI_PROVIDER=kimi
export AI_API_KEY=your_kimi_api_key
export AI_MODEL=moonshot-v1-8k
```

---

## ⚡ 一键启动

```bash
# 进入项目目录
cd /root/.openclaw/workspace/ai-agent-projects

# 配置Kimi (替换为你的key)
export AI_PROVIDER=kimi
export AI_API_KEY=your_moonshot_api_key

# 测试连接
node -e "
const AIProvider = require('./src/ai-provider.js');
const ai = new AIProvider({ provider: 'kimi', apiKey: process.env.AI_API_KEY });
ai.generateContent('你好，Kimi').then(r => console.log('✅ Kimi响应:', r.substring(0, 50)));
"

# 启动所有AI Agents
node orchestrator.js
```

---

## 🎉 Kimi已就绪

Kimi API已集成到所有4个AI Agent项目中：
- ✅ 安全内容AI工厂
- ✅ AI安全扫描服务
- ✅ 自动化社媒运营
- ✅ Affiliate自动化

**立即配置你的Kimi API Key并启动！**