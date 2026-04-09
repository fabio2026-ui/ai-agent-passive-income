#!/usr/bin/env python3
"""
Security Guard Agent - 系统安全维护机器人
主控制器 - 协调所有安全模块的运行
"""

import os
import sys
import json
import time
import logging
import argparse
from datetime import datetime
from pathlib import Path

# 添加脚本目录到路径
SCRIPT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SCRIPT_DIR / 'scripts'))

from security_scanner import SecurityScanner
from auto_fixer import AutoFixer
from system_monitor import SystemMonitor
from report_generator import ReportGenerator
from alert_manager import AlertManager

class SecurityGuardAgent:
    """24/7 系统安全维护机器人"""
    
    def __init__(self, config_path=None):
        self.base_dir = Path(__file__).parent.parent
        self.config_path = config_path or self.base_dir / 'config' / 'config.json'
        self.config = self._load_config()
        self._setup_logging()
        
        # 初始化各模块
        self.scanner = SecurityScanner(self.config)
        self.fixer = AutoFixer(self.config)
        self.monitor = SystemMonitor(self.config)
        self.reporter = ReportGenerator(self.config)
        self.alerter = AlertManager(self.config)
        
        self.running = False
        self.last_scan_time = None
        self.last_report_time = None
        
    def _load_config(self):
        """加载配置文件"""
        default_config = {
            "scan_interval": 3600,  # 每小时扫描
            "report_interval": 86400,  # 每天报告
            "monitor_interval": 60,  # 每分钟监控
            "auto_fix": True,
            "alert_thresholds": {
                "cpu_percent": 80,
                "memory_percent": 85,
                "disk_percent": 90,
                "load_average": 10
            },
            "scan_paths": ["/root/.openclaw/workspace"],
            "log_level": "INFO",
            "notification_channels": ["log", "webhook"],
            "webhook_url": ""
        }
        
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                default_config.update(config)
        
        return default_config
    
    def _setup_logging(self):
        """设置日志"""
        log_dir = self.base_dir / 'logs'
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f'security-guard-{datetime.now().strftime("%Y%m%d")}.log'
        
        logging.basicConfig(
            level=getattr(logging, self.config.get('log_level', 'INFO')),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger('SecurityGuard')
        
    def run_hourly_scan(self):
        """执行每小时安全扫描"""
        self.logger.info("="*60)
        self.logger.info("开始每小时安全扫描...")
        
        results = {
            'timestamp': datetime.now().isoformat(),
            'code_scan': {},
            'dependency_scan': {},
            'api_health': {}
        }
        
        try:
            # 1. 代码安全漏洞扫描
            self.logger.info("扫描代码安全漏洞...")
            results['code_scan'] = self.scanner.scan_code_vulnerabilities()
            
            # 2. 依赖包安全检查
            self.logger.info("检查依赖包安全...")
            results['dependency_scan'] = self.scanner.scan_dependencies()
            
            # 3. API健康检查
            self.logger.info("检查API健康状态...")
            results['api_health'] = self.scanner.check_api_health()
            
            # 4. 自动修复（如果启用）
            if self.config.get('auto_fix', True):
                self.logger.info("执行自动修复...")
                fixes = self.fixer.apply_fixes(results)
                results['fixes_applied'] = fixes
                
                if fixes:
                    self.alerter.send_alert(
                        "安全修复通知",
                        f"自动修复了 {len(fixes)} 个安全问题",
                        level="info"
                    )
            
            # 保存扫描结果
            self._save_scan_results(results)
            
            # 发送告警（如果有高危漏洞）
            high_risk = self._count_high_risk(results)
            if high_risk > 0:
                self.alerter.send_alert(
                    "安全告警",
                    f"发现 {high_risk} 个高危安全问题",
                    level="warning" if high_risk < 5 else "critical"
                )
            
            self.logger.info("每小时安全扫描完成")
            self.last_scan_time = datetime.now()
            
        except Exception as e:
            self.logger.error(f"安全扫描失败: {e}")
            self.alerter.send_alert("扫描错误", str(e), level="error")
            
    def run_system_monitor(self):
        """执行系统监控"""
        try:
            metrics = self.monitor.collect_metrics()
            
            # 检查阈值告警
            alerts = self.monitor.check_thresholds(metrics)
            for alert in alerts:
                self.alerter.send_alert(
                    alert['title'],
                    alert['message'],
                    level=alert['level']
                )
            
            # 保存监控数据
            self.monitor.save_metrics(metrics)
            
        except Exception as e:
            self.logger.error(f"系统监控失败: {e}")
            
    def run_daily_report(self):
        """生成每日安全报告"""
        self.logger.info("生成每日安全报告...")
        
        try:
            report = self.reporter.generate_daily_report()
            report_path = self.reporter.save_report(report)
            
            self.logger.info(f"每日报告已保存: {report_path}")
            
            # 发送报告摘要
            self.alerter.send_alert(
                "每日安全报告",
                f"报告已生成: {report['summary']}",
                level="info"
            )
            
            self.last_report_time = datetime.now()
            
        except Exception as e:
            self.logger.error(f"生成报告失败: {e}")
            
    def _save_scan_results(self, results):
        """保存扫描结果"""
        results_dir = self.base_dir / 'logs' / 'scan-results'
        results_dir.mkdir(parents=True, exist_ok=True)
        
        filename = f"scan-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        filepath = results_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
            
    def _count_high_risk(self, results):
        """统计高危问题数量"""
        count = 0
        
        # 统计代码漏洞
        if 'vulnerabilities' in results.get('code_scan', {}):
            for vuln in results['code_scan']['vulnerabilities']:
                if vuln.get('severity') in ['high', 'critical']:
                    count += 1
                    
        # 统计依赖漏洞
        if 'vulnerabilities' in results.get('dependency_scan', {}):
            for vuln in results['dependency_scan']['vulnerabilities']:
                if vuln.get('severity') in ['high', 'critical']:
                    count += 1
                    
        return count
        
    def run_continuous(self):
        """持续运行模式"""
        self.logger.info("Security Guard Agent 启动 - 持续监控模式")
        self.running = True
        
        last_scan = 0
        last_report = 0
        last_monitor = 0
        
        while self.running:
            try:
                current_time = time.time()
                
                # 每小时扫描
                if current_time - last_scan >= self.config.get('scan_interval', 3600):
                    self.run_hourly_scan()
                    last_scan = current_time
                
                # 每分钟监控
                if current_time - last_monitor >= self.config.get('monitor_interval', 60):
                    self.run_system_monitor()
                    last_monitor = current_time
                
                # 每天报告
                if current_time - last_report >= self.config.get('report_interval', 86400):
                    self.run_daily_report()
                    last_report = current_time
                
                # 短暂休眠避免CPU占用过高
                time.sleep(5)
                
            except KeyboardInterrupt:
                self.logger.info("收到停止信号，正在关闭...")
                self.running = False
            except Exception as e:
                self.logger.error(f"主循环错误: {e}")
                time.sleep(60)
                
        self.logger.info("Security Guard Agent 已停止")
        
    def run_once(self, task=None):
        """单次运行模式"""
        if task == 'scan':
            self.run_hourly_scan()
        elif task == 'monitor':
            self.run_system_monitor()
        elif task == 'report':
            self.run_daily_report()
        else:
            # 运行所有任务
            self.run_hourly_scan()
            self.run_system_monitor()
            
    def stop(self):
        """停止运行"""
        self.running = False
        
    def get_status(self):
        """获取运行状态"""
        return {
            'running': self.running,
            'last_scan': self.last_scan_time.isoformat() if self.last_scan_time else None,
            'last_report': self.last_report_time.isoformat() if self.last_report_time else None,
            'config': self.config
        }

def main():
    parser = argparse.ArgumentParser(description='Security Guard Agent - 系统安全维护机器人')
    parser.add_argument('--config', '-c', help='配置文件路径')
    parser.add_argument('--mode', '-m', choices=['continuous', 'once'], default='continuous',
                       help='运行模式: continuous (持续监控) 或 once (单次运行)')
    parser.add_argument('--task', '-t', choices=['scan', 'monitor', 'report'],
                       help='单次运行时的任务类型')
    parser.add_argument('--status', action='store_true', help='显示当前状态')
    
    args = parser.parse_args()
    
    agent = SecurityGuardAgent(config_path=args.config)
    
    if args.status:
        status = agent.get_status()
        print(json.dumps(status, indent=2, ensure_ascii=False))
    elif args.mode == 'continuous':
        agent.run_continuous()
    else:
        agent.run_once(task=args.task)

if __name__ == '__main__':
    main()
