#!/usr/bin/env python3
"""
小七临时邮箱系统
自动创建临时邮箱，接收验证码
"""

import requests
import json
import time
import random
import string

class TempMail:
    """使用 mail.tm API 创建临时邮箱"""
    
    def __init__(self):
        self.base_url = "https://api.mail.tm"
        self.token = None
        self.email = None
        self.password = None
        self.account_id = None
        
    def get_domains(self):
        """获取可用域名列表"""
        response = requests.get(f"{self.base_url}/domains")
        if response.status_code == 200:
            return response.json()["hydra:member"]
        return []
    
    def create_account(self):
        """创建临时邮箱账户"""
        # 获取可用域名
        domains = self.get_domains()
        if not domains:
            print("❌ 无法获取域名列表")
            return False
        
        domain = domains[0]["domain"]
        
        # 生成随机用户名
        username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        self.email = f"{username}@{domain}"
        self.password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
        
        # 创建账户
        response = requests.post(
            f"{self.base_url}/accounts",
            json={"address": self.email, "password": self.password}
        )
        
        if response.status_code == 201:
            self.account_id = response.json()["id"]
            print(f"✅ 临时邮箱创建成功: {self.email}")
            return True
        else:
            print(f"❌ 创建失败: {response.text}")
            return False
    
    def login(self):
        """登录获取 token"""
        if not self.email or not self.password:
            print("❌ 先创建账户")
            return False
        
        response = requests.post(
            f"{self.base_url}/token",
            json={"address": self.email, "password": self.password}
        )
        
        if response.status_code == 200:
            self.token = response.json()["token"]
            print("✅ 登录成功")
            return True
        return False
    
    def get_messages(self):
        """获取邮件列表"""
        if not self.token:
            if not self.login():
                return []
        
        response = requests.get(
            f"{self.base_url}/messages",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        if response.status_code == 200:
            return response.json()["hydra:member"]
        return []
    
    def get_message(self, message_id):
        """获取邮件内容"""
        if not self.token:
            return None
        
        response = requests.get(
            f"{self.base_url}/messages/{message_id}",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        return None
    
    def wait_for_email(self, timeout=300, check_interval=10):
        """等待接收邮件"""
        print(f"⏳ 等待邮件... (最长{timeout}秒)")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            messages = self.get_messages()
            if messages:
                print(f"✅ 收到 {len(messages)} 封邮件")
                return messages
            time.sleep(check_interval)
        
        print("❌ 超时，未收到邮件")
        return []
    
    def delete_account(self):
        """删除账户"""
        if not self.token or not self.account_id:
            return
        
        requests.delete(
            f"{self.base_url}/accounts/{self.account_id}",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        print("✅ 账户已删除")


def create_temp_email():
    """创建临时邮箱并返回信息"""
    mail = TempMail()
    
    if mail.create_account():
        if mail.login():
            return {
                "email": mail.email,
                "password": mail.password,
                "token": mail.token,
                "account_id": mail.account_id,
                "instance": mail
            }
    return None


if __name__ == "__main__":
    # 测试
    result = create_temp_email()
    if result:
        print(f"\n📧 邮箱: {result['email']}")
        print(f"🔑 密码: {result['password']}")
        print(f"\n等待邮件中...")
        messages = result["instance"].wait_for_email(timeout=60)
        for msg in messages:
            print(f"\n📨 来自: {msg['from']['address']}")
            print(f"📋 主题: {msg['subject']}")
    else:
        print("❌ 创建失败")
