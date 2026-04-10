# Investment Tracker - Portfolio Manager
# 小七团队开发
# 投资组合管理工具

import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import json

class AssetType(Enum):
    STOCK = "stock"
    BOND = "bond"
    ETF = "etf"
    CRYPTO = "crypto"
    REAL_ESTATE = "real_estate"
    CASH = "cash"

@dataclass
class Asset:
    id: Optional[int]
    symbol: str
    name: str
    type: AssetType
    quantity: float
    purchase_price: float
    current_price: float
    purchase_date: str
    currency: str = "USD"
    notes: str = ""

class PortfolioManager:
    """投资组合管理器"""
    
    def __init__(self, db_path: str = "portfolio.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                name TEXT,
                type TEXT NOT NULL,
                quantity REAL NOT NULL,
                purchase_price REAL NOT NULL,
                current_price REAL,
                purchase_date DATE,
                currency TEXT DEFAULT 'USD',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER,
                price REAL NOT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER,
                type TEXT,
                quantity REAL,
                price REAL,
                fees REAL,
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (asset_id) REFERENCES assets(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_asset(self, asset: Asset) -> int:
        """添加资产"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO assets (symbol, name, type, quantity, purchase_price, current_price, purchase_date, currency, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            asset.symbol,
            asset.name,
            asset.type.value,
            asset.quantity,
            asset.purchase_price,
            asset.current_price or asset.purchase_price,
            asset.purchase_date,
            asset.currency,
            asset.notes
        ))
        
        asset_id = cursor.lastrowid
        
        # 记录交易
        cursor.execute('''
            INSERT INTO transactions (asset_id, type, quantity, price, fees)
            VALUES (?, 'buy', ?, ?, 0)
        ''', (asset_id, asset.quantity, asset.purchase_price))
        
        conn.commit()
        conn.close()
        
        return asset_id
    
    def update_price(self, asset_id: int, new_price: float):
        """更新资产价格"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 更新当前价格
        cursor.execute('''
            UPDATE assets SET current_price = ? WHERE id = ?
        ''', (new_price, asset_id))
        
        # 记录历史价格
        cursor.execute('''
            INSERT INTO price_history (asset_id, price)
            VALUES (?, ?)
        ''', (asset_id, new_price))
        
        conn.commit()
        conn.close()
    
    def get_portfolio_summary(self) -> Dict:
        """获取投资组合概览"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM assets')
        assets_data = cursor.fetchall()
        
        total_value = 0
        total_cost = 0
        assets_by_type = {}
        
        for row in assets_data:
            quantity = row[4]
            purchase_price = row[5]
            current_price = row[6] or purchase_price
            asset_type = row[3]
            
            cost = quantity * purchase_price
            value = quantity * current_price
            
            total_cost += cost
            total_value += value
            
            if asset_type not in assets_by_type:
                assets_by_type[asset_type] = {'cost': 0, 'value': 0}
            assets_by_type[asset_type]['cost'] += cost
            assets_by_type[asset_type]['value'] += value
        
        conn.close()
        
        total_return = total_value - total_cost
        total_return_pct = (total_return / total_cost * 100) if total_cost > 0 else 0
        
        return {
            'total_value': total_value,
            'total_cost': total_cost,
            'total_return': total_return,
            'total_return_pct': total_return_pct,
            'assets_count': len(assets_data),
            'assets_by_type': assets_by_type
        }
    
    def get_asset_details(self, asset_id: int) -> Optional[Dict]:
        """获取资产详情"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM assets WHERE id = ?', (asset_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return None
        
        quantity = row[4]
        purchase_price = row[5]
        current_price = row[6] or purchase_price
        
        cost = quantity * purchase_price
        value = quantity * current_price
        gain = value - cost
        gain_pct = (gain / cost * 100) if cost > 0 else 0
        
        conn.close()
        
        return {
            'id': row[0],
            'symbol': row[1],
            'name': row[2],
            'type': row[3],
            'quantity': quantity,
            'purchase_price': purchase_price,
            'current_price': current_price,
            'cost': cost,
            'value': value,
            'gain': gain,
            'gain_pct': gain_pct,
            'purchase_date': row[7]
        }
    
    def get_performance_chart(self, days: int = 30) -> List[Dict]:
        """获取表现图表数据"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute('''
            SELECT date(recorded_at) as day, SUM(price * (
                SELECT quantity FROM assets WHERE id = price_history.asset_id
            )) as value
            FROM price_history
            WHERE recorded_at > ?
            GROUP BY day
            ORDER BY day
        ''', (start_date,))
        
        data = [{'date': row[0], 'value': row[1]} for row in cursor.fetchall()]
        conn.close()
        
        return data
    
    def get_allocation(self) -> Dict:
        """获取资产配置"""
        summary = self.get_portfolio_summary()
        
        allocation = {}
        for asset_type, values in summary['assets_by_type'].items():
            pct = (values['value'] / summary['total_value'] * 100) if summary['total_value'] > 0 else 0
            allocation[asset_type] = {
                'value': values['value'],
                'percentage': pct
            }
        
        return allocation
    
    def sell_asset(self, asset_id: int, quantity: float, price: float, fees: float = 0):
        """卖出资产"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取当前持仓
        cursor.execute('SELECT quantity FROM assets WHERE id = ?', (asset_id,))
        row = cursor.fetchone()
        
        if not row or row[0] < quantity:
            conn.close()
            raise ValueError("Insufficient quantity to sell")
        
        # 更新持仓
        new_quantity = row[0] - quantity
        if new_quantity == 0:
            cursor.execute('DELETE FROM assets WHERE id = ?', (asset_id,))
        else:
            cursor.execute('UPDATE assets SET quantity = ? WHERE id = ?', (new_quantity, asset_id))
        
        # 记录交易
        cursor.execute('''
            INSERT INTO transactions (asset_id, type, quantity, price, fees)
            VALUES (?, 'sell', ?, ?, ?)
        ''', (asset_id, quantity, price, fees))
        
        conn.commit()
        conn.close()
    
    def get_transactions(self, limit: int = 50) -> List[Dict]:
        """获取交易记录"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT t.*, a.symbol, a.name 
            FROM transactions t
            JOIN assets a ON t.asset_id = a.id
            ORDER BY t.transaction_date DESC
            LIMIT ?
        ''', (limit,))
        
        transactions = []
        for row in cursor.fetchall():
            transactions.append({
                'id': row[0],
                'symbol': row[6],
                'name': row[7],
                'type': row[2],
                'quantity': row[3],
                'price': row[4],
                'fees': row[5],
                'date': row[6]
            })
        
        conn.close()
        return transactions

# 定价
PRICING = {
    'free': {
        'assets': 10,
        'features': ['基础追踪', '手动更新']
    },
    'basic': {
        'price': 5,
        'assets': 50,
        'features': ['自动价格更新', '图表分析', '导出报表']
    },
    'pro': {
        'price': 15,
        'assets': 999,
        'features': ['实时数据', '高级分析', '税务报告', 'API访问']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'basic': 40,
        'pro': 15
    }
    
    revenue = (
        monthly_users['basic'] * PRICING['basic']['price'] +
        monthly_users['pro'] * PRICING['pro']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    manager = PortfolioManager()
    
    # 添加示例资产
    assets = [
        Asset(None, "AAPL", "Apple Inc.", AssetType.STOCK, 10, 150.0, 175.0, "2024-01-15"),
        Asset(None, "BTC", "Bitcoin", AssetType.CRYPTO, 0.5, 40000.0, 45000.0, "2024-01-10"),
        Asset(None, "VTI", "Vanguard Total Stock", AssetType.ETF, 20, 220.0, 235.0, "2024-01-20")
    ]
    
    for asset in assets:
        asset_id = manager.add_asset(asset)
        print(f"✅ 资产添加: {asset.symbol}")
    
    # 投资组合概览
    summary = manager.get_portfolio_summary()
    print(f"\n💼 投资组合")
    print(f"总价值: ${summary['total_value']:,.2f}")
    print(f"总收益: ${summary['total_return']:,.2f} ({summary['total_return_pct']:.2f}%)")
    
    # 资产配置
    allocation = manager.get_allocation()
    print(f"\n资产配置:")
    for asset_type, data in allocation.items():
        print(f"  {asset_type}: {data['percentage']:.1f}% (${data['value']:,.2f})")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
