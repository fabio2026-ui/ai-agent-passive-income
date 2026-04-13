# Task Scheduler - Job Runner
# 小七团队开发
# 定时任务调度系统

import schedule
import time
import threading
import sqlite3
from datetime import datetime, timedelta
from typing import Callable, Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import json

class JobStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

@dataclass
class ScheduledJob:
    id: Optional[int]
    name: str
    command: str
    schedule_type: str  # interval, cron, once
    schedule_config: Dict
    status: JobStatus
    last_run: Optional[str] = None
    next_run: Optional[str] = None
    run_count: int = 0
    fail_count: int = 0
    created_at: Optional[str] = None

class TaskScheduler:
    """任务调度器"""
    
    def __init__(self, db_path: str = "scheduler.db"):
        self.db_path = db_path
        self.running = False
        self.scheduler_thread = None
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                command TEXT NOT NULL,
                schedule_type TEXT NOT NULL,
                schedule_config TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                last_run TIMESTAMP,
                next_run TIMESTAMP,
                run_count INTEGER DEFAULT 0,
                fail_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS job_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER,
                started_at TIMESTAMP,
                ended_at TIMESTAMP,
                status TEXT,
                output TEXT,
                error TEXT,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_job(self, job: ScheduledJob) -> int:
        """添加任务"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 计算下次运行时间
        next_run = self._calculate_next_run(job.schedule_type, job.schedule_config)
        
        cursor.execute('''
            INSERT INTO jobs (name, command, schedule_type, schedule_config, status, next_run)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            job.name,
            job.command,
            job.schedule_type,
            json.dumps(job.schedule_config),
            job.status.value,
            next_run
        ))
        
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return job_id
    
    def _calculate_next_run(self, schedule_type: str, config: Dict) -> str:
        """计算下次运行时间"""
        now = datetime.now()
        
        if schedule_type == "interval":
            minutes = config.get("minutes", 60)
            next_run = now + timedelta(minutes=minutes)
            return next_run.isoformat()
        
        elif schedule_type == "daily":
            hour = config.get("hour", 0)
            minute = config.get("minute", 0)
            next_run = now.replace(hour=hour, minute=minute, second=0)
            if next_run <= now:
                next_run += timedelta(days=1)
            return next_run.isoformat()
        
        elif schedule_type == "weekly":
            days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            day = config.get("day", "monday").lower()
            hour = config.get("hour", 0)
            
            target_weekday = days.index(day)
            days_ahead = target_weekday - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            
            next_run = now + timedelta(days=days_ahead)
            next_run = next_run.replace(hour=hour, minute=0, second=0)
            return next_run.isoformat()
        
        return now.isoformat()
    
    def get_pending_jobs(self) -> List[ScheduledJob]:
        """获取待执行的任务"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute('''
            SELECT * FROM jobs 
            WHERE status IN ('pending', 'running') 
            AND (next_run IS NULL OR next_run <= ?)
        ''', (now,))
        
        jobs = []
        for row in cursor.fetchall():
            jobs.append(ScheduledJob(
                id=row[0],
                name=row[1],
                command=row[2],
                schedule_type=row[3],
                schedule_config=json.loads(row[4]),
                status=JobStatus(row[5]),
                last_run=row[6],
                next_run=row[7],
                run_count=row[8],
                fail_count=row[9],
                created_at=row[10]
            ))
        
        conn.close()
        return jobs
    
    def execute_job(self, job_id: int):
        """执行任务"""
        import subprocess
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取任务详情
        cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return
        
        command = row[2]
        schedule_type = row[3]
        schedule_config = json.loads(row[4])
        
        # 记录开始
        started_at = datetime.now().isoformat()
        cursor.execute("UPDATE jobs SET status = ?, last_run = ? WHERE id = ?",
                      (JobStatus.RUNNING.value, started_at, job_id))
        conn.commit()
        
        # 执行命令
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            ended_at = datetime.now().isoformat()
            
            if result.returncode == 0:
                status = JobStatus.COMPLETED
                cursor.execute("UPDATE jobs SET run_count = run_count + 1 WHERE id = ?", (job_id,))
            else:
                status = JobStatus.FAILED
                cursor.execute("UPDATE jobs SET fail_count = fail_count + 1 WHERE id = ?", (job_id,))
            
            # 记录日志
            cursor.execute('''
                INSERT INTO job_logs (job_id, started_at, ended_at, status, output, error)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                job_id,
                started_at,
                ended_at,
                status.value,
                result.stdout,
                result.stderr if result.returncode != 0 else None
            ))
            
            # 更新下次运行时间
            next_run = self._calculate_next_run(schedule_type, schedule_config)
            cursor.execute('''
                UPDATE jobs SET status = ?, next_run = ? WHERE id = ?
            ''', (JobStatus.PENDING.value, next_run, job_id))
            
        except Exception as e:
            cursor.execute('''
                INSERT INTO job_logs (job_id, started_at, ended_at, status, error)
                VALUES (?, ?, ?, ?, ?)
            ''', (job_id, started_at, datetime.now().isoformat(), JobStatus.FAILED.value, str(e)))
            
            cursor.execute("UPDATE jobs SET status = ?, fail_count = fail_count + 1 WHERE id = ?",
                          (JobStatus.FAILED.value, job_id))
        
        conn.commit()
        conn.close()
    
    def start_scheduler(self):
        """启动调度器"""
        self.running = True
        
        def run_scheduler():
            while self.running:
                jobs = self.get_pending_jobs()
                for job in jobs:
                    if job.id:
                        # 在新线程中执行
                        thread = threading.Thread(target=self.execute_job, args=(job.id,))
                        thread.start()
                
                time.sleep(30)  # 每30秒检查一次
        
        self.scheduler_thread = threading.Thread(target=run_scheduler)
        self.scheduler_thread.start()
        print("✅ 调度器已启动")
    
    def stop_scheduler(self):
        """停止调度器"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join()
        print("🛑 调度器已停止")
    
    def get_job_logs(self, job_id: int, limit: int = 50) -> List[Dict]:
        """获取任务日志"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM job_logs 
            WHERE job_id = ? 
            ORDER BY started_at DESC 
            LIMIT ?
        ''', (job_id, limit))
        
        logs = []
        for row in cursor.fetchall():
            logs.append({
                'id': row[0],
                'started_at': row[2],
                'ended_at': row[3],
                'status': row[4],
                'output': row[5],
                'error': row[6]
            })
        
        conn.close()
        return logs
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM jobs")
        total_jobs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'running'")
        running_jobs = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(run_count) FROM jobs")
        total_runs = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT SUM(fail_count) FROM jobs")
        total_fails = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM job_logs WHERE status = 'failed'")
        recent_fails = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_jobs': total_jobs,
            'running_jobs': running_jobs,
            'total_runs': total_runs,
            'total_fails': total_fails,
            'success_rate': (total_runs - total_fails) / total_runs * 100 if total_runs > 0 else 0
        }

# 定价
PRICING = {
    'free': {
        'jobs': 5,
        'executions_per_month': 500,
        'features': ['基础调度', '日志查看']
    },
    'starter': {
        'price': 9,
        'jobs': 25,
        'executions_per_month': 5000,
        'features': ['API访问', 'Webhook通知', '优先级队列']
    },
    'pro': {
        'price': 29,
        'jobs': 100,
        'executions_per_month': 50000,
        'features': ['团队协作', '高级日志', '失败重试']
    },
    'enterprise': {
        'price': 99,
        'jobs': 999,
        'executions_per_month': 500000,
        'features': ['集群支持', 'SLA保障', '专属客服']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 25,
        'pro': 10,
        'enterprise': 2
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['enterprise'] * PRICING['enterprise']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    scheduler = TaskScheduler()
    
    # 添加示例任务
    job = ScheduledJob(
        id=None,
        name="Daily Backup",
        command="echo 'Running backup...'",
        schedule_type="daily",
        schedule_config={"hour": 2, "minute": 0},
        status=JobStatus.PENDING
    )
    
    job_id = scheduler.add_job(job)
    print(f"✅ 任务已添加: ID {job_id}")
    
    # 统计
    stats = scheduler.get_statistics()
    print(f"\n总任务数: {stats['total_jobs']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
