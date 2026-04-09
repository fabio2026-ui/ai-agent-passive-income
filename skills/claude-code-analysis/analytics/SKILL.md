# Analytics & Telemetry Skill

事件追踪和性能监控系统。

## 功能
- 事件自动追踪
- 性能指标收集
- 错误报告
- 使用统计

## 追踪维度

| 维度 | 说明 |
|------|------|
| Tool Usage | 工具使用频率 |
| Query Metrics | 查询性能 |
| Session Duration | 会话时长 |
| Error Rates | 错误率 |
| User Engagement | 用户参与度 |

## 使用

```typescript
// 追踪事件
Analytics.track('video_generated', {
  duration: 41,
  model: 'jimeng',
  prompt_length: 100
});

// 计时
Analytics.time('memory_extraction', async () => {
  await extractMemories();
});

// 错误上报
Analytics.reportError(error, { context: 'video_gen' });
```

## 实现原理

基于Claude Code的 `services/analytics/`：
- 事件队列
- 批量上报
- 离线支持
- 隐私保护
