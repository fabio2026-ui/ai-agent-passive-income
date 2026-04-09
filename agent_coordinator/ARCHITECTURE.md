# Agent协调器系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Agent协调器系统                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      主控 Dashboard                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │  统计面板   │  │ Agent列表   │  │  任务队列   │             │   │
│  │  │  (实时)     │  │  (状态+进度)│  │ (优先级)    │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │  ┌─────────────┐  ┌─────────────┐                              │   │
│  │  │  系统日志   │  │  操作面板   │                              │   │
│  │  │  (WebSocket)│  │ (创建/终止) │                              │   │
│  │  └─────────────┘  └─────────────┘                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼ WebSocket/HTTP                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AgentCoordinator (协调器)                     │   │
│  │                   ┌─────────────────┐                           │   │
│  │                   │   Event Bus     │◄──── 事件发布/订阅        │   │
│  │                   │   (事件总线)     │                           │   │
│  │                   └─────────────────┘                           │   │
│  │                          │                                       │   │
│  │      ┌───────────────────┼───────────────────┐                  │   │
│  │      ▼                   ▼                   ▼                  │   │
│  │ ┌──────────┐      ┌──────────┐      ┌──────────────┐           │   │
│  │ │ Agent    │      │ Task     │      │  Conflict    │           │   │
│  │ │ Monitor  │      │Scheduler │      │  Resolver    │           │   │
│  │ │(Agent监控)│      │(任务调度)│      │(冲突解决器)   │           │   │
│  │ └──────────┘      └──────────┘      └──────────────┘           │   │
│  │      │                   │                   │                  │   │
│  └──────┼───────────────────┼───────────────────┼──────────────────┘   │
│         │                   │                   │                       │
│  ┌──────┴───────────────────┴───────────────────┴──────────────────┐   │
│  │                     Subagent Wrapper                              │   │
│  │              (子Agent操作接口封装层)                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │   │
│  │  │  list   │ │  spawn  │ │  kill   │ │  steer  │                │   │
│  │  │ (列出)  │ │ (启动)  │ │ (终止)  │ │ (控制)  │                │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│  ┌───────────────────────────┴────────────────────────────────────┐    │
│  │                         子Agent层                               │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │    │
│  │  │ opportunity │ │   api-      │ │ sales-tax   │ │  etsy-   │ │    │
│  │  │    -bot     │ │ aggregator  │ │   -nexus    │ │ calculator│ │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

功能模块说明:
═══════════════════════════════════════════════════════════════════════════

1. Agent Monitor (Agent监控器)
   ├── 实时获取所有子Agent状态
   ├── 监控资源使用情况(CPU/内存/磁盘/API配额)
   ├── 检测异常和僵尸Agent(运行超时检测)
   ├── 自动健康检查和心跳监控
   └── 保存历史快照(最近100个)

2. Task Scheduler (任务调度器)
   ├── 优先级队列管理(1=关键, 5=后台)
   ├── 依赖任务检查(确保前置任务完成)
   ├── 智能负载均衡(基于资源使用情况)
   ├── 自动Agent分配(启动新Agent执行)
   └── 任务状态追踪(pending/running/completed/failed)

3. Conflict Resolver (资源冲突解决器)
   ├── 实时资源监控(CPU/内存/磁盘/API/浏览器/文件锁)
   ├── 优先级抢占策略(高优先级抢占低优先级)
   ├── 资源重分配(动态调整资源分配)
   ├── 冲突历史记录(最近50次)
   └── 资源阈值告警(80%阈值触发)

4. Event Bus (事件总线)
   ├── 异步事件发布/订阅
   ├── 支持多种事件类型:
   │   ├── agent_timeout      - Agent心跳超时
   │   ├── long_running_agent - 长时间运行Agent
   │   ├── task_submitted     - 任务提交
   │   ├── task_assigned      - 任务分配
   │   ├── task_completed     - 任务完成
   │   ├── task_failed        - 任务失败
   │   ├── resource_preempted - 资源被抢占
   │   ├── conflict_resolved  - 冲突已解决
   │   └── progress_report    - 进度报告
   └── 支持自定义事件处理器

