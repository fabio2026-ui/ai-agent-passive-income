"""
Agent 监控系统
- 实时获取所有Agent状态
- 监控资源使用情况
- 检测异常和僵尸Agent
"""
import json
import time
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict


@dataclass
class AgentStatus:
    """Agent状态数据"""
    session_key: str
    label: str
    status: str
    task: str
    runtime: str
    runtime_ms: int
    model: str
    started_at: int
    last_heartbeat: float
    progress: float = 0.0
    resources: Dict = None
    logs: List[str] = None
    
    def __post_init__(self):
        if self.resources is None:
            self.resources = {}
        if self.logs is None:
            self.logs = []


class AgentMonitor:
    """Agent监控器"""
    
    def __init__(self, coordinator):
        self.coordinator = coordinator
        self.agents: Dict[str, AgentStatus] = {}
        self.history: List[Dict] = []
        self.running = False
        self._lock = asyncio.Lock()
        
    async def start(self):
        """启动监控"""
        self.running = True
        asyncio.create_task(self._monitor_loop())
        
    async def stop(self):
        """停止监控"""
        self.running = False
        
    async def _monitor_loop(self):
        """监控主循环"""
        while self.running:
            try:
                await self._fetch_all_agents()
                await self._check_health()
                await self._save_history()
                await asyncio.sleep(self.coordinator.config.get("check_interval", 5))
            except Exception as e:
                print(f"[Monitor] Error: {e}")
                await asyncio.sleep(1)
                
    async def _fetch_all_agents(self):
        """获取所有Agent状态"""
        from .subagent_wrapper import list_agents
        
        agents_data = await list_agents()
        async with self._lock:
            for agent_data in agents_data:
                session_key = agent_data.get("sessionKey")
                if session_key in self.agents:
                    # 更新现有Agent
                    agent = self.agents[session_key]
                    agent.status = agent_data.get("status", agent.status)
                    agent.runtime = agent_data.get("runtime", agent.runtime)
                    agent.runtime_ms = agent_data.get("runtimeMs", agent.runtime_ms)
                    agent.last_heartbeat = time.time()
                else:
                    # 新Agent
                    self.agents[session_key] = AgentStatus(
                        session_key=session_key,
                        label=agent_data.get("label", "unknown"),
                        status=agent_data.get("status", "unknown"),
                        task=agent_data.get("task", "")[:100],
                        runtime=agent_data.get("runtime", "0m"),
                        runtime_ms=agent_data.get("runtimeMs", 0),
                        model=agent_data.get("model", "unknown"),
                        started_at=agent_data.get("startedAt", 0),
                        last_heartbeat=time.time(),
                        progress=0.0
                    )
                    
    async def _check_health(self):
        """检查Agent健康状态"""
        now = time.time()
        timeout_threshold = 60  # 60秒无心跳视为异常
        
        async with self._lock:
            for session_key, agent in self.agents.items():
                if agent.status == "running":
                    if now - agent.last_heartbeat > timeout_threshold:
                        # 心跳超时
                        await self.coordinator.event_bus.emit("agent_timeout", {
                            "session_key": session_key,
                            "agent": agent
                        })
                        
                # 检测僵尸Agent(运行时间过长)
                if agent.runtime_ms > 3600000:  # 超过1小时
                    await self.coordinator.event_bus.emit("long_running_agent", {
                        "session_key": session_key,
                        "agent": agent
                    })
                    
    async def _save_history(self):
        """保存历史快照"""
        snapshot = {
            "timestamp": datetime.now().isoformat(),
            "agents_count": len(self.agents),
            "agents": [
                {
                    "session_key": a.session_key,
                    "label": a.label,
                    "status": a.status,
                    "runtime": a.runtime,
                    "progress": a.progress
                }
                for a in self.agents.values()
            ]
        }
        self.history.append(snapshot)
        # 只保留最近100个快照
        if len(self.history) > 100:
            self.history = self.history[-100:]
            
    def get_agent(self, session_key: str) -> Optional[AgentStatus]:
        """获取单个Agent状态"""
        return self.agents.get(session_key)
        
    def get_all_agents(self) -> List[AgentStatus]:
        """获取所有Agent状态"""
        return list(self.agents.values())
        
    def get_active_agents(self) -> List[AgentStatus]:
        """获取活跃Agent"""
        return [a for a in self.agents.values() if a.status == "running"]
        
    def get_agent_stats(self) -> Dict:
        """获取统计信息"""
        total = len(self.agents)
        running = sum(1 for a in self.agents.values() if a.status == "running")
        completed = sum(1 for a in self.agents.values() if a.status == "completed")
        failed = sum(1 for a in self.agents.values() if a.status == "failed")
        
        return {
            "total": total,
            "running": running,
            "completed": completed,
            "failed": failed,
            "timestamp": datetime.now().isoformat()
        }
        
    async def update_agent_progress(self, session_key: str, progress: float, log: str = None):
        """更新Agent进度"""
        async with self._lock:
            if session_key in self.agents:
                self.agents[session_key].progress = min(100, max(0, progress))
                if log:
                    self.agents[session_key].logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] {log}")
                    # 只保留最近50条日志
                    if len(self.agents[session_key].logs) > 50:
                        self.agents[session_key].logs = self.agents[session_key].logs[-50:]
