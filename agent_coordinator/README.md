# 🤖 Agent协调器系统

多Agent协调管理系统，提供实时监控、任务调度、资源冲突解决等功能。

## 📁 项目结构

```
agent_coordinator/
├── __init__.py              # 包初始化
├── constants.py             # 常量和配置
├── coordinator.py           # 主协调器
├── agent_monitor.py         # Agent监控模块
├── task_scheduler.py        # 任务调度器
├── conflict_resolver.py     # 资源冲突解决器
├── event_bus.py             # 事件总线
├── subagent_wrapper.py      # 子Agent操作包装器
├── dashboard.py             # Web Dashboard服务器
├── cli.py                   # 命令行工具
├── run.py                   # 主程序入口
├── run.sh                   # 启动脚本
├── static/
│   └── index.html           # Dashboard前端
└── reports/                 # 报告目录
```

## 🚀 快速开始

### 1. 启动协调器服务

```bash
# 使用启动脚本
./agent_coordinator/run.sh

# 或直接运行
python3 agent_coordinator/run.py
```

Dashboard将运行在 http://localhost:8080

### 2. 使用命令行工具

```bash
# 查看系统状态
python3 agent_coordinator/cli.py status

# 列出所有Agent
python3 agent_coordinator/cli.py agents

# 提交新任务
python3 agent_coordinator/cli.py submit "数据分析任务" --priority 2

# 实时监控模式
python3 agent_coordinator/cli.py monitor
```

## 🎯 核心功能

### 1️⃣ 监控所有子Agent状态

- 实时获取所有Agent的运行状态
- 监控资源使用情况(CPU/内存/磁盘/API配额)
- 检测异常和僵尸Agent
- 自动健康检查和故障恢复

```python
from agent_coordinator import get_coordinator

coordinator = get_coordinator()
agents = coordinator.get_all_agents()
```

### 2️⃣ 汇总各Agent进度报告

- 每30秒自动生成进度报告
- WebSocket实时推送更新
- 任务完成/失败通知
- 历史报告存储

### 3️⃣ 自动分配新任务

- 优先级队列管理
- 依赖任务检查
- 智能负载均衡
- 自动Agent分配

```python
# 提交任务
task_id = await coordinator.submit_task(
    title="数据分析",
    description="分析销售数据",
    priority=2  # 1=关键, 5=后台
)
```

### 4️⃣ 资源冲突解决

- 实时资源监控
- 优先级抢占策略
- 资源重分配
- 冲突历史记录

支持资源类型:
- CPU使用率
- 内存使用率
- 磁盘空间
- API配额
- 浏览器实例
- 文件锁

## 📊 Dashboard功能

Dashboard提供以下实时监控能力:

| 功能 | 描述 |
|------|------|
| 📈 统计面板 | 实时显示Agent和任务统计 |
| 🤖 Agent列表 | 查看所有Agent状态和进度 |
| 📋 任务队列 | 管理待处理/运行中/已完成任务 |
| 🔄 实时更新 | WebSocket每秒推送更新 |
| 📝 系统日志 | 查看系统运行日志 |
| ➕ 新建任务 | 通过UI提交新任务 |
| 🛑 终止Agent | 一键终止运行中的Agent |

## ⚙️ 配置选项

```python
COORDINATOR_CONFIG = {
    "check_interval": 5,         # 状态检查间隔(秒)
    "report_interval": 30,       # 进度报告间隔(秒)
    "max_retries": 3,            # 任务失败最大重试次数
    "concurrent_tasks": 10,      # 最大并发任务数
    "resource_threshold": 0.8,   # 资源冲突阈值
    "enable_auto_heal": True,    # 启用自动修复
    "dashboard_port": 8080,      # Dashboard端口
}
```

## 🔌 API接口

### REST API

```
GET  /api/status        # 系统状态
GET  /api/agents        # 所有Agent
GET  /api/tasks         # 所有任务
POST /api/tasks         # 创建任务
POST /api/agents/{id}/kill    # 终止Agent
POST /api/agents/{id}/steer   # 发送指令
```

### WebSocket

```javascript
ws://localhost:8080/ws

// 发送
{ "action": "get_status" }

// 接收
{ "type": "update", "data": { ... } }
```

## 📡 事件系统

```python
# 订阅事件
await coordinator.event_bus.on("task_completed", handler)

# 触发事件
await coordinator.event_bus.emit("custom_event", data)
```

可用事件:
- `agent_timeout` - Agent心跳超时
- `long_running_agent` - 长时间运行Agent检测
- `task_submitted` - 任务提交
- `task_assigned` - 任务分配
- `task_completed` - 任务完成
- `task_failed` - 任务失败
- `resource_preempted` - 资源被抢占
- `conflict_resolved` - 冲突已解决
- `progress_report` - 进度报告

## 🧪 测试示例

```python
import asyncio
from agent_coordinator import get_coordinator

async def test():
    coordinator = get_coordinator()
    await coordinator.start()
    
    # 提交任务
    task_id = await coordinator.submit_task(
        "示例任务",
        "这是一个测试任务",
        priority=2
    )
    print(f"任务已创建: {task_id}")
    
    # 查看状态
    status = coordinator.get_system_status()
    print(f"系统状态: {status}")

asyncio.run(test())
```

## 🔧 扩展开发

### 添加自定义资源监控

```python
from agent_coordinator.constants import ResourceType

# 注册资源声明
await coordinator.resolver.register_claim(
    agent_id="agent:xxx",
    resource_type="custom_resource",
    amount=50,
    priority=2
)
```

### 自定义任务处理器

```python
# 订阅任务事件
async def on_task_completed(data):
    task = data.get("task")
    print(f"任务完成: {task.title}")

await coordinator.event_bus.on("task_completed", on_task_completed)
```

## 📈 未来扩展

- [ ] 多节点分布式协调
- [ ] 任务结果持久化存储
- [ ] 更复杂的依赖图管理
- [ ] 机器学习智能调度
- [ ] 告警通知系统
- [ ] REST API认证

## 📄 许可证

MIT License
