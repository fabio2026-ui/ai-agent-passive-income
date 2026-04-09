#!/usr/bin/env python3
"""
告警管理模块
负责发送各种告警通知
"""

import os
import json
import logging
import requests
from pathlib import Path
from datetime import datetime

class AlertManager:
    """告警管理器"""
    
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger('AlertManager')
        self.channels = config.get('notification_channels', ['log'])
        self.webhook_url = config.get('webhook_url', '')
        self.alert_history = []
        
        # 告警去重控制（避免重复告警）
        self.recent_alerts = {}
        self.dedup_window = 3600  # 1小时内相同告警不重复发送
        
    def send_alert(self, title, message, level='info', data=None):
        """
        发送告警
        level: info, warning, error, critical
        """
        alert = {
            'timestamp': datetime.now().isoformat(),
            'title': title,
            'message': message,
            'level': level,
            'data': data or {}
        }
        
        # 检查是否需要去重
        alert_key = f"{title}:{message}"
        current_time = datetime.now().timestamp()
        
        if alert_key in self.recent_alerts:
            last_time = self.recent_alerts[alert_key]
            if current_time - last_time < self.dedup_window:
                self.logger.debug(f"告警去重跳过: {title}")
                return False
                
        self.recent_alerts[alert_key] = current_time
        
        # 发送到各个渠道
        success = False
        
        for channel in self.channels:
            try:
                if channel == 'log':
                    self._send_to_log(alert)
                    success = True
                elif channel == 'webhook':
                    self._send_to_webhook(alert)
                    success = True
                elif channel == 'file':
                    self._send_to_file(alert)
                    success = True
                elif channel == 'console':
                    self._send_to_console(alert)
                    success = True
            except Exception as e:
                self.logger.error(f"发送告警到 {channel} 失败: {e}")
                
        # 记录告警历史
        self._record_alert(alert)
        
        return success
        
    def _send_to_log(self, alert):
        """发送告警到日志"""
        level = alert['level']
        message = f"[{level.upper()}] {alert['title']}: {alert['message']}"
        
        if level == 'critical':
            self.logger.critical(message)
        elif level == 'error':
            self.logger.error(message)
        elif level == 'warning':
            self.logger.warning(message)
        else:
            self.logger.info(message)
            
    def _send_to_console(self, alert):
        """发送告警到控制台"""
        level_colors = {
            'info': '\033[94m',      # 蓝色
            'warning': '\033[93m',   # 黄色
            'error': '\033[91m',     # 红色
            'critical': '\033[95m'   # 紫色
        }
        reset = '\033[0m'
        
        color = level_colors.get(alert['level'], '')
        print(f"{color}[{alert['level'].upper()}] {alert['timestamp']}")
        print(f"标题: {alert['title']}")
        print(f"消息: {alert['message']}{reset}")
        print("-" * 60)
        
    def _send_to_webhook(self, alert):
        """发送告警到Webhook"""
        if not self.webhook_url:
            return
            
        try:
            payload = {
                'text': f"🛡️ Security Guard Alert\n\n"
                       f"级别: {alert['level'].upper()}\n"
                       f"时间: {alert['timestamp']}\n"
                       f"标题: {alert['title']}\n"
                       f"消息: {alert['message']}"
            }
            
            # 支持多种webhook格式
            if 'slack' in self.webhook_url:
                payload = {
                    'attachments': [{
                        'color': self._get_color(alert['level']),
                        'title': alert['title'],
                        'text': alert['message'],
                        'footer': 'Security Guard Agent',
                        'ts': datetime.now().timestamp()
                    }]
                }
            elif 'discord' in self.webhook_url:
                payload = {
                    'embeds': [{
                        'title': alert['title'],
                        'description': alert['message'],
                        'color': self._get_discord_color(alert['level']),
                        'timestamp': alert['timestamp']
                    }]
                }
                
            response = requests.post(
                self.webhook_url,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
        except Exception as e:
            self.logger.error(f"Webhook发送失败: {e}")
            
    def _send_to_file(self, alert):
        """发送告警到文件"""
        try:
            log_dir = Path(__file__).parent.parent / 'logs' / 'alerts'
            log_dir.mkdir(parents=True, exist_ok=True)
            
            date_str = datetime.now().strftime('%Y%m%d')
            log_file = log_dir / f'alerts-{date_str}.jsonl'
            
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(alert, ensure_ascii=False) + '\n')
                
        except Exception as e:
            self.logger.error(f"告警文件写入失败: {e}")
            
    def _record_alert(self, alert):
        """记录告警历史"""
        self.alert_history.append(alert)
        
        # 限制历史记录数量
        if len(self.alert_history) > 1000:
            self.alert_history = self.alert_history[-500:]
            
    def _get_color(self, level):
        """获取Slack颜色代码"""
        colors = {
            'info': 'good',
            'warning': 'warning',
            'error': 'danger',
            'critical': 'danger'
        }
        return colors.get(level, 'good')
        
    def _get_discord_color(self, level):
        """获取Discord颜色代码"""
        colors = {
            'info': 3447003,      # 蓝色
            'warning': 16776960,  # 黄色
            'error': 15158332,    # 红色
            'critical': 10038562  # 深红色
        }
        return colors.get(level, 3447003)
        
    def get_alert_summary(self, hours=24):
        """获取告警摘要"""
        cutoff_time = datetime.now().timestamp() - (hours * 3600)
        
        recent_alerts = [
            alert for alert in self.alert_history
            if datetime.fromisoformat(alert['timestamp']).timestamp() > cutoff_time
        ]
        
        by_level = {}
        for alert in recent_alerts:
            level = alert['level']
            by_level[level] = by_level.get(level, 0) + 1
            
        return {
            'total': len(recent_alerts),
            'by_level': by_level,
            'recent': recent_alerts[-10:]  # 最近10条
        }
        
    def send_daily_summary(self, report_data):
        """发送每日摘要"""
        summary = f"""
📊 Security Guard 每日安全报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 日期: {report_data.get('date')}

🔒 安全扫描:
   • 扫描文件数: {report_data.get('scan_stats', {}).get('scanned_files', 0)}
   • 发现漏洞: {report_data.get('scan_stats', {}).get('total_vulnerabilities', 0)}
   • 高危漏洞: {report_data.get('scan_stats', {}).get('high_risk_count', 0)}

🔧 自动修复:
   • 修复操作数: {report_data.get('fix_stats', {}).get('total_fixes', 0)}
   • 成功: {report_data.get('fix_stats', {}).get('successful', 0)}
   • 失败: {report_data.get('fix_stats', {}).get('failed', 0)}

📈 系统状态:
   • 平均CPU: {report_data.get('system_stats', {}).get('avg_cpu', 0)}%
   • 平均内存: {report_data.get('system_stats', {}).get('avg_memory', 0)}%
   • 告警次数: {report_data.get('alert_stats', {}).get('total', 0)}

⚠️ 风险提示:
{self._format_risks(report_data.get('risk_predictions', []))}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Security Guard Agent 🤖
"""
        
        self.send_alert(
            "每日安全报告",
            summary,
            level="info"
        )
        
    def _format_risks(self, risks):
        """格式化风险提示"""
        if not risks:
            return "   暂无重大风险"
            
        formatted = []
        for risk in risks[:5]:
            formatted.append(f"   • {risk.get('description', '未知风险')}")
        return '\n'.join(formatted)
