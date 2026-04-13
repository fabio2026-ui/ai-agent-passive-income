# Analytics Dashboard - Simple Analytics
# 小七团队开发
# 隐私友好的网站分析

import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from collections import defaultdict
import json

@dataclass
class PageView:
    id: int
    domain: str
    path: str
    referrer: str
    country: str
    device: str
    browser: str
    timestamp: datetime
    session_id: str

class SimpleAnalytics:
    """隐私友好的分析系统"""
    
    def __init__(self, db_path: str = 'analytics.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 页面浏览表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pageviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                path TEXT,
                referrer TEXT,
                country TEXT,
                device TEXT,
                browser TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT
            )
        ''')
        
        # 事件表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                event_name TEXT,
                event_data TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT
            )
        ''')
        
        # 网站配置表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT UNIQUE NOT NULL,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def track_pageview(self, domain: str, path: str, referrer: str = '',
                      country: str = '', device: str = '', browser: str = '',
                      session_id: str = '') -> bool:
        """追踪页面浏览"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO pageviews 
                (domain, path, referrer, country, device, browser, session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (domain, path, referrer, country, device, browser, session_id))
            
            conn.commit()
            return True
        except Exception as e:
            print(f"追踪失败: {e}")
            return False
        finally:
            conn.close()
    
    def track_event(self, domain: str, event_name: str, event_data: Dict = None,
                   session_id: str = '') -> bool:
        """追踪自定义事件"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO events 
                (domain, event_name, event_data, session_id)
                VALUES (?, ?, ?, ?)
            ''', (domain, event_name, json.dumps(event_data or {}), session_id))
            
            conn.commit()
            return True
        except Exception as e:
            print(f"事件追踪失败: {e}")
            return False
        finally:
            conn.close()
    
    def get_dashboard_data(self, domain: str, days: int = 30) -> Dict:
        """获取仪表盘数据"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since = datetime.now() - timedelta(days=days)
        
        # 总浏览量
        cursor.execute('''
            SELECT COUNT(*) FROM pageviews 
            WHERE domain = ? AND timestamp > ?
        ''', (domain, since))
        total_views = cursor.fetchone()[0]
        
        # 独立访客
        cursor.execute('''
            SELECT COUNT(DISTINCT session_id) FROM pageviews 
            WHERE domain = ? AND timestamp > ?
        ''', (domain, since))
        unique_visitors = cursor.fetchone()[0]
        
        # 热门页面
        cursor.execute('''
            SELECT path, COUNT(*) as views
            FROM pageviews 
            WHERE domain = ? AND timestamp > ?
            GROUP BY path
            ORDER BY views DESC
            LIMIT 10
        ''', (domain, since))
        top_pages = [{'path': row[0], 'views': row[1]} for row in cursor.fetchall()]
        
        # 流量来源
        cursor.execute('''
            SELECT 
                CASE 
                    WHEN referrer = '' THEN 'Direct'
                    WHEN referrer LIKE '%google%' THEN 'Google'
                    WHEN referrer LIKE '%twitter%' OR referrer LIKE '%x.com%' THEN 'Twitter'
                    WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
                    ELSE 'Other'
                END as source,
                COUNT(*) as count
            FROM pageviews 
            WHERE domain = ? AND timestamp > ?
            GROUP BY source
            ORDER BY count DESC
        ''', (domain, since))
        sources = [{'source': row[0], 'count': row[1]} for row in cursor.fetchall()]
        
        # 设备分布
        cursor.execute('''
            SELECT device, COUNT(*) as count
            FROM pageviews 
            WHERE domain = ? AND timestamp > ?
            GROUP BY device
        ''', (domain, since))
        devices = [{'device': row[0] or 'Unknown', 'count': row[1]} for row in cursor.fetchall()]
        
        # 国家分布
        cursor.execute('''
            SELECT country, COUNT(*) as count
            FROM pageviews 
            WHERE domain = ? AND timestamp > ?
            GROUP BY country
            ORDER BY count DESC
            LIMIT 10
        ''', (domain, since))
        countries = [{'country': row[0] or 'Unknown', 'count': row[1]} for row in cursor.fetchall()]
        
        # 每日趋势
        cursor.execute('''
            SELECT date(timestamp) as day, COUNT(*) as views
            FROM pageviews 
            WHERE domain = ? AND timestamp > ?
            GROUP BY day
            ORDER BY day
        ''', (domain, since))
        daily_trend = [{'date': row[0], 'views': row[1]} for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'period_days': days,
            'total_views': total_views,
            'unique_visitors': unique_visitors,
            'pages_per_session': total_views / unique_visitors if unique_visitors > 0 else 0,
            'top_pages': top_pages,
            'sources': sources,
            'devices': devices,
            'countries': countries,
            'daily_trend': daily_trend
        }
    
    def get_embed_script(self, domain: str) -> str:
        """生成嵌入脚本"""
        return f'''
        <script>
        (function() {{
            var domain = '{domain}';
            var sessionId = localStorage.getItem('sa_session') || Math.random().toString(36).substring(2);
            localStorage.setItem('sa_session', sessionId);
            
            function track() {{
                var data = {{
                    domain: domain,
                    path: window.location.pathname,
                    referrer: document.referrer,
                    session_id: sessionId
                }};
                
                navigator.sendBeacon('https://api.simpleanalytics.io/track', JSON.stringify(data));
            }}
            
            track();
            window.addEventListener('popstate', track);
        }})();
        </script>
        '''

# 定价
PRICING = {
    'free': {
        'pageviews': 10000,
        'websites': 1,
        'retention_days': 30,
        'features': ['Basic dashboard', 'Email reports']
    },
    'starter': {
        'price': 9,
        'pageviews': 100000,
        'websites': 3,
        'retention_days': 90,
        'features': ['Real-time data', 'Custom events', 'API access']
    },
    'business': {
        'price': 29,
        'pageviews': 1000000,
        'websites': 10,
        'retention_days': 365,
        'features': ['Funnels', 'Cohorts', 'Team access']
    },
    'enterprise': {
        'price': 99,
        'pageviews': 10000000,
        'websites': 999,
        'retention_days': 9999,
        'features': ['SLA', 'On-premise option', 'Priority support']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 40,
        'business': 15,
        'enterprise': 2
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['business'] * PRICING['business']['price'] +
        monthly_users['enterprise'] * PRICING['enterprise']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    analytics = SimpleAnalytics()
    
    # 模拟数据
    analytics.track_pageview('example.com', '/home', 'google.com', 'US', 'desktop', 'Chrome', 'sess_123')
    analytics.track_pageview('example.com', '/pricing', '', 'US', 'desktop', 'Chrome', 'sess_123')
    
    # 获取仪表盘数据
    data = analytics.get_dashboard_data('example.com')
    print(f"总浏览量: {data['total_views']}")
    print(f"独立访客: {data['unique_visitors']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
