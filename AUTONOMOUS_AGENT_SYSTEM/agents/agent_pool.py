"""
╔═══════════════════════════════════════════════════════════════╗
║           🏊 Agent池管理器 - AgentPool                         ║
║              动态Agent生命周期管理                              ║
╚═══════════════════════════════════════════════════════════════╝
"""

import asyncio
import logging
import time
from collections import deque
from typing import Dict, List, Optional, Set, Type, Deque

from agents.base_agent import BaseAgent, WorkerAgent, AnalystAgent, ConnectorAgent, AgentStatus


class AgentPool:
    """
    Agent池管理器
    
    功能：
    1. Agent生命周期管理 (创建/销毁)
    2. 动态扩缩容
    3. 任务分配与负载均衡
    4. 故障Agent检测与替换
    """
    
    def __init__(self, legion_hq):
        self.logger = logging.getLogger("AgentPool")
        self.legion = legion_hq
        
        # Agent注册表
        self.agents: Dict[str, BaseAgent] = {}
        self._agents_lock = asyncio.Lock()
        
        # Agent类型注册
        self._agent_factories: Dict[str, Type[BaseAgent]] = {
            "worker": WorkerAgent,
            "analyst": AnalystAgent,
            "connector": ConnectorAgent
        }
        
        # Agent队列 (按类型)
        self._idle_agents: Dict[str, Deque[str]] = {
            "worker": deque(),
            "analyst": deque(),
            "connector": deque()
        }
        
        # 使用中Agent
        self._busy_agents: Set[str] = set()
        
        # 配置
        self._min_idle = 2
        self._max_idle = 5
        self._max_agents = 10
        self._agent_lifetime = 3600  # 1小时
        self._auto_scale = True
        
        # 运行控制
        self._running = False
        self._pool_task = None
        
    def register_agent_type(self, agent_type: str, factory: Type[BaseAgent]):
        """注册新的Agent类型"""
        self._agent_factories[agent_type] = factory
        if agent_type not in self._idle_agents:
            self._idle_agents[agent_type] = deque()
        self.logger.info(f"✅ 注册Agent类型: {agent_type}")
        
    async def initialize(self):
        """初始化Agent池"""
        self.logger.info("🤖 初始化Agent池...")
        
        # 加载配置
        config = self.legion.config.get("agent_pool", {})
        self._min_idle = config.get("min_idle_agents", 2)
        self._max_idle = config.get("max_idle_agents", 5)
        self._max_agents = self.legion.config.get("legion", {}).get("max_agents", 10)
        self._agent_lifetime = config.get("agent_lifetime_seconds", 3600)
        self._auto_scale = config.get("auto_scale", True)
        
        # 创建初始Agent
        for agent_type in ["worker", "analyst"]:
            for _ in range(self._min_idle):
                await self._create_agent(agent_type)
                
        self.logger.info(f"✅ Agent池初始化完成 (当前: {len(self.agents)} 个Agent)")
        
    async def manage_pool(self):
        """池管理循环"""
        self._running = True
        self.logger.info("🏊 Agent池管理开始")
        
        while self._running:
            try:
                # 健康检查
                await self._health_check()
                
                # 自动扩缩容
                if self._auto_scale:
                    await self._auto_scale_pool()
                    
                # 清理过期Agent
                await self._cleanup_expired_agents()
                
                await asyncio.sleep(10)
                
            except Exception as e:
                self.logger.error(f"池管理错误: {e}")
                await asyncio.sleep(5)
                
    async def _create_agent(self, agent_type: str) -> Optional[BaseAgent]:
        """创建新Agent"""
        async with self._agents_lock:
            if len(self.agents) >= self._max_agents:
                self.logger.warning(f"⚠️ 达到最大Agent数量限制: {self._max_agents}")
                return None
                
        factory = self._agent_factories.get(agent_type)
        if not factory:
            self.logger.error(f"❌ 未知的Agent类型: {agent_type}")
            return None
            
        try:
            agent = factory()
            await agent.initialize()
            
            async with self._agents_lock:
                self.agents[agent.agent_id] = agent
                self._idle_agents[agent_type].append(agent.agent_id)
                
            # 保存到存储
            await self.legion.storage.save_agent(
                agent.agent_id, agent_type, agent.status.value, agent.to_dict()
            )
            
            self.logger.info(f"🆕 创建Agent: {agent.agent_id} (类型: {agent_type})")
            return agent
            
        except Exception as e:
            self.logger.error(f"❌ 创建Agent失败: {e}")
            return None
            
    async def _destroy_agent(self, agent_id: str):
        """销毁Agent"""
        async with self._agents_lock:
            if agent_id not in self.agents:
                return
                
            agent = self.agents[agent_id]
            
            # 从队列中移除
            for queue in self._idle_agents.values():
                if agent_id in queue:
                    queue.remove(agent_id)
                    
            if agent_id in self._busy_agents:
                self._busy_agents.remove(agent_id)
                
            del self.agents[agent_id]
            
        # 关闭Agent
        await agent.shutdown()
        self.logger.info(f"🗑️ 销毁Agent: {agent_id}")
        
    async def acquire_agent(self, agent_type: str) -> Optional[BaseAgent]:
        """
        获取一个可用Agent
        
        Args:
            agent_type: Agent类型
            
        Returns:
            BaseAgent实例或None
        """
        async with self._agents_lock:
            # 优先从空闲队列获取
            queue = self._idle_agents.get(agent_type, deque())
            
            while queue:
                agent_id = queue.popleft()
                
                if agent_id in self.agents:
                    agent = self.agents[agent_id]
                    
                    if agent.status == AgentStatus.IDLE:
                        self._busy_agents.add(agent_id)
                        return agent
                    elif agent.status == AgentStatus.DEAD:
                        # 死亡的Agent，跳过
                        continue
                        
            # 没有空闲Agent，尝试创建新的
            if len(self.agents) < self._max_agents:
                # 释放锁后再创建
                pass
                
        # 尝试创建新Agent
        if len(self.agents) < self._max_agents:
            agent = await self._create_agent(agent_type)
            if agent:
                async with self._agents_lock:
                    self._busy_agents.add(agent.agent_id)
                return agent
                
        return None
        
    async def release_agent(self, agent_id: str):
        """释放Agent回池"""
        async with self._agents_lock:
            if agent_id not in self.agents:
                return
                
            agent = self.agents[agent_id]
            
            if agent_id in self._busy_agents:
                self._busy_agents.remove(agent_id)
                
            if agent.status != AgentStatus.DEAD:
                agent_type = agent.agent_type
                self._idle_agents[agent_type].append(agent_id)
                
    async def _health_check(self):
        """健康检查"""
        dead_agents = []
        
        async with self._agents_lock:
            for agent_id, agent in self.agents.items():
                # 检查心跳
                heartbeat_age = time.time() - agent.last_heartbeat
                
                if heartbeat_age > 60:  # 1分钟无心跳
                    self.logger.warning(f"💀 Agent {agent_id} 心跳超时 ({heartbeat_age:.0f}s)")
                    dead_agents.append(agent_id)
                    
                elif agent.status == AgentStatus.ERROR:
                    self.logger.warning(f"⚠️ Agent {agent_id} 处于错误状态")
                    dead_agents.append(agent_id)
                    
        # 处理死亡Agent
        for agent_id in dead_agents:
            await self._destroy_agent(agent_id)
            
            # 发布事件
            await self.legion.event_bus.publish("agent.died", {
                "agent_id": agent_id,
                "reason": "health_check_failed"
            })
            
    async def _auto_scale_pool(self):
        """自动扩缩容"""
        for agent_type in self._agent_factories.keys():
            idle_count = len(self._idle_agents.get(agent_type, []))
            busy_count = sum(1 for aid in self._busy_agents 
                           if aid in self.agents and self.agents[aid].agent_type == agent_type)
            total = idle_count + busy_count
            
            # 扩容条件：空闲Agent不足且未达到上限
            if idle_count < self._min_idle and len(self.agents) < self._max_agents:
                needed = self._min_idle - idle_count
                for _ in range(needed):
                    await self._create_agent(agent_type)
                    
            # 缩容条件：空闲Agent过多
            elif idle_count > self._max_idle:
                excess = idle_count - self._max_idle
                async with self._agents_lock:
                    queue = self._idle_agents.get(agent_type, deque())
                    for _ in range(min(excess, len(queue))):
                        if queue:
                            agent_id = queue.popleft()
                            asyncio.create_task(self._destroy_agent(agent_id))
                            
    async def _cleanup_expired_agents(self):
        """清理过期Agent"""
        now = time.time()
        expired = []
        
        async with self._agents_lock:
            for agent_id, agent in self.agents.items():
                # 检查Agent年龄
                age = now - agent._created_at
                
                # 如果Agent空闲且超过生命周期，标记为过期
                if agent_id in self._idle_agents.get(agent.agent_type, []) and age > self._agent_lifetime:
                    expired.append(agent_id)
                    
        for agent_id in expired:
            # 检查是否会影响最小空闲数量
            agent_type = self.agents[agent_id].agent_type
            idle_count = len(self._idle_agents.get(agent_type, []))
            
            if idle_count > self._min_idle:
                await self._destroy_agent(agent_id)
                self.logger.info(f"🧹 清理过期Agent: {agent_id}")
                
    async def get_agent_stats(self) -> Dict:
        """获取Agent统计"""
        stats = {
            "total": len(self.agents),
            "by_type": {},
            "by_status": {
                "idle": 0,
                "busy": len(self._busy_agents),
                "error": 0,
                "dead": 0
            }
        }
        
        for agent_type in self._agent_factories.keys():
            stats["by_type"][agent_type] = {
                "idle": len(self._idle_agents.get(agent_type, [])),
                "busy": 0
            }
            
        for agent in self.agents.values():
            if agent.status == AgentStatus.IDLE:
                stats["by_status"]["idle"] += 1
            elif agent.status == AgentStatus.ERROR:
                stats["by_status"]["error"] += 1
            elif agent.status == AgentStatus.DEAD:
                stats["by_status"]["dead"] += 1
                
            if agent.agent_type in stats["by_type"] and agent.agent_id in self._busy_agents:
                stats["by_type"][agent.agent_type]["busy"] += 1
                
        return stats
        
    async def get_health_score(self) -> float:
        """获取池健康分数"""
        if not self.agents:
            return 100.0
            
        scores = []
        for agent in self.agents.values():
            scores.append(agent.get_health_score())
            
        return sum(scores) / len(scores)
        
    @property
    def active_agents(self) -> List[str]:
        """活跃Agent列表"""
        return [aid for aid, agent in self.agents.items() 
                if agent.status != AgentStatus.DEAD]
        
    async def restart_agent(self, agent_id: str) -> bool:
        """重启指定Agent"""
        if agent_id not in self.agents:
            return False
            
        agent = self.agents[agent_id]
        agent_type = agent.agent_type
        
        # 销毁旧Agent
        await self._destroy_agent(agent_id)
        
        # 创建新Agent
        new_agent = await self._create_agent(agent_type)
        return new_agent is not None
        
    async def shutdown(self):
        """关闭Agent池"""
        self._running = False
        self.logger.info("🛑 正在关闭Agent池...")
        
        # 关闭所有Agent
        agent_ids = list(self.agents.keys())
        for agent_id in agent_ids:
            await self._destroy_agent(agent_id)
            
        self.logger.info("👋 Agent池已关闭")
