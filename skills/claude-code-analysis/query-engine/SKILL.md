# Query Engine Skill

LLM查询引擎，管理API调用和流式响应。

## 功能
- 流式响应处理
- 工具循环调用
- Prompt缓存优化
- 错误重试机制
- 上下文窗口管理

## 架构

```
Query Loop:
  1. Send prompt to LLM
  2. Receive response (streaming)
  3. Check for tool calls
  4. Execute tools
  5. Send results back to LLM
  6. Repeat until complete
```

## 配置

```yaml
query_engine:
  model: kimi-k2p5
  max_tokens: 8192
  temperature: 0.7
  tool_timeout: 60
  retry_attempts: 3
```

## 性能优化
- Prompt缓存共享
- 增量更新
- 并行工具执行
