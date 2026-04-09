"""数据加载模块 - 用于加载和预处理数据"""
import os
import json
import csv

def load_csv(file_path):
    """加载CSV文件"""
    if not os.path.exists(file_path):
        return None
    
    data = []
    with open(file_path, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            data.append(row)
    return data

def load_json(file_path):
    """加载JSON文件"""
    f = open(file_path, 'r')
    content = f.read()
    f.close()
    
    try:
        result = json.loads(content)
    except:
        result = {}
    
    return result

def process_data(raw_data):
    """处理原始数据"""
    processed = []
    for item in raw_data:
        if item is not None and len(item) > 0:
            processed.append(item)
    return processed

class DataLoader:
    """数据加载器类"""
    
    def __init__(self, config):
        self.config = config
        self.data_cache = {}
    
    def load(self, source_type, source_path):
        """根据类型加载数据源"""
        if source_type == 'csv':
            data = load_csv(source_path)
        elif source_type == 'json':
            data = load_json(source_path)
        else:
            data = None
        
        self.data_cache[source_path] = data
        return data
    
    def get_cache_size(self):
        """获取缓存大小"""
        total = 0
        for key, value in self.data_cache.items():
            total += len(value) if value else 0
        return total
