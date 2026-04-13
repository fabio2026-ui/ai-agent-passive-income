# Habit Tracker - Daily Goals
# 小七团队开发
# 习惯追踪和目标管理

import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import json

class HabitFrequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

@dataclass
class Habit:
    id: Optional[int]
    name: str
    description: str
    frequency: HabitFrequency
    target_count: int
    color: str
    icon: str
    created_at: Optional[str] = None
    current_streak: int = 0
    longest_streak: int = 0
    total_completions: int = 0

class HabitTracker:
    """习惯追踪器"""
    
    def __init__(self, db_path: str = "habits.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                frequency TEXT DEFAULT 'daily',
                target_count INTEGER DEFAULT 1,
                color TEXT DEFAULT '#6366F1',
                icon TEXT DEFAULT '✅',
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                total_completions INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS completions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                habit_id INTEGER,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                note TEXT,
                FOREIGN KEY (habit_id) REFERENCES habits(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                target_date DATE,
                milestones TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_habit(self, habit: Habit) -> int:
        """创建新习惯"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO habits (name, description, frequency, target_count, color, icon)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            habit.name,
            habit.description,
            habit.frequency.value,
            habit.target_count,
            habit.color,
            habit.icon
        ))
        
        habit_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return habit_id
    
    def complete_habit(self, habit_id: int, note: str = "") -> bool:
        """完成习惯"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 记录完成
        cursor.execute('''
            INSERT INTO completions (habit_id, note)
            VALUES (?, ?)
        ''', (habit_id, note))
        
        # 更新习惯统计
        cursor.execute('''
            UPDATE habits 
            SET total_completions = total_completions + 1
            WHERE id = ?
        ''', (habit_id,))
        
        # 计算连胜
        self._update_streak(habit_id, cursor)
        
        conn.commit()
        conn.close()
        
        return True
    
    def _update_streak(self, habit_id: int, cursor):
        """更新连胜记录"""
        # 获取最近的完成记录
        cursor.execute('''
            SELECT completed_at FROM completions 
            WHERE habit_id = ? 
            ORDER BY completed_at DESC 
            LIMIT 2
        ''', (habit_id,))
        
        rows = cursor.fetchall()
        
        if len(rows) >= 2:
            last_completion = datetime.fromisoformat(rows[0][0])
            previous_completion = datetime.fromisoformat(rows[1][0])
            
            # 检查是否是连续的
            if (last_completion.date() - previous_completion.date()).days == 1:
                cursor.execute('''
                    UPDATE habits 
                    SET current_streak = current_streak + 1
                    WHERE id = ?
                ''', (habit_id,))
            else:
                cursor.execute('''
                    UPDATE habits 
                    SET current_streak = 1
                    WHERE id = ?
                ''', (habit_id,))
        else:
            cursor.execute('''
                UPDATE habits 
                SET current_streak = 1
                WHERE id = ?
            ''', (habit_id,))
        
        # 更新最长连胜
        cursor.execute('''
            UPDATE habits 
            SET longest_streak = MAX(longest_streak, current_streak)
            WHERE id = ?
        ''', (habit_id,))
    
    def get_habits(self, active_only: bool = True) -> List[Habit]:
        """获取所有习惯"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM habits ORDER BY created_at DESC')
        
        habits = []
        for row in cursor.fetchall():
            habits.append(Habit(
                id=row[0],
                name=row[1],
                description=row[2],
                frequency=HabitFrequency(row[3]),
                target_count=row[4],
                color=row[5],
                icon=row[6],
                created_at=row[10],
                current_streak=row[7],
                longest_streak=row[8],
                total_completions=row[9]
            ))
        
        conn.close()
        return habits
    
    def get_today_progress(self) -> Dict:
        """获取今日进度"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        cursor.execute('''
            SELECT COUNT(DISTINCT habit_id) FROM completions 
            WHERE date(completed_at) = ?
        ''', (today,))
        
        completed_today = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM habits')
        total_habits = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'completed': completed_today,
            'total': total_habits,
            'percentage': (completed_today / total_habits * 100) if total_habits > 0 else 0
        }
    
    def get_weekly_report(self) -> Dict:
        """获取周报"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 过去7天
        week_start = (datetime.now() - timedelta(days=7)).date().isoformat()
        
        cursor.execute('''
            SELECT date(completed_at) as day, COUNT(*) as count
            FROM completions 
            WHERE completed_at >= ?
            GROUP BY day
            ORDER BY day
        ''', (week_start,))
        
        daily_stats = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.execute('''
            SELECT h.name, COUNT(*) as count
            FROM completions c
            JOIN habits h ON c.habit_id = h.id
            WHERE c.completed_at >= ?
            GROUP BY h.id
            ORDER BY count DESC
        ''', (week_start,))
        
        top_habits = [{'name': row[0], 'count': row[1]} for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'daily_stats': daily_stats,
            'top_habits': top_habits,
            'total_completions': sum(daily_stats.values())
        }
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM habits")
        total_habits = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM completions")
        total_completions = cursor.fetchone()[0]
        
        cursor.execute("SELECT MAX(current_streak) FROM habits")
        best_streak = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT SUM(current_streak) FROM habits")
        total_active_streaks = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_habits': total_habits,
            'total_completions': total_completions,
            'best_streak': best_streak,
            'total_active_streaks': total_active_streaks
        }

# 定价
PRICING = {
    'free': {
        'habits': 5,
        'features': ['基础追踪', '本地存储']
    },
    'premium': {
        'price': 4,
        'habits': 999,
        'features': ['无限习惯', '云同步', '详细分析', '导出数据']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'premium': 150
    }
    
    revenue = monthly_users['premium'] * PRICING['premium']['price']
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    tracker = HabitTracker()
    
    # 创建示例习惯
    habits = [
        Habit(None, "晨跑", "每天跑步30分钟", HabitFrequency.DAILY, 1, "#FF6B6B", "🏃"),
        Habit(None, "阅读", "每天阅读30页", HabitFrequency.DAILY, 1, "#4ECDC4", "📚"),
        Habit(None, "冥想", "每天冥想15分钟", HabitFrequency.DAILY, 1, "#6366F1", "🧘")
    ]
    
    for habit in habits:
        habit_id = tracker.create_habit(habit)
        print(f"✅ 习惯创建: {habit.name} (ID: {habit_id})")
    
    # 完成一个习惯
    tracker.complete_habit(1, "感觉很好！")
    print("\n习惯已完成")
    
    # 今日进度
    progress = tracker.get_today_progress()
    print(f"\n今日进度: {progress['completed']}/{progress['total']} ({progress['percentage']:.0f}%)")
    
    # 统计
    stats = tracker.get_statistics()
    print(f"\n总完成: {stats['total_completions']}次")
    print(f"最长连胜: {stats['best_streak']}天")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
