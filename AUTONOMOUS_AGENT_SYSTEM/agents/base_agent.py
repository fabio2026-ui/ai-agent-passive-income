"""
╔═══════════════════════════════════════════════════════════════╗
║           🤖 Agent工厂与基类 - Agent System                    ║
║              可扩展的智能Agent体系                               ║
╚═══════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import logging
import time
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field


class AgentStatus(Enum):
    """Agent状态"""
    IDLE = "idle"           # 空闲
    BUSY = "busy"           # 忙碌
    STARTING = "starting"   # 启动中
    STOPPING = "stopping"   # 停止中
    ERROR = "error"         # 错误
    DEAD = "dead"           # 死亡


class AgentType(Enum):
    """Agent类型"""
    WORKER = "worker"       # 通用工作Agent
    ANALYST = "analyst"     # 分析Agent
    CONNECTOR = "connector" # 连接Agent
    MANAGER = "manager"     # 管理Agent
    CUSTOM = "custom"       # 自定义Agent


@dataclass
class AgentCapabilities:
    """Agent能力定义"""
    can_process_data: bool = True
    can_call_api: bool = False
    can_analyze: bool = False
    can_learn: bool = False
    supported_task_types: List[str] = field(default_factory=list)
    max_concurrent_tasks: int = 1


class BaseAgent(ABC):
    """
    Agent基类
    
    所有Agent必须继承此类并实现execute_task方法
    """
    
    def __init__(self, agent_type: str, capabilities: Optional[AgentCapabilities] = None):
        self.agent_id = f"{agent_type}_{str(uuid.uuid4())[:6]}"
        self.agent_type = agent_type
        self.status = AgentStatus.IDLE
        self.capabilities = capabilities or AgentCapabilities()
        
        # 统计
        self.tasks_completed = 0
        self.tasks_failed = 0
        self.total_execution_time = 0.0
        self.avg_response_time = 0.0
        
        # 心跳
        self.last_heartbeat = time.time()
        self._heartbeat_interval = 10
        
        # 当前任务
        self._current_task: Optional[str] = None
        self._current_task_start: Optional[float] = None
        
        # 生命周期
        self._created_at = time.time()
        self._shutdown_event = asyncio.Event()
        self._running = False
        
        # 日志
        self.logger = logging.getLogger(f"Agent.{self.agent_id}")
        
    async def initialize(self):
        """初始化Agent"""
        self.status = AgentStatus.STARTING
        self.logger.info(f"🤖 Agent {self.agent_id} 初始化中...")
        
        try:
            await self._setup()
            self.status = AgentStatus.IDLE
            self._running = True
            
            # 启动心跳任务
            asyncio.create_task(self._heartbeat_loop())
            
            self.logger.info(f"✅ Agent {self.agent_id} 已就绪")
        except Exception as e:
            self.status = AgentStatus.ERROR
            self.logger.error(f"❌ Agent {self.agent_id} 初始化失败: {e}")
            raise
            
    async def _setup(self):
        """子类可覆盖的初始化逻辑"""
        pass
        
    async def _heartbeat_loop(self):
        """心跳循环"""
        while self._running and self.status != AgentStatus.DEAD:
            self.last_heartbeat = time.time()
            await asyncio.sleep(self._heartbeat_interval)
            
    async def execute_task(self, task_type: str, task_data: Dict[str, Any]) -> Any:
        """
        执行任务 (外部调用)
        
        Args:
            task_type: 任务类型
            task_data: 任务数据
            
        Returns:
            任务执行结果
        """
        if self.status == AgentStatus.BUSY:
            raise Exception(f"Agent {self.agent_id} 正忙")
            
        self.status = AgentStatus.BUSY
        self._current_task = task_type
        self._current_task_start = time.time()
        
        try:
            self.logger.debug(f"▶️ 开始执行任务: {task_type}")
            
            # 调用子类实现
            result = await self._do_execute(task_type, task_data)
            
            # 更新统计
            execution_time = time.time() - self._current_task_start
            self.tasks_completed += 1
            self.total_execution_time += execution_time
            self.avg_response_time = self.total_execution_time / self.tasks_completed
            
            self.logger.debug(f"✅ 任务完成: {task_type} (耗时: {execution_time:.2f}s)")
            
            return result
            
        except Exception as e:
            self.tasks_failed += 1
            self.logger.error(f"❌ 任务执行失败: {task_type} - {e}")
            raise
            
        finally:
            self.status = AgentStatus.IDLE
            self._current_task = None
            self._current_task_start = None
            
    @abstractmethod
    async def _do_execute(self, task_type: str, task_data: Dict[str, Any]) -> Any:
        """
        子类必须实现的任务执行逻辑
        
        Args:
            task_type: 任务类型
            task_data: 任务数据
            
        Returns:
            任务执行结果
        """
        pass
        
    async def shutdown(self):
        """关闭Agent"""
        self.logger.info(f"🛑 Agent {self.agent_id} 正在关闭...")
        self.status = AgentStatus.STOPPING
        self._running = False
        
        try:
            await self._cleanup()
            self.status = AgentStatus.DEAD
            self.logger.info(f"👋 Agent {self.agent_id} 已关闭")
        except Exception as e:
            self.logger.error(f"❌ Agent {self.agent_id} 关闭时出错: {e}")
            
    async def _cleanup(self):
        """子类可覆盖的清理逻辑"""
        pass
        
    def get_health_score(self) -> float:
        """获取Agent健康分数"""
        if self.status == AgentStatus.DEAD:
            return 0.0
        if self.status == AgentStatus.ERROR:
            return 20.0
        if self.status == AgentStatus.BUSY:
            return 80.0
        return 100.0
        
    def to_dict(self) -> Dict[str, Any]:
        """序列化为字典"""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "status": self.status.value,
            "capabilities": {
                "can_process_data": self.capabilities.can_process_data,
                "can_call_api": self.capabilities.can_call_api,
                "can_analyze": self.capabilities.can_analyze,
                "supported_task_types": self.capabilities.supported_task_types
            },
            "stats": {
                "tasks_completed": self.tasks_completed,
                "tasks_failed": self.tasks_failed,
                "avg_response_time_ms": self.avg_response_time * 1000,
                "uptime_seconds": time.time() - self._created_at
            },
            "current_task": self._current_task,
            "last_heartbeat_age": time.time() - self.last_heartbeat
        }


class WorkerAgent(BaseAgent):
    """
    通用工作Agent
    
    处理通用数据任务
    """
    
    def __init__(self):
        super().__init__(
            agent_type="worker",
            capabilities=AgentCapabilities(
                can_process_data=True,
                supported_task_types=["data_processing", "computation", "default"]
            )
        )
        
    async def _do_execute(self, task_type: str, task_data: Dict[str, Any]) -> Any:
        """执行任务"""
        if task_type == "data_processing":
            return await self._process_data(task_data)
        elif task_type == "computation":
            return await self._compute(task_data)
        else:
            # 通用处理
            return {"status": "completed", "task_type": task_type, "processed": True}
            
    async def _process_data(self, data: Dict) -> Dict:
        """处理数据"""
        # 模拟数据处理
        await asyncio.sleep(0.1)
        return {
            "status": "success",
            "processed_items": len(data),
            "timestamp": datetime.now().isoformat()
        }
        
    async def _compute(self, data: Dict) -> Dict:
        """计算任务"""
        # 模拟计算
        await asyncio.sleep(0.05)
        return {
            "status": "success",
            "result": "computed",
            "timestamp": datetime.now().isoformat()
        }


class AnalystAgent(BaseAgent):
    """
    分析Agent
    
    处理分析类任务
    """
    
    def __init__(self):
        super().__init__(
            agent_type="analyst",
            capabilities=AgentCapabilities(
                can_analyze=True,
                supported_task_types=["analysis", "report", "summarize"]
            )
        )
        
    async def _do_execute(self, task_type: str, task_data: Dict[str, Any]) -> Any:
        """执行分析任务"""
        if task_type == "analysis":
            return await self._analyze(task_data)
        elif task_type == "report":
            return await self._generate_report(task_data)
        elif task_type == "summarize":
            return await self._summarize(task_data)
        else:
            return {"status": "completed", "task_type": task_type, "analyzed": True}
            
    async def _analyze(self, data: Dict) -> Dict:
        """数据分析"""
        await asyncio.sleep(0.2)
        return {
            "status": "success",
            "analysis": "completed",
            "insights": ["insight_1", "insight_2"],
            "timestamp": datetime.now().isoformat()
        }
        
    async def _generate_report(self, data: Dict) -> Dict:
        """生成报告"""
        await asyncio.sleep(0.3)
        return {
            "status": "success",
            "report_type": data.get("report_type", "general"),
            "generated": True,
            "timestamp": datetime.now().isoformat()
        }
        
    async def _summarize(self, data: Dict) -> Dict:
        """摘要生成"""
        await asyncio.sleep(0.15)
        return {
            "status": "success",
            "summary": "This is a generated summary of the provided content.",
            "timestamp": datetime.now().isoformat()
        }


class ConnectorAgent(BaseAgent):
    """
    连接Agent
    
    处理外部API调用和网络任务
    """
    
    def __init__(self):
        super().__init__(
            agent_type="connector",
            capabilities=AgentCapabilities(
                can_call_api=True,
                supported_task_types=["api_call", "fetch", "webhook"]
            )
        )
        
    async def _do_execute(self, task_type: str, task_data: Dict[str, Any]) -> Any:
        """执行连接任务"""
        if task_type == "api_call":
            return await self._api_call(task_data)
        elif task_type == "fetch":
            return await self._fetch(task_data)
        else:
            return {"status": "completed", "task_type": task_type, "connected": True}
            
    async def _api_call(self, data: Dict) -> Dict:
        """API调用"""
        endpoint = data.get("endpoint", "")
        method = data.get("method", "GET")
        
        # 模拟API调用
        await asyncio.sleep(0.5)
        
        return {
            "status": "success",
            "endpoint": endpoint,
            "method": method,
            "response_code": 200,
            "timestamp": datetime.now().isoformat()
        }
        
    async def _fetch(self, data: Dict) -> Dict:
        """获取数据"""
        url = data.get("url", "")
        
        # 模拟获取
        await asyncio.sleep(0.3)
        
        return {
            "status": "success",
            "url": url,
            "content_length": 1024,
            "timestamp": datetime.now().isoformat()
        }


class CustomAgent(BaseAgent):
    """
    自定义Agent模板
    
    用户可以继承此类创建自己的Agent
    """
    
    def __init__(self, name: str, supported_tasks: List[str]):
        super().__init__(
            agent_type=f"custom_{name}",
            capabilities=AgentCapabilities(
                supported_task_types=supported_tasks
            )
        )
        self.custom_name = name
        
    async def _do_execute(self, task_type: str, task_data: Dict[str, Any]) -> Any:
        """自定义执行逻辑"""
        # 用户在这里实现自定义逻辑
        return {
            "status": "completed",
            "agent": self.custom_name,
            "task": task_type,
            "timestamp": datetime.now().isoformat()
        }
