# Password Manager - Secure Vault
# 小七团队开发
# 密码管理器

import sqlite3
import hashlib
import secrets
import string
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
from cryptography.fernet import Fernet

@dataclass
class PasswordEntry:
    id: Optional[int]
    title: str
    username: str
    password: str
    url: str = ""
    notes: str = ""
    category: str = "general"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class PasswordVault:
    """安全密码管理器"""
    
    def __init__(self, master_password: str, db_path: str = "vault.db"):
        self.db_path = db_path
        self.key = self._derive_key(master_password)
        self.cipher = Fernet(self.key)
        self.init_database()
    
    def _derive_key(self, password: str) -> bytes:
        """从主密码派生加密密钥"""
        # 使用PBKDF2派生密钥
        import base64
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
        
        salt = b'static_salt_for_demo'  # 实际应用应随机生成并存储
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS passwords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                username TEXT,
                password TEXT NOT NULL,
                url TEXT,
                notes TEXT,
                category TEXT DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS password_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_id INTEGER,
                old_password TEXT,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _encrypt(self, data: str) -> str:
        """加密数据"""
        return self.cipher.encrypt(data.encode()).decode()
    
    def _decrypt(self, encrypted_data: str) -> str:
        """解密数据"""
        return self.cipher.decrypt(encrypted_data.encode()).decode()
    
    def add_entry(self, entry: PasswordEntry) -> int:
        """添加密码条目"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        encrypted_password = self._encrypt(entry.password)
        
        cursor.execute('''
            INSERT INTO passwords (title, username, password, url, notes, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            entry.title,
            entry.username,
            encrypted_password,
            entry.url,
            entry.notes,
            entry.category
        ))
        
        entry_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return entry_id
    
    def get_entry(self, entry_id: int) -> Optional[PasswordEntry]:
        """获取密码条目"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM passwords WHERE id = ?', (entry_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        try:
            decrypted_password = self._decrypt(row[3])
        except:
            decrypted_password = "[DECRYPTION_ERROR]"
        
        return PasswordEntry(
            id=row[0],
            title=row[1],
            username=row[2],
            password=decrypted_password,
            url=row[4],
            notes=row[5],
            category=row[6],
            created_at=row[7],
            updated_at=row[8]
        )
    
    def search_entries(self, query: str = "", category: str = None) -> List[PasswordEntry]:
        """搜索密码条目"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        sql = "SELECT * FROM passwords WHERE (title LIKE ? OR username LIKE ? OR url LIKE ?)"
        params = [f"%{query}%"] * 3
        
        if category:
            sql += " AND category = ?"
            params.append(category)
        
        sql += " ORDER BY title"
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()
        
        entries = []
        for row in rows:
            try:
                decrypted_password = self._decrypt(row[3])
            except:
                decrypted_password = "[DECRYPTION_ERROR]"
            
            entries.append(PasswordEntry(
                id=row[0],
                title=row[1],
                username=row[2],
                password=decrypted_password,
                url=row[4],
                notes=row[5],
                category=row[6],
                created_at=row[7],
                updated_at=row[8]
            ))
        
        return entries
    
    def update_entry(self, entry_id: int, entry: PasswordEntry):
        """更新密码条目"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 保存历史
        old_entry = self.get_entry(entry_id)
        if old_entry and old_entry.password != entry.password:
            cursor.execute('''
                INSERT INTO password_history (entry_id, old_password)
                VALUES (?, ?)
            ''', (entry_id, self._encrypt(old_entry.password)))
        
        encrypted_password = self._encrypt(entry.password)
        
        cursor.execute('''
            UPDATE passwords 
            SET title = ?, username = ?, password = ?, url = ?, notes = ?, category = ?, updated_at = ?
            WHERE id = ?
        ''', (
            entry.title,
            entry.username,
            encrypted_password,
            entry.url,
            entry.notes,
            entry.category,
            datetime.now().isoformat(),
            entry_id
        ))
        
        conn.commit()
        conn.close()
    
    def delete_entry(self, entry_id: int):
        """删除密码条目"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM passwords WHERE id = ?", (entry_id,))
        cursor.execute("DELETE FROM password_history WHERE entry_id = ?", (entry_id,))
        
        conn.commit()
        conn.close()
    
    def generate_password(self, length: int = 16, 
                         use_upper: bool = True,
                         use_lower: bool = True,
                         use_digits: bool = True,
                         use_symbols: bool = True) -> str:
        """生成强密码"""
        chars = ""
        if use_lower:
            chars += string.ascii_lowercase
        if use_upper:
            chars += string.ascii_uppercase
        if use_digits:
            chars += string.digits
        if use_symbols:
            chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        if not chars:
            chars = string.ascii_letters + string.digits
        
        password = ''.join(secrets.choice(chars) for _ in range(length))
        return password
    
    def check_password_strength(self, password: str) -> Dict:
        """检查密码强度"""
        score = 0
        feedback = []
        
        if len(password) >= 12:
            score += 2
        elif len(password) >= 8:
            score += 1
        else:
            feedback.append("密码长度应至少8位")
        
        if any(c.isupper() for c in password):
            score += 1
        else:
            feedback.append("建议包含大写字母")
        
        if any(c.islower() for c in password):
            score += 1
        else:
            feedback.append("建议包含小写字母")
        
        if any(c.isdigit() for c in password):
            score += 1
        else:
            feedback.append("建议包含数字")
        
        if any(c in string.punctuation for c in password):
            score += 1
        else:
            feedback.append("建议包含特殊字符")
        
        levels = ["非常弱", "弱", "一般", "强", "非常强", "完美"]
        level = min(score, len(levels) - 1)
        
        return {
            'score': score,
            'level': levels[level],
            'feedback': feedback
        }
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM passwords")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT category, COUNT(*) FROM passwords GROUP BY category")
        by_category = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.execute('''
            SELECT COUNT(*) FROM passwords 
            WHERE updated_at < datetime('now', '-90 days')
        ''')
        old_passwords = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_passwords': total,
            'by_category': by_category,
            'old_passwords': old_passwords,
            'security_score': max(0, 100 - old_passwords * 5)
        }

# 定价
PRICING = {
    'free': {
        'passwords': 50,
        'devices': 1,
        'features': ['基础加密', '密码生成器']
    },
    'personal': {
        'price': 3,
        'passwords': 999,
        'devices': 3,
        'features': ['云同步', '安全分享', '密码历史']
    },
    'family': {
        'price': 8,
        'passwords': 999,
        'devices': 10,
        'members': 6,
        'features': ['家庭共享', '紧急访问', '管理控制台']
    },
    'business': {
        'price': 5,
        'per_user': True,
        'features': ['SSO', '审计日志', '策略管理', 'API访问']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'personal': 100,
        'family': 20,
        'business': 30  # 假设30个用户，每人每月€5
    }
    
    revenue = (
        monthly_users['personal'] * PRICING['personal']['price'] +
        monthly_users['family'] * PRICING['family']['price'] +
        monthly_users['business'] * PRICING['business']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    vault = PasswordVault("my_master_password_123")
    
    # 添加示例密码
    entry = PasswordEntry(
        id=None,
        title="GitHub",
        username="developer@example.com",
        password=vault.generate_password(20),
        url="https://github.com",
        category="development"
    )
    
    entry_id = vault.add_entry(entry)
    print(f"✅ 密码已保存: ID {entry_id}")
    
    # 检查密码强度
    strength = vault.check_password_strength(entry.password)
    print(f"密码强度: {strength['level']}")
    
    # 统计
    stats = vault.get_statistics()
    print(f"\n总密码数: {stats['total_passwords']}")
    print(f"安全评分: {stats['security_score']}/100")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
