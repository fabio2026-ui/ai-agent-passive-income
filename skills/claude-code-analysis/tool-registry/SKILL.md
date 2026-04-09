# Tool Registry Skill

统一的工具注册和发现系统。

## 功能
- 动态工具注册
- 工具发现
- 权限控制
- 结果标准化

## 内置工具类型

### 文件工具
- `file_read`: 读取文件
- `file_write`: 写入文件
- `file_edit`: 编辑文件
- `glob`: 批量匹配
- `grep`: 文本搜索

### 执行工具
- `bash`: Bash命令
- `powershell`: PowerShell
- `repl`: 交互式REPL

### 代理工具
- `agent_spawn`: 创建子代理
- `task_create`: 创建任务

### 外部工具
- `web_search`: 网络搜索
- `web_fetch`: 网页获取
- `mcp`: MCP协议工具

## 使用

```typescript
// 注册工具
ToolRegistry.register({
  name: 'custom_tool',
  description: '自定义工具',
  input_schema: {...},
  handler: async (input) => {...}
});

// 调用工具
const result = await ToolRegistry.call('bash', { 
  command: 'ls -la' 
});
```
