# Multi-API Quick Start

## 免费方案: Google Gemini

### 1. 获取免费API Key
```bash
# 访问 https://makersuite.google.com/app/apikey
# 点击 "Create API Key"
# 复制你的 API Key
```

### 2. 配置并启动
```bash
cd /root/.openclaw/workspace/ai-agent-projects

export AI_PROVIDER=gemini
export AI_API_KEY=AIzaSyYourActualKeyHere

node orchestrator.js
```

---

## 超便宜方案: Groq

### 1. 注册Groq
```bash
# 访问 https://groq.com
# 注册账号
# 获取API Key
```

### 2. 配置并启动
```bash
export AI_PROVIDER=groq
export AI_API_KEY=gsk_your_groq_key
export AI_MODEL=llama-3.3-70b-versatile

node orchestrator.js
```

---

## 高质量方案: OpenAI

### 1. 获取API Key
```bash
# 访问 https://platform.openai.com/api-keys
# 创建新Key
```

### 2. 配置并启动
```bash
export AI_PROVIDER=openai
export AI_API_KEY=sk-your-openai-key
export AI_MODEL=gpt-4o

node orchestrator.js
```

---

## 测试所有Provider

```bash
# 测试当前配置的Provider
node -e "
const AIProvider = require('./src/ai-provider.js');
const ai = new AIProvider({
  provider: process.env.AI_PROVIDER,
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL
});
ai.generateContent('Hello, write one sentence about AI').then(console.log);
"
```

---

## 支持的Provider列表

| Provider | 环境变量设置 |
|----------|-------------|
| **Claude** | `AI_PROVIDER=claude` + `AI_API_KEY=sk-ant-...` |
| **OpenAI** | `AI_PROVIDER=openai` + `AI_API_KEY=sk-...` |
| **Gemini** | `AI_PROVIDER=gemini` + `AI_API_KEY=AIzaSy...` |
| **Mistral** | `AI_PROVIDER=mistral` + `AI_API_KEY=...` |
| **Groq** | `AI_PROVIDER=groq` + `AI_API_KEY=gsk_...` |
| **OpenRouter** | `AI_PROVIDER=openrouter` + `AI_API_KEY=...` |
| **Ollama** | `AI_PROVIDER=ollama` + `AI_BASE_URL=http://localhost:11434` |

---

## 推荐选择

| 你的情况 | 推荐方案 | 原因 |
|----------|----------|------|
| 想免费开始 | Gemini | 完全免费，质量够用 |
| 追求性价比 | Groq | 超便宜，速度快 |
| 追求质量 | Claude/OpenAI | 最好质量 |
| 隐私优先 | Ollama | 本地运行，完全免费 |

---

## 立即行动

```bash
# 选择你的方案并执行:

# 方案A: Gemini (免费)
export AI_PROVIDER=gemini
export AI_API_KEY=YOUR_GEMINI_KEY

# 方案B: Groq (超便宜)
export AI_PROVIDER=groq  
export AI_API_KEY=YOUR_GROQ_KEY

# 然后启动:
node orchestrator.js
```

---

*所有API都已支持 | 选择你的方案立即启动*