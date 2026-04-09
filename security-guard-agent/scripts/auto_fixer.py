#!/usr/bin/env python3
"""
自动修复模块
负责自动修复发现的安全问题
"""

import os
import re
import json
import subprocess
import logging
import shutil
from pathlib import Path
from datetime import datetime

class AutoFixer:
    """自动修复器"""
    
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger('AutoFixer')
        self.fix_history = []
        
    def apply_fixes(self, scan_results):
        """
        根据扫描结果应用自动修复
        返回已应用的修复列表
        """
        fixes_applied = []
        
        # 1. 修复依赖漏洞
        dep_fixes = self._fix_dependencies(scan_results.get('dependency_scan', {}))
        fixes_applied.extend(dep_fixes)
        
        # 2. 修复代码问题
        code_fixes = self._fix_code_issues(scan_results.get('code_scan', {}))
        fixes_applied.extend(code_fixes)
        
        # 3. 修复服务问题
        service_fixes = self._fix_service_issues(scan_results.get('api_health', {}))
        fixes_applied.extend(service_fixes)
        
        # 记录修复历史
        self._record_fixes(fixes_applied)
        
        if fixes_applied:
            self.logger.info(f"成功应用了 {len(fixes_applied)} 个自动修复")
        
        return fixes_applied
        
    def _fix_dependencies(self, dep_scan):
        """修复依赖漏洞"""
        fixes = []
        
        for vuln in dep_scan.get('vulnerabilities', []):
            vuln_type = vuln.get('type')
            
            if vuln_type == 'pip':
                fix = self._fix_pip_dependency(vuln)
                if fix:
                    fixes.append(fix)
                    
            elif vuln_type == 'npm':
                fix = self._fix_npm_dependency(vuln)
                if fix:
                    fixes.append(fix)
        
        return fixes
        
    def _fix_pip_dependency(self, vuln):
        """修复Python依赖漏洞"""
        package = vuln.get('package')
        fix_versions = vuln.get('fix_versions', [])
        
        if not package or not fix_versions:
            return None
            
        try:
            # 尝试升级到修复版本
            fix_version = fix_versions[0]
            self.logger.info(f"尝试升级 {package} 到 {fix_version}")
            
            result = subprocess.run(
                ['pip', 'install', '--upgrade', f'{package}>={fix_version}'],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return {
                    'type': 'dependency_upgrade',
                    'package': package,
                    'version': fix_version,
                    'timestamp': datetime.now().isoformat(),
                    'status': 'success',
                    'details': f'已将 {package} 升级到 {fix_version}'
                }
            else:
                self.logger.warning(f"升级 {package} 失败: {result.stderr}")
                return {
                    'type': 'dependency_upgrade',
                    'package': package,
                    'version': fix_version,
                    'timestamp': datetime.now().isoformat(),
                    'status': 'failed',
                    'details': result.stderr
                }
                
        except Exception as e:
            self.logger.error(f"修复pip依赖 {package} 失败: {e}")
            return None
            
    def _fix_npm_dependency(self, vuln):
        """修复npm依赖漏洞"""
        project = vuln.get('project')
        package = vuln.get('package')
        
        if not project or not package:
            return None
            
        try:
            self.logger.info(f"尝试修复 {project} 中的 {package}")
            
            # 使用npm audit fix
            result = subprocess.run(
                ['npm', 'audit', 'fix', '--force'],
                cwd=project,
                capture_output=True,
                text=True,
                timeout=180
            )
            
            return {
                'type': 'npm_audit_fix',
                'project': project,
                'package': package,
                'timestamp': datetime.now().isoformat(),
                'status': 'success' if result.returncode == 0 else 'partial',
                'details': result.stdout[-500:] if len(result.stdout) > 500 else result.stdout
            }
            
        except Exception as e:
            self.logger.error(f"修复npm依赖失败: {e}")
            return None
            
    def _fix_code_issues(self, code_scan):
        """修复代码安全问题"""
        fixes = []
        
        for vuln in code_scan.get('vulnerabilities', []):
            vuln_type = vuln.get('type')
            file_path = vuln.get('file')
            line_num = vuln.get('line')
            
            if not file_path or not os.path.exists(file_path):
                continue
                
            # 根据漏洞类型应用修复
            if vuln_type == 'yaml_load':
                fix = self._fix_yaml_load(file_path, line_num)
                if fix:
                    fixes.append(fix)
                    
            elif vuln_type == 'debug_mode':
                fix = self._fix_debug_mode(file_path, line_num)
                if fix:
                    fixes.append(fix)
                    
            elif vuln_type == 'disabled_verification':
                fix = self._fix_ssl_verification(file_path, line_num)
                if fix:
                    fixes.append(fix)
        
        return fixes
        
    def _fix_yaml_load(self, file_path, line_num):
        """修复yaml.load安全问题"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            if line_num <= 0 or line_num > len(lines):
                return None
                
            original_line = lines[line_num - 1]
            
            # 替换不安全的yaml.load
            if 'yaml.load' in original_line and 'Loader' not in original_line:
                fixed_line = original_line.replace(
                    'yaml.safe_load(',
                    'yaml.safe_load('
                )
                lines[line_num - 1] = fixed_line
                
                # 写回文件
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                    
                return {
                    'type': 'code_fix',
                    'file': file_path,
                    'line': line_num,
                    'issue': 'yaml_load',
                    'timestamp': datetime.now().isoformat(),
                    'status': 'success',
                    'details': f'将yaml.load替换为yaml.safe_load'
                }
                
        except Exception as e:
            self.logger.error(f"修复yaml_load失败: {e}")
            return None
            
    def _fix_debug_mode(self, file_path, line_num):
        """修复调试模式"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            if line_num <= 0 or line_num > len(lines):
                return None
                
            original_line = lines[line_num - 1]
            
            # 将debug=True改为debug=False
            if 'debug' in original_line.lower() and '= True' in original_line:
                fixed_line = re.sub(r'debug\s*=\s*True', 'debug = False', original_line, flags=re.IGNORECASE)
                lines[line_num - 1] = fixed_line
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                    
                return {
                    'type': 'code_fix',
                    'file': file_path,
                    'line': line_num,
                    'issue': 'debug_mode',
                    'timestamp': datetime.now().isoformat(),
                    'status': 'success',
                    'details': '将debug模式从True改为False'
                }
                
        except Exception as e:
            self.logger.error(f"修复debug_mode失败: {e}")
            return None
            
    def _fix_ssl_verification(self, file_path, line_num):
        """修复SSL验证禁用问题"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            if line_num <= 0 or line_num > len(lines):
                return None
                
            original_line = lines[line_num - 1]
            
            # 将verify=False改为verify=True
            if 'verify' in original_line and '= False' in original_line:
                fixed_line = re.sub(r'verify\s*=\s*False', 'verify = True', original_line)
                lines[line_num - 1] = fixed_line
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                    
                return {
                    'type': 'code_fix',
                    'file': file_path,
                    'line': line_num,
                    'issue': 'ssl_verification',
                    'timestamp': datetime.now().isoformat(),
                    'status': 'success',
                    'details': '启用SSL证书验证'
                }
                
        except Exception as e:
            self.logger.error(f"修复SSL验证失败: {e}")
            return None
            
    def _fix_service_issues(self, api_health):
        """修复服务问题"""
        fixes = []
        
        for detail in api_health.get('details', []):
            if detail.get('status') in ['unhealthy', 'timeout', 'error']:
                fix = self._restart_service(detail)
                if fix:
                    fixes.append(fix)
                    
        return fixes
        
    def _restart_service(self, service_detail):
        """重启崩溃的服务"""
        service_name = service_detail.get('name')
        url = service_detail.get('url')
        
        # 尝试通过systemctl重启（仅限Linux）
        try:
            # 猜测服务名称
            possible_names = [
                service_name.lower().replace(' ', '-'),
                service_name.lower().replace(' ', ''),
                'app',
                'api',
                'web'
            ]
            
            for name in possible_names:
                result = subprocess.run(
                    ['systemctl', 'is-active', name],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0:
                    # 服务存在，尝试重启
                    restart_result = subprocess.run(
                        ['systemctl', 'restart', name],
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    
                    return {
                        'type': 'service_restart',
                        'service': name,
                        'timestamp': datetime.now().isoformat(),
                        'status': 'success' if restart_result.returncode == 0 else 'failed',
                        'details': f'尝试重启服务 {name}'
                    }
                    
        except FileNotFoundError:
            # 非systemd系统
            pass
        except Exception as e:
            self.logger.warning(f"重启服务失败: {e}")
            
        return None
        
    def _record_fixes(self, fixes):
        """记录修复历史"""
        if not fixes:
            return
            
        self.fix_history.extend(fixes)
        
        # 保存到文件
        try:
            log_dir = Path(__file__).parent.parent / 'logs'
            log_dir.mkdir(exist_ok=True)
            
            fix_log = log_dir / 'fix-history.json'
            
            existing = []
            if fix_log.exists():
                with open(fix_log, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
                    
            existing.extend(fixes)
            
            # 只保留最近1000条记录
            existing = existing[-1000:]
            
            with open(fix_log, 'w', encoding='utf-8') as f:
                json.dump(existing, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            self.logger.error(f"保存修复历史失败: {e}")
