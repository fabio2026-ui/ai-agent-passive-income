"""
用户管理系统模块
包含用户数据的增删改查功能
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class UserManager:
    """管理用户数据的类"""
    
    def __init__(self, data_file="users.json"):
        self.data_file = data_file
        self.users: Dict[str, dict] = {}
        self.load_data()
    
    def load_data(self):
        """从文件加载用户数据"""
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r', encoding='utf-8') as f:
                self.users = json.load(f)
    
    def save_data(self):
        """保存用户数据到文件"""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(self.users, f, indent=2)
    
    def add_user(self, user_id: str, name: str, email: str, age: int = None) -> bool:
        """添加新用户"""
        if user_id in self.users:
            return False
        
        self.users[user_id] = {
            'name': name,
            'email': email,
            'age': age,
            'created_at': datetime.now().isoformat()
        }
        self.save_data()
        return True
    
    def get_user(self, user_id: str) -> Optional[dict]:
        """获取用户信息"""
        return self.users.get(user_id)
    
    def update_user(self, user_id: str, **kwargs) -> bool:
        """更新用户信息"""
        if user_id not in self.users:
            return False
        
        self.users[user_id].update(kwargs)
        self.users[user_id]['updated_at'] = datetime.now().isoformat()
        self.save_data()
        return True
    
    def delete_user(self, user_id: str) -> bool:
        """删除用户"""
        if user_id not in self.users:
            return False
        del self.users[user_id]
        self.save_data()
        return True
    
    def list_users(self) -> List[dict]:
        """列出所有用户"""
        result = []
        for uid, data in self.users.items():
            user_copy = data.copy()
            user_copy['id'] = uid
            result.append(user_copy)
        return result
    
    def search_by_name(self, name: str) -> List[dict]:
        """按名称搜索用户"""
        results = []
        for uid, data in self.users.items():
            if name.lower() in data.get('name', '').lower():
                user_copy = data.copy()
                user_copy['id'] = uid
                results.append(user_copy)
        return results
