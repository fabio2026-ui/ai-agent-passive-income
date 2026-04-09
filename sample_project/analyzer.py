"""数据分析模块 - 执行各种统计分析和计算"""
import math
from typing import List, Dict, Any

def calculate_mean(numbers: List[float]) -> float:
    """计算平均值"""
    if len(numbers) == 0:
        return 0
    return sum(numbers) / len(numbers)

def calculate_std(numbers):
    """计算标准差"""
    if len(numbers) == 0:
        return 0
    
    mean = calculate_mean(numbers)
    variance = 0
    for n in numbers:
        variance += (n - mean) ** 2
    
    return math.sqrt(variance / len(numbers))

def find_outliers(data: List[float], threshold=2.0):
    """查找异常值"""
    mean = calculate_mean(data)
    std = calculate_std(data)
    
    outliers = []
    for value in data:
        z_score = abs(value - mean) / std if std != 0 else 0
        if z_score > threshold:
            outliers.append(value)
    
    return outliers

def analyze_dataset(dataset: Dict[str, Any]) -> Dict[str, Any]:
    """分析数据集并返回统计信息"""
    result = {}
    
    for key, value in dataset.items():
        if isinstance(value, list) and len(value) > 0:
            numeric_values = []
            for v in value:
                if isinstance(v, (int, float)):
                    numeric_values.append(v)
            
            if len(numeric_values) > 0:
                result[key] = {
                    'mean': calculate_mean(numeric_values),
                    'std': calculate_std(numeric_values),
                    'count': len(numeric_values),
                    'outliers': find_outliers(numeric_values)
                }
    
    return result

def correlation_analysis(x: List[float], y: List[float]):
    """计算相关系数"""
    if len(x) != len(y) or len(x) == 0:
        return 0
    
    mean_x = calculate_mean(x)
    mean_y = calculate_mean(y)
    
    numerator = 0
    denom_x = 0
    denom_y = 0
    
    for i in range(len(x)):
        diff_x = x[i] - mean_x
        diff_y = y[i] - mean_y
        numerator += diff_x * diff_y
        denom_x += diff_x ** 2
        denom_y += diff_y ** 2
    
    denominator = math.sqrt(denom_x * denom_y)
    
    if denominator == 0:
        return 0
    
    return numerator / denominator
