#!/usr/bin/env python3
# =============================================================================
# Configuration Validator
# 配置验证器
# =============================================================================
# 功能：
# 1. 修改前验证语法
# 2. 修改后验证功能
# 3. 支持多种配置文件类型
# 4. 异常立即恢复建议
# =============================================================================

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import List, Optional, Tuple


class ValidationLevel(Enum):
    """验证级别"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class ValidationResult:
    """验证结果"""
    level: ValidationLevel
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    suggestion: Optional[str] = None


class ConfigValidator:
    """配置验证器主类"""
    
    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.results: List[ValidationResult] = []
        self.file_content: str = ""
        self.file_type: str = self._detect_file_type()
        
    def _detect_file_type(self) -> str:
        """检测文件类型"""
        suffix = self.file_path.suffix.lower()
        name = self.file_path.name.lower()
        
        type_mapping = {
            '.json': 'json',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.py': 'python',
            '.sh': 'shell',
            '.bash': 'shell',
            '.conf': 'config',
            '.cfg': 'config',
            '.ini': 'ini',
            '.toml': 'toml',
            '.xml': 'xml',
            '.properties': 'properties',
            '.env': 'env',
        }
        
        # 特殊文件名检测
        if 'nginx' in name:
            return 'nginx'
        elif 'apache' in name or 'httpd' in name:
            return 'apache'
        elif 'ssh' in name:
            return 'ssh'
        elif 'dockerfile' in name or name == 'dockerfile':
            return 'dockerfile'
        elif name == 'makefile':
            return 'makefile'
        elif 'sshd' in name:
            return 'ssh'
        
        return type_mapping.get(suffix, 'text')
    
    def _read_file(self) -> bool:
        """读取文件内容"""
        try:
            if not self.file_path.exists():
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message=f"文件不存在: {self.file_path}"
                ))
                return False
            
            if not os.access(self.file_path, os.R_OK):
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message=f"文件不可读: {self.file_path}"
                ))
                return False
            
            with open(self.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                self.file_content = f.read()
            
            return True
        except Exception as e:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message=f"读取文件失败: {e}"
            ))
            return False
    
    # =========================================================================
    # JSON 验证
    # =========================================================================
    
    def _validate_json(self) -> bool:
        """验证 JSON 文件"""
        try:
            json.loads(self.file_content)
            self.results.append(ValidationResult(
                level=ValidationLevel.INFO,
                message="JSON 语法验证通过"
            ))
            
            # 额外检查：JSON 格式最佳实践
            self._check_json_best_practices()
            return True
        except json.JSONDecodeError as e:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message=f"JSON 语法错误: {e.msg}",
                line=e.lineno,
                column=e.colno,
                suggestion="检查 JSON 格式，确保括号匹配"
            ))
            return False
    
    def _check_json_best_practices(self):
        """检查 JSON 最佳实践"""
        # 检查大文件
        if len(self.file_content) > 1024 * 1024:  # 1MB
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="JSON 文件较大，考虑使用流式解析"
            ))
        
        # 检查尾随逗号（Python 的 json 模块会报错，但这里是为了更好的错误信息）
        lines = self.file_content.split('\n')
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if re.search(r',\s*[}\]]', stripped):
                self.results.append(ValidationResult(
                    level=ValidationLevel.WARNING,
                    message="发现可能的尾随逗号",
                    line=i,
                    suggestion="JSON 标准不允许尾随逗号"
                ))
    
    # =========================================================================
    # YAML 验证
    # =========================================================================
    
    def _validate_yaml(self) -> bool:
        """验证 YAML 文件"""
        try:
            import yaml
            yaml.safe_load(self.file_content)
            self.results.append(ValidationResult(
                level=ValidationLevel.INFO,
                message="YAML 语法验证通过"
            ))
            return True
        except ImportError:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="未安装 PyYAML，跳过 YAML 语法验证",
                suggestion="安装: pip install pyyaml"
            ))
            return True
        except yaml.YAMLError as e:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message=f"YAML 语法错误: {e}",
                suggestion="检查缩进和 YAML 语法"
            ))
            return False
    
    # =========================================================================
    # Python 验证
    # =========================================================================
    
    def _validate_python(self) -> bool:
        """验证 Python 文件"""
        try:
            compile(self.file_content, str(self.file_path), 'exec')
            self.results.append(ValidationResult(
                level=ValidationLevel.INFO,
                message="Python 语法验证通过"
            ))
            
            # 额外检查
            self._check_python_best_practices()
            return True
        except SyntaxError as e:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message=f"Python 语法错误: {e.msg}",
                line=e.lineno,
                column=e.offset,
                suggestion="检查 Python 语法"
            ))
            return False
    
    def _check_python_best_practices(self):
        """检查 Python 最佳实践"""
        # 检查硬编码密码
        password_patterns = [
            r'password\s*=\s*["\'][^"\']+["\']',
            r'passwd\s*=\s*["\'][^"\']+["\']',
            r'secret\s*=\s*["\'][^"\']+["\']',
            r'token\s*=\s*["\'][^"\']+["\']',
            r'api_key\s*=\s*["\'][^"\']+["\']',
        ]
        
        lines = self.file_content.split('\n')
        for i, line in enumerate(lines, 1):
            for pattern in password_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    # 排除环境变量引用
                    if 'os.environ' not in line and 'getenv' not in line:
                        self.results.append(ValidationResult(
                            level=ValidationLevel.WARNING,
                            message="发现可能的硬编码敏感信息",
                            line=i,
                            suggestion="使用环境变量存储敏感信息"
                        ))
    
    # =========================================================================
    # Shell 脚本验证
    # =========================================================================
    
    def _validate_shell(self) -> bool:
        """验证 Shell 脚本"""
        try:
            result = subprocess.run(
                ['bash', '-n'],
                input=self.file_content,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                self.results.append(ValidationResult(
                    level=ValidationLevel.INFO,
                    message="Shell 语法验证通过"
                ))
                self._check_shell_best_practices()
                return True
            else:
                error_msg = result.stderr.strip()
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message=f"Shell 语法错误: {error_msg}",
                    suggestion="检查 Shell 语法"
                ))
                return False
        except Exception as e:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message=f"Shell 验证失败: {e}"
            ))
            return False
    
    def _check_shell_best_practices(self):
        """检查 Shell 最佳实践"""
        lines = self.file_content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # 检查未引用的变量
            if re.search(r'\$\w+[^"]', line) and not line.strip().startswith('#'):
                if not re.search(r'\$\{', line):
                    self.results.append(ValidationResult(
                        level=ValidationLevel.WARNING,
                        message="变量可能未加引号，存在空格问题风险",
                        line=i,
                        suggestion='使用 "${VAR}" 而非 $VAR'
                    ))
            
            # 检查 rm -rf /
            if re.search(r'rm\s+-rf?\s+/\s', line):
                self.results.append(ValidationResult(
                    level=ValidationLevel.CRITICAL,
                    message="检测到危险的 rm 命令!",
                    line=i,
                    suggestion="此命令可能删除整个文件系统!"
                ))
    
    # =========================================================================
    # Nginx 配置验证
    # =========================================================================
    
    def _validate_nginx(self) -> bool:
        """验证 Nginx 配置"""
        # 创建临时文件进行验证
        with tempfile.NamedTemporaryFile(mode='w', suffix='.conf', delete=False) as f:
            f.write(self.file_content)
            temp_path = f.name
        
        try:
            result = subprocess.run(
                ['nginx', '-t', '-c', temp_path],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                self.results.append(ValidationResult(
                    level=ValidationLevel.INFO,
                    message="Nginx 配置验证通过"
                ))
                return True
            else:
                error_msg = result.stderr.strip()
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message=f"Nginx 配置错误: {error_msg}",
                    suggestion="检查 Nginx 配置语法"
                ))
                return False
        except FileNotFoundError:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="未找到 nginx 命令，跳过详细验证",
                suggestion="安装 nginx 以启用详细验证"
            ))
            return True
        finally:
            os.unlink(temp_path)
    
    # =========================================================================
    # Apache 配置验证
    # =========================================================================
    
    def _validate_apache(self) -> bool:
        """验证 Apache 配置"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.conf', delete=False) as f:
            f.write(self.file_content)
            temp_path = f.name
        
        try:
            # 尝试 apachectl
            for cmd in ['apachectl', 'apache2ctl']:
                try:
                    result = subprocess.run(
                        [cmd, '-t', '-f', temp_path],
                        capture_output=True,
                        text=True
                    )
                    
                    if result.returncode == 0:
                        self.results.append(ValidationResult(
                            level=ValidationLevel.INFO,
                            message="Apache 配置验证通过"
                        ))
                        return True
                    else:
                        error_msg = result.stderr.strip() or result.stdout.strip()
                        self.results.append(ValidationResult(
                            level=ValidationLevel.ERROR,
                            message=f"Apache 配置错误: {error_msg}",
                            suggestion="检查 Apache 配置语法"
                        ))
                        return False
                except FileNotFoundError:
                    continue
            
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="未找到 apachectl/apache2ctl，跳过详细验证"
            ))
            return True
        finally:
            os.unlink(temp_path)
    
    # =========================================================================
    # SSH 配置验证
    # =========================================================================
    
    def _validate_ssh(self) -> bool:
        """验证 SSH 配置"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.conf', delete=False) as f:
            f.write(self.file_content)
            temp_path = f.name
        
        try:
            result = subprocess.run(
                ['sshd', '-t', '-f', temp_path],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                self.results.append(ValidationResult(
                    level=ValidationLevel.INFO,
                    message="SSH 配置验证通过"
                ))
                
                # 检查安全设置
                self._check_ssh_security()
                return True
            else:
                error_msg = result.stderr.strip()
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message=f"SSH 配置错误: {error_msg}",
                    suggestion="检查 SSH 配置语法"
                ))
                return False
        except FileNotFoundError:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="未找到 sshd 命令，跳过详细验证"
            ))
            return True
        finally:
            os.unlink(temp_path)
    
    def _check_ssh_security(self):
        """检查 SSH 安全配置"""
        content_lower = self.file_content.lower()
        
        # 检查是否禁用了 root 登录
        if 'permitrootlogin' not in content_lower:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="未设置 PermitRootLogin，建议显式设置为 no"
            ))
        elif 'permitrootlogin yes' in content_lower:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="PermitRootLogin 设置为 yes，存在安全风险"
            ))
        
        # 检查是否使用密码认证
        if 'passwordauthentication yes' in content_lower:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="启用密码认证，建议使用密钥认证"
            ))
    
    # =========================================================================
    # INI 配置验证
    # =========================================================================
    
    def _validate_ini(self) -> bool:
        """验证 INI 配置文件"""
        try:
            import configparser
            config = configparser.ConfigParser()
            config.read_string(self.file_content)
            
            self.results.append(ValidationResult(
                level=ValidationLevel.INFO,
                message="INI 配置验证通过"
            ))
            return True
        except ImportError:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="无法导入 configparser"
            ))
            return True
        except Exception as e:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message=f"INI 配置错误: {e}",
                suggestion="检查 INI 格式，确保有 [section] 头部"
            ))
            return False
    
    # =========================================================================
    # 通用文本验证
    # =========================================================================
    
    def _validate_text(self) -> bool:
        """通用文本文件验证"""
        # 检查空文件
        if not self.file_content.strip():
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message="配置文件为空"
            ))
            return True
        
        # 检查 null 字节
        if '\x00' in self.file_content:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message="文件包含 null 字节，可能是二进制文件",
                suggestion="检查文件编码"
            ))
            return False
        
        self.results.append(ValidationResult(
            level=ValidationLevel.INFO,
            message="文本文件基础验证通过"
        ))
        return True
    
    # =========================================================================
    # 主验证流程
    # =========================================================================
    
    def validate(self, phase: str = "pre") -> bool:
        """执行验证
        
        Args:
            phase: "pre" (修改前) 或 "post" (修改后)
        
        Returns:
            bool: 验证是否通过
        """
        if not self._read_file():
            return False
        
        self.results.append(ValidationResult(
            level=ValidationLevel.INFO,
            message=f"开始 [{phase}] 阶段验证 - 类型: {self.file_type}"
        ))
        
        # 根据文件类型选择验证器
        validators = {
            'json': self._validate_json,
            'yaml': self._validate_yaml,
            'python': self._validate_python,
            'shell': self._validate_shell,
            'nginx': self._validate_nginx,
            'apache': self._validate_apache,
            'ssh': self._validate_ssh,
            'ini': self._validate_ini,
            'text': self._validate_text,
        }
        
        validator = validators.get(self.file_type, self._validate_text)
        result = validator()
        
        return result
    
    def print_results(self):
        """打印验证结果"""
        print()
        print("=" * 60)
        print("           配置验证结果")
        print("=" * 60)
        
        has_error = False
        has_warning = False
        
        for r in self.results:
            level_colors = {
                ValidationLevel.INFO: '\033[0;32m',      # Green
                ValidationLevel.WARNING: '\033[1;33m',   # Yellow
                ValidationLevel.ERROR: '\033[0;31m',     # Red
                ValidationLevel.CRITICAL: '\033[0;35m',  # Purple
            }
            
            color = level_colors.get(r.level, '\033[0m')
            reset = '\033[0m'
            
            location = ""
            if r.line is not None:
                location = f" [行 {r.line}"
                if r.column is not None:
                    location += f", 列 {r.column}"
                location += "]"
            
            print(f"{color}[{r.level.value.upper()}]{reset}{location} {r.message}")
            
            if r.suggestion:
                print(f"       建议: {r.suggestion}")
            
            if r.level in (ValidationLevel.ERROR, ValidationLevel.CRITICAL):
                has_error = True
            elif r.level == ValidationLevel.WARNING:
                has_warning = True
        
        print("=" * 60)
        
        if has_error:
            print(f"{level_colors[ValidationLevel.ERROR]}验证失败，请修复错误后重试{reset}")
        elif has_warning:
            print(f"{level_colors[ValidationLevel.WARNING]}验证通过，但有警告需要注意{reset}")
        else:
            print(f"{level_colors[ValidationLevel.INFO]}✓ 验证全部通过{reset}")
        
        print()
        
        return not has_error


def main():
    parser = argparse.ArgumentParser(
        description='配置验证器 - 验证各种配置文件的语法和最佳实践'
    )
    parser.add_argument(
        '--file', '-f',
        required=True,
        help='要验证的配置文件路径'
    )
    parser.add_argument(
        '--phase',
        choices=['pre', 'post'],
        default='pre',
        help='验证阶段: pre (修改前) 或 post (修改后)'
    )
    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help='静默模式，只返回退出码'
    )
    
    args = parser.parse_args()
    
    validator = ConfigValidator(args.file)
    result = validator.validate(args.phase)
    
    if not args.quiet:
        validator.print_results()
    
    sys.exit(0 if result else 1)


if __name__ == '__main__':
    main()
