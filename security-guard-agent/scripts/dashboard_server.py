#!/usr/bin/env python3
"""
Web监控面板 - 实时状态HTTP服务器
提供Web界面查看安全监控状态
"""

import os
import json
import glob
from pathlib import Path
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# 获取项目路径
BASE_DIR = Path(__file__).parent.parent

def get_latest_report():
    """获取最新报告"""
    reports_dir = BASE_DIR / 'reports'
    if not reports_dir.exists():
        return None
        
    report_files = sorted(reports_dir.glob('security-report-*.json'), reverse=True)
    if not report_files:
        return None
        
    try:
        with open(report_files[0], 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None

def get_system_status():
    """获取当前系统状态"""
    try:
        import psutil
        
        return {
            'cpu_percent': psutil.cpu_percent(interval=0.5),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': [
                {
                    'mount': p.mountpoint,
                    'percent': psutil.disk_usage(p.mountpoint).percent
                }
                for p in psutil.disk_partitions()[:3]
            ],
            'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat(),
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {'error': str(e)}

def get_recent_scans(limit=5):
    """获取最近的扫描结果"""
    scan_dir = BASE_DIR / 'logs' / 'scan-results'
    if not scan_dir.exists():
        return []
        
    scan_files = sorted(scan_dir.glob('scan-*.json'), reverse=True)[:limit]
    
    scans = []
    for f in scan_files:
        try:
            with open(f, 'r', encoding='utf-8') as file:
                data = json.load(file)
                scans.append({
                    'timestamp': data.get('timestamp', ''),
                    'vuln_count': len(data.get('code_scan', {}).get('vulnerabilities', [])) + 
                                  len(data.get('dependency_scan', {}).get('vulnerabilities', [])),
                    'files_scanned': data.get('code_scan', {}).get('scanned_files', 0)
                })
        except Exception:
            continue
            
    return scans

def get_recent_alerts(limit=10):
    """获取最近的告警"""
    alerts_dir = BASE_DIR / 'logs' / 'alerts'
    if not alerts_dir.exists():
        return []
        
    alert_files = sorted(alerts_dir.glob('alerts-*.jsonl'), reverse=True)[:1]
    
    alerts = []
    for f in alert_files:
        try:
            with open(f, 'r', encoding='utf-8') as file:
                for line in file:
                    if line.strip():
                        data = json.loads(line)
                        alerts.append(data)
                        if len(alerts) >= limit:
                            break
        except Exception:
            continue
            
    return alerts[:limit]

class DashboardHandler(BaseHTTPRequestHandler):
    """HTTP请求处理器"""
    
    def log_message(self, format, *args):
        # 简化日志输出
        pass
    
    def do_GET(self):
        path = self.path
        
        if path == '/' or path == '/index.html':
            self._serve_dashboard()
        elif path == '/api/status':
            self._serve_json(get_system_status())
        elif path == '/api/report':
            self._serve_json(get_latest_report() or {})
        elif path == '/api/scans':
            self._serve_json(get_recent_scans())
        elif path == '/api/alerts':
            self._serve_json(get_recent_alerts())
        else:
            # 尝试从reports目录服务文件
            self._serve_file(path)
            
    def _serve_dashboard(self):
        """服务主面板"""
        html = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Guard - 监控面板</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header .status { opacity: 0.9; }
        .container { max-width: 1400px; margin: 0 auto; padding: 30px; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: #1e293b;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            border: 1px solid #334155;
        }
        .card h3 {
            color: #94a3b8;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        .metric {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        .metric.warning { color: #f59e0b; }
        .metric.danger { color: #ef4444; }
        .metric.success { color: #10b981; }
        .progress-bar {
            height: 8px;
            background: #334155;
            border-radius: 4px;
            margin-top: 12px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .progress-fill.normal { background: #10b981; }
        .progress-fill.warning { background: #f59e0b; }
        .progress-fill.danger { background: #ef4444; }
        
        .section {
            background: #1e293b;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid #334155;
        }
        .section h2 {
            color: #f8fafc;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #334155;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #334155;
        }
        th {
            color: #94a3b8;
            font-weight: 500;
        }
        
        .badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        
        .alert-item {
            padding: 12px;
            border-left: 3px solid;
            margin-bottom: 8px;
            background: #0f172a;
            border-radius: 0 8px 8px 0;
        }
        .alert-item.info { border-color: #3b82f6; }
        .alert-item.warning { border-color: #f59e0b; }
        .alert-item.error { border-color: #ef4444; }
        .alert-item.critical { border-color: #dc2626; }
        
        .refresh-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #667eea;
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }
        .refresh-btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            color: #64748b;
            border-top: 1px solid #334155;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .live-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ Security Guard</h1>
        <div class="status"><span class="live-indicator"></span>实时监控面板</div>
    </div>
    
    <div class="container">
        <div class="grid" id="metrics-grid">
            <div class="card">
                <h3>💻 CPU 使用率</h3>
                <div class="metric" id="cpu-metric">--%</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="cpu-progress" style="width: 0%"></div>
                </div>
            </div>
            
            <div class="card">
                <h3>📝 内存使用率</h3>
                <div class="metric" id="memory-metric">--%</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="memory-progress" style="width: 0%"></div>
                </div>
            </div>
            
            <div class="card">
                <h3>🔒 今日漏洞</h3>
                <div class="metric" id="vuln-metric">--</div>
                <div style="margin-top: 12px; color: #94a3b8; font-size: 14px;">
                    已扫描文件: <span id="scanned-files">--</span>
                </div>
            </div>
            
            <div class="card">
                <h3>🔧 自动修复</h3>
                <div class="metric success" id="fix-metric">--</div>
                <div style="margin-top: 12px; color: #94a3b8; font-size: 14px;">
                    今日修复操作
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>⚠️ 最近告警</h2>
            <div id="alerts-container">
                <p style="color: #64748b;">加载中...</p>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 最近扫描</h2>
            <div id="scans-container">
                <p style="color: #64748b;">加载中...</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Security Guard Agent 🤖 | 最后更新: <span id="last-update">--</span></p>
        </div>
    </div>
    
    <button class="refresh-btn" onclick="refreshData()">🔄 刷新</button>
    
    <script>
        let autoRefresh = true;
        
        function getProgressClass(value) {
            if (value < 60) return 'normal';
            if (value < 80) return 'warning';
            return 'danger';
        }
        
        function getMetricClass(value) {
            if (value < 60) return '';
            if (value < 80) return 'warning';
            return 'danger';
        }
        
        async function fetchStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                
                if (data.error) return;
                
                // 更新CPU
                const cpuValue = data.cpu_percent || 0;
                document.getElementById('cpu-metric').textContent = cpuValue + '%';
                document.getElementById('cpu-metric').className = 'metric ' + getMetricClass(cpuValue);
                document.getElementById('cpu-progress').style.width = cpuValue + '%';
                document.getElementById('cpu-progress').className = 'progress-fill ' + getProgressClass(cpuValue);
                
                // 更新内存
                const memValue = data.memory_percent || 0;
                document.getElementById('memory-metric').textContent = memValue + '%';
                document.getElementById('memory-metric').className = 'metric ' + getMetricClass(memValue);
                document.getElementById('memory-progress').style.width = memValue + '%';
                document.getElementById('memory-progress').className = 'progress-fill ' + getProgressClass(memValue);
                
            } catch (e) {
                console.error('获取状态失败:', e);
            }
        }
        
        async function fetchReport() {
            try {
                const response = await fetch('/api/report');
                const data = await response.json();
                
                if (data.scan_stats) {
                    document.getElementById('vuln-metric').textContent = data.scan_stats.total_vulnerabilities || 0;
                    document.getElementById('scanned-files').textContent = data.scan_stats.scanned_files || 0;
                }
                
                if (data.fix_stats) {
                    document.getElementById('fix-metric').textContent = data.fix_stats.successful || 0;
                }
                
            } catch (e) {
                console.error('获取报告失败:', e);
            }
        }
        
        async function fetchAlerts() {
            try {
                const response = await fetch('/api/alerts');
                const alerts = await response.json();
                
                const container = document.getElementById('alerts-container');
                
                if (alerts.length === 0) {
                    container.innerHTML = '<p style="color: #64748b;">暂无告警 🎉</p>';
                    return;
                }
                
                container.innerHTML = alerts.map(alert => `
                    <div class="alert-item ${alert.level}">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <strong>${alert.title}</strong>
                            <span style="color: #64748b; font-size: 12px;">${new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        <div>${alert.message}</div>
                    </div>
                `).join('');
                
            } catch (e) {
                console.error('获取告警失败:', e);
            }
        }
        
        async function fetchScans() {
            try {
                const response = await fetch('/api/scans');
                const scans = await response.json();
                
                const container = document.getElementById('scans-container');
                
                if (scans.length === 0) {
                    container.innerHTML = '<p style="color: #64748b;">暂无扫描记录</p>';
                    return;
                }
                
                container.innerHTML = `
                    <table>
                        <tr>
                            <th>时间</th>
                            <th>扫描文件</th>
                            <th>发现漏洞</th>
                            <th>状态</th>
                        </tr>
                        ${scans.map(scan => `
                            <tr>
                                <td>${new Date(scan.timestamp).toLocaleString()}</td>
                                <td>${scan.files_scanned}</td>
                                <td>
                                    <span class="badge ${scan.vuln_count > 0 ? 'badge-warning' : 'badge-success'}">
                                        ${scan.vuln_count}
                                    </span>
                                </td>
                                <td>${scan.vuln_count > 0 ? '⚠️ 需关注' : '✅ 正常'}</td>
                            </tr>
                        `).join('')}
                    </table>
                `;
                
            } catch (e) {
                console.error('获取扫描记录失败:', e);
            }
        }
        
        async function refreshData() {
            await Promise.all([
                fetchStatus(),
                fetchReport(),
                fetchAlerts(),
                fetchScans()
            ]);
            
            document.getElementById('last-update').textContent = new Date().toLocaleString();
        }
        
        // 初始加载
        refreshData();
        
        // 自动刷新 (每30秒)
        setInterval(() => {
            if (autoRefresh) {
                refreshData();
            }
        }, 30000);
    </script>
</body>
</html>
'''
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))
        
    def _serve_json(self, data):
        """服务JSON数据"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
        
    def _serve_file(self, path):
        """服务文件"""
        safe_path = path.lstrip('/')
        file_path = BASE_DIR / 'reports' / safe_path
        
        # 安全检查
        try:
            file_path.resolve().relative_to(BASE_DIR / 'reports')
        except ValueError:
            self.send_error(403, "Forbidden")
            return
            
        if file_path.exists() and file_path.is_file():
            content_type = 'text/html' if file_path.suffix == '.html' else 'application/json'
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.end_headers()
            
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_error(404, "Not Found")

def run_server(port=9999):
    """运行HTTP服务器"""
    server = HTTPServer(('0.0.0.0', port), DashboardHandler)
    print(f"🌐 Security Guard 监控面板已启动")
    print(f"📊 访问地址: http://localhost:{port}")
    print(f"🛑 按 Ctrl+C 停止服务")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹️  服务器已停止")
        server.shutdown()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9999
    run_server(port)
