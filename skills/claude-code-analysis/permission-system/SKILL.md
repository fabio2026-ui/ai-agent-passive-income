# Permission System Skill

细粒度的工具和资源权限控制。

## 功能
- 工具级权限控制
- 文件访问权限
- 网络请求权限
- 权限持久化

## 权限模式

- `auto`: 自动允许，无需确认
- `ask`: 每次询问用户
- `deny`: 完全禁止

## 使用

```yaml
# permissions.yaml
tools:
  bash:
    mode: ask
    allowed_commands: ['ls', 'cat', 'git']
  
  file_write:
    mode: auto
    allowed_paths: ['/workspace/']
    
  web_fetch:
    mode: deny
```

## 实现原理

基于Claude Code的权限系统：
- CanUseToolFn 接口
- PermissionMode 枚举
- 权限缓存和持久化
