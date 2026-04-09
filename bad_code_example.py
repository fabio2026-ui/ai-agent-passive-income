# 示例：用户管理系统
# 这是一个包含多种代码质量问题的示例项目

import os, sys, json, random, hashlib, time
from typing import List,Dict

DEBUG=True

class userManager:
    """用户管理类"""
    def __init__(self,db_path):
        self.db=db_path
        self.users=[]
        self.load()
    
    def load(self):
        """加载用户数据"""
        if os.path.exists(self.db):
            with open(self.db,'r') as f:
                self.users=json.load(f)
    
    def save(self):
        """保存用户数据"""
        with open(self.db,'w') as f:
            json.dump(self.users,f)
    
    def addUser(self,name,pwd,email):
        """添加用户"""
        # 密码使用MD5哈希（安全问题）
        hash=hashlib.md5(pwd.encode()).hexdigest()
        user={
            'id':len(self.users)+1,
            'name':name,
            'password':hash,
            'email':email,
            'created':time.time()
        }
        self.users.append(user)
        self.save()
        return user
    
    def findUser(self,name):
        """查找用户"""
        for u in self.users:
            if u['name']==name:
                return u
        return None
    
    def login(self,name,pwd):
        """用户登录"""
        user=self.findUser(name)
        if user:
            hash=hashlib.md5(pwd.encode()).hexdigest()
            if user['password']==hash:
                return True
        return False
    
    def deleteUser(self,id):
        """删除用户"""
        for i,u in enumerate(self.users):
            if u['id']==id:
                del self.users[i]
                self.save()
                return True
        return False
    
    def getAllUsers(self):
        """获取所有用户"""
        result=[]
        for u in self.users:
            result.append(u)
        return result
    
    def exportToCSV(self,filepath):
        """导出到CSV"""
        f=open(filepath,'w')
        f.write('id,name,email,created\n')
        for u in self.users:
            f.write(f"{u['id']},{u['name']},{u['email']},{u['created']}\n")
        f.close()

# 全局实例
manager=userManager('users.json')

def process_data(data_list):
    """处理数据（性能问题示例）"""
    result=[]
    for i in range(len(data_list)):
        for j in range(len(data_list)):
            if i!=j:
                if data_list[i]==data_list[j]:
                    result.append(data_list[i])
    return result

def get_user_stats():
    """获取用户统计"""
    stats={}
    for u in manager.users:
        domain=u['email'].split('@')[1]
        if domain not in stats:
            stats[domain]=0
        stats[domain]+=1
    return stats

def backup_database():
    """备份数据库"""
    cmd='cp users.json backup_'+str(int(time.time()))+'.json'
    os.system(cmd)

def generate_report():
    """生成报告"""
    r=[]
    r.append('User Report')
    r.append('==========')
    r.append('Total: '+str(len(manager.users)))
    for u in manager.users:
        r.append(u['name']+': '+u['email'])
    return '\n'.join(r)

if __name__=='__main__':
    # 测试代码
    manager.addUser('admin','123456','admin@test.com')
    manager.addUser('test','password','test@test.com')
    print(generate_report())
