#!/usr/bin/env python3
"""
系统监控模块 - 备用版本（无psutil依赖）
使用纯Python和系统命令收集系统指标
"""

import os
import json
import re
import logging
from pathlib import Path
from datetime import datetime
from collections import deque

class SystemMonitor:
    """系统监控器（备用实现）"""
    
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger('SystemMonitor')
        self.thresholds = config.get('alert_thresholds', {})
        
        # 历史数据缓存
        self.history = {
            'cpu': deque(maxlen=60),
            'memory': deque(maxlen=60)
        }
        
    def collect_metrics(self):
        """
        收集系统指标
        """
        metrics = {
            'timestamp': datetime.now().isoformat(),
            'cpu': self._get_cpu_metrics(),
            'memory': self._get_memory_metrics(),
            'disk': self._get_disk_metrics(),
            'network': self._get_network_metrics(),
            'processes': self._get_process_metrics(),
            'system': self._get_system_info()
        }
        
        # 更新历史数据
        self.history['cpu'].append(metrics['cpu']['percent'])
        self.history['memory'].append(metrics['memory']['percent'])
        
        return metrics
        
    def _get_cpu_metrics(self):
        """获取CPU指标"""
        try:
            # 从/proc/stat读取CPU信息
            with open('/proc/stat', 'r') as f:
                line = f.readline()
                fields = line.split()
                
            # 计算CPU使用率
            user = int(fields[1])
            nice = int(fields[2])
            system = int(fields[3])
            idle = int(fields[4])
            iowait = int(fields[5])
            
            total = user + nice + system + idle + iowait
            used = user + nice + system
            
            cpu_percent = round((used / total) * 100, 2) if total > 0 else 0
            
            # 获取负载平均值
            try:
                with open('/proc/loadavg', 'r') as f:
                    load_data = f.read().split()
                    load_avg = [
                        float(load_data[0]),
                        float(load_data[1]),
                        float(load_data[2])
                    ]
            except:
                load_avg = [0, 0, 0]
                
            # 获取CPU核心数
            cpu_count = 0
            try:
                with open('/proc/cpuinfo', 'r') as f:
                    for line in f:
                        if line.startswith('processor'):
                            cpu_count += 1
            except:
                cpu_count = 1
                
            return {
                'percent': cpu_percent,
                'count': cpu_count,
                'load_average': {
                    '1min': round(load_avg[0], 2),
                    '5min': round(load_avg[1], 2),
                    '15min': round(load_avg[2], 2)
                },
                'frequency': None
            }
            
        except Exception as e:
            self.logger.debug(f"读取CPU信息失败: {e}")
            return {
                'percent': 0,
                'count': 1,
                'load_average': {'1min': 0, '5min': 0, '15min': 0},
                'frequency': None
            }
            
    def _get_memory_metrics(self):
        """获取内存指标"""
        try:
            mem_info = {}
            with open('/proc/meminfo', 'r') as f:
                for line in f:
                    if ':' in line:
                        key, value = line.split(':', 1)
                        mem_info[key.strip()] = int(value.split()[0]) * 1024  # 转换为字节
                        
            total = mem_info.get('MemTotal', 0)
            free = mem_info.get('MemFree', 0)
            available = mem_info.get('MemAvailable', free)
            buffers = mem_info.get('Buffers', 0)
            cached = mem_info.get('Cached', 0)
            
            used = total - available
            
            # Swap信息
            swap_total = mem_info.get('SwapTotal', 0)
            swap_free = mem_info.get('SwapFree', 0)
            swap_used = swap_total - swap_free
            
            mem_percent = round((used / total) * 100, 2) if total > 0 else 0
            swap_percent = round((swap_used / swap_total) * 100, 2) if swap_total > 0 else 0
            
            return {
                'percent': mem_percent,
                'total_gb': round(total / (1024**3), 2),
                'available_gb': round(available / (1024**3), 2),
                'used_gb': round(used / (1024**3), 2),
                'free_gb': round(free / (1024**3), 2),
                'swap': {
                    'percent': swap_percent,
                    'total_gb': round(swap_total / (1024**3), 2),
                    'used_gb': round(swap_used / (1024**3), 2)
                }
            }
            
        except Exception as e:
            self.logger.debug(f"读取内存信息失败: {e}")
            return {
                'percent': 0,
                'total_gb': 0,
                'available_gb': 0,
                'used_gb': 0,
                'free_gb': 0,
                'swap': {'percent': 0, 'total_gb': 0, 'used_gb': 0}
            }
            
    def _get_disk_metrics(self):
        """获取磁盘指标"""
        disks = []
        
        try:
            # 读取mount信息
            with open('/proc/mounts', 'r') as f:
                for line in f:
                    parts = line.split()
                    if len(parts) >= 2:
                        device = parts[0]
                        mountpoint = parts[1]
                        fstype = parts[2]
                        
                        # 只检查真实文件系统
                        if fstype in ('ext4', 'ext3', 'xfs', 'btrfs', 'tmpfs'):
                            try:
                                # 使用statvfs获取磁盘使用情况
                                import os
                                statvfs = os.statvfs(mountpoint)
                                
                                total = statvfs.f_blocks * statvfs.f_frsize
                                free = statvfs.f_bfree * statvfs.f_frsize
                                available = statvfs.f_bavail * statvfs.f_frsize
                                used = total - free
                                
                                percent = round((used / total) * 100, 2) if total > 0 else 0
                                
                                disks.append({
                                    'device': device,
                                    'mountpoint': mountpoint,
                                    'fstype': fstype,
                                    'percent': percent,
                                    'total_gb': round(total / (1024**3), 2),
                                    'used_gb': round(used / (1024**3), 2),
                                    'free_gb': round(available / (1024**3), 2)
                                })
                            except:
                                pass
                                
        except Exception as e:
            self.logger.debug(f"读取磁盘信息失败: {e}")
            
        return {
            'partitions': disks,
            'io': {}
        }
        
    def _get_network_metrics(self):
        """获取网络指标"""
        net_stats = {}
        connection_stats = {}
        
        try:
            # 读取网络接口统计
            with open('/proc/net/dev', 'r') as f:
                lines = f.readlines()
                
            total_rx = 0
            total_tx = 0
            
            for line in lines[2:]:  # 跳过标题行
                parts = line.split()
                if len(parts) >= 9:
                    rx_bytes = int(parts[1])
                    tx_bytes = int(parts[9])
                    total_rx += rx_bytes
                    total_tx += tx_bytes
                    
            net_stats = {
                'bytes_sent_mb': round(total_tx / (1024**2), 2),
                'bytes_recv_mb': round(total_rx / (1024**2), 2),
                'packets_sent': 0,
                'packets_recv': 0,
                'errors_in': 0,
                'errors_out': 0,
                'drop_in': 0,
                'drop_out': 0
            }
            
        except Exception as e:
            self.logger.debug(f"读取网络信息失败: {e}")
            
        return {
            'io': net_stats,
            'connections': connection_stats
        }
        
    def _get_process_metrics(self):
        """获取进程指标"""
        high_cpu_procs = []
        high_mem_procs = []
        process_count = 0
        
        try:
            for pid in os.listdir('/proc'):
                if pid.isdigit():
                    process_count += 1
                    try:
                        # 读取进程状态
                        with open(f'/proc/{pid}/stat', 'r') as f:
                            stat = f.read().split()
                            
                        # 简化处理，只计数
                    except:
                        pass
                        
        except Exception as e:
            self.logger.debug(f"读取进程信息失败: {e}")
            
        return {
            'total_count': process_count,
            'high_cpu': high_cpu_procs,
            'high_memory': high_mem_procs
        }
        
    def _get_system_info(self):
        """获取系统信息"""
        import socket
        
        boot_time = 0
        try:
            with open('/proc/stat', 'r') as f:
                for line in f:
                    if line.startswith('btime'):
                        boot_time = int(line.split()[1])
                        break
        except:
            pass
            
        import time
        uptime_hours = round((time.time() - boot_time) / 3600, 2) if boot_time > 0 else 0
        
        return {
            'hostname': socket.gethostname(),
            'boot_time': datetime.fromtimestamp(boot_time).isoformat() if boot_time > 0 else '',
            'uptime_hours': uptime_hours
        }
        
    def check_thresholds(self, metrics):
        """
        检查指标是否超过阈值
        返回需要发送的告警列表
        """
        alerts = []
        
        # CPU告警
        cpu_percent = metrics['cpu']['percent']
        cpu_threshold = self.thresholds.get('cpu_percent', 80)
        if cpu_percent > cpu_threshold:
            alerts.append({
                'title': 'CPU使用率告警',
                'message': f'CPU使用率 {cpu_percent}% 超过阈值 {cpu_threshold}%',
                'level': 'warning' if cpu_percent < 95 else 'critical',
                'metric': 'cpu',
                'value': cpu_percent,
                'threshold': cpu_threshold
            })
            
        # 负载告警
        load_avg = metrics['cpu']['load_average']['1min']
        load_threshold = self.thresholds.get('load_average', 10)
        if load_avg > load_threshold:
            alerts.append({
                'title': '系统负载告警',
                'message': f'1分钟负载 {load_avg} 超过阈值 {load_threshold}',
                'level': 'warning',
                'metric': 'load',
                'value': load_avg,
                'threshold': load_threshold
            })
            
        # 内存告警
        mem_percent = metrics['memory']['percent']
        mem_threshold = self.thresholds.get('memory_percent', 85)
        if mem_percent > mem_threshold:
            alerts.append({
                'title': '内存使用率告警',
                'message': f'内存使用率 {mem_percent}% 超过阈值 {mem_threshold}%',
                'level': 'warning' if mem_percent < 95 else 'critical',
                'metric': 'memory',
                'value': mem_percent,
                'threshold': mem_threshold
            })
            
        # 磁盘告警
        for disk in metrics['disk']['partitions']:
            disk_threshold = self.thresholds.get('disk_percent', 90)
            if disk['percent'] > disk_threshold:
                alerts.append({
                    'title': f'磁盘空间告警 - {disk["mountpoint"]}',
                    'message': f'磁盘 {disk["mountpoint"]} 使用率 {disk["percent"]}% 超过阈值 {disk_threshold}%',
                    'level': 'warning' if disk['percent'] < 95 else 'critical',
                    'metric': 'disk',
                    'value': disk['percent'],
                    'threshold': disk_threshold,
                    'mountpoint': disk['mountpoint']
                })
                
        return alerts
        
    def save_metrics(self, metrics):
        """保存监控数据到文件"""
        try:
            log_dir = Path(__file__).parent.parent / 'logs' / 'metrics'
            log_dir.mkdir(parents=True, exist_ok=True)
            
            # 按小时分文件
            hour_str = datetime.now().strftime('%Y%m%d-%H')
            log_file = log_dir / f'metrics-{hour_str}.jsonl'
            
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(metrics, ensure_ascii=False) + '\n')
                
        except Exception as e:
            self.logger.error(f"保存监控数据失败: {e}")
