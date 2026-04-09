# Lifecycle Hooks Skill

可扩展的生命周期钩子系统。

## 钩子类型

### 查询钩子
- `preQuery`: 查询前
- `postQuery`: 查询后
- `onToolUse`: 工具使用时

### 会话钩子
- `onSessionStart`: 会话开始
- `onSessionEnd`: 会话结束
- `onMemoryFlush`: 记忆刷新

### 工具钩子
- `preToolUse`: 工具调用前
- `postToolUse`: 工具调用后
- `onToolError`: 工具错误时

## 使用

```typescript
// 注册钩子
Hooks.register('postQuery', async (context) => {
  // 自动提取记忆
  await Memory.extract(context);
});

Hooks.register('onToolError', async (error, tool) => {
  // 错误上报
  await Analytics.trackError(error, tool);
});
```

## 实现原理

基于Claude Code的 `utils/hooks/` 系统：
- 异步钩子支持
- 钩子优先级
- 错误处理
- 钩子链式调用
