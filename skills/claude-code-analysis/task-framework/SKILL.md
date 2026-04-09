# Task Framework Skill

统一的任务管理和状态跟踪系统。

## 功能
- 任务生命周期管理 (created → running → completed/failed)
- 可观察的任务进度
- 任务取消和清理
- 后台任务支持

## 使用

```typescript
// 创建任务
const taskId = TaskManager.create({
  type: 'video_generation',
  name: '生成网文视频',
  timeout: 1800
});

// 更新进度
TaskManager.update(taskId, { 
  status: 'running',
  progress: 50 
});

// 完成任务
TaskManager.complete(taskId, { result: videoPath });
```

## 实现原理

基于Claude Code的 `Task.ts` 系统：
- TaskStateBase: 统一任务状态接口
- 支持 React hooks 观察
- 自动超时处理
- 任务依赖管理
