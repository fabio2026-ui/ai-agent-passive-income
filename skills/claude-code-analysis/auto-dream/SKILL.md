# Auto-Dream Skill

后台记忆整合和压缩系统。

## 功能
- 后台运行的记忆整理
- 4阶段处理流程
- 历史对话压缩
- 知识图谱构建

## 4阶段流程

1. **Orient** (定向): 确定记忆范围
2. **Gather** (收集): 汇总相关记忆
3. **Consolidate** (整合): 压缩和去重
4. **Prune** (修剪): 删除过期内容

## 使用

```typescript
// 启动后台整合
Dream.start({
  sessions: ['session1', 'session2'],
  strategy: 'compress',
  keepRecent: 30  // 保留最近30条
});

// 可视化状态
Dream.onProgress((progress) => {
  console.log(`整合进度: ${progress.percent}%`);
});
```

## 实现原理

基于Claude Code的 `services/autoDream/`：
- Background task
- Forked agent
- Observable progress
- Rollback support
