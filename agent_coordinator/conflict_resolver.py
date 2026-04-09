"""
资源冲突解决器
- 检测资源冲突
- 解决策略: 优先级抢占、资源重分配、队列等待
"""
import asyncio
from typing import Dict, List, Set
from dataclasses import dataclass
from .constants import ResourceType


@dataclass
class ResourceClaim:
    """资源声明"""
    agent_id: str
    resource_type: str
    amount: float
    priority: int
    timestamp: float


class ConflictResolver:
    """资源冲突解决器"""
    
    def __init__(self, coordinator):
        self.coordinator = coordinator
        self.resource_claims: Dict[str, List[ResourceClaim]] = {}
        self.resolved_conflicts: List[Dict] = []
        self._lock = asyncio.Lock()
        
    async def start(self):
        """启动冲突检测"""
        asyncio.create_task(self._conflict_detection_loop())
        
    async def _conflict_detection_loop(self):
        """冲突检测循环"""
        while True:
            try:
                await self._detect_conflicts()
                await asyncio.sleep(5)
            except Exception as e:
                print(f"[ConflictResolver] Error: {e}")
                await asyncio.sleep(1)
                
    async def register_claim(self, agent_id: str, resource_type: str, amount: float, priority: int = 3):
        """注册资源声明"""
        import time
        claim = ResourceClaim(
            agent_id=agent_id,
            resource_type=resource_type,
            amount=amount,
            priority=priority,
            timestamp=time.time()
        )
        
        async with self._lock:
            if resource_type not in self.resource_claims:
                self.resource_claims[resource_type] = []
            self.resource_claims[resource_type].append(claim)
            
    async def release_claim(self, agent_id: str, resource_type: str = None):
        """释放资源声明"""
        async with self._lock:
            if resource_type:
                if resource_type in self.resource_claims:
                    self.resource_claims[resource_type] = [
                        c for c in self.resource_claims[resource_type] 
                        if c.agent_id != agent_id
                    ]
            else:
                for claims in self.resource_claims.values():
                    claims[:] = [c for c in claims if c.agent_id != agent_id]
                    
    async def _detect_conflicts(self):
        """检测资源冲突"""
        conflicts = []
        
        async with self._lock:
            for resource_type, claims in self.resource_claims.items():
                total_claimed = sum(c.amount for c in claims)
                limit = self._get_resource_limit(resource_type)
                
                if total_claimed > limit:
                    # 检测到冲突
                    conflicts.append({
                        "resource_type": resource_type,
                        "total_claimed": total_claimed,
                        "limit": limit,
                        "claims": claims
                    })
                    
        for conflict in conflicts:
            await self._resolve_conflict(conflict)
            
    async def _resolve_conflict(self, conflict: Dict):
        """解决冲突"""
        resource_type = conflict["resource_type"]
        claims = conflict["claims"]
        limit = conflict["limit"]
        
        # 按优先级和时间排序
        sorted_claims = sorted(claims, key=lambda c: (c.priority, c.timestamp))
        
        # 策略1: 优先级抢占
        allocated = 0
        preempted = []
        
        for claim in sorted_claims:
            if allocated + claim.amount <= limit:
                allocated += claim.amount
            else:
                preempted.append(claim)
                
        # 通知被抢占的Agent
        for claim in preempted:
            await self.coordinator.event_bus.emit("resource_preempted", {
                "agent_id": claim.agent_id,
                "resource_type": resource_type,
                "reason": "higher_priority_claims"
            })
            
        # 记录解决方案
        resolution = {
            "timestamp": asyncio.get_event_loop().time(),
            "resource_type": resource_type,
            "strategy": "priority_preemption",
            "preempted_agents": [c.agent_id for c in preempted],
            "preserved_agents": [c.agent_id for c in sorted_claims if c not in preempted]
        }
        
        self.resolved_conflicts.append(resolution)
        
        await self.coordinator.event_bus.emit("conflict_resolved", resolution)
        
    def _get_resource_limit(self, resource_type: str) -> float:
        """获取资源限制"""
        from .constants import DEFAULT_RESOURCE_LIMITS
        return DEFAULT_RESOURCE_LIMITS.get(resource_type, 100)
        
    def get_conflict_history(self) -> List[Dict]:
        """获取冲突历史"""
        return self.resolved_conflicts[-50:]  # 最近50条
        
    def get_current_claims(self) -> Dict[str, List[Dict]]:
        """获取当前资源声明"""
        result = {}
        for resource_type, claims in self.resource_claims.items():
            result[resource_type] = [
                {
                    "agent_id": c.agent_id,
                    "amount": c.amount,
                    "priority": c.priority
                }
                for c in claims
            ]
        return result
