"""
╔═══════════════════════════════════════════════════════════════╗
║           💾 持久化存储层 - PersistentStore                    ║
║                 数据持久化与状态管理                            ║
╚═══════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import logging
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass


@dataclass
class TaskRecord:
    """任务记录"""
    task_id: str
    task_type: str
    status: str  # pending, running, completed, failed
    priority: int
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[str] = None
    error: Optional[str] = None
    agent_id: Optional[str] = None


class PersistentStore:
    """
    持久化存储系统 (纯asyncio实现)
    
    功能：
    1. SQLite数据库存储
    2. 任务历史记录
    3. 指标数据存储
    4. 系统状态快照
    """
    
    def __init__(self, db_path: Optional[str] = None):
        self.logger = logging.getLogger("PersistentStore")
        
        if db_path is None:
            db_path = Path(__file__).parent.parent / "storage" / "legion.db"
        
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._lock = asyncio.Lock()
        self._conn: Optional[sqlite3.Connection] = None
        self._running = False
        
    def _get_connection(self) -> sqlite3.Connection:
        """获取数据库连接 (在同步执行器中使用)"""
        if self._conn is None:
            self._conn = sqlite3.connect(str(self.db_path))
            self._conn.row_factory = sqlite3.Row
        return self._conn
        
    async def initialize(self):
        """初始化数据库"""
        self.logger.info("💾 初始化持久化存储...")
        
        # 在同步线程中执行初始化
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._init_tables_sync)
        
        self._running = True
        self.logger.info("✅ 存储层初始化完成")
        
    def _init_tables_sync(self):
        """同步创建数据表 (在executor中运行)"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # 任务表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                task_id TEXT PRIMARY KEY,
                task_type TEXT NOT NULL,
                status TEXT NOT NULL,
                priority INTEGER DEFAULT 5,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                result TEXT,
                error TEXT,
                agent_id TEXT,
                retry_count INTEGER DEFAULT 0
            )
        ''')
        
        # Agent表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agents (
                agent_id TEXT PRIMARY KEY,
                agent_type TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_heartbeat TIMESTAMP,
                total_tasks INTEGER DEFAULT 0,
                failed_tasks INTEGER DEFAULT 0,
                metadata TEXT
            )
        ''')
        
        # 指标表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metric_type TEXT NOT NULL,
                metric_value REAL,
                metadata TEXT
            )
        ''')
        
        # 系统事件表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                event_type TEXT NOT NULL,
                source TEXT,
                data TEXT
            )
        ''')
        
        # 状态快照表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                snapshot_data TEXT NOT NULL
            )
        ''')
        
        # 创建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_metrics_time ON metrics(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_time ON events(timestamp)')
        
        conn.commit()
        
    async def save_task(self, task: TaskRecord):
        """保存任务记录"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._save_task_sync, task)

    def _save_task_sync(self, task: TaskRecord):
        """同步保存任务 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO tasks
            (task_id, task_type, status, priority, created_at, started_at, completed_at, result, error, agent_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            task.task_id, task.task_type, task.status, task.priority,
            task.created_at, task.started_at, task.completed_at,
            task.result, task.error, task.agent_id
        ))

        conn.commit()
            
    async def get_task(self, task_id: str) -> Optional[TaskRecord]:
        """获取任务记录"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._get_task_sync, task_id)

    def _get_task_sync(self, task_id: str) -> Optional[TaskRecord]:
        """同步获取任务 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM tasks WHERE task_id = ?', (task_id,))
        row = cursor.fetchone()

        if row:
            return TaskRecord(
                task_id=row['task_id'],
                task_type=row['task_type'],
                status=row['status'],
                priority=row['priority'],
                created_at=row['created_at'],
                started_at=row['started_at'],
                completed_at=row['completed_at'],
                result=row['result'],
                error=row['error'],
                agent_id=row['agent_id']
            )
        return None
            
    async def update_task_status(self, task_id: str, status: str,
                                  result: Optional[str] = None,
                                  error: Optional[str] = None,
                                  agent_id: Optional[str] = None):
        """更新任务状态"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._update_task_status_sync,
                                       task_id, status, result, error, agent_id)

    def _update_task_status_sync(self, task_id: str, status: str,
                                  result: Optional[str],
                                  error: Optional[str],
                                  agent_id: Optional[str]):
        """同步更新任务状态 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        updates = ["status = ?"]
        params = [status]

        if result is not None:
            updates.append("result = ?")
            params.append(result)
        if error is not None:
            updates.append("error = ?")
            params.append(error)
        if agent_id is not None:
            updates.append("agent_id = ?")
            params.append(agent_id)
        if status == "running":
            updates.append("started_at = CURRENT_TIMESTAMP")
        if status in ("completed", "failed"):
            updates.append("completed_at = CURRENT_TIMESTAMP")

        params.append(task_id)

        cursor.execute(f'''
            UPDATE tasks SET {', '.join(updates)} WHERE task_id = ?
        ''', params)

        conn.commit()
            
    async def get_pending_tasks(self, limit: int = 100) -> List[TaskRecord]:
        """获取待处理任务"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._get_pending_tasks_sync, limit)

    def _get_pending_tasks_sync(self, limit: int) -> List[TaskRecord]:
        """同步获取待处理任务 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM tasks
            WHERE status = 'pending'
            ORDER BY priority ASC, created_at ASC
            LIMIT ?
        ''', (limit,))

        rows = cursor.fetchall()
        return [TaskRecord(
            task_id=row['task_id'],
            task_type=row['task_type'],
            status=row['status'],
            priority=row['priority'],
            created_at=row['created_at'],
            started_at=row['started_at'],
            completed_at=row['completed_at'],
            result=row['result'],
            error=row['error'],
            agent_id=row['agent_id']
        ) for row in rows]

    async def save_agent(self, agent_id: str, agent_type: str, status: str,
                         metadata: Optional[Dict] = None):
        """保存Agent信息"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._save_agent_sync,
                                       agent_id, agent_type, status, metadata)

    def _save_agent_sync(self, agent_id: str, agent_type: str, status: str,
                         metadata: Optional[Dict]):
        """同步保存Agent信息 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO agents
            (agent_id, agent_type, status, last_heartbeat, metadata)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
        ''', (agent_id, agent_type, status, json.dumps(metadata) if metadata else None))

        conn.commit()

    async def update_agent_heartbeat(self, agent_id: str):
        """更新Agent心跳"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._update_agent_heartbeat_sync, agent_id)

    def _update_agent_heartbeat_sync(self, agent_id: str):
        """同步更新Agent心跳 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            UPDATE agents SET last_heartbeat = CURRENT_TIMESTAMP WHERE agent_id = ?
        ''', (agent_id,))

        conn.commit()

    async def save_metrics(self, metrics: Dict[str, Any]):
        """保存指标数据"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._save_metrics_sync, metrics)

    def _save_metrics_sync(self, metrics: Dict[str, Any]):
        """同步保存指标 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        for key, value in metrics.items():
            if isinstance(value, (int, float)):
                cursor.execute('''
                    INSERT INTO metrics (metric_type, metric_value, metadata)
                    VALUES (?, ?, ?)
                ''', (key, value, None))
            else:
                cursor.execute('''
                    INSERT INTO metrics (metric_type, metadata)
                    VALUES (?, ?)
                ''', (key, json.dumps(value) if not isinstance(value, str) else value))

        conn.commit()

    async def log_event(self, event_type: str, source: str, data: Dict):
        """记录系统事件"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._log_event_sync, event_type, source, data)

    def _log_event_sync(self, event_type: str, source: str, data: Dict):
        """同步记录事件 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO events (event_type, source, data)
            VALUES (?, ?, ?)
        ''', (event_type, source, json.dumps(data)))

        conn.commit()

    async def save_snapshot(self, snapshot_data: Dict):
        """保存系统状态快照"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._save_snapshot_sync, snapshot_data)

    def _save_snapshot_sync(self, snapshot_data: Dict):
        """同步保存快照 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO snapshots (snapshot_data)
            VALUES (?)
        ''', (json.dumps(snapshot_data),))

        # 只保留最近100个快照
        cursor.execute('''
            DELETE FROM snapshots WHERE id NOT IN (
                SELECT id FROM snapshots ORDER BY timestamp DESC LIMIT 100
            )
        ''')

        conn.commit()

    async def get_recent_metrics(self, hours: int = 24) -> List[Dict]:
        """获取最近指标"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._get_recent_metrics_sync, hours)

    def _get_recent_metrics_sync(self, hours: int) -> List[Dict]:
        """同步获取最近指标 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM metrics
            WHERE timestamp > datetime('now', '-{} hours')
            ORDER BY timestamp DESC
        '''.format(hours))

        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    async def get_health_score(self) -> float:
        """获取存储健康分数"""
        try:
            # 检查数据库是否可访问
            async with self._lock:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self._health_check_sync)
            return 100.0
        except Exception as e:
            self.logger.error(f"存储健康检查失败: {e}")
            return 0.0

    def _health_check_sync(self):
        """同步健康检查 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        cursor.fetchone()

    async def cleanup_old_data(self, days: int = 7):
        """清理旧数据"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._cleanup_old_data_sync, days)

    def _cleanup_old_data_sync(self, days: int):
        """同步清理旧数据 (在executor中运行，无需额外锁)"""
        conn = self._get_connection()
        cursor = conn.cursor()

        # 清理旧指标
        cursor.execute('''
            DELETE FROM metrics
            WHERE timestamp < datetime('now', '-{} days')
        '''.format(days))

        # 清理旧事件
        cursor.execute('''
            DELETE FROM events
            WHERE timestamp < datetime('now', '-{} days')
        '''.format(days))

        conn.commit()
        self.logger.info(f"已清理 {days} 天前的历史数据")

    async def shutdown(self):
        """关闭存储"""
        self._running = False

        # 关闭数据库连接
        async with self._lock:
            if self._conn:
                self._conn.close()
                self._conn = None

        self.logger.info("💾 存储层已关闭")
