# API Monitor - Uptime Checker
# 小七团队开发
# API监控和告警系统

import asyncio
import aiohttp
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
import smtplib
from email.mime.text import MIMEText
from dataclasses import dataclass
from enum import Enum

class Status(Enum):
    UP = "up"
    DOWN = "down"
    DEGRADED = "degraded"

@dataclass
class CheckResult:
    url: str
    status: Status
    response_time: float
    status_code: int
    checked_at: datetime
    error_message: Optional[str] = None

class APIMonitor:
    """API监控系统"""
    
    def __init__(self, db_path: str = 'monitor.db'):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 监控端点表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS endpoints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                method TEXT DEFAULT 'GET',
                headers TEXT,
                body TEXT,
                check_interval INTEGER DEFAULT 60,
                timeout INTEGER DEFAULT 30,
                expected_status INTEGER DEFAULT 200,
                alert_threshold INTEGER DEFAULT 2,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # 检查结果表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS checks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint_id INTEGER,
                status TEXT,
                response_time REAL,
                status_code INTEGER,
                error_message TEXT,
                checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
            )
        ''')
        
        # 事件表（上下线记录）
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint_id INTEGER,
                started_at TIMESTAMP,
                resolved_at TIMESTAMP,
                duration INTEGER,
                status TEXT,
                FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
            )
        ''')
        
        # 告警配置表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alert_configs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint_id INTEGER,
                alert_type TEXT,
                config TEXT,
                FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def check_endpoint(self, endpoint: Dict) -> CheckResult:
        """检查单个端点"""
        start_time = datetime.now()
        
        try:
            timeout = aiohttp.ClientTimeout(total=endpoint.get('timeout', 30))
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                method = endpoint.get('method', 'GET')
                url = endpoint['url']
                headers = json.loads(endpoint.get('headers', '{}'))
                
                async with session.request(method, url, headers=headers) as response:
                    response_time = (datetime.now() - start_time).total_seconds()
                    status_code = response.status
                    
                    # 判断状态
                    expected = endpoint.get('expected_status', 200)
                    if status_code == expected:
                        status = Status.UP
                    elif 200 <= status_code < 300:
                        status = Status.DEGRADED
                    else:
                        status = Status.DOWN
                    
                    return CheckResult(
                        url=url,
                        status=status,
                        response_time=response_time,
                        status_code=status_code,
                        checked_at=start_time
                    )
                    
        except asyncio.TimeoutError:
            return CheckResult(
                url=endpoint['url'],
                status=Status.DOWN,
                response_time=endpoint.get('timeout', 30),
                status_code=0,
                checked_at=start_time,
                error_message='Timeout'
            )
        except Exception as e:
            return CheckResult(
                url=endpoint['url'],
                status=Status.DOWN,
                response_time=0,
                status_code=0,
                checked_at=start_time,
                error_message=str(e)
            )
    
    async def check_all(self) -> List[CheckResult]:
        """检查所有端点"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM endpoints WHERE is_active = 1')
        columns = [description[0] for description in cursor.description]
        endpoints = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        
        # 并行检查
        tasks = [self.check_endpoint(endpoint) for endpoint in endpoints]
        results = await asyncio.gather(*tasks)
        
        # 保存结果
        self.save_results(results, endpoints)
        
        return results
    
    def save_results(self, results: List[CheckResult], endpoints: List[Dict]):
        """保存检查结果"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for result, endpoint in zip(results, endpoints):
            # 保存检查记录
            cursor.execute('''
                INSERT INTO checks (endpoint_id, status, response_time, status_code, error_message)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                endpoint['id'],
                result.status.value,
                result.response_time,
                result.status_code,
                result.error_message
            ))
            
            # 检查是否需要告警
            self.check_alert(endpoint, result, cursor)
        
        conn.commit()
        conn.close()
    
    def check_alert(self, endpoint: Dict, result: CheckResult, cursor):
        """检查是否需要发送告警"""
        if result.status != Status.UP:
            # 获取最近失败的次数
            cursor.execute('''
                SELECT COUNT(*) FROM checks 
                WHERE endpoint_id = ? AND status != ?
                ORDER BY checked_at DESC LIMIT ?
            ''', (endpoint['id'], Status.UP.value, endpoint.get('alert_threshold', 2)))
            
            fail_count = cursor.fetchone()[0]
            
            if fail_count >= endpoint.get('alert_threshold', 2):
                # 触发告警
                self.send_alert(endpoint, result)
    
    def send_alert(self, endpoint: Dict, result: CheckResult):
        """发送告警"""
        # 这里实现邮件/短信/Slack告警
        print(f"🚨 ALERT: {endpoint['name']} is {result.status.value}")
        print(f"   URL: {endpoint['url']}")
        print(f"   Error: {result.error_message}")
    
    def get_uptime_stats(self, endpoint_id: int, days: int = 30) -> Dict:
        """获取可用性统计"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as up_count,
                AVG(response_time) as avg_response_time,
                MAX(response_time) as max_response_time
            FROM checks 
            WHERE endpoint_id = ? AND checked_at > ?
        ''', (Status.UP.value, endpoint_id, since))
        
        row = cursor.fetchone()
        total, up_count, avg_response, max_response = row
        
        conn.close()
        
        if total == 0:
            return {'uptime_percentage': 0, 'avg_response_time': 0}
        
        return {
            'uptime_percentage': (up_count / total) * 100,
            'avg_response_time': avg_response or 0,
            'max_response_time': max_response or 0,
            'total_checks': total,
            'period_days': days
        }
    
    def get_public_status_page(self) -> Dict:
        """生成公共状态页面数据"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM endpoints WHERE is_active = 1')
        columns = [description[0] for description in cursor.description]
        endpoints = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        status_data = []
        for endpoint in endpoints:
            # 获取最新状态
            cursor.execute('''
                SELECT status, response_time, checked_at
                FROM checks WHERE endpoint_id = ?
                ORDER BY checked_at DESC LIMIT 1
            ''', (endpoint['id'],))
            
            latest = cursor.fetchone()
            stats = self.get_uptime_stats(endpoint['id'])
            
            status_data.append({
                'name': endpoint['name'],
                'status': latest[0] if latest else 'unknown',
                'response_time': latest[1] if latest else 0,
                'uptime_30d': stats['uptime_percentage'],
                'last_checked': latest[2] if latest else None
            })
        
        conn.close()
        
        return {
            'overall_status': 'operational' if all(s['status'] == 'up' for s in status_data) else 'degraded',
            'endpoints': status_data,
            'updated_at': datetime.now().isoformat()
        }

# 定价
PRICING = {
    'free': {
        'monitors': 5,
        'check_interval': 5,  # minutes
        'retention_days': 7,
        'features': ['Email alerts', 'Basic dashboard']
    },
    'starter': {
        'price': 9,
        'monitors': 20,
        'check_interval': 1,
        'retention_days': 30,
        'features': ['SMS alerts', 'Status page', 'API access']
    },
    'pro': {
        'price': 29,
        'monitors': 100,
        'check_interval': 30,  # seconds
        'retention_days': 90,
        'features': ['Slack integration', 'Team alerts', 'Custom domains']
    },
    'enterprise': {
        'price': 99,
        'monitors': 999,
        'check_interval': 10,  # seconds
        'retention_days': 365,
        'features': ['Priority support', 'Custom integrations', 'SLA']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 30,
        'pro': 15,
        'enterprise': 3
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
    monitor = APIMonitor()
    
    # 添加测试端点
    print("API监控系统已启动")
    
    # 查看状态页面数据
    status = monitor.get_public_status_page()
    print(f"\n状态页面: {status['overall_status']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
