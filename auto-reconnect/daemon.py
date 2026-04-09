#!/usr/bin/env python3
"""
断线自动重连守护进程 (Auto-Reconnect Daemon)
功能：监控连接状态，自动重连，失败时发送通知
"""

import os
import sys
import time
import json
import logging
import smtplib
import subprocess
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

# 配置
CONFIG_FILE = "/etc/auto-reconnect/config.json"
LOG_FILE = "/var/log/auto-reconnect.log"
PID_FILE = "/var/run/auto-reconnect.pid"
STATE_FILE = "/var/lib/auto-reconnect/state.json"

# 重连策略 (秒)
RETRY_DELAYS = [0, 5, 15, 60]  # 第1次立即，第2次5秒，第3次15秒，之后60秒
MAX_RETRY = 100

# 邮件配置
SMTP_HOST = "smtp.sharebot.net"
SMTP_PORT = 587
SMTP_USER = "notify@sharebot.net"
SMTP_PASS = os.environ.get("SMTP_PASS", "")
NOTIFY_EMAIL = "ai_67dd6c1a002c@sharebot.net"

class AutoReconnectDaemon:
    def __init__(self):
        self.retry_count = 0
        self.last_state = "unknown"
        self.backup_mode = False
        self.safe_mode = False
        self.setup_logging()
        self.load_state()
        
    def setup_logging(self):
        """配置日志记录"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(message)s',
            handlers=[
                logging.FileHandler(LOG_FILE),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger('auto-reconnect')
        
    def load_state(self):
        """加载上次状态"""
        try:
            if os.path.exists(STATE_FILE):
                with open(STATE_FILE, 'r') as f:
                    state = json.load(f)
                    self.retry_count = state.get('retry_count', 0)
                    self.last_state = state.get('last_state', 'unknown')
        except Exception as e:
            self.logger.warning(f"无法加载状态文件: {e}")
            
    def save_state(self):
        """保存当前状态"""
        try:
            os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
            with open(STATE_FILE, 'w') as f:
                json.dump({
                    'retry_count': self.retry_count,
                    'last_state': self.last_state,
                    'backup_mode': self.backup_mode,
                    'safe_mode': self.safe_mode,
                    'timestamp': datetime.now().isoformat()
                }, f)
        except Exception as e:
            self.logger.error(f"无法保存状态: {e}")
            
    def check_connection(self):
        """检测连接状态"""
        # 检查网关连接
        try:
            # 检查 openclaw gateway 状态
            result = subprocess.run(
                ['openclaw', 'gateway', 'status'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0 and 'running' in result.stdout.lower():
                return True
                
            # 备用检查：网络连通性
            ping_result = subprocess.run(
                ['ping', '-c', '1', '-W', '3', '8.8.8.8'],
                capture_output=True,
                timeout=10
            )
            return ping_result.returncode == 0
            
        except Exception as e:
            self.logger.error(f"连接检测失败: {e}")
            return False
            
    def reconnect(self):
        """执行重连操作"""
        try:
            self.logger.info("尝试重连...")
            
            # 策略1: 重启 openclaw gateway
            result = subprocess.run(
                ['openclaw', 'gateway', 'restart'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                time.sleep(3)  # 等待服务启动
                return self.check_connection()
                
            return False
            
        except Exception as e:
            self.logger.error(f"重连失败: {e}")
            return False
            
    def reconnect_backup(self):
        """备用重连通道"""
        try:
            self.logger.info("尝试备用通道...")
            self.backup_mode = True
            
            # 备用方案1: 停止并重新启动服务
            subprocess.run(['systemctl', 'stop', 'openclaw-gateway'], 
                         capture_output=True, timeout=15)
            time.sleep(2)
            subprocess.run(['systemctl', 'start', 'openclaw-gateway'], 
                         capture_output=True, timeout=15)
            time.sleep(5)
            
            if self.check_connection():
                self.logger.info("备用通道重连成功")
                return True
                
            # 备用方案2: 重启网络服务
            subprocess.run(['systemctl', 'restart', 'systemd-networkd'], 
                         capture_output=True, timeout=30)
            time.sleep(5)
            
            return self.check_connection()
            
        except Exception as e:
            self.logger.error(f"备用通道失败: {e}")
            return False
            
    def enter_safe_mode(self):
        """进入安全模式"""
        self.safe_mode = True
        self.logger.critical("!!! 进入安全模式 !!!")
        self.logger.critical("所有重连尝试失败，系统进入安全模式")
        self.send_notification(
            "【紧急】连接守护进程进入安全模式",
            f"所有重连尝试({MAX_RETRY}次)均失败，系统已进入安全模式。\n"
            f"时间: {datetime.now().isoformat()}\n"
            f"请立即手动检查系统状态。"
        )
        
    def send_notification(self, subject, body):
        """发送邮件通知"""
        try:
            msg = MIMEMultipart()
            msg['From'] = SMTP_USER
            msg['To'] = NOTIFY_EMAIL
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # 尝试发送邮件
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
                
            self.logger.info(f"通知邮件已发送: {subject}")
            return True
            
        except Exception as e:
            self.logger.error(f"邮件发送失败: {e}")
            # 记录到本地作为备份
            self.log_notification_backup(subject, body)
            return False
            
    def log_notification_backup(self, subject, body):
        """邮件发送失败时记录到本地"""
        backup_file = "/var/log/auto-reconnect-notifications.log"
        try:
            with open(backup_file, 'a') as f:
                f.write(f"\n{'='*60}\n")
                f.write(f"时间: {datetime.now().isoformat()}\n")
                f.write(f"主题: {subject}\n")
                f.write(f"内容: {body}\n")
        except Exception as e:
            self.logger.error(f"备份日志写入失败: {e}")
            
    def get_retry_delay(self):
        """获取当前重试延迟"""
        if self.retry_count < len(RETRY_DELAYS):
            return RETRY_DELAYS[self.retry_count]
        return RETRY_DELAYS[-1]  # 使用最后一个延迟(60秒)
        
    def run_cycle(self):
        """运行一个检测周期"""
        connected = self.check_connection()
        
        if connected:
            if self.last_state != "connected":
                self.logger.info("✓ 连接已恢复")
                if self.retry_count > 0:
                    self.send_notification(
                        "【恢复】连接已恢复",
                        f"连接在 {self.retry_count} 次重试后恢复\n"
                        f"时间: {datetime.now().isoformat()}"
                    )
                self.retry_count = 0
                self.backup_mode = False
                self.safe_mode = False
                self.last_state = "connected"
                self.save_state()
            return True
            
        else:
            self.last_state = "disconnected"
            self.logger.warning(f"✗ 连接中断 (重试 {self.retry_count + 1}/{MAX_RETRY})")
            
            if self.retry_count >= MAX_RETRY:
                if not self.safe_mode:
                    self.enter_safe_mode()
                return False
                
            # 计算延迟
            delay = self.get_retry_delay()
            if delay > 0:
                self.logger.info(f"等待 {delay} 秒后重试...")
                time.sleep(delay)
                
            # 尝试重连
            if not self.backup_mode:
                success = self.reconnect()
            else:
                success = self.reconnect_backup()
                
            if success:
                self.logger.info("✓ 重连成功")
                self.retry_count = 0
                self.backup_mode = False
                self.send_notification(
                    "【恢复】重连成功",
                    f"连接通过{'备用' if self.backup_mode else '主'}通道恢复\n"
                    f"时间: {datetime.now().isoformat()}"
                )
            else:
                self.retry_count += 1
                self.logger.error(f"✗ 重连失败 (第 {self.retry_count} 次)")
                
                if self.retry_count == 3:
                    self.send_notification(
                        "【警告】连接中断",
                        f"连接中断，已尝试 {self.retry_count} 次重连\n"
                        f"即将尝试备用通道\n"
                        f"时间: {datetime.now().isoformat()}"
                    )
                    self.backup_mode = True
                    
            self.save_state()
            return success
            
    def run(self):
        """主循环"""
        self.logger.info("="*60)
        self.logger.info("断线自动重连守护进程启动")
        self.logger.info(f"日志文件: {LOG_FILE}")
        self.logger.info(f"最大重试: {MAX_RETRY}")
        self.logger.info("="*60)
        
        # 创建PID文件
        try:
            with open(PID_FILE, 'w') as f:
                f.write(str(os.getpid()))
        except Exception as e:
            self.logger.warning(f"无法创建PID文件: {e}")
            
        try:
            while True:
                self.run_cycle()
                # 每分钟检测一次
                time.sleep(60)
        except KeyboardInterrupt:
            self.logger.info("收到中断信号，正在退出...")
        finally:
            self.cleanup()
            
    def cleanup(self):
        """清理资源"""
        try:
            if os.path.exists(PID_FILE):
                os.remove(PID_FILE)
        except:
            pass
        self.logger.info("守护进程已停止")

if __name__ == "__main__":
    daemon = AutoReconnectDaemon()
    daemon.run()
