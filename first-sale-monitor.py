#!/bin/bash
# Stripe首单自动监控系统 (Python版本) - 每分钟运行
# 邮件通知: ai_67dd6c1a002c@sharebot.net
# 创建时间: 2026-03-21 17:14

import os
import sys
import json
import time
import fcntl
import signal
from datetime import datetime
import subprocess

# 配置
SCRIPT_DIR = "/root/.openclaw/workspace"
LOG_FILE = f"{SCRIPT_DIR}/logs/first-sale-monitor.log"
STATE_FILE = f"{SCRIPT_DIR}/first-sale-state.json"
SECRET_FILE = f"{SCRIPT_DIR}/.stripe-secret"
LOCK_FILE = "/tmp/first-sale-monitor.lock"
NOTIFICATION_EMAIL = "ai_67dd6c1a002c@sharebot.net"

# 全局变量
running = True

def signal_handler(signum, frame):
    global running
    running = False
    log("收到终止信号，正在退出...")

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

def log(msg):
    """记录日志"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] {msg}"
    print(log_msg)
    
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(log_msg + "\n")

def get_stripe_key():
    """获取Stripe密钥"""
    # 首先检查环境变量
    key = os.environ.get("STRIPE_SECRET_KEY")
    if key:
        return key
    
    # 然后检查文件
    if os.path.exists(SECRET_FILE):
        try:
            with open(SECRET_FILE, "r") as f:
                return f.read().strip()
        except:
            pass
    
    return None

def check_stripe_charges(api_key):
    """检查Stripe付款"""
    try:
        import urllib.request
        import urllib.error
        import ssl
        
        url = "https://api.stripe.com/v1/charges?limit=10"
        
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Stripe-Version", "2023-10-16")
        
        context = ssl.create_default_context()
        
        with urllib.request.urlopen(req, context=context, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except Exception as e:
        log(f"❌ Stripe API错误: {str(e)}")
        return None

def send_email_notification(subject, body, to_email):
    """发送邮件通知 - 多渠道备用方案"""
    notification_sent = False
    
    # 方法1: 使用mail命令
    try:
        result = subprocess.run(
            ["mail", "-s", subject, to_email],
            input=body,
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            log(f"✅ 邮件已通过mail命令发送到 {to_email}")
            notification_sent = True
    except Exception as e:
        log(f"mail命令失败: {str(e)}")
    
    # 方法2: 使用sendmail
    if not notification_sent:
        try:
            email_content = f"""Subject: {subject}
To: {to_email}
Content-Type: text/plain; charset=UTF-8

{body}
"""
            result = subprocess.run(
                ["sendmail", to_email],
                input=email_content,
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                log(f"✅ 邮件已通过sendmail发送到 {to_email}")
                notification_sent = True
        except Exception as e:
            log(f"sendmail失败: {str(e)}")
    
    # 方法3: 使用msmtp
    if not notification_sent:
        try:
            result = subprocess.run(
                ["msmtp", "-t", to_email],
                input=f"Subject: {subject}\n\n{body}",
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                log(f"✅ 邮件已通过msmtp发送到 {to_email}")
                notification_sent = True
        except Exception as e:
            log(f"msmtp失败: {str(e)}")
    
    # 方法4: 保存到待发送队列，由外部邮件服务处理
    if not notification_sent:
        try:
            queue_file = f"{SCRIPT_DIR}/email-notification-queue.json"
            queue = []
            if os.path.exists(queue_file):
                with open(queue_file, "r") as f:
                    queue = json.load(f)
            
            queue.append({
                "to": to_email,
                "subject": subject,
                "body": body,
                "created_at": datetime.now().isoformat(),
                "status": "pending"
            })
            
            with open(queue_file, "w") as f:
                json.dump(queue, f, indent=2)
            
            log(f"📧 通知已加入邮件队列: {queue_file}")
            notification_sent = True
        except Exception as e:
            log(f"邮件队列失败: {str(e)}")
    
    # 方法5: 创建本地通知文件
    try:
        notification_file = f"{SCRIPT_DIR}/NOTIFICATION-FIRST-SALE-{datetime.now().strftime('%Y%m%d-%H%M%S')}.txt"
        with open(notification_file, "w") as f:
            f.write(f"收件人: {to_email}\n")
            f.write(f"主题: {subject}\n")
            f.write(f"时间: {datetime.now().isoformat()}\n")
            f.write("="*50 + "\n\n")
            f.write(body)
        log(f"📄 通知文件已创建: {notification_file}")
    except Exception as e:
        log(f"通知文件创建失败: {str(e)}")
    
    if not notification_sent:
        log("⚠️ 实时邮件发送失败，已保存到队列和文件")
    
    return notification_sent

def load_state():
    """加载状态文件"""
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    
    return {
        "first_sale_detected": False,
        "check_count": 0,
        "last_check": "",
        "sales": []
    }

def save_state(state):
    """保存状态文件"""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def check_and_notify():
    """检查付款并发送通知"""
    global running
    
    log("===== 开始检查Stripe付款 =====")
    
    # 获取API密钥
    api_key = get_stripe_key()
    if not api_key:
        log("❌ 错误: 未找到Stripe API密钥")
        log(f"请设置环境变量 STRIPE_SECRET_KEY 或创建文件 {SECRET_FILE}")
        return False
    
    # 加载状态
    state = load_state()
    
    # 如果已经检测到首单，直接返回
    if state.get("first_sale_detected"):
        log("首单已检测到，跳过检查")
        return True
    
    # 检查付款
    data = check_stripe_charges(api_key)
    if data is None:
        return False
    
    # 更新检查次数
    state["check_count"] = state.get("check_count", 0) + 1
    state["last_check"] = datetime.now().isoformat()
    
    charges = data.get("data", [])
    
    if charges:
        # 有付款！
        first_charge = charges[0]
        
        charge_id = first_charge.get("id", "unknown")
        amount = first_charge.get("amount", 0)
        currency = first_charge.get("currency", "usd").upper()
        status = first_charge.get("status", "unknown")
        created_ts = first_charge.get("created", 0)
        customer = first_charge.get("receipt_email") or first_charge.get("billing_details", {}).get("email") or "匿名客户"
        
        # 转换金额
        amount_decimal = amount / 100
        
        # 转换时间
        created_date = datetime.fromtimestamp(created_ts).strftime("%Y-%m-%d %H:%M:%S")
        
        log(f"🎉 检测到付款! ID: {charge_id}, 金额: {amount_decimal} {currency}")
        
        # 更新状态
        state["first_sale_detected"] = True
        state["detected_at"] = datetime.now().isoformat()
        state["first_sale"] = {
            "charge_id": charge_id,
            "amount": amount_decimal,
            "currency": currency,
            "status": status,
            "created_timestamp": created_ts,
            "created_date": created_date,
            "customer": customer
        }
        state["sales"].append({
            "id": charge_id,
            "amount": amount_decimal,
            "currency": currency,
            "date": created_date
        })
        
        save_state(state)
        
        # 创建通知内容
        notification_msg = f"""🎉 第一单到账！

