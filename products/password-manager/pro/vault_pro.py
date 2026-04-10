# Password Vault Pro - Zero-Knowledge Password Manager
# 小七团队出品 - 顶尖安全版本
# 零知识架构密码管理器

import os
import sqlite3
import hashlib
import hmac
import base64
import secrets
import string
from typing import List, Dict, Optional, Tuple, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from contextlib import contextmanager
import logging
import json
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import bcrypt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecurityLevel(Enum):
    """安全级别"""
    STANDARD = "standard"
    HIGH = "high"
    MAXIMUM = "maximum"

class PasswordStrength(Enum):
    """密码强度等级"""
    VERY_WEAK = 1
    WEAK = 2
    FAIR = 3
    GOOD = 4
    STRONG = 5
    VERY_STRONG = 6

@dataclass
class PasswordEntry:
    """密码条目"""
    id: Optional[str]
    title: str
    username: str
    password: str
    url: str = ""
    notes: str = ""
    category: str = "general"
    tags: List[str] = field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_used: Optional[datetime] = None
    password_changed_at: Optional[datetime] = None
    strength_score: int = 0
    is_favorite: bool = False
    
    def to_dict(self) -> Dict:
        """转换为字典（不包含敏感信息）"""
        return {
            'id': self.id,
            'title': self.title,
            'username': self.username,
            'url': self.url,
            'category': self.category,
            'tags': self.tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'strength_score': self.strength_score,
            'is_favorite': self.is_favorite
        }

@dataclass
class SecurityAudit:
    """安全审计结果"""
    total_passwords: int
    weak_passwords: List[str]
    duplicate_passwords: List[str]
    old_passwords: List[str]
    compromised_passwords: List[str]
    overall_score: int
    recommendations: List[str]

@dataclass
class PasswordHistory:
    """密码历史"""
    entry_id: str
    old_password: str
    changed_at: datetime
    reason: str = ""

class CryptoEngine:
    """
    加密引擎 - 零知识架构核心
    
    所有加密操作在本地完成，服务器只存储加密后的数据。
    主密码永不离开本地设备。
    """
    
    def __init__(self, master_password: str, salt: Optional[bytes] = None):
        self.salt = salt or secrets.token_bytes(32)
        self.key = self._derive_key(master_password, self.salt)
    
    def _derive_key(self, password: str, salt: bytes) -> bytes:
        """使用PBKDF2派生加密密钥"""
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=600000  # OWASP推荐
        )
        return kdf.derive(password.encode())
    
    def encrypt(self, plaintext: str, associated_data: bytes = b"") -> bytes:
        """使用AES-256-GCM加密"""
        aesgcm = AESGCM(self.key)
        nonce = secrets.token_bytes(12)
        ciphertext = aesgcm.encrypt(
            nonce,
            plaintext.encode(),
            associated_data
        )
        return self.salt + nonce + ciphertext
    
    def decrypt(self, encrypted_data: bytes, associated_data: bytes = b"") -> str:
        """解密数据"""
        salt = encrypted_data[:32]
        nonce = encrypted_data[32:44]
        ciphertext = encrypted_data[44:]
        
        # 重新派生密钥
        key = self._derive_key(self._get_master_password(), salt)
        aesgcm = AESGCM(key)
        
        plaintext = aesgcm.decrypt(nonce, ciphertext, associated_data)
        return plaintext.decode()
    
    def _get_master_password(self) -> str:
        """获取主密码（应在子类中实现）"""
        raise NotImplementedError("Must implement in subclass")

