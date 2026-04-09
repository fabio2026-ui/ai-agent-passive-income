#!/usr/bin/env python3
"""
报告生成模块
负责生成每日安全报告和数据分析
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

class ReportGenerator:
    """报告生成器"""
    
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger('ReportGenerator')
        self.base_dir = Path(__file__).parent.parent
        
    def generate_daily_report(self):
        """生成每日安全报告"""
        today = datetime.now()
        
        report = {
            'date': today.strftime('%Y-%m-%d'),
            'generated_at': today.isoformat(),
            'summary': '',
            'scan_stats': self._analyze_scan_data(),
            'fix_stats': self._analyze_fix_data(),
            'system_stats': self._analyze_system_data(),
            'alert_stats': self._analyze_alert_data(),
            'risk_predictions': self._predict_risks()
        }
        
        # 生成摘要
        report['summary'] = self._generate_summary(report)
        
        return report
        
    def _analyze_scan_data(self):
        """分析扫描数据"""
        scan_dir = self.base_dir / 'logs' / 'scan-results'
        
        today_str = datetime.now().strftime('%Y%m%d')
        scanned_files = 0
        total_vulns = 0
        high_risk_count = 0
        
        if scan_dir.exists():
            for scan_file in scan_dir.glob(f'scan-{today_str}*.json'):
                try:
                    with open(scan_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                    scanned_files += data.get('scanned_files', 0)
                    
                    # 统计漏洞
                    code_vulns = data.get('code_scan', {}).get('vulnerabilities', [])
                    dep_vulns = data.get('dependency_scan', {}).get('vulnerabilities', [])
                    
                    total_vulns += len(code_vulns) + len(dep_vulns)
                    
                    for vuln in code_vulns + dep_vulns:
                        if vuln.get('severity') in ['high', 'critical']:
                            high_risk_count += 1
                            
                except Exception as e:
                    self.logger.warning(f"读取扫描文件失败 {scan_file}: {e}")
                    
        return {
            'scanned_files': scanned_files,
            'total_vulnerabilities': total_vulns,
            'high_risk_count': high_risk_count
        }
        
    def _analyze_fix_data(self):
        """分析修复数据"""
        fix_log = self.base_dir / 'logs' / 'fix-history.json'
        
        today_str = datetime.now().strftime('%Y-%m-%d')
        total_fixes = 0
        successful = 0
        failed = 0
        fix_types = defaultdict(int)
        
        if fix_log.exists():
            try:
                with open(fix_log, 'r', encoding='utf-8') as f:
                    fixes = json.load(f)
                    
                for fix in fixes:
                    fix_time = fix.get('timestamp', '')
                    if today_str in fix_time:
                        total_fixes += 1
                        fix_types[fix.get('type', 'unknown')] += 1
                        
                        if fix.get('status') == 'success':
                            successful += 1
                        else:
                            failed += 1
                            
            except Exception as e:
                self.logger.warning(f"读取修复历史失败: {e}")
                
        return {
            'total_fixes': total_fixes,
            'successful': successful,
            'failed': failed,
            'by_type': dict(fix_types)
        }
        
    def _analyze_system_data(self):
        """分析系统数据"""
        metrics_dir = self.base_dir / 'logs' / 'metrics'
        
        today_str = datetime.now().strftime('%Y%m%d')
        cpu_values = []
        memory_values = []
        disk_values = []
        
        if metrics_dir.exists():
            for metrics_file in metrics_dir.glob(f'metrics-{today_str}*.jsonl'):
                try:
                    with open(metrics_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.strip():
                                data = json.loads(line)
                                cpu_values.append(data.get('cpu', {}).get('percent', 0))
                                memory_values.append(data.get('memory', {}).get('percent', 0))
                                
                                # 磁盘使用率取最高值
                                for disk in data.get('disk', {}).get('partitions', []):
                                    disk_values.append(disk.get('percent', 0))
                                    
                except Exception as e:
                    self.logger.warning(f"读取监控数据失败 {metrics_file}: {e}")
                    
        return {
            'avg_cpu': round(sum(cpu_values) / len(cpu_values), 2) if cpu_values else 0,
            'max_cpu': max(cpu_values) if cpu_values else 0,
            'avg_memory': round(sum(memory_values) / len(memory_values), 2) if memory_values else 0,
            'max_memory': max(memory_values) if memory_values else 0,
            'max_disk': max(disk_values) if disk_values else 0,
            'data_points': len(cpu_values)
        }
        
    def _analyze_alert_data(self):
        """分析告警数据"""
        alerts_dir = self.base_dir / 'logs' / 'alerts'
        
        today_str = datetime.now().strftime('%Y%m%d')
        alerts_by_level = defaultdict(int)
        total = 0
        
        if alerts_dir.exists():
            for alert_file in alerts_dir.glob(f'alerts-{today_str}.jsonl'):
                try:
                    with open(alert_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.strip():
                                data = json.loads(line)
                                level = data.get('level', 'info')
                                alerts_by_level[level] += 1
                                total += 1
                                
                except Exception as e:
                    self.logger.warning(f"读取告警数据失败 {alert_file}: {e}")
                    
        return {
            'total': total,
            'by_level': dict(alerts_by_level)
        }
        
    def _predict_risks(self):
        """预测潜在风险"""
        risks = []
        
        # 基于扫描数据预测
        scan_stats = self._analyze_scan_data()
        if scan_stats['high_risk_count'] > 5:
            risks.append({
                'level': 'high',
                'description': f'发现 {scan_stats["high_risk_count"]} 个高危漏洞，建议立即修复',
                'category': 'security'
            })
            
        # 基于系统数据预测
        system_stats = self._analyze_system_data()
        if system_stats['avg_cpu'] > 70:
            risks.append({
                'level': 'medium',
                'description': f'CPU平均使用率 {system_stats["avg_cpu"]}%，可能存在性能瓶颈',
                'category': 'performance'
            })
            
        if system_stats['max_memory'] > 90:
            risks.append({
                'level': 'high',
                'description': f'内存峰值使用率 {system_stats["max_memory"]}%，存在OOM风险',
                'category': 'performance'
            })
            
        if system_stats['max_disk'] > 85:
            risks.append({
                'level': 'medium',
                'description': f'磁盘最大使用率 {system_stats["max_disk"]}%，建议清理空间',
                'category': 'storage'
            })
            
        # 基于历史趋势预测
        trend_risks = self._analyze_trends()
        risks.extend(trend_risks)
        
        return sorted(risks, key=lambda x: {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}.get(x['level'], 4))
        
    def _analyze_trends(self):
        """分析趋势"""
        risks = []
        
        # 检查过去7天的数据
        metrics_dir = self.base_dir / 'logs' / 'metrics'
        
        if metrics_dir.exists():
            # 简单趋势分析：检查今天的平均值是否比昨天高
            today_cpu = []
            yesterday_cpu = []
            
            today_str = datetime.now().strftime('%Y%m%d')
            yesterday_str = (datetime.now() - timedelta(days=1)).strftime('%Y%m%d')
            
            for metrics_file in metrics_dir.glob('*.jsonl'):
                try:
                    with open(metrics_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.strip():
                                data = json.loads(line)
                                timestamp = data.get('timestamp', '')
                                cpu = data.get('cpu', {}).get('percent', 0)
                                
                                if today_str in timestamp:
                                    today_cpu.append(cpu)
                                elif yesterday_str in timestamp:
                                    yesterday_cpu.append(cpu)
                                    
                except Exception:
                    continue
                    
            if today_cpu and yesterday_cpu:
                today_avg = sum(today_cpu) / len(today_cpu)
                yesterday_avg = sum(yesterday_cpu) / len(yesterday_cpu)
                
                if today_avg > yesterday_avg * 1.2:  # 比昨天高20%
                    risks.append({
                        'level': 'medium',
                        'description': f'CPU使用率较昨日上升 {(today_avg/yesterday_avg-1)*100:.1f}%，请关注',
                        'category': 'trend'
                    })
                    
        return risks
        
    def _generate_summary(self, report):
        """生成报告摘要"""
        parts = []
        
        # 安全状态
        scan_stats = report['scan_stats']
        if scan_stats['high_risk_count'] == 0:
            parts.append("✅ 安全状态良好")
        elif scan_stats['high_risk_count'] < 3:
            parts.append(f"⚠️ 发现 {scan_stats['high_risk_count']} 个高危问题")
        else:
            parts.append(f"🚨 发现 {scan_stats['high_risk_count']} 个高危问题，需要立即处理")
            
        # 修复状态
        fix_stats = report['fix_stats']
        if fix_stats['total_fixes'] > 0:
            parts.append(f"🔧 自动修复了 {fix_stats['successful']}/{fix_stats['total_fixes']} 个问题")
            
        # 系统状态
        system_stats = report['system_stats']
        if system_stats['max_cpu'] < 80 and system_stats['max_memory'] < 85:
            parts.append("💻 系统运行正常")
        else:
            parts.append("💻 系统负载较高")
            
        return " | ".join(parts)
        
    def save_report(self, report):
        """保存报告"""
        try:
            reports_dir = self.base_dir / 'reports'
            reports_dir.mkdir(exist_ok=True)
            
            date_str = report['date']
            report_file = reports_dir / f'security-report-{date_str}.json'
            
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
                
            # 同时生成HTML报告
            html_file = reports_dir / f'security-report-{date_str}.html'
            self._generate_html_report(report, html_file)
            
            self.logger.info(f"报告已保存: {report_file}")
            return str(report_file)
            
        except Exception as e:
            self.logger.error(f"保存报告失败: {e}")
            return None
            
    def _generate_html_report(self, report, output_path):
        """生成HTML格式的报告"""
        html = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>安全报告 - {report['date']}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{ margin-bottom: 10px; }}
        .header .date {{ opacity: 0.9; }}
        .content {{ padding: 30px; }}
        .summary {{
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }}
        .stat-card h3 {{
            color: #495057;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }}
        .stat-value {{
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
        }}
        .section {{
            margin-bottom: 30px;
        }}
        .section h2 {{
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }}
        th, td {{
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
        }}
        th {{
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }}
        .badge {{
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }}
        .badge-critical {{ background: #fee2e2; color: #dc2626; }}
        .badge-high {{ background: #fef3c7; color: #d97706; }}
        .badge-medium {{ background: #dbeafe; color: #2563eb; }}
        .badge-low {{ background: #d1fae5; color: #059669; }}
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Security Guard 每日安全报告</h1>
            <div class="date">{report['date']}</div>
        </div>
        
        <div class="content">
            <div class="summary">
                <strong>📊 摘要:</strong> {report['summary']}
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>🔒 扫描文件数</h3>
                    <div class="stat-value">{report['scan_stats']['scanned_files']}</div>
                </div>
                <div class="stat-card">
                    <h3>🐛 发现漏洞</h3>
                    <div class="stat-value">{report['scan_stats']['total_vulnerabilities']}</div>
                </div>
                <div class="stat-card">
                    <h3>🔧 自动修复</h3>
                    <div class="stat-value">{report['fix_stats']['successful']}</div>
                </div>
                <div class="stat-card">
                    <h3>⚠️ 告警次数</h3>
                    <div class="stat-value">{report['alert_stats']['total']}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>💻 系统性能</h2>
                <table>
                    <tr><th>指标</th><th>平均值</th><th>峰值</th></tr>
                    <tr><td>CPU使用率</td><td>{report['system_stats']['avg_cpu']}%</td><td>{report['system_stats']['max_cpu']}%</td></tr>
                    <tr><td>内存使用率</td><td>{report['system_stats']['avg_memory']}%</td><td>{report['system_stats']['max_memory']}%</td></tr>
                    <tr><td>磁盘使用率</td><td>-</td><td>{report['system_stats']['max_disk']}%</td></tr>
                </table>
            </div>
            
            <div class="section">
                <h2>⚠️ 风险预测</h2>
                <table>
                    <tr><th>等级</th><th>类别</th><th>描述</th></tr>
"""
        
        for risk in report['risk_predictions']:
            level_class = f"badge-{risk['level']}"
            html += f"""
                    <tr>
                        <td><span class="badge {level_class}">{risk['level'].upper()}</span></td>
                        <td>{risk['category']}</td>
                        <td>{risk['description']}</td>
                    </tr>
"""
        
        html += f"""
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by Security Guard Agent 🤖 at {report['generated_at']}</p>
        </div>
    </div>
</body>
</html>
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
