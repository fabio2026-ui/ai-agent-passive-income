# 支持的AI API提供商

## ✅ 已支持的API

| 提供商 | 成本 | 速度 | 质量 | 获取方式 |
|--------|------|------|------|----------|
| **DeepSeek** | **超便宜** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | platform.deepseek.com |
| **Kimi (Moonshot)** | 中等 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | platform.moonshot.cn |
| **Claude (Anthropic)** | €20-50/月 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | console.anthropic.com |
| **OpenAI (GPT-4o)** | €20-50/月 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | platform.openai.com |
| **Google Gemini** | **免费** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | makersuite.google.com |
| **Mistral AI** | €10-30/月 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | console.mistral.ai |
| **Groq** | **超便宜** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | groq.com |
| **OpenRouter** | **免费额度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | openrouter.ai |
| **Ollama (本地)** | **完全免费** | ⭐⭐⭐ | ⭐⭐⭐ | ollama.ai |

---

## 🆕 DeepSeek (推荐！超便宜+高质量)

### 为什么选择DeepSeek
- 💰 **超便宜**: 比OpenAI便宜10倍
- 🚀 **超快**: 推理速度极快
- 🧠 **高质量**: DeepSeek-V3性能接近GPT-4
- 🇨🇳 **国内API**: 稳定，无需梯子

### 获取API Key
```bash
# 1. 访问 https://platform.deepseek.com/
# 2. 注册账号
# 3. 创建API Key
# 4. 新用户有免费额度
```

### 配置并启动
```bash
export AI_PROVIDER=deepseek
export AI_API_KEY=sk-your-deepseek-key
export AI_MODEL=deepseek-chat

node orchestrator.js
```

### 价格对比
| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| DeepSeek-V3 | ¥1/百万tokens | ¥2/百万tokens |
| GPT-4o | $5/百万tokens | $15/百万tokens |
| **节省** | **95%** | **98%** |

---

## 🆓 其他免费方案

### 方案1: Google Gemini (完全免费)
```bash
# 1. 访问 https://makersuite.google.com/app/apikey
# 2. 获取免费API Key
# 3. 配置:
export AI_PROVIDER=gemini
export AI_API_KEY=your_gemini_key
export AI_MODEL=gemini-2.0-flash-exp
```

**优点**: 完全免费，速度快，质量高
**限制**: 每分钟60次请求

---

### 方案2: OpenRouter (免费额度)
```bash
# 1. 访问 https://openrouter.ai/
# 2. 注册获取免费额度
# 3. 配置:
export AI_PROVIDER=openrouter
export AI_API_KEY=your_openrouter_key
export AI_MODEL=meta-llama/llama-3.3-70b-instruct
```

**优点**: 免费访问Llama, Mistral等开源模型
**限制**: 每天有请求限额

---

### 方案3: Ollama (本地运行)
```bash
# 1. 安装 Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# 2. 下载模型
ollama pull llama3.2

# 3. 配置:
export AI_PROVIDER=ollama
export AI_BASE_URL=http://localhost:11434
export AI_MODEL=llama3.2
```

**优点**: 完全免费，无网络依赖，隐私
**缺点**: 需要本地运行，质量略低于云端

---

## 💰 付费方案推荐

### 性价比最高: Groq
```bash
export AI_PROVIDER=groq
export AI_API_KEY=your_groq_key
export AI_MODEL=llama-3.3-70b-versatile
```

**价格**: €0.59/百万tokens (比OpenAI便宜10倍)
**速度**: 每秒500+ tokens
**质量**: Llama 3.3 70B，接近GPT-4

---

### 质量最高: Claude/OpenAI
```bash
# Claude
export AI_PROVIDER=claude
export AI_API_KEY=your_claude_key
export AI_MODEL=claude-3-7-sonnet-20250219

# 或 OpenAI
export AI_PROVIDER=openai
export AI_API_KEY=your_openai_key
export AI_MODEL=gpt-4o
```

---

## 🔧 配置方法

### 方法1: 环境变量
```bash
export AI_PROVIDER=gemini  # 或 openai, claude, groq等
export AI_API_KEY=your_api_key
export AI_MODEL=gemini-2.0-flash-exp  # 可选
```

### 方法2: .env文件
```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-2.0-flash-exp
```

### 方法3: 代码中指定
```javascript
const AIProvider = require('./src/ai-provider.js');

const ai = new AIProvider({
  provider: 'gemini',
  apiKey: 'your_key',
  model: 'gemini-2.0-flash-exp'
});

const content = await ai.generateContent('写一篇安全文章');
```

---

## 📊 各提供商对比

### 内容生成质量
```
Claude 3.7 > GPT-4o > Gemini 2.0 > Llama 3.3 > Mistral Large
```

### 价格从低到高
```
Ollama (免费) < Gemini (免费) < OpenRouter (免费额度) < Groq (超便宜) < Mistral < OpenAI < Claude
```

### 速度从快到慢
```
Groq > Gemini > Mistral > GPT-4o > Claude > Ollama
```

---

## 🎯 推荐组合

### 免费启动方案
```bash
# 使用 Gemini (完全免费)
export AI_PROVIDER=gemini
export AI_API_KEY=AIzaSy...your_key
```

### 性价比方案
```bash
# 使用 Groq (超便宜)
export AI_PROVIDER=groq
export AI_API_KEY=gsk_...your_key
```

### 质量优先方案
```bash
# 使用 Claude
export AI_PROVIDER=claude
export AI_API_KEY=sk-ant-...your_key
```

---

## ⚡ 快速开始

### 使用 Gemini (免费)
```bash
# 1. 获取API Key
curl -s https://makersuite.google.com/app/apikey

# 2. 设置环境变量
export AI_PROVIDER=gemini
export AI_API_KEY=YOUR_GEMINI_KEY

# 3. 启动AI Agents
cd /root/.openclaw/workspace/ai-agent-projects
node orchestrator.js
```

---

*支持7个API提供商 | 免费到付费全方案覆盖*