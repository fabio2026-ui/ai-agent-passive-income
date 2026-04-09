"""
╔═══════════════════════════════════════════════════════════════╗
║           🎛️ 任务调度器 - TaskScheduler                        ║
║              智能任务分配与负载均衡                             ║
╚═══════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import logging
import uuid
from collections import deque
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Callable, Deque, Set
from dataclasses import dataclass, field, asdict
import heapq


class TaskPriority(Enum):
    """任务优先级"""
    CRITICAL = 1
    HIGH = 3
    NORMAL = 5
    LOW = 7
    BACKGROUND = 10


class TaskStatus(Enum):
    """任务状态"""
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"


@dataclass(order=True)
class Task:
    """任务定义"""
    # 用于堆排序的字段必须在前
    priority: int = field(compare=True)
    created_at: float = field(compare=True)
    
    # 其他字段
    task_id: str = field(compare=False, default_factory=lambda: str(uuid.uuid4())[:8])
    task_type: str = field(compare=False, default="")
    data: Dict = field(compare=False, default_factory=dict)
    status: TaskStatus = field(compare=False, default=TaskStatus.PENDING)
    agent_id: Optional[str] = field(compare=False, default=None)
    retry_count: int = field(compare=False, default=0)
    max_retries: int = field(compare=False, default=3)
    started_at: Optional[float] = field(compare=False, default=None)
    completed_at: Optional[float] = field(compare=False, default=None)
    result: Optional[str] = field(compare=False, default=None)
    error: Optional[str] = field(compare=False, default=None)
    callback: Optional[Callable] = field(compare=False, default=None)
    
    def __post_init__(self):
        if self.created_at == 0:
            import time
            self.created_at = time.time()


class TaskScheduler:
    """
    智能任务调度器
    
    功能：
    1. 优先级任务队列
    2. 负载均衡分配
    3. 任务超时与重试
    4. 并发控制
    5. 任务结果回调
    """
    
    def __init__(self, legion_hq):
        self.logger = logging.getLogger("TaskScheduler")
        self.legion = legion_hq
        
        # 任务队列 (优先队列)
        self._task_queue: List[Task] = []
        self._queue_lock = asyncio.Lock()
        
        # 任务索引
        self._tasks: Dict[str, Task] = {}
        
        # 运行中任务
        self._running_tasks: Dict[str, asyncio.Task] = {}
        
        # 配置
        self._max_concurrent = 20
        self._task_timeout = 300
        self._retry_attempts = 3
        self._retry_delay = 5
        
        # 统计
        self.stats = {
            "submitted": 0,
            "completed": 0,
            "failed": 0,
            "retried": 0
        }
        
        # 任务类型到Agent类型的映射
        self._task_agent_mapping: Dict[str, str] = {
            "data_processing": "worker",
            "analysis": "analyst",
            "api_call": "connector",
            "default": "worker"
        }
        
        # 运行控制
        self._running = False
        self._semaphore = None
        self._scheduler_task = None
        
    async def initialize(self):
        """初始化调度器"""
        self.logger.info("🎛️ 初始化任务调度器...")
        
        # 加载配置
        config = self.legion.config.get("scheduler", {})
        self._max_concurrent = config.get("max_concurrent_tasks", 20)
        self._task_timeout = config.get("task_timeout_seconds", 300)
        self._retry_attempts = config.get("retry_attempts", 3)
        self._retry_delay = config.get("retry_delay_seconds", 5)
        
        # 信号量控制并发
        self._semaphore = asyncio.Semaphore(self._max_concurrent)
        
        self.logger.info(f"✅ 调度器初始化完成 (最大并发: {self._max_concurrent})")
        
    async def start_scheduling(self):
        """启动调度循环"""
        self._running = True
        self.logger.info("🎛️ 任务调度器开始运行")
        
        while self._running:
            try:
                # 分配任务
                await self._dispatch_tasks()
                
                # 清理完成的任务
                await self._cleanup_finished_tasks()
                
                # 处理重试
                await self._process_retries()
                
                await asyncio.sleep(0.1)
                
            except Exception as e:
                self.logger.error(f"调度循环错误: {e}")
                await asyncio.sleep(1)
                
    async def submit_task(self, task_type: str, task_data: Dict, 
                          priority: int = 5,
                          callback: Optional[Callable] = None) -> str:
        """
        提交任务
        
        Args:
            task_type: 任务类型
            task_data: 任务数据
            priority: 优先级 (1-10, 数字越小优先级越高)
            callback: 完成回调函数
            
        Returns:
            task_id: 任务ID
        """
        import time
        
        task = Task(
            task_id=str(uuid.uuid4())[:8],
            task_type=task_type,
            data=task_data,
            priority=priority,
            created_at=time.time(),
            callback=callback,
            max_retries=self._retry_attempts
        )
        
        async with self._queue_lock:
            heapq.heappush(self._task_queue, task)
            self._tasks[task.task_id] = task
            
        self.stats["submitted"] += 1
        
        # 保存到存储
        await self.legion.storage.save_task(
            self._task_to_record(task)
        )
        
        self.logger.debug(f"📥 任务已提交: {task.task_id} (类型: {task_type}, 优先级: {priority})")
        
        return task.task_id
        
    async def submit_batch(self, tasks: List[Dict]) -> List[str]:
        """批量提交任务"""
        task_ids = []
        for task_info in tasks:
            task_id = await self.submit_task(
                task_type=task_info.get("type", "default"),
                task_data=task_info.get("data", {}),
                priority=task_info.get("priority", 5),
                callback=task_info.get("callback")
            )
            task_ids.append(task_id)
        return task_ids
        
    async def cancel_task(self, task_id: str) -> bool:
        """取消任务"""
        if task_id not in self._tasks:
            return False
            
        task = self._tasks[task_id]
        
        if task.status == TaskStatus.PENDING:
            # 从队列中移除
            async with self._queue_lock:
                self._task_queue = [t for t in self._task_queue if t.task_id != task_id]
                heapq.heapify(self._task_queue)
            task.status = TaskStatus.CANCELLED
            return True
            
        elif task.status == TaskStatus.RUNNING and task_id in self._running_tasks:
            # 取消运行中的任务
            self._running_tasks[task_id].cancel()
            return True
            
        return False
        
    async def get_task_status(self, task_id: str) -> Optional[Dict]:
        """获取任务状态"""
        if task_id not in self._tasks:
            # 尝试从存储加载
            record = await self.legion.storage.get_task(task_id)
            if record:
                return asdict(record)
            return None
            
        task = self._tasks[task_id]
        return {
            "task_id": task.task_id,
            "task_type": task.task_type,
            "status": task.status.value,
            "priority": task.priority,
            "agent_id": task.agent_id,
            "retry_count": task.retry_count,
            "created_at": task.created_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at,
            "result": task.result,
            "error": task.error
        }
        
    async def _dispatch_tasks(self):
        """分配任务给Agent"""
        if not self.legion.agent_pool:
            return
            
        while self._task_queue and len(self._running_tasks) < self._max_concurrent:
            async with self._queue_lock:
                if not self._task_queue:
                    break
                task = heapq.heappop(self._task_queue)
                
            # 找到合适的Agent
            agent_type = self._task_agent_mapping.get(task.task_type, "worker")
            agent = await self.legion.agent_pool.acquire_agent(agent_type)
            
            if agent is None:
                # 没有可用Agent，放回队列
                async with self._queue_lock:
                    heapq.heappush(self._task_queue, task)
                break
                
            # 分配任务给Agent
            task.status = TaskStatus.RUNNING
            task.agent_id = agent.agent_id
            task.started_at = asyncio.get_event_loop().time()
            
            # 更新存储
            await self.legion.storage.update_task_status(
                task.task_id, "running", agent_id=agent.agent_id
            )
            
            # 创建执行协程
            exec_task = asyncio.create_task(
                self._execute_task(task, agent)
            )
            self._running_tasks[task.task_id] = exec_task
            
            self.logger.debug(f"▶️ 任务开始执行: {task.task_id} → Agent {agent.agent_id}")
            
    async def _execute_task(self, task: Task, agent):
        """执行单个任务"""
        try:
            async with self._semaphore:
                # 设置超时
                result = await asyncio.wait_for(
                    agent.execute_task(task.task_type, task.data),
                    timeout=self._task_timeout
                )
                
            # 任务成功
            task.status = TaskStatus.COMPLETED
            task.completed_at = asyncio.get_event_loop().time()
            task.result = json.dumps(result) if isinstance(result, dict) else str(result)
            
            self.stats["completed"] += 1
            self.legion.stats["tasks_completed"] += 1
            
            # 更新存储
            await self.legion.storage.update_task_status(
                task.task_id, "completed", result=task.result
            )
            
            self.logger.info(f"✅ 任务完成: {task.task_id}")
            
            # 调用回调
            if task.callback:
                try:
                    if asyncio.iscoroutinefunction(task.callback):
                        asyncio.create_task(task.callback(task.task_id, result, None))
                    else:
                        task.callback(task.task_id, result, None)
                except Exception as e:
                    self.logger.error(f"任务回调错误: {e}")
                    
        except asyncio.TimeoutError:
            task.error = "任务执行超时"
            await self._handle_task_failure(task, agent)
            
        except Exception as e:
            task.error = str(e)
            await self._handle_task_failure(task, agent)
            
        finally:
            # 释放Agent
            if self.legion.agent_pool:
                await self.legion.agent_pool.release_agent(agent.agent_id)
                
    async def _handle_task_failure(self, task: Task, agent):
        """处理任务失败"""
        self.stats["failed"] += 1
        self.legion.stats["tasks_failed"] += 1
        
        # 发布任务失败事件
        self.legion.event_bus.publish("task.failed", {
            "task_id": task.task_id,
            "error": task.error,
            "retry_count": task.retry_count
        })
        
        if task.retry_count < task.max_retries:
            # 重试
            task.retry_count += 1
            task.status = TaskStatus.RETRYING
            self.stats["retried"] += 1
            
            await self.legion.storage.update_task_status(
                task.task_id, "retrying", error=task.error
            )
            
            self.logger.warning(f"🔄 任务将重试: {task.task_id} (第 {task.retry_count} 次)")
            
            # 延迟后重新加入队列
            await asyncio.sleep(self._retry_delay * task.retry_count)
            task.status = TaskStatus.PENDING
            
            async with self._queue_lock:
                heapq.heappush(self._task_queue, task)
        else:
            # 最终失败
            task.status = TaskStatus.FAILED
            task.completed_at = asyncio.get_event_loop().time()
            
            await self.legion.storage.update_task_status(
                task.task_id, "failed", error=task.error
            )
            
            self.logger.error(f"❌ 任务最终失败: {task.task_id} - {task.error}")
            
            # 调用回调
            if task.callback:
                try:
                    if asyncio.iscoroutinefunction(task.callback):
                        asyncio.create_task(task.callback(task.task_id, None, task.error))
                    else:
                        task.callback(task.task_id, None, task.error)
                except Exception as e:
                    self.logger.error(f"任务失败回调错误: {e}")
                    
    async def _cleanup_finished_tasks(self):
        """清理完成的任务"""
        done_tasks = []
        for task_id, task in list(self._running_tasks.items()):
            if task.done():
                done_tasks.append(task_id)
                
        for task_id in done_tasks:
            del self._running_tasks[task_id]
            
    async def _process_retries(self):
        """处理重试逻辑 (由_handle_task_failure处理)"""
        pass
        
    def _task_to_record(self, task: Task):
        """转换任务为存储记录"""
        from storage.persistent_store import TaskRecord
        
        return TaskRecord(
            task_id=task.task_id,
            task_type=task.task_type,
            status=task.status.value,
            priority=task.priority,
            created_at=datetime.fromtimestamp(task.created_at).isoformat() if task.created_at else None,
            started_at=datetime.fromtimestamp(task.started_at).isoformat() if task.started_at else None,
            completed_at=datetime.fromtimestamp(task.completed_at).isoformat() if task.completed_at else None,
            result=task.result,
            error=task.error,
            agent_id=task.agent_id
        )
        
    async def get_health_score(self) -> float:
        """获取调度器健康分数"""
        if self.stats["submitted"] == 0:
            return 100.0
            
        success_rate = self.stats["completed"] / self.stats["submitted"]
        return success_rate * 100
        
    @property
    def pending_tasks(self) -> int:
        """待处理任务数"""
        return len(self._task_queue)
        
    @property
    def running_tasks_count(self) -> int:
        """运行中任务数"""
        return len(self._running_tasks)
        
    async def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            "submitted": self.stats["submitted"],
            "completed": self.stats["completed"],
            "failed": self.stats["failed"],
            "retried": self.stats["retried"],
            "pending": self.pending_tasks,
            "running": self.running_tasks_count,
            "success_rate": f"{(self.stats['completed'] / max(self.stats['submitted'], 1) * 100):.1f}%"
        }
        
    async def shutdown(self):
        """关闭调度器"""
        self._running = False
        
        # 取消所有运行中任务
        for task in self._running_tasks.values():
            task.cancel()
            
        # 等待任务完成
        if self._running_tasks:
            await asyncio.gather(*self._running_tasks.values(), return_exceptions=True)
            
        self.logger.info("🎛️ 任务调度器已停止")
