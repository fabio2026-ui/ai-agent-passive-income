"""
任务调度器
- 任务队列管理
- 优先级调度
- 自动任务分配
"""
import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field
from .constants import TaskPriority


@dataclass
class Task:
    """任务定义"""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str = ""
    description: str = ""
    priority: int = TaskPriority.MEDIUM
    status: str = "pending"  # pending, assigned, running, completed, failed
    assigned_to: str = None
    created_at: datetime = field(default_factory=datetime.now)
    started_at: datetime = None
    completed_at: datetime = None
    progress: float = 0.0
    result: dict = field(default_factory=dict)
    error: str = None
    retry_count: int = 0
    max_retries: int = 3
    dependencies: List[str] = field(default_factory=list)
    resources_required: Dict = field(default_factory=dict)
    

class TaskScheduler:
    """任务调度器"""
    
    def __init__(self, coordinator):
        self.coordinator = coordinator
        self.tasks: Dict[str, Task] = {}
        self.pending_queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self.running_tasks: Dict[str, Task] = {}
        self.completed_tasks: Dict[str, Task] = {}
        self.running = False
        self._lock = asyncio.Lock()
        
    async def start(self):
        """启动调度器"""
        self.running = True
        asyncio.create_task(self._scheduler_loop())
        
    async def stop(self):
        """停止调度器"""
        self.running = False
        
    async def submit_task(self, 
                         title: str, 
                         description: str = "",
                         priority: int = TaskPriority.MEDIUM,
                         dependencies: List[str] = None,
                         resources: Dict = None) -> Task:
        """提交新任务"""
        task = Task(
            title=title,
            description=description,
            priority=priority,
            dependencies=dependencies or [],
            resources_required=resources or {}
        )
        
        async with self._lock:
            self.tasks[task.id] = task
            await self.pending_queue.put((priority, task.created_at.timestamp(), task.id))
            
        await self.coordinator.event_bus.emit("task_submitted", {"task": task})
        return task
        
    async def _scheduler_loop(self):
        """调度主循环"""
        while self.running:
            try:
                # 获取下一个待处理任务
                if not self.pending_queue.empty():
                    _, _, task_id = await self.pending_queue.get()
                    
                    async with self._lock:
                        if task_id not in self.tasks:
                            continue
                        task = self.tasks[task_id]
                        
                        # 检查依赖是否完成
                        if not await self._check_dependencies(task):
                            # 依赖未完成，重新入队
                            await self.pending_queue.put((
                                task.priority, 
                                task.created_at.timestamp(), 
                                task.id
                            ))
                            await asyncio.sleep(1)
                            continue
                            
                    # 尝试分配任务
                    assigned = await self._assign_task(task)
                    if not assigned:
                        # 分配失败，重新入队
                        await self.pending_queue.put((
                            task.priority,
                            task.created_at.timestamp(),
                            task.id
                        ))
                        
                await asyncio.sleep(1)
            except Exception as e:
                print(f"[Scheduler] Error: {e}")
                await asyncio.sleep(1)
                
    async def _check_dependencies(self, task: Task) -> bool:
        """检查任务依赖是否完成"""
        for dep_id in task.dependencies:
            if dep_id not in self.tasks:
                return False
            dep_task = self.tasks[dep_id]
            if dep_task.status != "completed":
                return False
        return True
        
    async def _assign_task(self, task: Task) -> bool:
        """分配任务给Agent"""
        # 获取可用Agent
        available_agents = await self._get_available_agents()
        
        if not available_agents:
            return False
            
        # 选择最合适的Agent(基于资源使用情况)
        best_agent = min(available_agents, 
                        key=lambda a: a.get("resource_usage", 100))
        
        # 分配任务
        from .subagent_wrapper import spawn_agent
        
        result = await spawn_agent(
            task=task.description,
            label=f"task-{task.id}",
            timeout=3600
        )
        
        if result.get("success"):
            async with self._lock:
                task.status = "assigned"
                task.assigned_to = result.get("session_key")
                task.started_at = datetime.now()
                self.running_tasks[task.id] = task
                
            await self.coordinator.event_bus.emit("task_assigned", {
                "task": task,
                "agent": result.get("session_key")
            })
            return True
            
        return False
        
    async def _get_available_agents(self) -> List[Dict]:
        """获取可用Agent列表"""
        # 实际实现应该查询资源使用情况
        max_concurrent = self.coordinator.config.get("concurrent_tasks", 10)
        current_running = len(self.running_tasks)
        
        if current_running >= max_concurrent:
            return []
            
        # 返回可用槽位
        return [{"resource_usage": 50}] * (max_concurrent - current_running)
        
    async def update_task_progress(self, task_id: str, progress: float, result: dict = None):
        """更新任务进度"""
        async with self._lock:
            if task_id in self.tasks:
                self.tasks[task_id].progress = progress
                if result:
                    self.tasks[task_id].result.update(result)
                    
    async def complete_task(self, task_id: str, success: bool = True, result: dict = None, error: str = None):
        """完成任务"""
        async with self._lock:
            if task_id in self.tasks:
                task = self.tasks[task_id]
                task.status = "completed" if success else "failed"
                task.progress = 100.0 if success else task.progress
                task.completed_at = datetime.now()
                
                if result:
                    task.result.update(result)
                if error:
                    task.error = error
                    
                if task_id in self.running_tasks:
                    del self.running_tasks[task_id]
                    
                self.completed_tasks[task_id] = task
                
        await self.coordinator.event_bus.emit(
            "task_completed" if success else "task_failed",
            {"task": task}
        )
        
    def get_task(self, task_id: str) -> Optional[Task]:
        """获取任务信息"""
        return self.tasks.get(task_id)
        
    def get_pending_tasks(self) -> List[Task]:
        """获取待处理任务"""
        return [t for t in self.tasks.values() if t.status == "pending"]
        
    def get_running_tasks(self) -> List[Task]:
        """获取运行中任务"""
        return list(self.running_tasks.values())
        
    def get_completed_tasks(self) -> List[Task]:
        """获取已完成任务"""
        return list(self.completed_tasks.values())
        
    def get_stats(self) -> Dict:
        """获取统计信息"""
        total = len(self.tasks)
        pending = sum(1 for t in self.tasks.values() if t.status == "pending")
        running = len(self.running_tasks)
        completed = len(self.completed_tasks)
        failed = sum(1 for t in self.completed_tasks.values() if t.error)
        
        return {
            "total": total,
            "pending": pending,
            "running": running,
            "completed": completed,
            "failed": failed
        }
