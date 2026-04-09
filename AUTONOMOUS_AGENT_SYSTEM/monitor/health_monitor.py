"""
╔═══════════════════════════════════════════════════════════════╗
║           📊 健康监控中心 - HealthMonitor                      ║
║              实时监控与告警系统                                 ║
╚═══════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import logging
import psutil
import threading
import time
from collections import deque
from datetime import datetime
from typing import Dict, List, Optional, Callable, Deque
from dataclasses import dataclass, asdict


@dataclass
class SystemMetrics:
    """系统指标"""
    timestamp: float
    cpu_percent: float
    memory_percent: float
    memory_available_mb: float
    disk_percent: float
    network_io_sent_mb: float
    network_io_recv_mb: float
    process_count: int
    thread_count: int
    
    
@dataclass
class AgentMetrics:
    """Agent指标"""
    agent_id: str
    timestamp: float
    status: str
    tasks_completed: int
    tasks_failed: int
    avg_response_time_ms: float
    last_heartbeat_age_seconds: float


@dataclass
class HealthReport:
    """健康报告"""
    timestamp: str
    overall_score: float
    system_health: Dict
    agent_health: Dict
    alerts: List[str]
    recommendations: List[str]


class HealthMonitor:
    """
    健康监控系统
    
    功能：
    1. 实时系统资源监控 (CPU/内存/磁盘/网络)
    2. Agent健康状态追踪
    3. 告警生成与分发
    4. 历史数据收集
    5. 健康报告生成
    """
    
    def __init__(self, legion_hq):
        self.logger = logging.getLogger("HealthMonitor")
        self.legion = legion_hq
        
        # 指标历史 (滑动窗口)
        self.system_metrics_history: Deque[SystemMetrics] = deque(maxlen=1000)
        self.agent_metrics: Dict[str, AgentMetrics] = {}
        
        # 告警配置
        self.alert_thresholds = {
            "cpu_percent": 80,
            "memory_percent": 85,
            "disk_percent": 90,
            "agent_heartbeat_max_age": 60,
            "agent_failure_rate": 0.3
        }
        
        # 告警状态 (防止重复告警)
        self._alert_state: Dict[str, bool] = {}
        self._alert_cooldown: Dict[str, float] = {}
        
        # 运行控制
        self._running = False
        self._monitor_task = None
        self._check_interval = 10  # 秒
        
        # 回调注册
        self._alert_handlers: List[Callable] = []
        
    def register_alert_handler(self, handler: Callable):
        """注册告警处理器"""
        self._alert_handlers.append(handler)
        
    async def initialize(self):
        """初始化监控"""
        self.logger.info("📊 初始化健康监控中心...")
        
        # 加载配置
        config = self.legion.config.get("monitor", {})
        self._check_interval = config.get("health_check_interval", 10)
        self.alert_thresholds["cpu_percent"] = config.get("alert_thresholds", {}).get("cpu_percent", 80)
        self.alert_thresholds["memory_percent"] = config.get("alert_thresholds", {}).get("memory_percent", 85)
        
        self.logger.info("✅ 监控中心初始化完成")
        
    async def start_monitoring(self):
        """启动监控循环"""
        self._running = True
        self.logger.info("📊 监控中心开始运行")
        
        while self._running:
            try:
                # 收集系统指标
                await self._collect_system_metrics()
                
                # 收集Agent指标
                await self._collect_agent_metrics()
                
                # 检查告警
                await self._check_alerts()
                
                # 保存到存储
                if self.system_metrics_history:
                    latest = self.system_metrics_history[-1]
                    await self.legion.storage.save_metrics({
                        "system_cpu": latest.cpu_percent,
                        "system_memory": latest.memory_percent,
                        "system_disk": latest.disk_percent
                    })
                    
                await asyncio.sleep(self._check_interval)
                
            except Exception as e:
                self.logger.error(f"监控循环错误: {e}")
                await asyncio.sleep(5)
                
    async def _collect_system_metrics(self):
        """收集系统指标"""
        try:
            # CPU使用率
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # 内存使用
            memory = psutil.virtual_memory()
            
            # 磁盘使用
            disk = psutil.disk_usage('/')
            
            # 网络IO
            net_io = psutil.net_io_counters()
            
            # 进程和线程数
            process_count = len(psutil.pids())
            thread_count = threading.active_count()
            
            metrics = SystemMetrics(
                timestamp=time.time(),
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_available_mb=memory.available / (1024 * 1024),
                disk_percent=disk.percent,
                network_io_sent_mb=net_io.bytes_sent / (1024 * 1024),
                network_io_recv_mb=net_io.bytes_recv / (1024 * 1024),
                process_count=process_count,
                thread_count=thread_count
            )
            
            self.system_metrics_history.append(metrics)
            
        except Exception as e:
            self.logger.error(f"收集系统指标失败: {e}")
            
    async def _collect_agent_metrics(self):
        """收集Agent指标"""
        if not self.legion.agent_pool:
            return
            
        try:
            for agent_id, agent in self.legion.agent_pool.agents.items():
                metrics = AgentMetrics(
                    agent_id=agent_id,
                    timestamp=time.time(),
                    status=agent.status,
                    tasks_completed=agent.tasks_completed,
                    tasks_failed=agent.tasks_failed,
                    avg_response_time_ms=agent.avg_response_time,
                    last_heartbeat_age_seconds=time.time() - agent.last_heartbeat
                )
                self.agent_metrics[agent_id] = metrics
                
        except Exception as e:
            self.logger.error(f"收集Agent指标失败: {e}")
            
    async def _check_alerts(self):
        """检查并触发告警"""
        alerts = []
        
        # 检查系统资源
        if self.system_metrics_history:
            latest = self.system_metrics_history[-1]
            
            # CPU告警
            if latest.cpu_percent > self.alert_thresholds["cpu_percent"]:
                alert_key = "cpu_high"
                if self._should_trigger_alert(alert_key):
                    alerts.append(f"⚠️ CPU使用率过高: {latest.cpu_percent:.1f}%")
                    self._set_alert_state(alert_key, True)
            else:
                self._set_alert_state("cpu_high", False)
                
            # 内存告警
            if latest.memory_percent > self.alert_thresholds["memory_percent"]:
                alert_key = "memory_high"
                if self._should_trigger_alert(alert_key):
                    alerts.append(f"⚠️ 内存使用率过高: {latest.memory_percent:.1f}%")
                    self._set_alert_state(alert_key, True)
            else:
                self._set_alert_state("memory_high", False)
                
            # 磁盘告警
            if latest.disk_percent > self.alert_thresholds["disk_percent"]:
                alert_key = "disk_high"
                if self._should_trigger_alert(alert_key):
                    alerts.append(f"⚠️ 磁盘使用率过高: {latest.disk_percent:.1f}%")
                    self._set_alert_state(alert_key, True)
            else:
                self._set_alert_state("disk_high", False)
                
        # 检查Agent健康
        dead_agents = []
        for agent_id, metrics in self.agent_metrics.items():
            if metrics.last_heartbeat_age_seconds > self.alert_thresholds["agent_heartbeat_max_age"]:
                alert_key = f"agent_dead_{agent_id}"
                if self._should_trigger_alert(alert_key):
                    alerts.append(f"💀 Agent {agent_id} 失去响应 ({metrics.last_heartbeat_age_seconds:.0f}s)")
                    dead_agents.append(agent_id)
                    self._set_alert_state(alert_key, True)
                    
                # 发布Agent死亡事件
                await self.legion.event_bus.publish("agent.died", {
                    "agent_id": agent_id,
                    "last_heartbeat_age": metrics.last_heartbeat_age_seconds
                })
                
        # 分发告警
        for alert in alerts:
            await self._dispatch_alert(alert)
            
        # 如果有关键告警，发布健康危急事件
        critical_alerts = [a for a in alerts if "💀" in a or (self.system_metrics_history and 
                          self.system_metrics_history[-1].cpu_percent > 95)]
        if critical_alerts:
            await self.legion.event_bus.publish("health.critical", {
                "alerts": critical_alerts,
                "timestamp": datetime.now().isoformat()
            })
            
    def _should_trigger_alert(self, alert_key: str) -> bool:
        """检查是否应该触发告警（冷却机制）"""
        now = time.time()
        cooldown = 300  # 5分钟冷却
        
        if alert_key in self._alert_cooldown:
            if now - self._alert_cooldown[alert_key] < cooldown:
                return False
                
        self._alert_cooldown[alert_key] = now
        return True
        
    def _set_alert_state(self, alert_key: str, active: bool):
        """设置告警状态"""
        self._alert_state[alert_key] = active
        
    async def _dispatch_alert(self, message: str):
        """分发告警"""
        self.logger.warning(message)
        
        # 调用注册的处理器
        for handler in self._alert_handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    asyncio.create_task(handler(message))
                else:
                    handler(message)
            except Exception as e:
                self.logger.error(f"告警处理器错误: {e}")
                
        # 保存到存储
        await self.legion.storage.log_event("alert", "HealthMonitor", {"message": message})
        
    async def get_health_score(self) -> float:
        """计算整体健康分数"""
        scores = []
        
        # 系统资源健康度
        if self.system_metrics_history:
            latest = self.system_metrics_history[-1]
            
            # CPU分数 (0-100, 越低越好)
            cpu_score = max(0, 100 - latest.cpu_percent)
            scores.append(cpu_score * 0.3)
            
            # 内存分数
            memory_score = max(0, 100 - latest.memory_percent)
            scores.append(memory_score * 0.3)
            
            # 磁盘分数
            disk_score = max(0, 100 - latest.disk_percent)
            scores.append(disk_score * 0.1)
            
        # Agent健康度
        if self.agent_metrics:
            alive_count = sum(1 for m in self.agent_metrics.values() 
                           if m.last_heartbeat_age_seconds < self.alert_thresholds["agent_heartbeat_max_age"])
            total_count = len(self.agent_metrics)
            if total_count > 0:
                agent_score = (alive_count / total_count) * 100
                scores.append(agent_score * 0.3)
                
        return sum(scores) if scores else 100.0
        
    async def generate_health_report(self) -> HealthReport:
        """生成健康报告"""
        alerts = []
        recommendations = []
        
        # 系统健康分析
        system_health = {}
        if self.system_metrics_history:
            recent = list(self.system_metrics_history)[-60:]  # 最近10分钟
            avg_cpu = sum(m.cpu_percent for m in recent) / len(recent)
            avg_memory = sum(m.memory_percent for m in recent) / len(recent)
            
            system_health = {
                "cpu_avg_10min": avg_cpu,
                "memory_avg_10min": avg_memory,
                "current_disk_usage": self.system_metrics_history[-1].disk_percent
            }
            
            if avg_cpu > 70:
                recommendations.append("CPU负载较高，考虑增加Agent实例或优化任务")
            if avg_memory > 75:
                recommendations.append("内存使用率高，建议检查内存泄漏或扩展资源")
                
        # Agent健康分析
        agent_health = {}
        if self.agent_metrics:
            total_agents = len(self.agent_metrics)
            healthy_agents = sum(1 for m in self.agent_metrics.values() 
                               if m.last_heartbeat_age_seconds < 30)
            
            agent_health = {
                "total": total_agents,
                "healthy": healthy_agents,
                "unhealthy": total_agents - healthy_agents
            }
            
            if healthy_agents < total_agents:
                alerts.append(f"有 {total_agents - healthy_agents} 个Agent不健康")
                
        overall_score = await self.get_health_score()
        
        return HealthReport(
            timestamp=datetime.now().isoformat(),
            overall_score=overall_score,
            system_health=system_health,
            agent_health=agent_health,
            alerts=alerts,
            recommendations=recommendations
        )
        
    async def get_system_status(self) -> Dict:
        """获取系统状态摘要"""
        if not self.system_metrics_history:
            return {"status": "unknown"}
            
        latest = self.system_metrics_history[-1]
        return {
            "cpu_percent": latest.cpu_percent,
            "memory_percent": latest.memory_percent,
            "memory_available_mb": latest.memory_available_mb,
            "disk_percent": latest.disk_percent,
            "process_count": latest.process_count,
            "thread_count": latest.thread_count,
            "timestamp": datetime.fromtimestamp(latest.timestamp).isoformat()
        }
        
    async def shutdown(self):
        """关闭监控"""
        self._running = False
        self.logger.info("📊 监控中心已停止")
