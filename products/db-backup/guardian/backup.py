# Database Backup Tool - DB Guardian
# 小七团队开发
# 数据库备份和恢复系统

import sqlite3
import subprocess
import gzip
import shutil
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import os

class DatabaseType(Enum):
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"
    MONGODB = "mongodb"
    SQLITE = "sqlite"
    REDIS = "redis"

@dataclass
class BackupConfig:
    name: str
    db_type: DatabaseType
    host: str
    port: int
    database: str
    username: str
    password: str
    backup_dir: str = "./backups"
    retention_days: int = 30
    compress: bool = True
    encrypt: bool = False

class DBGuardian:
    """数据库备份守护"""
    
    def __init__(self):
        self.init_database()
    
    def init_database(self):
        """初始化备份记录数据库"""
        conn = sqlite3.connect('db_guardian.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS backups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                config_name TEXT NOT NULL,
                db_type TEXT NOT NULL,
                database_name TEXT NOT NULL,
                backup_path TEXT NOT NULL,
                size_bytes INTEGER,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                status TEXT,
                error_message TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                config_name TEXT UNIQUE NOT NULL,
                cron_expression TEXT,
                is_active BOOLEAN DEFAULT 1,
                last_run TIMESTAMP,
                next_run TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def backup_mysql(self, config: BackupConfig) -> str:
        """备份MySQL数据库"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{config.database}_{timestamp}.sql"
        
        if not os.path.exists(config.backup_dir):
            os.makedirs(config.backup_dir)
        
        filepath = os.path.join(config.backup_dir, filename)
        
        # 使用mysqldump
        cmd = [
            'mysqldump',
            '-h', config.host,
            '-P', str(config.port),
            '-u', config.username,
            f'-p{config.password}',
            config.database
        ]
        
        try:
            with open(filepath, 'w') as f:
                subprocess.run(cmd, stdout=f, check=True)
            
            # 压缩
            if config.compress:
                filepath = self._compress_file(filepath)
            
            return filepath
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"MySQL备份失败: {e}")
    
    def backup_postgresql(self, config: BackupConfig) -> str:
        """备份PostgreSQL数据库"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{config.database}_{timestamp}.dump"
        
        if not os.path.exists(config.backup_dir):
            os.makedirs(config.backup_dir)
        
        filepath = os.path.join(config.backup_dir, filename)
        
        # 设置环境变量
        env = os.environ.copy()
        env['PGPASSWORD'] = config.password
        
        cmd = [
            'pg_dump',
            '-h', config.host,
            '-p', str(config.port),
            '-U', config.username,
            '-F', 'c',  # 自定义格式
            '-f', filepath,
            config.database
        ]
        
        try:
            subprocess.run(cmd, env=env, check=True)
            return filepath
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"PostgreSQL备份失败: {e}")
    
    def backup_sqlite(self, config: BackupConfig) -> str:
        """备份SQLite数据库"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{config.database}_{timestamp}.db"
        
        if not os.path.exists(config.backup_dir):
            os.makedirs(config.backup_dir)
        
        filepath = os.path.join(config.backup_dir, filename)
        
        # 直接复制文件
        shutil.copy2(config.database, filepath)
        
        # 压缩
        if config.compress:
            filepath = self._compress_file(filepath)
        
        return filepath
    
    def _compress_file(self, filepath: str) -> str:
        """压缩文件"""
        compressed_path = f"{filepath}.gz"
        
        with open(filepath, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # 删除原文件
        os.remove(filepath)
        
        return compressed_path
    
    def run_backup(self, config: BackupConfig) -> Dict:
        """执行备份"""
        started_at = datetime.now()
        
        # 记录开始
        conn = sqlite3.connect('db_guardian.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO backups (config_name, db_type, database_name, backup_path, started_at, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (config.name, config.db_type.value, config.database, '', started_at, 'running'))
        
        backup_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        try:
            # 根据类型执行备份
            if config.db_type == DatabaseType.MYSQL:
                backup_path = self.backup_mysql(config)
            elif config.db_type == DatabaseType.POSTGRESQL:
                backup_path = self.backup_postgresql(config)
            elif config.db_type == DatabaseType.SQLITE:
                backup_path = self.backup_sqlite(config)
            else:
                raise Exception(f"不支持的数据库类型: {config.db_type}")
            
            # 获取文件大小
            size_bytes = os.path.getsize(backup_path)
            completed_at = datetime.now()
            
            # 更新记录
            conn = sqlite3.connect('db_guardian.db')
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE backups 
                SET backup_path = ?, size_bytes = ?, completed_at = ?, status = ?
                WHERE id = ?
            ''', (backup_path, size_bytes, completed_at, 'completed', backup_id))
            conn.commit()
            conn.close()
            
            # 清理旧备份
            self._cleanup_old_backups(config)
            
            return {
                'success': True,
                'backup_id': backup_id,
                'path': backup_path,
                'size_mb': size_bytes / (1024 * 1024),
                'duration': (completed_at - started_at).total_seconds()
            }
            
        except Exception as e:
            # 记录失败
            conn = sqlite3.connect('db_guardian.db')
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE backups 
                SET status = ?, error_message = ?, completed_at = ?
                WHERE id = ?
            ''', ('failed', str(e), datetime.now(), backup_id))
            conn.commit()
            conn.close()
            
            raise e
    
    def _cleanup_old_backups(self, config: BackupConfig):
        """清理旧备份"""
        cutoff_date = datetime.now() - timedelta(days=config.retention_days)
        
        conn = sqlite3.connect('db_guardian.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT backup_path FROM backups 
            WHERE config_name = ? AND completed_at < ?
        ''', (config.name, cutoff_date))
        
        for row in cursor.fetchall():
            backup_path = row[0]
            if os.path.exists(backup_path):
                os.remove(backup_path)
                print(f"已删除旧备份: {backup_path}")
        
        cursor.execute('''
            DELETE FROM backups 
            WHERE config_name = ? AND completed_at < ?
        ''', (config.name, cutoff_date))
        
        conn.commit()
        conn.close()
    
    def restore_backup(self, backup_id: int, target_config: BackupConfig) -> bool:
        """从备份恢复"""
        conn = sqlite3.connect('db_guardian.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT backup_path, db_type FROM backups WHERE id = ?', (backup_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise Exception("备份不存在")
        
        backup_path, db_type = row
        
        # 解压缩
        if backup_path.endswith('.gz'):
            decompressed_path = backup_path[:-3]
            with gzip.open(backup_path, 'rb') as f_in:
                with open(decompressed_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            backup_path = decompressed_path
        
        # 根据类型恢复
        if db_type == DatabaseType.MYSQL.value:
            return self._restore_mysql(backup_path, target_config)
        elif db_type == DatabaseType.POSTGRESQL.value:
            return self._restore_postgresql(backup_path, target_config)
        elif db_type == DatabaseType.SQLITE.value:
            shutil.copy2(backup_path, target_config.database)
            return True
        
        return False
    
    def get_backup_history(self, config_name: str = None, limit: int = 50) -> List[Dict]:
        """获取备份历史"""
        conn = sqlite3.connect('db_guardian.db')
        cursor = conn.cursor()
        
        if config_name:
            cursor.execute('''
                SELECT * FROM backups WHERE config_name = ? 
                ORDER BY started_at DESC LIMIT ?
            ''', (config_name, limit))
        else:
            cursor.execute('''
                SELECT * FROM backups ORDER BY started_at DESC LIMIT ?
            ''', (limit,))
        
        backups = []
        for row in cursor.fetchall():
            backups.append({
                'id': row[0],
                'config_name': row[1],
                'db_type': row[2],
                'database': row[3],
                'path': row[4],
                'size_mb': row[5] / (1024 * 1024) if row[5] else 0,
                'started_at': row[6],
                'completed_at': row[7],
                'status': row[8],
                'error': row[9]
            })
        
        conn.close()
        return backups
    
    def get_storage_stats(self) -> Dict:
        """获取存储统计"""
        conn = sqlite3.connect('db_guardian.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT SUM(size_bytes) FROM backups WHERE status = 'completed'")
        total_size = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM backups WHERE status = 'completed'")
        total_backups = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM backups WHERE status = 'failed'")
        failed_backups = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_size_gb': total_size / (1024 * 1024 * 1024),
            'total_backups': total_backups,
            'failed_backups': failed_backups,
            'success_rate': (total_backups / (total_backups + failed_backups) * 100) if (total_backups + failed_backups) > 0 else 0
        }

# 定价
PRICING = {
    'free': {
        'databases': 1,
        'storage_gb': 5,
        'retention_days': 7,
        'features': ['每日备份', '本地存储']
    },
    'starter': {
        'price': 9,
        'databases': 5,
        'storage_gb': 50,
        'retention_days': 30,
        'features': ['每小时备份', '云存储', '邮件通知']
    },
    'pro': {
        'price': 29,
        'databases': 20,
        'storage_gb': 200,
        'retention_days': 90,
        'features': ['实时备份', '多点备份', '加密存储', 'API访问']
    },
    'enterprise': {
        'price': 99,
        'databases': 999,
        'storage_gb': 1000,
        'retention_days': 365,
        'features': ['无限备份', '全球CDN', '专属支持', 'SLA']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 20,
        'pro': 8,
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
    guardian = DBGuardian()
    
    print("🛡️ DB Guardian - 数据库备份系统")
    print("\n支持数据库:")
    for db_type in DatabaseType:
        print(f"  - {db_type.value}")
    
    # 统计
    stats = guardian.get_storage_stats()
    print(f"\n存储统计:")
    print(f"总备份: {stats['total_backups']}")
    print(f"总大小: {stats['total_size_gb']:.2f} GB")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