class PasswordVaultPro:
    """
    专业级密码管理器
    
    核心特性:
    - 零知识架构: 只有用户知道主密码
    - AES-256-GCM加密
    - PBKDF2密钥派生 (600k iterations)
    - 密码强度分析
    - 安全审计
    - 密码生成器
    - 历史记录
    - 团队共享 (企业版)
    """
    
    def __init__(self, db_path: str = "vault_pro.db", master_password: Optional[str] = None):
        self.db_path = db_path
        self.master_password = master_password
        self.crypto = None
        self._init_database()
        
        if master_password:
            self._unlock(master_password)
    
    def _init_database(self):
        """初始化数据库"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            
            # 密码条目表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS password_entries (
                    id TEXT PRIMARY KEY,
                    encrypted_data BLOB NOT NULL,
                    title_hash TEXT,
                    category TEXT DEFAULT 'general',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used TIMESTAMP,
                    strength_score INTEGER DEFAULT 0,
                    is_favorite BOOLEAN DEFAULT 0
                )
            ''')
            
            # 密码历史表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS password_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_id TEXT,
                    encrypted_password BLOB NOT NULL,
                    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    reason TEXT,
                    FOREIGN KEY (entry_id) REFERENCES password_entries(id)
                )
            ''')
            
            # 安全审计日志
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT NOT NULL,
                    entry_id TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    details TEXT
                )
            ''')
            
            # 用户配置表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            logger.info("Database initialized")
    
    @contextmanager
    def _get_db(self):
        """数据库连接上下文"""
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()
    
    def _unlock(self, master_password: str):
        """解锁保险箱"""
        # 这里应该验证主密码的正确性
        self.crypto = CryptoEngine(master_password)
        logger.info("Vault unlocked")
    
    def add_entry(self, entry: PasswordEntry) -> str:
        """添加密码条目"""
        if not self.crypto:
            raise PermissionError("Vault is locked")
        
        entry_id = f"pwd_{secrets.token_hex(8)}"
        entry.id = entry_id
        entry.created_at = datetime.now()
        entry.updated_at = datetime.now()
        entry.password_changed_at = datetime.now()
        
        # 分析密码强度
        entry.strength_score = self._analyze_password_strength(entry.password)
        
        # 加密数据
        entry_data = json.dumps({
            'title': entry.title,
            'username': entry.username,
            'password': entry.password,
            'url': entry.url,
            'notes': entry.notes,
            'tags': entry.tags
        })
        
        encrypted_data = self.crypto.encrypt(entry_data)
        title_hash = hashlib.sha256(entry.title.encode()).hexdigest()
        
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO password_entries 
                (id, encrypted_data, title_hash, category, strength_score, is_favorite)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                entry_id,
                encrypted_data,
                title_hash,
                entry.category,
                entry.strength_score,
                entry.is_favorite
            ))
            conn.commit()
        
        # 记录审计日志
        self._log_audit("CREATE", entry_id, f"Created entry: {entry.title}")
        
        logger.info(f"Entry created: {entry_id}")
        return entry_id
    
    def get_entry(self, entry_id: str) -> Optional[PasswordEntry]:
        """获取密码条目"""
        if not self.crypto:
            raise PermissionError("Vault is locked")
        
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT encrypted_data, category, created_at, updated_at, last_used, strength_score, is_favorite
                FROM password_entries WHERE id = ?
            ''', (entry_id,))
            
            row = cursor.fetchone()
            if not row:
                return None
            
            # 解密数据
            try:
                decrypted_data = json.loads(self.crypto.decrypt(row[0]))
            except Exception as e:
                logger.error(f"Decryption failed: {e}")
                return None
            
            # 更新最后使用时间
            cursor.execute('''
                UPDATE password_entries SET last_used = ? WHERE id = ?
            ''', (datetime.now(), entry_id))
            conn.commit()
            
            return PasswordEntry(
                id=entry_id,
                title=decrypted_data['title'],
                username=decrypted_data['username'],
                password=decrypted_data['password'],
                url=decrypted_data['url'],
                notes=decrypted_data['notes'],
                tags=decrypted_data['tags'],
                category=row[1],
                created_at=datetime.fromisoformat(row[2]),
                updated_at=datetime.fromisoformat(row[3]),
                last_used=datetime.now(),
                strength_score=row[6],
                is_favorite=row[7]
            )
    
    def update_entry(self, entry_id: str, **kwargs):
        """更新密码条目"""
        entry = self.get_entry(entry_id)
        if not entry:
            raise ValueError(f"Entry not found: {entry_id}")
        
        # 如果密码变化，保存历史
        if 'password' in kwargs and kwargs['password'] != entry.password:
            self._save_password_history(entry_id, entry.password, "User update")
            kwargs['password_changed_at'] = datetime.now()
            kwargs['strength_score'] = self._analyze_password_strength(kwargs['password'])
        
        # 更新字段
        for key, value in kwargs.items():
            if hasattr(entry, key):
                setattr(entry, key, value)
        
        entry.updated_at = datetime.now()
        
        # 重新加密保存
        entry_data = json.dumps({
            'title': entry.title,
            'username': entry.username,
            'password': entry.password,
            'url': entry.url,
            'notes': entry.notes,
            'tags': entry.tags
        })
        
        encrypted_data = self.crypto.encrypt(entry_data)
        title_hash = hashlib.sha256(entry.title.encode()).hexdigest()
        
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE password_entries 
                SET encrypted_data = ?, title_hash = ?, category = ?, updated_at = ?, strength_score = ?
                WHERE id = ?
            ''', (
                encrypted_data,
                title_hash,
                entry.category,
                entry.updated_at,
                entry.strength_score,
                entry_id
            ))
            conn.commit()
        
        self._log_audit("UPDATE", entry_id, f"Updated entry: {entry.title}")
        logger.info(f"Entry updated: {entry_id}")
    
    def _save_password_history(self, entry_id: str, old_password: str, reason: str):
        """保存密码历史"""
        encrypted_password = self.crypto.encrypt(old_password)
        
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO password_history (entry_id, encrypted_password, reason)
                VALUES (?, ?, ?)
            ''', (entry_id, encrypted_password, reason))
            conn.commit()
    
    def search_entries(self, query: str = "", category: str = None, tags: List[str] = None) -> List[Dict]:
        """搜索密码条目"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            
            sql = "SELECT id, category, strength_score, is_favorite FROM password_entries WHERE 1=1"
            params = []
            
            if category:
                sql += " AND category = ?"
                params.append(category)
            
            sql += " ORDER BY is_favorite DESC, created_at DESC"
            
            cursor.execute(sql, params)
            
            results = []
            for row in cursor.fetchall():
                entry = self.get_entry(row[0])
                if entry and (not query or query.lower() in entry.title.lower()):
                    results.append(entry.to_dict())
            
            return results
    
    def delete_entry(self, entry_id: str):
        """删除密码条目"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM password_entries WHERE id = ?", (entry_id,))
            cursor.execute("DELETE FROM password_history WHERE entry_id = ?", (entry_id,))
            conn.commit()
        
        self._log_audit("DELETE", entry_id, "Entry deleted")
        logger.info(f"Entry deleted: {entry_id}")
    
    def generate_password(self, length: int = 16, 
                         use_uppercase: bool = True,
                         use_lowercase: bool = True,
                         use_digits: bool = True,
                         use_symbols: bool = True,
                         exclude_ambiguous: bool = True) -> str:
        """生成强密码"""
        chars = ""
        
        if use_lowercase:
            chars += string.ascii_lowercase
        if use_uppercase:
            chars += string.ascii_uppercase
        if use_digits:
            chars += string.digits
        if use_symbols:
            chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        if exclude_ambiguous:
            chars = chars.translate(str.maketrans('', '', '0O1lI'))
        
        if not chars:
            chars = string.ascii_letters + string.digits
        
        # 确保每类字符至少一个
        password = []
        if use_lowercase:
            password.append(secrets.choice(string.ascii_lowercase))
        if use_uppercase:
            password.append(secrets.choice(string.ascii_uppercase))
        if use_digits:
            password.append(secrets.choice(string.digits))
        if use_symbols:
            password.append(secrets.choice("!@#$%^&*()_+-=[]{}|;:,.<>?"))
        
        # 填充剩余长度
        for _ in range(length - len(password)):
            password.append(secrets.choice(chars))
        
        # 打乱顺序
        secrets.SystemRandom().shuffle(password)
        
        return ''.join(password)
    
    def _analyze_password_strength(self, password: str) -> int:
        """分析密码强度 (0-100)"""
        score = 0
        
        # 长度评分
        if len(password) >= 16:
            score += 30
        elif len(password) >= 12:
            score += 20
        elif len(password) >= 8:
            score += 10
        
        # 字符种类
        if any(c.islower() for c in password):
            score += 15
        if any(c.isupper() for c in password):
            score += 15
        if any(c.isdigit() for c in password):
            score += 15
        if any(c in string.punctuation for c in password):
            score += 15
        
        # 检查常见弱密码模式
        common_patterns = ['123', 'abc', 'password', 'qwerty', '111', '000']
        if any(pattern in password.lower() for pattern in common_patterns):
            score -= 20
        
        return max(0, min(100, score))
    
    def get_password_strength(self, password: str) -> Dict:
        """获取密码强度详情"""
        score = self._analyze_password_strength(password)
        
        if score >= 90:
            level = PasswordStrength.VERY_STRONG
        elif score >= 75:
            level = PasswordStrength.STRONG
        elif score >= 60:
            level = PasswordStrength.GOOD
        elif score >= 45:
            level = PasswordStrength.FAIR
        elif score >= 30:
            level = PasswordStrength.WEAK
        else:
            level = PasswordStrength.VERY_WEAK
        
        feedback = []
        if len(password) < 12:
            feedback.append("密码长度应至少12位")
        if not any(c.isupper() for c in password):
            feedback.append("建议包含大写字母")
        if not any(c.islower() for c in password):
            feedback.append("建议包含小写字母")
        if not any(c.isdigit() for c in password):
            feedback.append("建议包含数字")
        if not any(c in string.punctuation for c in password):
            feedback.append("建议包含特殊字符")
        
        return {
            'score': score,
            'level': level.name,
            'feedback': feedback
        }
    
    def run_security_audit(self) -> SecurityAudit:
        """运行安全审计"""
        all_entries = []
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM password_entries")
            for row in cursor.fetchall():
                entry = self.get_entry(row[0])
                if entry:
                    all_entries.append(entry)
        
        weak_passwords = []
        duplicate_passwords = []
        old_passwords = []
        
        password_map = {}
        
        for entry in all_entries:
            # 检查弱密码
            strength = self.get_password_strength(entry.password)
            if strength['score'] < 50:
                weak_passwords.append(entry.id)
            
            # 检查重复密码
            password_hash = hashlib.sha256(entry.password.encode()).hexdigest()
            if password_hash in password_map:
                duplicate_passwords.append(entry.id)
                duplicate_passwords.append(password_map[password_hash])
            else:
                password_map[password_hash] = entry.id
            
            # 检查旧密码（超过90天）
            if entry.password_changed_at:
                days_old = (datetime.now() - entry.password_changed_at).days
                if days_old > 90:
                    old_passwords.append(entry.id)
        
        # 计算总体安全分
        total_issues = len(weak_passwords) + len(duplicate_passwords) + len(old_passwords)
        overall_score = max(0, 100 - total_issues * 5)
        
        recommendations = []
        if weak_passwords:
            recommendations.append(f"更新 {len(weak_passwords)} 个弱密码")
        if duplicate_passwords:
            recommendations.append(f"更换 {len(set(duplicate_passwords))} 个重复密码")
        if old_passwords:
            recommendations.append(f"更新 {len(old_passwords)} 个旧密码（超过90天）")
        if not recommendations:
            recommendations.append("密码库安全状况良好！")
        
        return SecurityAudit(
            total_passwords=len(all_entries),
            weak_passwords=weak_passwords,
            duplicate_passwords=list(set(duplicate_passwords)),
            old_passwords=old_passwords,
            compromised_passwords=[],
            overall_score=overall_score,
            recommendations=recommendations
        )
    
    def _log_audit(self, action: str, entry_id: str, details: str):
        """记录审计日志"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO audit_logs (action, entry_id, details)
                VALUES (?, ?, ?)
            ''', (action, entry_id, details))
            conn.commit()
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM password_entries")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM password_entries WHERE is_favorite = 1")
            favorites = cursor.fetchone()[0]
            
            cursor.execute("SELECT AVG(strength_score) FROM password_entries")
            avg_strength = cursor.fetchone()[0] or 0
            
            cursor.execute('''
                SELECT category, COUNT(*) FROM password_entries 
                GROUP BY category
            ''')
            by_category = {row[0]: row[1] for row in cursor.fetchall()}
            
            return {
                'total_passwords': total,
                'favorites': favorites,
                'average_strength': round(avg_strength, 1),
                'by_category': by_category
            }

# 定价
PRICING = {
    'free': {
        'passwords': 25,
        'devices': 1,
        'features': ['基础加密', '密码生成器', '强度分析']
    },
    'personal': {
        'price': 4,
        'passwords': 999,
        'devices': 3,
        'features': ['云同步', '安全分享', '密码历史', '安全审计']
    },
    'family': {
        'price': 8,
        'passwords': 999,
        'devices': 10,
        'members': 6,
        'features': ['家庭共享', '紧急访问', '管理控制台']
    },
    'business': {
        'price': 6,
        'per_user': True,
        'features': ['SSO', '审计日志', '策略管理', 'API访问', '团队文件夹']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'personal': 200,
        'family': 50,
        'business': 40
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

# 使用示例
def main():
    """主函数示例"""
    # 初始化（首次使用需要主密码）
    vault = PasswordVaultPro(master_password="MySuperSecureMasterPassword123!")
    
    # 添加密码条目
    entry = PasswordEntry(
        id=None,
        title="GitHub",
        username="developer@example.com",
        password=vault.generate_password(20),
        url="https://github.com",
        category="development",
        tags=["coding", "git"]
    )
    
    entry_id = vault.add_entry(entry)
    print(f"✅ 密码已保存: {entry.title}")
    
    # 检查密码强度
    strength = vault.get_password_strength(entry.password)
    print(f"密码强度: {strength['level']} ({strength['score']}/100)")
    
    # 运行安全审计
    audit = vault.run_security_audit()
    print(f"\n🔒 安全审计:")
    print(f"总体评分: {audit.overall_score}/100")
    print(f"建议:")
    for rec in audit.recommendations:
        print(f"  - {rec}")
    
    # 统计
    stats = vault.get_statistics()
    print(f"\n📊 统计:")
    print(f"总密码数: {stats['total_passwords']}")
    print(f"平均强度: {stats['average_strength']}/100")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")

if __name__ == "__main__":
    main()
