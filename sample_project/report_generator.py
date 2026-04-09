"""报告生成模块 - 生成HTML和CSV格式的分析报告"""
import os
import datetime
from typing import Dict, Any

def generate_html_report(data: Dict[str, Any], output_path: str):
    """生成HTML格式的分析报告"""
    
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>数据分析报告</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        h1 {{ color: #333; }}
        table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #4CAF50; color: white; }}
    </style>
</head>
<body>
    <h1>数据分析报告</h1>
    <p>生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    
    <h2>分析摘要</h2>
    <table>
        <tr>
            <th>指标</th>
            <th>数值</th>
        </tr>
"""
    
    for key, value in data.items():
        html_content += f"        <tr><td>{key}</td><td>{value}</td></tr>\n"
    
    html_content += """
    </table>
</body>
</html>
"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return output_path

def generate_csv_report(data: Dict[str, Any], output_path: str):
    """生成CSV格式的报告"""
    import csv
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['指标', '数值'])
        
        for key, value in data.items():
            writer.writerow([key, value])
    
    return output_path

def save_summary(stats: Dict[str, Any], output_dir: str = './output'):
    """保存分析摘要到多个格式"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    
    html_path = os.path.join(output_dir, f'summary_{timestamp}.html')
    csv_path = os.path.join(output_dir, f'summary_{timestamp}.csv')
    
    generate_html_report(stats, html_path)
    generate_csv_report(stats, csv_path)
    
    return {
        'html': html_path,
        'csv': csv_path
    }

class ReportGenerator:
    """报告生成器类"""
    
    def __init__(self, template_dir=None):
        self.template_dir = template_dir or './templates'
        self.reports_generated = []
    
    def create_report(self, analysis_result, format_type='html'):
        """创建报告"""
        if format_type == 'html':
            return generate_html_report(analysis_result, 'output/report.html')
        elif format_type == 'csv':
            return generate_csv_report(analysis_result, 'output/report.csv')
        else:
            raise ValueError(f"不支持的格式: {format_type}")
    
    def get_report_history(self):
        """获取报告生成历史"""
        return self.reports_generated
