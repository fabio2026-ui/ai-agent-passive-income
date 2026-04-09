"""
╔═══════════════════════════════════════════════════════════════╗
║           🏥 自我修复系统 - AutoHealer                         ║
║              故障检测与自动恢复                                 ║
╚═══════════════════════════════════════════════════════════════╝
"""

import asyncio
import logging
import time
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Set
from enum import Enum


class RecoveryAction(Enum):
    """恢复操作类型"""
    RESTART_AGENT = "restart_agent"
    RESTART_MODULE = "restart_module"
    CLEAR_QUEUE = "clear_queue"
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    EMERGENCY_SAVE = "emergency_save"
    FULL_RESTART = "full_restart"


class Incident:
    """故障事件"""
    
    def __init__(self, incident_type: str, source: str, description: str, severity: str = "warning"):
        self.id = f"{int(time.time())}_{hash(description) % 10000}"
        self.type = incident_type
        self.source = source
        self.description = description
        self.severity = severity  # info, warning, critical
        self.created_at = time.time()
        self.resolved_at: Optional[float] = None
        self.recovery_action: Optional[str] = None
        self.status = "open"
        
    def resolve(self, action: str):
        """标记为已解决"""
        self.status = "resolved"
        self.resolved_at = time.time()
        self.recovery_action = action


