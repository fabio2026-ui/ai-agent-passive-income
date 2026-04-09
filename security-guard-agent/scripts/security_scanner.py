#!/usr/bin/env python3
"""
安全扫描模块
负责代码漏洞扫描、依赖包检查和API健康检查
"""

import os
import re
import json
import subprocess
import requests
import logging
from pathlib import Path
from datetime import datetime

class SecurityScanner:
    """安全扫描器"""
    
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger('SecurityScanner')
        self.scan_paths = config.get('scan_paths', ['/root/.openclaw/workspace'])
        
    def scan_code_vulnerabilities(self):
        """
        扫描代码安全漏洞
        使用正则表达式和规则匹配检测常见安全问题
        """
        vulnerabilities = []
        scanned_files = 0
        
        # 定义漏洞模式 - 优化以减少误报
        patterns = {
            'hardcoded_password': {
                'pattern': r'(?im)^(?!.*#)(?!.*//)(password|passwd|pwd)\s*=\s*["\'][^"\'\$]{8,}["\']',
                'severity': 'high',
                'description': '发现硬编码密码'
            },
            'hardcoded_secret': {
                'pattern': r'(?im)^(?!.*#)(?!.*//)(api_key|secret_key|secret|token|apikey|api_secret)\s*=\s*["\'][^"\'\$\{]{20,}["\']',
                'severity': 'high',
                'description': '发现硬编码密钥'
            },
            'sql_injection': {
                'pattern': r'(?i)(execute|cursor\.execute|query|raw|exec)\s*\(\s*["\'].*(%s|%d|\{.*\}).*["\'].*%(?!\s*\()',
                'severity': 'critical',
                'description': '可能存在SQL注入风险 - 字符串格式化用于SQL'
            },
            'eval_usage': {
                'pattern': r'(?i)(?<!\$)\beval\s*\(',
                'severity': 'high',
                'description': '使用eval()函数，存在代码注入风险'
            },
            'exec_usage': {
                'pattern': r'(?i)(?<!\$)\bexec\s*\(',
                'severity': 'high',
                'description': '使用exec()函数，存在代码注入风险'
            },
            'os_system': {
                'pattern': r'(?i)(?<!\'|"|\w)os\.system\s*\(',
                'severity': 'high',
                'description': '使用os.system()执行系统命令，存在命令注入风险'
            },
            'subprocess_shell': {
                'pattern': r'(?i)(?<!#.*)(?<!//.*)subprocess\.(run|call|Popen|check_output)\s*\([^)]*shell\s*=\s*True',
                'severity': 'high',
                'description': 'subprocess使用shell=True，存在命令注入风险'
            },
            'pickle_load': {
                'pattern': r'(?i)pickle\.load\s*\(',
                'severity': 'medium',
                'description': '使用pickle加载不可信数据存在安全风险'
            },
            'yaml_load': {
                'pattern': r'(?i)(?<!#.*)(?<!//.*)yaml\.load\s*\([^)]*\)(?!.*Loader=yaml\.(SafeLoader|FullLoader))',
                'severity': 'medium',
                'description': 'yaml.load未指定Loader，存在安全风险'
            },
            'debug_mode': {
                'pattern': r'(?i)(?<!#.*)(?<!//.*)debug\s*=\s*True',
                'severity': 'low',
                'description': '调试模式开启，可能泄露敏感信息'
            },
            'disabled_verification': {
                'pattern': r'(?i)(?<!#.*)(?<!//.*)(verify|verify_ssl)\s*=\s*False',
                'severity': 'high',
                'description': '禁用SSL证书验证'
            },
            'weak_hash': {
                'pattern': r'(?i)hashlib\.(md5|sha1)\s*\(',
                'severity': 'medium',
                'description': '使用弱哈希算法(MD5/SHA1)'
            },
            'temp_file_race': {
                'pattern': r'(?i)os\.mktemp\s*\(',
                'severity': 'medium',
                'description': '使用不安全的临时文件创建方式'
            },
            'dangerous_deserialization': {
                'pattern': r'(?i)(marshal\.loads|jsonpickle\.decode|\.loads\(.*unpickle)',
                'severity': 'high',
                'description': '不安全的反序列化操作'
            }
        }
        
        # 扫描文件扩展名
        extensions = {'.py', '.js', '.ts', '.json', '.yaml', '.yml', '.sh'}
        
        for scan_path in self.scan_paths:
            path = Path(scan_path)
            if not path.exists():
                continue
                
            for ext in extensions:
                for file_path in path.rglob(f'*{ext}'):
                    if self._should_skip(file_path):
                        continue
                        
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            lines = content.split('\n')
                            
                        scanned_files += 1
                        
                        for vuln_type, rule in patterns.items():
                            matches = re.finditer(rule['pattern'], content, re.IGNORECASE)
                            for match in matches:
                                line_num = content[:match.start()].count('\n') + 1
                                line_content = lines[line_num - 1].strip() if line_num <= len(lines) else ''
                                
                                vulnerabilities.append({
                                    'type': vuln_type,
                                    'file': str(file_path),
                                    'line': line_num,
                                    'severity': rule['severity'],
                                    'description': rule['description'],
                                    'code_snippet': line_content[:100]
                                })
                                
                    except Exception as e:
                        self.logger.warning(f"无法扫描文件 {file_path}: {e}")
        
        self.logger.info(f"扫描了 {scanned_files} 个文件，发现 {len(vulnerabilities)} 个漏洞")
        
        return {
            'scanned_files': scanned_files,
            'vulnerabilities': vulnerabilities,
            'vulnerability_count': len(vulnerabilities)
        }
        
    def scan_dependencies(self):
        """
        扫描依赖包安全漏洞
        检查npm和pip依赖的已知漏洞
        """
        vulnerabilities = []
        
        # 扫描 Python 依赖
        pip_vulns = self._scan_pip_dependencies()
        vulnerabilities.extend(pip_vulns)
        
        # 扫描 Node.js 依赖
        npm_vulns = self._scan_npm_dependencies()
        vulnerabilities.extend(npm_vulns)
        
        return {
            'vulnerabilities': vulnerabilities,
            'vulnerability_count': len(vulnerabilities),
            'pip_checked': len(pip_vulns),
            'npm_checked': len(npm_vulns)
        }
        
    def _scan_pip_dependencies(self):
        """扫描Python pip依赖"""
        vulns = []
        
        try:
            # 检查pip-audit是否安装
            result = subprocess.run(
                ['pip-audit', '--format=json', '--desc=on'],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0 and result.stdout:
                try:
                    audit_data = json.loads(result.stdout)
                    for vuln in audit_data.get('vulnerabilities', []):
                        vulns.append({
                            'package': vuln.get('name'),
                            'version': vuln.get('version'),
                            'vuln_id': vuln.get('vuln_id'),
                            'severity': vuln.get('severity', 'unknown'),
                            'description': vuln.get('description', ''),
                            'fix_versions': vuln.get('fix_versions', []),
                            'type': 'pip'
                        })
                except json.JSONDecodeError:
                    pass
                    
        except FileNotFoundError:
            self.logger.warning("pip-audit未安装，跳过Python依赖扫描")
            # 尝试使用pip list和safety
            try:
                result = subprocess.run(
                    ['pip', 'list', '--format=json'],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode == 0:
                    packages = json.loads(result.stdout)
                    self.logger.info(f"发现 {len(packages)} 个Python包")
            except Exception as e:
                self.logger.warning(f"pip扫描失败: {e}")
                
        except subprocess.TimeoutExpired:
            self.logger.warning("pip-audit扫描超时")
        except Exception as e:
            self.logger.error(f"Python依赖扫描错误: {e}")
            
        return vulns
        
    def _scan_npm_dependencies(self):
        """扫描Node.js npm依赖"""
        vulns = []
        
        for scan_path in self.scan_paths:
            path = Path(scan_path)
            for package_json in path.rglob('package.json'):
                project_dir = package_json.parent
                
                try:
                    # 检查是否有node_modules
                    if not (project_dir / 'node_modules').exists():
                        continue
                    
                    # 使用npm audit
                    result = subprocess.run(
                        ['npm', 'audit', '--json'],
                        cwd=project_dir,
                        capture_output=True,
                        text=True,
                        timeout=120
                    )
                    
                    if result.stdout:
                        audit_data = json.loads(result.stdout)
                        advisories = audit_data.get('advisories', {})
                        
                        for adv_id, advisory in advisories.items():
                            vulns.append({
                                'package': advisory.get('module_name'),
                                'severity': advisory.get('severity'),
                                'title': advisory.get('title'),
                                'overview': advisory.get('overview', '')[:200],
                                'recommendation': advisory.get('recommendation', ''),
                                'findings': len(advisory.get('findings', [])),
                                'type': 'npm',
                                'project': str(project_dir)
                            })
                            
                except subprocess.TimeoutExpired:
                    self.logger.warning(f"npm audit超时: {project_dir}")
                except Exception as e:
                    self.logger.warning(f"npm扫描失败 {project_dir}: {e}")
                    
        return vulns
        
    def check_api_health(self):
        """
        检查API健康状态
        检查配置中定义的API端点
        """
        results = {
            'checked_endpoints': 0,
            'healthy': 0,
            'unhealthy': 0,
            'details': []
        }
        
        # 内置健康检查端点
        endpoints = self.config.get('api_endpoints', [])
        
        # 添加默认检查点
        default_endpoints = [
            {'url': 'http://localhost:8080/health', 'name': '本地服务'},
            {'url': 'http://localhost:3000/api/health', 'name': 'API服务'}
        ]
        
        all_endpoints = default_endpoints + endpoints
        
        for endpoint in all_endpoints:
            url = endpoint.get('url')
            name = endpoint.get('name', url)
            
            try:
                response = requests.get(
                    url,
                    timeout=endpoint.get('timeout', 10),
                    verify=endpoint.get('verify_ssl', True)
                )
                
                healthy = response.status_code < 400
                
                check_result = {
                    'name': name,
                    'url': url,
                    'status': 'healthy' if healthy else 'unhealthy',
                    'status_code': response.status_code,
                    'response_time': response.elapsed.total_seconds()
                }
                
                results['details'].append(check_result)
                results['checked_endpoints'] += 1
                
                if healthy:
                    results['healthy'] += 1
                else:
                    results['unhealthy'] += 1
                    
            except requests.exceptions.Timeout:
                results['details'].append({
                    'name': name,
                    'url': url,
                    'status': 'timeout',
                    'error': '请求超时'
                })
                results['unhealthy'] += 1
                results['checked_endpoints'] += 1
                
            except Exception as e:
                results['details'].append({
                    'name': name,
                    'url': url,
                    'status': 'error',
                    'error': str(e)
                })
                results['unhealthy'] += 1
                results['checked_endpoints'] += 1
                
        return results
        
    def _should_skip(self, file_path):
        """检查是否应该跳过该文件"""
        skip_patterns = [
            r'node_modules',
            r'\.git',
            r'__pycache__',
            r'\.venv',
            r'venv',
            r'\.env',
            r'dist',
            r'build',
            r'\.next',
            r'\.nuxt',
            r'out',
            r'coverage',
            r'\.pytest_cache',
            r'\.mypy_cache',
            r'\.tox',
            r'static/chunks',
            r'server/chunks',
            r'security-guard-agent/logs',
            r'scan-results',
            r'\.json$',  # Skip JSON files (logs, configs)
            r'DEPRECATED'  # Skip deprecated code
        ]
        
        path_str = str(file_path)
        for pattern in skip_patterns:
            if re.search(pattern, path_str):
                return True
        return False