项目: Stripe收款
金额: {amount_decimal} {currency}
时间: {created_date}
客户: {customer}
付款ID: {charge_id}
状态: {status}

检测时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
检查次数: {state['check_count']}

---
这是您的首单自动通知系统"""
        
        log(notification_msg)
        
        # 发送邮件通知
        subject = f"🎉 Stripe首单到账通知 - {amount_decimal} {currency}"
        send_email_notification(subject, notification_msg, NOTIFICATION_EMAIL)
        
        # 创建庆祝文件
        celebration_file = f"{SCRIPT_DIR}/FIRST-SALE-CELEBRATION.txt"
        with open(celebration_file, "w") as f:
            f.write(f"""╔═══════════════════════════════════════════╗
║                                           ║
║   🎉🎉🎉 恭喜！您的首单已到账！ 🎉🎉🎉    ║
║                                           ║
╚═══════════════════════════════════════════╝

首单详情:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 付款ID:    {charge_id}
💰 金额:      {amount_decimal} {currency}
📅 时间:      {created_date}
👤 客户:      {customer}
✅ 状态:      {status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检测统计:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 总检查次数: {state['check_count']}
⏰ 首次检测:   {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
📧 通知邮箱:   {NOTIFICATION_EMAIL}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

里程碑达成！继续加油！💪

""")
        
        log(f"✅ 首单通知已发送到 {NOTIFICATION_EMAIL}")
        log("🎉 首单庆祝文件已创建: FIRST-SALE-CELEBRATION.txt")
        
    else:
        log(f"暂无新付款 (第 {state['check_count']} 次检查)")
        save_state(state)
    
    log("===== 检查完成 =====")
    return True

def main():
    """主函数"""
    # 检查锁文件
    if os.path.exists(LOCK_FILE):
        try:
            with open(LOCK_FILE, "r") as f:
                old_pid = int(f.read().strip())
            # 检查进程是否还在运行
            os.kill(old_pid, 0)
            log(f"监控脚本已在运行，PID: {old_pid}")
            return
        except (ValueError, OSError, ProcessLookupError):
            # 进程不存在，继续执行
            pass
    
    # 创建锁文件
    with open(LOCK_FILE, "w") as f:
        f.write(str(os.getpid()))
    
    try:
        check_and_notify()
    finally:
        # 清理锁文件
        if os.path.exists(LOCK_FILE):
            with open(LOCK_FILE, "r") as f:
                try:
                    if int(f.read().strip()) == os.getpid():
                        os.remove(LOCK_FILE)
                except:
                    pass

if __name__ == "__main__":
    main()
