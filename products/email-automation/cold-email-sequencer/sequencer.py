# Email Automation Service - Cold Email Sequencer
# 小七团队开发
# 自动邮件跟进序列

import json
import smtplib
import schedule
import time
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional
import sqlite3

class ColdEmailSequencer:
    """冷邮件自动化系统"""
    
    def __init__(self, db_path: str = 'email_sequences.db'):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 邮件序列表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sequences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 邮件步骤表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sequence_steps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sequence_id INTEGER,
                step_order INTEGER,
                subject TEXT,
                body TEXT,
                delay_days INTEGER,
                FOREIGN KEY (sequence_id) REFERENCES sequences(id)
            )
        ''')
        
        # 联系人表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                first_name TEXT,
                company TEXT,
                industry TEXT,
                status TEXT DEFAULT 'active'
            )
        ''')
        
        # 发送记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sent_emails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id INTEGER,
                sequence_id INTEGER,
                step_id INTEGER,
                sent_at TIMESTAMP,
                opened BOOLEAN DEFAULT 0,
                clicked BOOLEAN DEFAULT 0,
                replied BOOLEAN DEFAULT 0,
                FOREIGN KEY (contact_id) REFERENCES contacts(id)
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def create_sequence(self, name: str, steps: List[Dict]) -> int:
        """创建邮件序列"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 插入序列
        cursor.execute('INSERT INTO sequences (name) VALUES (?)', (name,))
        sequence_id = cursor.lastrowid
        
        # 插入步骤
        for i, step in enumerate(steps):
            cursor.execute('''
                INSERT INTO sequence_steps 
                (sequence_id, step_order, subject, body, delay_days)
                VALUES (?, ?, ?, ?, ?)
            ''', (sequence_id, i+1, step['subject'], step['body'], step['delay_days']))
        
        conn.commit()
        conn.close()
        
        return sequence_id
        
    def add_contact(self, email: str, first_name: str = '', company: str = '', industry: str = '') -> int:
        """添加联系人"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO contacts (email, first_name, company, industry)
                VALUES (?, ?, ?, ?)
            ''', (email, first_name, company, industry))
            contact_id = cursor.lastrowid
            conn.commit()
        except sqlite3.IntegrityError:
            cursor.execute('SELECT id FROM contacts WHERE email = ?', (email,))
            contact_id = cursor.fetchone()[0]
        
        conn.close()
        return contact_id
        
    def send_email(self, contact_id: int, sequence_id: int, step_id: int, smtp_config: Dict):
        """发送单封邮件"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取联系人信息
        cursor.execute('SELECT email, first_name, company FROM contacts WHERE id = ?', (contact_id,))
        contact = cursor.fetchone()
        
        # 获取邮件内容
        cursor.execute('SELECT subject, body FROM sequence_steps WHERE id = ?', (step_id,))
        step = cursor.fetchone()
        
        if not contact or not step:
            conn.close()
            return False
            
        email, first_name, company = contact
        subject, body = step
        
        # 替换变量
        subject = subject.replace('{{first_name}}', first_name or 'there')
        subject = subject.replace('{{company}}', company or 'your company')
        body = body.replace('{{first_name}}', first_name or 'there')
        body = body.replace('{{company}}', company or 'your company')
        
        # 发送邮件
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_config['from_email']
            msg['To'] = email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(smtp_config['host'], smtp_config['port'])
            server.starttls()
            server.login(smtp_config['username'], smtp_config['password'])
            server.send_message(msg)
            server.quit()
            
            # 记录发送
            cursor.execute('''
                INSERT INTO sent_emails (contact_id, sequence_id, step_id, sent_at)
                VALUES (?, ?, ?, ?)
            ''', (contact_id, sequence_id, step_id, datetime.now()))
            conn.commit()
            
            print(f"✅ 邮件已发送至 {email}")
            success = True
            
        except Exception as e:
            print(f"❌ 发送失败 {email}: {e}")
            success = False
            
        conn.close()
        return success
        
    def run_sequence(self, sequence_id: int, smtp_config: Dict):
        """运行邮件序列"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取所有活跃联系人
        cursor.execute('SELECT id FROM contacts WHERE status = ?', ('active',))
        contacts = cursor.fetchall()
        
        # 获取序列步骤
        cursor.execute('''
            SELECT id, delay_days FROM sequence_steps 
            WHERE sequence_id = ? ORDER BY step_order
        ''', (sequence_id,))
        steps = cursor.fetchall()
        
        conn.close()
        
        for contact_id, in contacts:
            for step_id, delay_days in steps:
                # 检查是否已经发送过这个步骤
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id FROM sent_emails 
                    WHERE contact_id = ? AND step_id = ?
                ''', (contact_id, step_id))
                already_sent = cursor.fetchone()
                conn.close()
                
                if not already_sent:
                    # 如果是第一步立即发送，否则延迟
                    if delay_days == 0:
                        self.send_email(contact_id, sequence_id, step_id, smtp_config)
                    else:
                        # 调度延迟发送
                        schedule.every(delay_days).days.do(
                            self.send_email, contact_id, sequence_id, step_id, smtp_config
                        )
                        
    def get_stats(self) -> Dict:
        """获取统计数据"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM contacts')
        total_contacts = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM sent_emails')
        total_sent = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM sent_emails WHERE opened = 1')
        total_opened = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM sent_emails WHERE replied = 1')
        total_replied = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_contacts': total_contacts,
            'total_sent': total_sent,
            'open_rate': (total_opened / total_sent * 100) if total_sent > 0 else 0,
            'reply_rate': (total_replied / total_sent * 100) if total_sent > 0 else 0
        }

# 预设邮件序列模板
EMAIL_TEMPLATES = {
    'saas_outreach': [
        {
            'subject': 'Quick question about {{company}}',
            'body': '''
            <p>Hi {{first_name}},</p>
            <p>I noticed {{company}} is growing fast in the {{industry}} space.</p>
            <p>We help similar companies automate their sales process and save 10+ hours per week.</p>
            <p>Would you be open to a quick 15-minute call next week?</p>
            <p>Best,<br>小七</p>
            ''',
            'delay_days': 0
        },
        {
            'subject': 'Following up: {{company}} automation',
            'body': '''
            <p>Hi {{first_name}},</p>
            <p>Just following up on my previous email about automating {{company}}'s sales process.</p>
            <p>We've helped 50+ companies in your industry increase conversions by 30%.</p>
            <p>Worth a brief conversation?</p>
            <p>Best,<br>小七</p>
            ''',
            'delay_days': 3
        },
        {
            'subject': 'Last try: {{company}} growth',
            'body': '''
            <p>Hi {{first_name}},</p>
            <p>I don't want to be annoying, so this is my last email.</p>
            <p>If you're not interested in growing {{company}} right now, I totally understand.</p>
            <p>If things change in the future, feel free to reach out.</p>
            <p>Best of luck!<br>小七</p>
            ''',
            'delay_days': 7
        }
    ]
}

# 定价
PRICING = {
    'starter': {
        'price': 19,
        'contacts': 100,
        'sequences': 3,
        'emails_per_month': 500
    },
    'growth': {
        'price': 49,
        'contacts': 1000,
        'sequences': 10,
        'emails_per_month': 5000
    },
    'pro': {
        'price': 99,
        'contacts': 10000,
        'sequences': 999,
        'emails_per_month': 50000
    }
}

if __name__ == '__main__':
    # 示例使用
    sequencer = ColdEmailSequencer()
    
    # 创建序列
    sequence_id = sequencer.create_sequence('SaaS Outreach', EMAIL_TEMPLATES['saas_outreach'])
    print(f"序列创建完成: ID {sequence_id}")
    
    # 添加联系人
    contact_id = sequencer.add_contact('test@example.com', 'John', 'TestCo', 'SaaS')
    print(f"联系人添加完成: ID {contact_id}")
    
    # 查看统计
    stats = sequencer.get_stats()
    print(f"\n统计: {stats}")
