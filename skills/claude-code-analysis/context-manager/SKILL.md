# Context Management Skill

系统和用户上下文管理系统。

## 上下文类型

### 系统上下文
- 操作系统信息
- 可用工具列表
- 环境变量
- 系统时间

### 用户上下文
- 用户偏好
- 历史命令
- 工作目录
- Git状态

### 项目上下文
- 项目结构
- 依赖信息
- 配置文件
- 最近修改

## 使用

```typescript
// 获取上下文
const context = ContextManager.get({
  include: ['system', 'git', 'project'],
  max_depth: 3
});

// 添加上下文
ContextManager.add('important_note', {
  content: '这是关键信息',
  persist: true
});
```
