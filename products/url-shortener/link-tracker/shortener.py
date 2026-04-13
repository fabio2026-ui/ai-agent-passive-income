# URL Shortener - Link Tracker
# 小七团队开发
# 短链接和点击追踪系统

import sqlite3
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from urllib.parse import urlparse

@dataclass
class ShortLink:
    short_code: str
    original_url: str
    created_at: datetime
    clicks: int = 0
    user_id: Optional[int] = None
    custom_alias: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True

class URLShortener:
    """短链接系统"""
    
    def __init__(self, db_path: str = 'shortlinks.db'):
        self.db_path = db_path
        self.base_url = "https://short.io/"
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 短链接表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                short_code TEXT UNIQUE NOT NULL,
                original_url TEXT NOT NULL,
                user_id INTEGER,
                custom_alias TEXT,
                clicks INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # 点击记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS clicks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                link_id INTEGER,
                ip_address TEXT,
                user_agent TEXT,
                referrer TEXT,
                country TEXT,
                city TEXT,
                device TEXT,
                browser TEXT,
                os TEXT,
                clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (link_id) REFERENCES links(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _generate_short_code(self, url: str, length: int = 6) -> str:
        """生成短码"""
        # 使用哈希和时间戳生成唯一码
        hash_input = f"{url}{datetime.now().timestamp()}"
        hash_obj = hashlib.md5(hash_input.encode())
        short_code = hash_obj.hexdigest()[:length]
        
        # 检查是否已存在
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM links WHERE short_code = ?', (short_code,))
        
        if cursor.fetchone():
            # 递归生成新的
            conn.close()
            return self._generate_short_code(url, length + 1)
        
        conn.close()
        return short_code
    
    def shorten(self, url: str, custom_alias: str = None, 
                user_id: int = None, expires_days: int = None) -> str:
        """创建短链接"""
        # 验证URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # 生成短码
        if custom_alias:
            short_code = custom_alias
        else:
            short_code = self._generate_short_code(url)
        
        # 计算过期时间
        expires_at = None
        if expires_days:
            expires_at = datetime.now() + timedelta(days=expires_days)
        
        # 保存到数据库
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO links (short_code, original_url, user_id, custom_alias, expires_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (short_code, url, user_id, custom_alias, expires_at))
            
            conn.commit()
            
        except sqlite3.IntegrityError:
            if custom_alias:
                conn.close()
                raise ValueError(f"Alias '{custom_alias}' already exists")
            else:
                conn.close()
                return self.shorten(url, None, user_id, expires_days)
        
        conn.close()
        
        return f"{self.base_url}{short_code}"
    
    def get_original_url(self, short_code: str) -> Optional[str]:
        """获取原始URL"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT original_url, is_active, expires_at 
            FROM links WHERE short_code = ?
        ''', (short_code,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        original_url, is_active, expires_at = row
        
        # 检查是否过期
        if expires_at:
            expires = datetime.fromisoformat(expires_at)
            if datetime.now() > expires:
                return None
        
        # 检查是否激活
        if not is_active:
            return None
        
        return original_url
    
    def track_click(self, short_code: str, request_info: Dict) -> bool:
        """记录点击"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取链接ID
        cursor.execute('SELECT id FROM links WHERE short_code = ?', (short_code,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return False
        
        link_id = row[0]
        
        # 记录点击详情
        cursor.execute('''
            INSERT INTO clicks 
            (link_id, ip_address, user_agent, referrer, country, city, device, browser, os)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            link_id,
            request_info.get('ip'),
            request_info.get('user_agent'),
            request_info.get('referrer'),
            request_info.get('country'),
            request_info.get('city'),
            request_info.get('device'),
            request_info.get('browser'),
            request_info.get('os')
        ))
        
        # 更新点击数
        cursor.execute('UPDATE links SET clicks = clicks + 1 WHERE id = ?', (link_id,))
        
        conn.commit()
        conn.close()
        
        return True
    
    def get_analytics(self, short_code: str, days: int = 30) -> Dict:
        """获取链接统计"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取链接信息
        cursor.execute('''
            SELECT id, original_url, clicks, created_at 
            FROM links WHERE short_code = ?
        ''', (short_code,))
        
        link_row = cursor.fetchone()
        if not link_row:
            conn.close()
            return {}
        
        link_id, original_url, total_clicks, created_at = link_row
        
        since = datetime.now() - timedelta(days=days)
        
        # 获取详细点击数据
        cursor.execute('''
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT ip_address) as unique_visitors,
                date(clicked_at) as day
            FROM clicks 
            WHERE link_id = ? AND clicked_at > ?
            GROUP BY day
            ORDER BY day
        ''', (link_id, since))
        
        daily_clicks = [
            {'date': row[2], 'clicks': row[0], 'unique': row[1]}
            for row in cursor.fetchall()
        ]
        
        # 获取地理位置分布
        cursor.execute('''
            SELECT country, COUNT(*) as count
            FROM clicks 
            WHERE link_id = ? AND clicked_at > ?
            GROUP BY country
            ORDER BY count DESC
            LIMIT 10
        ''', (link_id, since))
        
        countries = [{'country': row[0] or 'Unknown', 'count': row[1]} 
                    for row in cursor.fetchall()]
        
        # 获取设备分布
        cursor.execute('''
            SELECT device, COUNT(*) as count
            FROM clicks 
            WHERE link_id = ? AND clicked_at > ?
            GROUP BY device
        ''', (link_id, since))
        
        devices = [{'device': row[0] or 'Unknown', 'count': row[1]} 
                  for row in cursor.fetchall()]
        
        # 获取来源分布
        cursor.execute('''
            SELECT 
                CASE 
                    WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
                    WHEN referrer LIKE '%google%' THEN 'Google'
                    WHEN referrer LIKE '%facebook%' THEN 'Facebook'
                    WHEN referrer LIKE '%twitter%' OR referrer LIKE '%x.com%' THEN 'Twitter'
                    ELSE 'Other'
                END as source,
                COUNT(*) as count
            FROM clicks 
            WHERE link_id = ? AND clicked_at > ?
            GROUP BY source
            ORDER BY count DESC
        ''', (link_id, since))
        
        sources = [{'source': row[0], 'count': row[1]} for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'short_code': short_code,
            'original_url': original_url,
            'total_clicks': total_clicks,
            'created_at': created_at,
            'period_days': days,
            'daily_clicks': daily_clicks,
            'countries': countries,
            'devices': devices,
            'sources': sources
        }
    
    def get_user_links(self, user_id: int) -> List[Dict]:
        """获取用户的所有链接"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT short_code, original_url, clicks, created_at, is_active
            FROM links WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        
        links = [
            {
                'short_url': f"{self.base_url}{row[0]}",
                'original_url': row[1],
                'clicks': row[2],
                'created_at': row[3],
                'is_active': row[4]
            }
            for row in cursor.fetchall()
        ]
        
        conn.close()
        return links

# 定价
PRICING = {
    'free': {
        'price': 0,
        'links': 50,
        'clicks_tracked': 1000,
        'features': ['基础统计', '标准短码']
    },
    'starter': {
        'price': 5,
        'links': 500,
        'clicks_tracked': 10000,
        'features': ['自定义别名', '基础分析', 'API访问']
    },
    'pro': {
        'price': 15,
        'links': 5000,
        'clicks_tracked': 100000,
        'features': ['高级分析', '团队协作', 'UTM参数', '批量创建']
    },
    'business': {
        'price': 49,
        'links': 50000,
        'clicks_tracked': 1000000,
        'features': ['白标短链', 'SSO', '专属支持', 'SLA']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 40,
        'pro': 20,
        'business': 5
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['business'] * PRICING['business']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    shortener = URLShortener()
    
    # 创建短链接
    short_url = shortener.shorten("https://example.com/very/long/url/path")
    print(f"短链接: {short_url}")
    
    # 创建带自定义别名
    custom = shortener.shorten("https://myproduct.com/launch", custom_alias="launch")
    print(f"自定义短链: {custom}")
    
    # 模拟点击追踪
    request = {
        'ip': '192.168.1.1',
        'user_agent': 'Mozilla/5.0',
        'country': 'CN',
        'device': 'Desktop'
    }
    code = short_url.split('/')[-1]
    shortener.track_click(code, request)
    print("点击已记录")
    
    # 获取分析
    analytics = shortener.get_analytics(code)
    print(f"\n链接统计:")
    print(f"总点击: {analytics['total_clicks']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
