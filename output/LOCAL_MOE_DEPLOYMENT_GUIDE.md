# OpenClaw 本地MoE模型部署方案
# 零成本、高效率、告别Token消耗焦虑

**创建时间**: 2026-04-01  
**目标**: 通过本地MoE模型减少90% API消耗  
**预期节省**: ¥150-300/月

---

## 🎯 方案概述

### 什么是MoE模型？
MoE (Mixture of Experts) 混合专家架构：
- 总参数量大（如400B），但每次只激活部分专家（如17B）
- **效果接近大模型，消耗接近小模型**
- 本地运行仅需中等配置

### 推荐本地MoE模型

| 模型 | 总参数 | 激活参数 | 体积 | 显存需求 | 适用场景 |
|------|--------|----------|------|----------|----------|
| **Qwen3.5:cloud** | - | - | 4GB | 8GB | 主力推荐，中文最强 |
| **Qwen3.5:0.6b** | 0.6B | 0.6B | 1GB | 4GB | 低配电脑，极速响应 |
| **DeepSeek-V3** | 400B | 17B | 8GB | 16GB | 代码任务，复杂推理 |
| **Qwen2.5:7b** | 7B | 7B | 4GB | 8GB | 通用任务，性价比高 |
| **GLM-4.7** | 9B | 9B | 5GB | 10GB | 中文对话，长上下文 |

---

## 🚀 部署步骤（5分钟搞定）

### 第一步：安装Ollama

```bash
# MacOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 下载安装包: https://ollama.com/download
```

### 第二步：拉取MoE模型

```bash
# 推荐：主力模型（中等配置）
ollama pull qwen3.5:cloud

# 备选：轻量模型（低配电脑）
ollama pull qwen3.5:0.6b

# 代码专用（高配电脑）
ollama pull deepseek-v3

# 查看已安装模型
ollama list
```

### 第三步：验证模型运行

```bash
# 运行模型
ollama run qwen3.5:cloud

# 测试对话
>>> 你好，请介绍一下自己

# 退出
/bye

# 查看运行状态
ollama ps
```

---

## ⚙️ OpenClaw配置

### 配置方式1：修改配置文件

编辑 `~/.openclaw/config.json`:

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "ollama": {
        "baseUrl": "http://localhost:11434",
        "apiKey": "ollama-local",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3.5:cloud",
            "name": "Qwen3.5 Local",
            "reasoning": false,
            "input": ["text"],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 128000,
            "maxTokens": 4096
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/qwen3.5:cloud"
      }
    }
  }
}
```

### 配置方式2：环境变量（推荐）

```bash
# 设置环境变量
export OLLAMA_API_KEY="ollama-local"

# 重启OpenClaw
openclaw gateway restart
```

### 配置方式3：Web UI设置

1. 打开 OpenClaw Web UI (`http://localhost:18789`)
2. 进入 Settings → LLM Provider
3. Provider选择: `Ollama (Local)`
4. Base URL: `http://localhost:11434`
5. Model Name: `qwen3.5:cloud`
6. Context Window: `8192`
7. 点击 Test Connection
8. 保存设置

---

## 🔄 混合模式配置（本地+云端）

### 方案A：按任务切换

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/qwen3.5:cloud",
        "fallback": "kimi-k2.5"
      }
    },
    "coding": {
      "model": "kimi-coding/k2p5"
    },
    "heartbeat": {
      "model": "ollama/qwen3.5:0.6b"
    }
  }
}
```

### 方案B：智能路由

```yaml
# 复杂任务 → 云端模型
# 简单任务 → 本地模型

rules:
  - pattern: "代码|编程|debug"
    model: "kimi-coding/k2p5"
    
  - pattern: "搜索|查询|联网"
    model: "kimi-k2.5"
    
  - pattern: "总结|整理|日常"
    model: "ollama/qwen3.5:cloud"
    
  - pattern: "心跳|定时|监控"
    model: "ollama/qwen3.5:0.6b"
```

---

## 📊 成本对比

### 纯云端模式（当前）

| 使用场景 | 日消耗 | 月消耗 | 年费 |
|----------|--------|--------|------|
| 轻度使用 | ¥5 | ¥150 | ¥1,800 |
| 中度使用 | ¥15 | ¥450 | ¥5,400 |
| 重度使用 | ¥30 | ¥900 | ¥10,800 |

### 本地+云端混合模式

| 使用场景 | 本地占比 | 月消耗 | 节省 |
|----------|----------|--------|------|
| 轻度使用 | 80% | ¥30 | **80%** |
| 中度使用 | 70% | ¥135 | **70%** |
| 重度使用 | 60% | ¥360 | **60%** |

### 纯本地模式

| 项目 | 成本 |
|------|------|
| 硬件折旧 | ~¥50/月 |
| 电费 | ~¥20/月 |
| API费用 | **¥0** |
| **总计** | **~¥70/月** |

---

## 💡 最佳实践

### 1. 心跳任务全部本地

```bash
# 每日检查、定时任务等使用本地模型
heartbeat:
  model: "ollama/qwen3.5:0.6b"
  cost: 0
```

### 2. 代码任务云端处理

```bash
# 复杂代码生成、调试使用云端
coding:
  model: "kimi-coding/k2p5"
  only_when: "复杂任务"
```

### 3. 自动降级机制

```json
{
  "fallback": {
    "on_error": "switch_to_local",
    "on_timeout": "switch_to_local",
    "on_quota_exceeded": "switch_to_local"
  }
}
```

---

## 🔧 性能优化

### 内存不足时的选择

| 内存大小 | 推荐模型 | 响应速度 |
|----------|----------|----------|
| 8GB | qwen3.5:0.6b | ⚡ 极速 |
| 16GB | qwen3.5:cloud | 🚀 快速 |
| 32GB | deepseek-v3 | ⚡ 较快 |
| 64GB+ | 多模型并行 | 🚀 并行 |

### GPU加速（可选）

```bash
# 安装CUDA（NVIDIA显卡）
# Ollama自动检测并使用GPU

# 验证GPU使用
ollama ps
# 显示 GPU% 即表示在使用显卡加速
```

---

## 🛠️ 运维命令

```bash
# 查看运行状态
ollama ps

# 查看已安装模型
ollama list

# 拉取新模型
ollama pull qwen3.5:14b

# 删除模型
ollama rm qwen3.5:0.6b

# 查看日志
ollama logs

# 重启服务
ollama serve
```

---

## ⚠️ 注意事项

### 1. 模型能力边界
- 本地模型适合：日常对话、简单任务、心跳检查
- 云端模型适合：复杂代码、深度推理、联网搜索

### 2. 安全风险
- 本地模型无内容审查，谨慎处理敏感操作
- 建议开启 Human-in-the-loop 确认破坏性命令

### 3. 离线限制
- 断网后无法使用联网技能（搜索、API调用等）
- 纯本地任务不受影响（文件操作、本地脚本等）

---

## 🎉 预期效果

部署后预期：
- ✅ API消耗减少 **70-90%**
- ✅ 响应速度提升 **2-5倍**（本地无网络延迟）
- ✅ 数据隐私100%本地
- ✅ 断网可用，7×24稳定运行
- ✅ 月成本从¥199降至¥30-50

---

## 📚 相关资源

- Ollama官网: https://ollama.com
- 模型库: https://ollama.com/library
- OpenClaw文档: https://docs.openclaw.ai
- 社区讨论: https://discord.gg/clawd

---

**立即执行**: 按步骤1-3部署，5分钟后即可享受零成本AI！
