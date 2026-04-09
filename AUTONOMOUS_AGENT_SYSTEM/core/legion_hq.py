"""
╔═══════════════════════════════════════════════════════════════╗
║           🏛️ 小七军团指挥部 - LegionHQ (Core Controller)        ║
║                   系统核心控制与协调中枢                          ║
╚═══════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import logging
import signal
import sys
import time
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, asdict


class SystemState(Enum):
    """系统运行状态"""
    INIT = "initializing"
    RUNNING = "running"
    DEGRADED = "degraded"
    RECOVERING = "recovering"
    STOPPING = "stopping"
    STOPPED = "stopped"


@dataclass
class LegionStatus:
    """军团状态数据"""
    state: str
    uptime_seconds: float
    total_tasks_completed: int
    total_tasks_failed: int
    active_agents: int
    pending_tasks: int
    system_health_score: float  # 0-100
    last_update: str


class EventBus:
    """事件总线 - 用于模块间通信 (纯asyncio实现)"""
    
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}
        self._lock = asyncio.Lock()
        self._event_queue = asyncio.Queue()
        self._running = False
        
    async def subscribe(self, event_type: str, handler: Callable):
        """订阅事件"""
        async with self._lock:
            if event_type not in self._subscribers:
                self._subscribers[event_type] = []
            self._subscribers[event_type].append(handler)
            
    async def unsubscribe(self, event_type: str, handler: Callable):
        """取消订阅"""
        async with self._lock:
            if event_type in self._subscribers:
                self._subscribers[event_type].remove(handler)
                
    async def publish(self, event_type: str, data: Any = None):
        """发布事件"""
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self._event_queue.put(event)
        
    async def process_events(self):
        """处理事件队列"""
        self._running = True
        while self._running:
            try:
                # 使用asyncio.wait_for实现超时机制
                event = await asyncio.wait_for(
                    self._event_queue.get(), 
                    timeout=1.0
                )
                event_type = event["type"]
                
                async with self._lock:
                    handlers = self._subscribers.get(event_type, []).copy()
                
                for handler in handlers:
                    try:
                        if asyncio.iscoroutinefunction(handler):
                            asyncio.create_task(handler(event["data"]))
                        else:
                            handler(event["data"])
                    except Exception as e:
                        logging.error(f"Event handler error: {e}")
                        
            except asyncio.TimeoutError:
                await asyncio.sleep(0.1)
                
    async def stop(self):
        """停止事件处理"""
        self._running = False


class LegionHQ:
    """
    小七军团指挥部
    
    职责：
    1. 全局状态管理
    2. 模块协调与通信
    3. 生命周期管理
    4. 决策中枢
    """
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if hasattr(self, '_initialized'):
            return
        self._initialized = True
        
        self.name = "小七军团v1.0"
        self.version = "1.0.0"
        self.start_time = None
        
        # 系统状态
        self.state = SystemState.INIT
        self._state_lock = asyncio.Lock()
        
        # 事件总线
        self.event_bus = EventBus()
        
        # 模块引用
        self.monitor = None
        self.scheduler = None
        self.agent_pool = None
        self.healer = None
        self.storage = None
        
        # 统计
        self.stats = {
            "tasks_completed": 0,
            "tasks_failed": 0,
            "recoveries": 0
        }
        
        # 运行控制
        self._running = False
        self._shutdown_event = asyncio.Event()
        
        # 配置
        self.config = self._load_config()
        
        # 设置日志
        self._setup_logging()
        
        self.logger = logging.getLogger("LegionHQ")
        self.logger.info(f"🏛️ {self.name} 初始化中...")
        
    def _load_config(self) -> dict:
        """加载配置"""
        config_path = Path(__file__).parent.parent / "config" / "legion.yaml"
        try:
            import yaml
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except Exception:
            return {
                "legion": {"max_agents": 10, "heartbeat_interval": 30},
                "monitor": {"health_check_interval": 10},
                "scheduler": {"max_concurrent_tasks": 20}
            }
    
    def _setup_logging(self):
        """配置日志"""
        log_dir = Path(__file__).parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"legion_{datetime.now().strftime('%Y%m%d')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s | %(levelname)s | [%(name)s] %(message)s",
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
    async def set_state(self, state: SystemState):
        """设置系统状态"""
        async with self._state_lock:
            old_state = self.state
            self.state = state
            self.logger.info(f"🔄 系统状态变更: {old_state.value} → {state.value}")
            
            # 发布状态变更事件
            await self.event_bus.publish("system.state_changed", {
                "old": old_state.value,
                "new": state.value,
                "timestamp": datetime.now().isoformat()
            })
            
    async def get_state(self) -> SystemState:
        """获取当前状态"""
        async with self._state_lock:
            return self.state
            
    async def initialize(self):
        """初始化所有模块"""
        self.logger.info("🔧 正在初始化系统模块...")
        
        # 按依赖顺序初始化
        from storage.persistent_store import PersistentStore
        from monitor.health_monitor import HealthMonitor
        from scheduler.task_scheduler import TaskScheduler
        from agents.agent_pool import AgentPool
        from healer.auto_healer import AutoHealer
        
        # 1. 存储层
        self.storage = PersistentStore()
        await self.storage.initialize()
        self.logger.info("✅ 存储层已就绪")
        
        # 2. 监控中心
        self.monitor = HealthMonitor(self)
        await self.monitor.initialize()
        self.logger.info("✅ 监控中心已就绪")
        
        # 3. 任务调度器
        self.scheduler = TaskScheduler(self)
        await self.scheduler.initialize()
        self.logger.info("✅ 任务调度器已就绪")
        
        # 4. Agent池
        self.agent_pool = AgentPool(self)
        await self.agent_pool.initialize()
        self.logger.info("✅ Agent池已就绪")
        
        # 5. 自我修复系统
        self.healer = AutoHealer(self)
        await self.healer.initialize()
        self.logger.info("✅ 自我修复系统已就绪")
        
        # 注册事件处理器
        await self._register_event_handlers()
        
        self.logger.info("🎉 所有模块初始化完成！")
        
    async def _register_event_handlers(self):
        """注册系统事件处理器"""
        await self.event_bus.subscribe("agent.died", self._on_agent_died)
        await self.event_bus.subscribe("task.failed", self._on_task_failed)
        await self.event_bus.subscribe("health.critical", self._on_health_critical)
        
    async def _on_agent_died(self, data):
        """Agent死亡事件处理"""
        self.logger.warning(f"💀 Agent {data.get('agent_id')} 已停止")
        # 触发自我修复
        await self.healer.handle_agent_failure(data.get('agent_id'))
        
    async def _on_task_failed(self, data):
        """任务失败事件处理"""
        self.stats["tasks_failed"] += 1
        self.logger.error(f"❌ 任务失败: {data.get('task_id')}")
        
    async def _on_health_critical(self, data):
        """健康状态危急处理"""
        self.logger.critical("🚨 系统健康状态危急！")
        await self.set_state(SystemState.DEGRADED)
        
    async def start(self):
        """启动军团"""
        if self._running:
            return
            
        self.start_time = time.time()
        self._running = True
        self.set_state(SystemState.RUNNING)
        
        self.logger.info(f"\n{'='*60}")
        self.logger.info(f"🚀 {self.name} v{self.version} 启动中...")
        self.logger.info(f"{'='*60}\n")
        
        # 启动所有模块
        tasks = [
            asyncio.create_task(self.event_bus.process_events()),
            asyncio.create_task(self.monitor.start_monitoring()),
            asyncio.create_task(self.scheduler.start_scheduling()),
            asyncio.create_task(self.agent_pool.manage_pool()),
            asyncio.create_task(self.healer.start_healing()),
            asyncio.create_task(self._main_loop())
        ]
        
        # 等待关闭信号
        await self._shutdown_event.wait()
        
        # 取消所有任务
        for task in tasks:
            task.cancel()
            
        await asyncio.gather(*tasks, return_exceptions=True)
        
    async def _main_loop(self):
        """主循环"""
        while self._running:
            try:
                # 系统健康检查
                health_score = await self._calculate_health_score()
                
                # 根据健康分数调整状态
                if health_score < 50 and self.state != SystemState.DEGRADED:
                    await self.set_state(SystemState.DEGRADED)
                elif health_score >= 80 and self.state == SystemState.DEGRADED:
                    await self.set_state(SystemState.RUNNING)
                    
                # 记录统计
                await self.storage.save_metrics({
                    "timestamp": datetime.now().isoformat(),
                    "health_score": health_score,
                    "state": self.state.value,
                    "stats": self.stats.copy()
                })
                
                await asyncio.sleep(self.config.get("legion", {}).get("heartbeat_interval", 30))
                
            except Exception as e:
                self.logger.error(f"主循环错误: {e}")
                await asyncio.sleep(5)
                
    async def _calculate_health_score(self) -> float:
        """计算系统健康分数 (0-100)"""
        scores = []
        
        # Agent健康度
        if self.agent_pool:
            agent_health = await self.agent_pool.get_health_score()
            scores.append(agent_health * 0.4)
            
        # 调度器健康度
        if self.scheduler:
            scheduler_health = await self.scheduler.get_health_score()
            scores.append(scheduler_health * 0.3)
            
        # 存储健康度
        if self.storage:
            storage_health = await self.storage.get_health_score()
            scores.append(storage_health * 0.3)
            
        return sum(scores) if scores else 100.0
        
    async def submit_task(self, task_type: str, task_data: dict, priority: int = 5) -> str:
        """提交任务到系统"""
        return await self.scheduler.submit_task(task_type, task_data, priority)
        
    async def get_status(self) -> LegionStatus:
        """获取军团状态"""
        uptime = time.time() - self.start_time if self.start_time else 0
        
        return LegionStatus(
            state=self.state.value,
            uptime_seconds=uptime,
            total_tasks_completed=self.stats["tasks_completed"],
            total_tasks_failed=self.stats["tasks_failed"],
            active_agents=len(self.agent_pool.active_agents) if self.agent_pool else 0,
            pending_tasks=len(self.scheduler.pending_tasks) if self.scheduler else 0,
            system_health_score=await self._calculate_health_score(),
            last_update=datetime.now().isoformat()
        )
        
    def shutdown(self, signal_num=None, frame=None):
        """关闭系统 (同步版本用于信号处理)"""
        self.logger.info("\n🛑 收到关闭信号，正在优雅关闭...")
        # 使用asyncio.create_task来调用异步的set_state
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(self._async_shutdown())
            else:
                loop.run_until_complete(self._async_shutdown())
        except:
            self._running = False
            self._shutdown_event.set()

    async def _async_shutdown(self):
        """异步关闭系统"""
        await self.set_state(SystemState.STOPPING)
        self._running = False
        self._shutdown_event.set()
        
    async def graceful_shutdown(self):
        """优雅关闭所有模块"""
        self.logger.info("🧹 正在清理资源...")
        
        if self.healer:
            await self.healer.shutdown()
        if self.agent_pool:
            await self.agent_pool.shutdown()
        if self.scheduler:
            await self.scheduler.shutdown()
        if self.monitor:
            await self.monitor.shutdown()
        if self.storage:
            await self.storage.shutdown()
            
        await self.event_bus.stop()
        await self.set_state(SystemState.STOPPED)
        self.logger.info("👋 系统已安全关闭")


# 全局访问点
legion = LegionHQ()