5. Dashboard (Web Dashboard)
   ├── REST API接口
   │   ├── GET  /api/status   - 系统状态
   │   ├── GET  /api/agents   - 所有Agent
   │   ├── GET  /api/tasks    - 所有任务
   │   ├── POST /api/tasks    - 创建任务
   │   └── POST /api/agents/* - Agent操作
   ├── WebSocket实时推送
   │   └── 每2秒自动推送更新
   ├── 可视化界面
   │   ├── 统计面板(实时数字)
   │   ├── Agent列表(状态+进度条)
   │   ├── 任务队列(优先级标识)
   │   └── 系统日志(滚动显示)
   └── 操作功能
       ├── 新建任务
       ├── 终止Agent
       └── 刷新状态

数据流:
═══════════════════════════════════════════════════════════════════════════

[Agent状态更新] → Agent Monitor → Event Bus → Dashboard (WebSocket)
                                           ↓
[任务提交] → Task Scheduler → Subagent Wrapper → 启动新Agent
                                    ↓
                        [资源声明] → Conflict Resolver → [冲突检测/解决]
                                           ↓
                                    Event Bus → Dashboard

事件流示例:
═══════════════════════════════════════════════════════════════════════════

1. 任务提交流程:
   CLI/API → submit_task() → TaskScheduler.submit_task()
                         ↓
                    Event: task_submitted
                         ↓
                    Dashboard 显示新任务

2. 任务分配流程:
   Scheduler Loop → _assign_task() → spawn_agent()
                                 ↓
                            Agent Started
                                 ↓
                            Event: task_assigned
                                 ↓
                            Dashboard 更新状态

3. 资源冲突流程:
   Agent → register_claim() → _detect_conflicts()
                          ↓
                    Conflict Detected!
                          ↓
                    Priority Preemption
                          ↓
                    Event: resource_preempted
                          ↓
                    Event: conflict_resolved

4. 进度报告流程:
   Report Loop → _generate_report() → save to file
                                  ↓
                             Event: progress_report
                                  ↓
                             Dashboard 更新统计

配置选项:
═══════════════════════════════════════════════════════════════════════════

COORDINATOR_CONFIG = {
    "check_interval": 5,         # 状态检查间隔(秒)
    "report_interval": 30,       # 进度报告间隔(秒)
    "max_retries": 3,            # 任务失败最大重试次数
    "concurrent_tasks": 10,      # 最大并发任务数
    "resource_threshold": 0.8,   # 资源冲突阈值
    "enable_auto_heal": True,    # 启用自动修复
    "dashboard_port": 8080,      # Dashboard端口
}

资源限制:
═══════════════════════════════════════════════════════════════════════════

DEFAULT_RESOURCE_LIMITS = {
    "cpu": 80,        # CPU使用率上限 %
    "memory": 85,     # 内存使用率上限 %
    "disk": 90,       # 磁盘使用率上限 %
    "api_quota": 100, # API配额上限
    "browser": 3,     # 浏览器实例数
}

使用示例:
═══════════════════════════════════════════════════════════════════════════

# 1. 启动服务
./agent_coordinator/run.sh

# 2. 命令行工具
python3 agent_coordinator/cli.py status
python3 agent_coordinator/cli.py agents
python3 agent_coordinator/cli.py submit "新任务" --priority 2

# 3. Python API
from agent_coordinator import get_coordinator

coordinator = get_coordinator()
await coordinator.start()

# 提交任务
task_id = await coordinator.submit_task(
    title="数据分析",
    description="分析销售数据",
    priority=2
)

# 获取状态
status = coordinator.get_system_status()
agents = coordinator.get_all_agents()
tasks = coordinator.get_all_tasks()

# 订阅事件
async def handler(data):
    print(f"任务完成: {data}")

await coordinator.event_bus.on("task_completed", handler)

# 停止服务
await coordinator.stop()
```
