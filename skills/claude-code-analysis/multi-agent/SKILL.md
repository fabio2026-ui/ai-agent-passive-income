# Multi-Agent Coordination Skill

多代理协调和任务分配系统。

## 功能
- 子代理生命周期管理
- 代理间通信
- 任务并行执行
- 结果汇总

## 使用

```typescript
// 创建子代理任务
const agents = await AgentCoordinator.spawn([
  { name: 'researcher', task: '研究市场数据' },
  { name: 'writer', task: '撰写报告' },
  { name: 'reviewer', task: '审查质量' }
]);

// 并行执行
const results = await AgentCoordinator.runParallel(agents);

// 汇总结果
const final = AgentCoordinator.aggregate(results);
```

## 实现原理

基于Claude Code的 `coordinator/` 和 `tools/AgentTool/`：
- Forked agent 模式
- 资源共享和隔离
- 并发控制
- 结果聚合
