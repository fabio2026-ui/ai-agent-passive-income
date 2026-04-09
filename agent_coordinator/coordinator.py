"""
Agent协调器主类
整合所有模块，提供统一的协调服务
"""
import asyncio
import json
from datetime import datetime
from typing import Dict, List, Optional
from .event_bus import EventBus
from .agent_monitor import AgentMonitor
from .task_scheduler import TaskScheduler
from .conflict_resolver import ConflictResolver
from .constants import COORDINATOR_CONFIG


class AgentCoordinator:
    """Agent协调器"""
    
    def __init__(self, config: Dict = None):
        self.config = config or COORDINATOR_CONFIG
        self.event_bus = EventBus()
        self.monitor = AgentMonitor(self)
        self.scheduler = TaskScheduler(self)
        self.resolver = ConflictResolver(self)
        self.started_at = datetime.now()
        self.is_running = False
        
        # 注册事件处理器
        self._setup_event_handlers()
        
    def _setup_event_handlers(self):
        """设置事件处理器"""
        asyncio.create_task(self.event_bus.on("agent_timeout", self._on_agent_timeout))
        asyncio.create_task(self.event_bus.on("long_running_agent", self._on_long_running))
        asyncio.create_task(self.event_bus.on("task_completed", self._on_task_completed))
        asyncio.create_task(self.event_bus.on("resource_preempted", self._on_resource_preempted))
        
    async def start(self):
        """启动协调器"""
        print("[Coordinator] Starting...")
        self.is_running = True
        
        # 启动各模块
        await self.monitor.start()
        await self.scheduler.start()
        await self.resolver.start()
        
        # 启动报告循环
        asyncio.create_task(self._report_loop())
        
        print("[Coordinator] Started successfully")
        
    async def stop(self):
        """停止协调器"""
        print("[Coordinator] Stopping...")
        self.is_running = False
        await self.monitor.stop()
        await self.scheduler.stop()
        
    async def _report_loop(self):
        """定期报告循环"""
        while self.is_running:
            try:
                await self._generate_report()
                await asyncio.sleep(self.config.get("report_interval", 30))
            except Exception as e:
                print(f"[Coordinator] Report error: {e}")
                await asyncio.sleep(1)
                
    async def _generate_report(self):
        """生成进度报告"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "uptime": str(datetime.now() - self.started_at),
            "agents": self.monitor.get_agent_stats(),
            "tasks": self.scheduler.get_stats(),
            "conflicts": len(self.resolver.resolved_conflicts)
        }
        
        # 广播报告
        await self.event_bus.emit("progress_report", report)
        
        # 保存到文件
        try:
            with open("/root/.openclaw/workspace/agent_coordinator/reports/latest.json", "w") as f:
                json.dump(report, f, indent=2)
        except:
            pass
            
    # 事件处理器
    async def _on_agent_timeout(self, data):
        """Agent超时处理"""
        agent = data.get("agent")
        print(f"[Coordinator] Agent timeout: {agent.label if agent else 'unknown'}")
        
        if self.config.get("enable_auto_heal"):
            # 自动重启
            from .subagent_wrapper import spawn_agent
            await spawn_agent(agent.task, agent.label)
            
    async def _on_long_running(self, data):
        """长时间运行Agent处理"""
        agent = data.get("agent")
        print(f"[Coordinator] Long running agent detected: {agent.label if agent else 'unknown'}")
        
    async def _on_task_completed(self, data):
        """任务完成处理"""
        task = data.get("task")
        print(f"[Coordinator] Task completed: {task.title if task else 'unknown'}")
        
    async def _on_resource_preempted(self, data):
        """资源被抢占处理"""
        agent_id = data.get("agent_id")
        resource_type = data.get("resource_type")
        print(f"[Coordinator] Resource preempted: {agent_id} - {resource_type}")
        
    # 公共API
    def get_system_status(self) -> Dict:
        """获取系统整体状态"""
        return {
            "status": "running" if self.is_running else "stopped",
            "started_at": self.started_at.isoformat(),
            "uptime": str(datetime.now() - self.started_at),
            "agents": self.monitor.get_agent_stats(),
            "tasks": self.scheduler.get_stats(),
            "resources": self.resolver.get_current_claims()
        }
        
    def get_all_agents(self) -> List[Dict]:
        """获取所有Agent详细信息"""
        return [
            {
                "session_key": a.session_key,
                "label": a.label,
                "status": a.status,
                "task": a.task,
                "runtime": a.runtime,
                "progress": a.progress,
                "resources": a.resources,
                "logs": a.logs[-10:] if a.logs else []
            }
            for a in self.monitor.get_all_agents()
        ]
        
    def get_all_tasks(self) -> Dict[str, List[Dict]]:
        """获取所有任务信息"""
        return {
            "pending": [self._task_to_dict(t) for t in self.scheduler.get_pending_tasks()],
            "running": [self._task_to_dict(t) for t in self.scheduler.get_running_tasks()],
            "completed": [self._task_to_dict(t) for t in self.scheduler.get_completed_tasks()]
        }
        
    def _task_to_dict(self, task) -> Dict:
        """任务转字典"""
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "assigned_to": task.assigned_to,
            "progress": task.progress,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }
        
    async def submit_task(self, title: str, description: str, priority: int = 3) -> str:
        """提交新任务"""
        task = await self.scheduler.submit_task(title, description, priority)
        return task.id
        
    async def kill_agent(self, session_key: str):
        """终止Agent"""
        from .subagent_wrapper import kill_agent
        return await kill_agent(session_key)
        
    async def steer_agent(self, session_key: str, message: str):
        """向Agent发送指令"""
        from .subagent_wrapper import steer_agent
        return await steer_agent(session_key, message)


# 全局协调器实例
_coordinator: Optional[AgentCoordinator] = None


def get_coordinator() -> AgentCoordinator:
    """获取协调器实例"""
    global _coordinator
    if _coordinator is None:
        _coordinator = AgentCoordinator()
    return _coordinator
