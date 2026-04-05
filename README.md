# Kimi / DeepSeek API 快速启动

## ✅ 支持双API
- **Kimi** (月之暗面) - 中文最优
- **DeepSeek** (深度求索) - 超便宜+高质量 ⭐推荐

---

## 🚀 立即启动

### 方案A: DeepSeek (推荐！超便宜)
```bash
export AI_PROVIDER=deepseek
export AI_API_KEY=sk-your-deepseek-key
node orchestrator.js
```

### 方案B: Kimi (中文最优)
```bash
export AI_PROVIDER=kimi
export AI_API_KEY=your_kimi_key
node orchestrator.js
```

---

## 📋 完整命令

```bash
# 进入项目目录
cd /root/.openclaw/workspace/ai-agent-projects

# 配置Kimi API (替换为你的key)
export AI_API_KEY=sk-your-kimi-key

# 启动
node orchestrator.js
```

---

## 🔧 可选配置

```bash
# 使用特定模型
export AI_MODEL=moonshot-v1-32k  # 或 moonshot-v1-8k, moonshot-v1-128k

# 使用其他API (如果不用Kimi)
export AI_PROVIDER=gemini
export AI_API_KEY=your_gemini_key
```

---

## ✅ 支持的模型

| 模型 | 上下文 | 适用场景 |
|------|--------|----------|
| moonshot-v1-8k | 8K | 短内容生成 |
| moonshot-v1-32k | 32K | 长文章、代码 |
| moonshot-v1-128k | 128K | 超长文档分析 |

---

## 💡 默认行为

如果没有设置`AI_PROVIDER`，系统会：
1. 自动尝试使用 **Kimi** (`provider=kimi`)
2. 使用模型 **moonshot-v1-8k**
3. 从 `AI_API_KEY` 或 `KIMI_API_KEY` 读取密钥

---

## 🎯 现在只需做一件事

```bash
export AI_API_KEY=你的Kimi_API_Key
node orchestrator.js
```

**然后4个AI Agent就开始自动运转了！**