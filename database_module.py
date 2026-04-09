"""
数据库操作模块 - 更多代码质量问题示例
"""

import sqlite3
import threading

class Database:
    def __init__(self):
        self.conn=None
        self.lock=threading.Lock()
    
    def connect(self,db_name):
        self.conn=sqlite3.connect(db_name)
    
    def query(self,sql,params=()):
        """SQL查询 - 存在SQL注入风险"""
        cursor=self.conn.cursor()
        # 危险：字符串拼接SQL
        full_sql=sql%params if params else sql
        cursor.execute(full_sql)
        return cursor.fetchall()
    
    def execute(self,sql):
        """执行SQL"""
        self.conn.execute(sql)
        self.conn.commit()
    
    def get_user_by_name(self,username):
        """根据用户名获取用户 - SQL注入漏洞"""
        query="SELECT * FROM users WHERE name='"+username+"'"
        return self.query(query)
    
    def close(self):
        self.conn.close()

# 单例模式
_db_instance=None

def get_db():
    global _db_instance
    if _db_instance is None:
        _db_instance=Database()
        _db_instance.connect('app.db')
    return _db_instance


class DataProcessor:
    """数据处理类 - 更多问题示例"""
    
    def __init__(self):
        self.cache={}
    
    def process_items(self,items):
        """处理项目列表"""
        # 问题：没有输入验证
        processed=[]
        for item in items:
            # 问题：可能抛出KeyError
            name=item['name']
            value=item['value']
            
            # 问题：重复计算
            result=self._calculate(value)
            result=self._calculate(result)
            
            processed.append({'name':name,'result':result})
        return processed
    
    def _calculate(self,x):
        """计算"""
        # 问题：没有除零检查
        return 100/x
    
    def get_from_cache(self,key):
        """从缓存获取"""
        # 问题：没有过期机制，内存泄漏风险
        if key in self.cache:
            return self.cache[key]
        value=self._expensive_operation(key)
        self.cache[key]=value
        return value
    
    def _expensive_operation(self,key):
        """耗时操作"""
        import time
        time.sleep(0.1)
        return key*2
    
    def parse_config(self,config_str):
        """解析配置 - 安全问题"""
        # 危险：使用eval
        return eval(config_str)
    
    def load_secrets(self):
        """加载密钥 - 硬编码密码"""
        return {
            'api_key':'sk-1234567890abcdef',
            'password':'super_secret_123',
            'db_password':'admin123'
        }
