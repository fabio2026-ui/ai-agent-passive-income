# Auto-Memory Skill

自动从会话中提取持久化记忆，保存到项目记忆目录。

## 功能
- 自动分析对话内容，提取重要信息
- 保存到 `memory/YYYY-MM-DD.md`
- 支持记忆压缩和整合
- 跨会话记忆恢复

## 使用

```bash
# 在对话结束时自动触发
# 或在关键时刻手动调用
```

## 实现原理

基于Claude Code的 `extractMemories` 系统：
1. 使用forked agent模式进行异步处理
2. 分析对话内容，识别重要决策、TODO、约束
3. 写入项目记忆目录
4. 下次会话自动加载

## 配置

```yaml
# .openclaw/config.yaml
memory:
  auto_extract: true
  extract_on: ["session_end", "important_decision"]
  max_memories_per_day: 10
```