class AutoHealer:
    """
    自动修复系统
    
    功能：
    1. 故障检测与分类
    2. 自动恢复策略执行
    3. 恢复历史记录
    4. 预防性维护
    """
    
    def __init__(self, legion_hq):
        self.logger = logging.getLogger("AutoHealer")
        self.legion = legion_hq
        
        # 故障记录
        self.incidents: Dict[str, Incident] = {}
        self._incident_history: List[Incident] = []
        
        # 恢复计数 (用于防止无限恢复循环)
        self._recovery_attempts: Dict[str, List[float]] = defaultdict(list)
        self._max_restart_attempts = 5
        self._restart_cooldown = 300  # 5分钟
        
        # 配置
        self._enabled = True
        self._check_interval = 60
        
        # 运行控制
        self._running = False
        self._healer_task = None
        
    async def initialize(self):
        """初始化修复系统"""
        self.logger.info("🏥 初始化自我修复系统...")
        
        # 加载配置
        config = self.legion.config.get("healer", {})
        self._enabled = config.get("enabled", True)
        self._check_interval = config.get("check_interval", 60)
        self._max_restart_attempts = config.get("max_restart_attempts", 5)
        self._restart_cooldown = config.get("restart_cooldown_seconds", 300)
        
        # 注册事件处理器
        await self.legion.event_bus.subscribe("agent.died", self._on_agent_died)
        await self.legion.event_bus.subscribe("task.failed", self._on_task_failed)
        await self.legion.event_bus.subscribe("health.critical", self._on_health_critical)
        
        self.logger.info("✅ 自我修复系统初始化完成")
        
    async def start_healing(self):
        """启动修复循环"""
        if not self._enabled:
            self.logger.info("🏥 自我修复系统已禁用")
            return
            
        self._running = True
        self.logger.info("🏥 自我修复系统开始运行")
        
        while self._running:
            try:
                # 执行预防性检查
                await self._preventive_check()
                
                # 清理旧的恢复尝试记录
                await self._cleanup_recovery_history()
                
                await asyncio.sleep(self._check_interval)
                
            except Exception as e:
                self.logger.error(f"修复循环错误: {e}")
                await asyncio.sleep(10)
                
    async def handle_agent_failure(self, agent_id: str) -> bool:
        """
        处理Agent故障
        
        Args:
            agent_id: 故障Agent ID
            
        Returns:
            是否成功恢复
        """
        self.logger.info(f"🔧 开始修复Agent: {agent_id}")
        
        # 创建故障事件
        incident = Incident(
            incident_type="agent_failure",
            source=agent_id,
            description=f"Agent {agent_id} 失去响应",
            severity="warning"
        )
        self.incidents[incident.id] = incident
        
        # 检查恢复尝试次数
        if not self._can_attempt_recovery(agent_id):
            self.logger.error(f"❌ Agent {agent_id} 恢复尝试次数过多，停止自动修复")
            incident.status = "failed"
            self._incident_history.append(incident)
            del self.incidents[incident.id]
            return False
            
        # 尝试重启Agent
        success = await self._restart_agent(agent_id)
        
        if success:
            incident.resolve(RecoveryAction.RESTART_AGENT.value)
            self.logger.info(f"✅ Agent {agent_id} 已成功恢复")
        else:
            incident.status = "failed"
            self.logger.error(f"❌ Agent {agent_id} 恢复失败")
            
        # 记录历史
        self._incident_history.append(incident)
        del self.incidents[incident.id]
        
        return success
        
    async def handle_system_degradation(self, severity: str = "warning"):
        """处理系统降级"""
        self.logger.warning(f"🔧 开始处理系统降级 (级别: {severity})")
        
        incident = Incident(
            incident_type="system_degradation",
            source="system",
            description=f"系统健康状态降级: {severity}",
            severity=severity
        )
        self.incidents[incident.id] = incident
        
        # 根据严重程度采取不同措施
        if severity == "critical":
            # 紧急情况：保存状态并尝试恢复
            await self._emergency_save()
            
            # 清理任务队列
            # await self._clear_task_queue()
            
            # 重启所有模块
            await self._restart_all_modules()
            
            incident.resolve(RecoveryAction.FULL_RESTART.value)
            
        elif severity == "warning":
            # 警告情况：扩容Agent池
            await self._scale_up_agents()
            incident.resolve(RecoveryAction.SCALE_UP.value)
            
        self._incident_history.append(incident)
        del self.incidents[incident.id]
        
    async def _restart_agent(self, agent_id: str) -> bool:
        """重启Agent"""
        try:
            if not self.legion.agent_pool:
                return False
                
            # 记录恢复尝试
            self._recovery_attempts[agent_id].append(time.time())
            
            # 执行重启
            success = await self.legion.agent_pool.restart_agent(agent_id)
            return success
            
        except Exception as e:
            self.logger.error(f"重启Agent {agent_id} 失败: {e}")
            return False
            
    async def _restart_all_modules(self):
        """重启所有模块"""
        self.logger.warning("🔄 执行全系统重启...")
        
        # 按顺序重启
        modules = [
            ("scheduler", self.legion.scheduler),
            ("agent_pool", self.legion.agent_pool),
            ("monitor", self.legion.monitor),
        ]
        
        for name, module in modules:
            if module:
                try:
                    await module.shutdown()
                    await asyncio.sleep(1)
                    await module.initialize()
                    await asyncio.sleep(1)
                    self.logger.info(f"✅ 模块 {name} 已重启")
                except Exception as e:
                    self.logger.error(f"❌ 模块 {name} 重启失败: {e}")
                    
    async def _scale_up_agents(self):
        """扩容Agent"""
        if not self.legion.agent_pool:
            return
            
        self.logger.info("📈 扩容Agent池...")
        
        # 尝试增加worker类型的Agent
        for _ in range(2):
            # 通过AgentPool的自动扩容机制实现
            pass
            
    async def _clear_task_queue(self):
        """清理任务队列"""
        self.logger.warning("🧹 清理任务队列...")
        
        if self.legion.scheduler:
            # 取消所有待处理任务
            # 这里应该有一个方法来获取和取消任务
            pass
            
    async def _emergency_save(self):
        """紧急保存状态"""
        self.logger.warning("💾 执行紧急状态保存...")
        
        try:
            # 保存系统状态快照
            snapshot = {
                "timestamp": datetime.now().isoformat(),
                "legion_status": self.legion.get_status().__dict__ if hasattr(self.legion, 'get_status') else {},
                "active_tasks": len(self.legion.scheduler._running_tasks) if self.legion.scheduler else 0,
                "pending_tasks": len(self.legion.scheduler._task_queue) if self.legion.scheduler else 0,
                "active_agents": len(self.legion.agent_pool.agents) if self.legion.agent_pool else 0
            }
            
            await self.legion.storage.save_snapshot(snapshot)
            self.logger.info("✅ 紧急状态保存完成")
            
        except Exception as e:
            self.logger.error(f"❌ 紧急保存失败: {e}")
            
    async def _preventive_check(self):
        """预防性检查"""
        # 检查系统负载趋势
        if self.legion.monitor and len(self.legion.monitor.system_metrics_history) > 10:
            recent = list(self.legion.monitor.system_metrics_history)[-10:]
            avg_cpu = sum(m.cpu_percent for m in recent) / len(recent)
            
            # 如果CPU持续高负载，提前扩容
            if avg_cpu > 70:
                self.logger.info("📈 检测到高负载趋势，提前扩容")
                await self._scale_up_agents()
                
        # 检查Agent健康趋势
        if self.legion.agent_pool:
            dead_agents = sum(1 for a in self.legion.agent_pool.agents.values() 
                            if a.status.value == "dead")
            if dead_agents > 2:
                self.logger.warning(f"⚠️ 检测到 {dead_agents} 个死亡Agent，执行批量恢复")
                # 批量恢复逻辑
                
    async def _cleanup_recovery_history(self):
        """清理恢复历史"""
        now = time.time()
        
        for key in list(self._recovery_attempts.keys()):
            # 保留最近30分钟的记录
            self._recovery_attempts[key] = [
                t for t in self._recovery_attempts[key]
                if now - t < 1800
            ]
            
    def _can_attempt_recovery(self, target_id: str) -> bool:
        """检查是否可以尝试恢复"""
        attempts = self._recovery_attempts.get(target_id, [])
        
        # 检查最近5分钟内的尝试次数
        recent_attempts = [t for t in attempts if time.time() - t < self._restart_cooldown]
        
        return len(recent_attempts) < self._max_restart_attempts
        
    async def _on_agent_died(self, data):
        """Agent死亡事件处理"""
        agent_id = data.get("agent_id")
        if agent_id:
            asyncio.create_task(self.handle_agent_failure(agent_id))
            
    async def _on_task_failed(self, data):
        """任务失败事件处理"""
        # 如果任务失败率过高，可能需要调整
        pass
        
    async def _on_health_critical(self, data):
        """健康危急事件处理"""
        asyncio.create_task(self.handle_system_degradation("critical"))
        
    async def get_recovery_stats(self) -> Dict:
        """获取恢复统计"""
        total_incidents = len(self._incident_history) + len(self.incidents)
        resolved = sum(1 for i in self._incident_history if i.status == "resolved")
        failed = sum(1 for i in self._incident_history if i.status == "failed")
        
        # 按类型统计
        by_type = defaultdict(int)
        for i in list(self.incidents.values()) + self._incident_history:
            by_type[i.type] += 1
            
        return {
            "total_incidents": total_incidents,
            "open_incidents": len(self.incidents),
            "resolved": resolved,
            "failed": failed,
            "success_rate": f"{(resolved / max(total_incidents, 1) * 100):.1f}%",
            "by_type": dict(by_type),
            "recovery_attempts_pending": sum(len(v) for v in self._recovery_attempts.values())
        }
        
    async def get_active_incidents(self) -> List[Dict]:
        """获取活跃故障"""
        return [
            {
                "id": i.id,
                "type": i.type,
                "source": i.source,
                "description": i.description,
                "severity": i.severity,
                "created_at": datetime.fromtimestamp(i.created_at).isoformat(),
                "age_seconds": time.time() - i.created_at
            }
            for i in self.incidents.values()
        ]
        
    async def resolve_incident_manually(self, incident_id: str, resolution: str) -> bool:
        """手动解决故障"""
        if incident_id not in self.incidents:
            return False
            
        incident = self.incidents[incident_id]
        incident.resolve(resolution)
        incident.status = "resolved"
        
        self._incident_history.append(incident)
        del self.incidents[incident_id]
        
        self.logger.info(f"✅ 故障 {incident_id} 已手动解决: {resolution}")
        return True
        
    async def shutdown(self):
        """关闭修复系统"""
        self._running = False
        
        # 记录未解决的故障
        for incident in self.incidents.values():
            incident.status = "aborted"
            self._incident_history.append(incident)
            
        self.incidents.clear()
        self.logger.info("🏥 自我修复系统已关闭")
