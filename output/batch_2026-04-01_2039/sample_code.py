"""
示例Python项目 - 用户管理系统
这是一个包含多种代码质量问题的示例项目，用于代码审查演示
"""

import sqlite3
import hashlib
import json
from datetime import datetime
import threading

# ==================== 数据处理模块 ====================

class DataProcessor:
    def __init__(self, db_path):
        self.db = db_path
        self.cache = {}
        self.lock = threading.Lock()
    
    def process_list(self, lst):
        """处理列表数据 - 存在性能问题"""
        result = []
        for i in range(len(lst)):
            for j in range(len(lst)):
                if lst[i] == lst[j] and i != j:
                    result.append(lst[i])
        return list(set(result))
    
    def get_user_by_name(self, username):
        """通过用户名获取用户 - 存在SQL注入风险"""
        conn = sqlite3.connect(self.db)
        cursor = conn.cursor()
        # 危险：直接拼接SQL
        query = f"SELECT * FROM users WHERE username = '{username}'"
        cursor.execute(query)
        result = cursor.fetchall()
        conn.close()
        return result
    
    def load_large_file(self, file_path):
        """加载大文件 - 存在内存问题"""
        with open(file_path, 'r') as f:
            data = f.read()  # 一次性读取整个文件到内存
        lines = data.split('\n')
        processed = []
        for line in lines:
            processed.append(self._transform(line))
        return processed
    
    def _transform(self, line):
        return line.upper()


# ==================== API接口模块 ====================

class UserAPI:
    def __init__(self):
        self.users = {}
        self.secret_key = "hardcoded_secret_key_12345"  # 硬编码密钥
    
    def register(self, data):
        """用户注册 - 缺乏输入验证"""
        username = data.get('username')
        password = data.get('password')
        
        # 没有验证用户名和密码的有效性
        hashed = hashlib.md5(password.encode()).hexdigest()  # 使用不安全的MD5
        
        self.users[username] = {
            'password': hashed,
            'created_at': str(datetime.now())
        }
        return {'status': 'success'}
    
    def login(self, data):
        """用户登录"""
        u = data['username']  # 直接访问可能引发KeyError
        p = data['password']
        
        if u in self.users:
            if self.users[u]['password'] == hashlib.md5(p.encode()).hexdigest():
                return {'status': 'success', 'token': self._generate_token(u)}
        return {'status': 'fail'}
    
    def _generate_token(self, username):
        """生成Token - 存在安全问题"""
        return hashlib.md5(f"{username}{self.secret_key}".encode()).hexdigest()
    
    def get_user_data(self, user_id):
        """获取用户数据 - 缺乏权限检查"""
        # 应该检查调用者是否有权限查看此用户数据
        conn = sqlite3.connect('app.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        result = cursor.fetchone()
        conn.close()
        return result


# ==================== 工具函数模块 ====================

import re

def validate_email(email):
    """验证邮箱 - 正则过于简单"""
    if "@" in email:
        return True
    return False

def format_phone(phone):
    """格式化手机号 - 缺乏错误处理"""
    return f"{phone[:3]}-{phone[3:6]}-{phone[6:]}"

def calculate_discount(price, discount):
    """计算折扣 - 可能的除零错误"""
    final_price = price * (1 - discount / 100)
    return final_price

def parse_json(data):
    """解析JSON - 缺乏异常处理"""
    return json.loads(data)

def log_message(msg):
    """记录日志 - 潜在的信息泄露"""
    print(f"[LOG] {datetime.now()} - {msg}")  # 可能记录敏感信息

def retry_operation(func, max_retry=3):
    """重试操作 - 无限递归风险"""
    try:
        return func()
    except Exception as e:
        if max_retry > 0:
            return retry_operation(func, max_retry - 1)  # 递归实现可能导致栈溢出
        raise

# ==================== 全局代码 ====================

# 全局变量 - 不是线程安全的
global_counter = 0

def increment_counter():
    global global_counter
    # 没有锁保护，并发时会出问题
    temp = global_counter
    temp += 1
    global_counter = temp

# 硬编码配置
DB_HOST = "localhost"
DB_USER = "admin"
DB_PASS = "password123"  # 敏感信息泄露

# 未使用的导入
import os
import sys

# 未使用的变量
unused_var = "This is never used"

def main():
    api = UserAPI()
    data = {'username': 'test', 'password': '123456'}
    result = api.register(data)
    print(result)

if __name__ == '__main__':
    main()
