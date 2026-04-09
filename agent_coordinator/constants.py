# Agent状态定义
class AgentState:
    PENDING = "pending"      # 等待启动
    RUNNING = "running"      # 运行中
    PAUSED = "paused"        # 暂停
    COMPLETED = "completed"  # 已完成
    FAILED = "failed"        # 失败
    CONFLICT = "conflict"    # 资源冲突

# 任务优先级
class TaskPriority:
    CRITICAL = 1    # 关键任务
    HIGH = 2        # 高优先级
    MEDIUM = 3      # 中等优先级
    LOW = 4         # 低优先级
    BACKGROUND = 5  # 后台任务

# 资源类型
class ResourceType:
    CPU = "cpu"
    MEMORY = "memory"
    DISK = "disk"
    NETWORK = "network"
    API_QUOTA = "api_quota"
    BROWSER = "browser"
    FILE_LOCK = "file_lock"

# 默认资源配置
DEFAULT_RESOURCE_LIMITS = {
    ResourceType.CPU: 80,        # CPU使用率上限 %
    ResourceType.MEMORY: 85,     # 内存使用率上限 %
    ResourceType.DISK: 90,       # 磁盘使用率上限 %
    ResourceType.API_QUOTA: 100, # API配额上限
    ResourceType.BROWSER: 3,     # 浏览器实例数
}

# 协调器配置
COORDINATOR_CONFIG = {
    "check_interval": 5,         # 状态检查间隔(秒)
    "report_interval": 30,       # 进度报告间隔(秒)
    "max_retries": 3,            # 任务失败最大重试次数
    "concurrent_tasks": 10,      # 最大并发任务数
    "resource_threshold": 0.8,   # 资源冲突阈值
    "enable_auto_heal": True,    # 启用自动修复
    "dashboard_port": 8080,      # Dashboard端口
}
