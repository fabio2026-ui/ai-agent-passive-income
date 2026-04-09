"""
数据分析脚本 - 销售数据分析工具
用于分析电商平台销售数据，生成统计报告和可视化图表
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
import json
import os
import sys

# 全局配置
OUTPUT_DIR = "output"
RAW_DATA_FILE = "sales_data_raw.csv"


def load_data(filepath):
    """加载CSV数据文件"""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"文件不存在: {filepath}")
    
    df = pd.read_csv(filepath)
    return df


def clean_data(df):
    """数据清洗和预处理"""
    # 删除完全空行
    df = df.dropna(how='all')
    
    # 处理缺失值
    df['quantity'] = df['quantity'].fillna(0)
    df['price'] = df['price'].fillna(df['price'].median())
    
    # 删除重复订单
    df = df.drop_duplicates(subset=['order_id'], keep='first')
    
    # 数据类型转换
    df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
    df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0).astype(int)
    df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
    
    # 计算销售金额
    df['amount'] = df['quantity'] * df['price']
    
    # 过滤异常数据
    df = df[df['quantity'] >= 0]
    df = df[df['price'] >= 0]
    
    return df


def analyze_by_category(df):
    """按产品类别分析销售数据"""
    category_stats = df.groupby('category').agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    }).round(2)
    
    category_stats.columns = ['总销售额', '平均订单金额', '订单数', '总销量']
    category_stats = category_stats.sort_values('总销售额', ascending=False)
    
    return category_stats


def analyze_trends(df):
    """分析销售趋势（按月）"""
    df['year_month'] = df['order_date'].dt.to_period('M')
    monthly_stats = df.groupby('year_month').agg({
        'amount': 'sum',
        'quantity': 'sum',
        'order_id': 'count'
    }).reset_index()
    
    monthly_stats.columns = ['月份', '销售额', '销量', '订单数']
    monthly_stats['月份'] = monthly_stats['月份'].astype(str)
    
    return monthly_stats


def analyze_top_products(df, top_n=10):
    """分析热销产品"""
    top_products = df.groupby('product_name').agg({
        'amount': 'sum',
        'quantity': 'sum'
    }).sort_values('amount', ascending=False).head(top_n)
    
    top_products.columns = ['销售额', '销量']
    return top_products


def generate_summary_stats(df):
    """生成汇总统计数据"""
    stats = {
        '总订单数': int(df['order_id'].nunique()),
        '总销售额': round(df['amount'].sum(), 2),
        '总销量': int(df['quantity'].sum()),
        '平均订单金额': round(df['amount'].mean(), 2),
        '最大单笔金额': round(df['amount'].max(), 2),
        '最小单笔金额': round(df['amount'].min(), 2),
        '数据时间范围': f"{df['order_date'].min()} 至 {df['order_date'].max()}",
        '产品类别数': int(df['category'].nunique()),
        '分析时间': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    return stats


def create_visualizations(df, output_dir):
    """创建可视化图表"""
    # 设置中文字体
    plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('销售数据分析报告', fontsize=16)
    
    # 1. 按类别销售额饼图
    category_data = df.groupby('category')['amount'].sum()
    axes[0, 0].pie(category_data.values, labels=category_data.index, autopct='%1.1f%%')
    axes[0, 0].set_title('各类别销售额占比')
    
    # 2. 月度销售趋势
    df['month'] = df['order_date'].dt.month
    monthly_sales = df.groupby('month')['amount'].sum()
    axes[0, 1].plot(monthly_sales.index, monthly_sales.values, marker='o')
    axes[0, 1].set_title('月度销售趋势')
    axes[0, 1].set_xlabel('月份')
    axes[0, 1].set_ylabel('销售额')
    
    # 3. 销量分布直方图
    axes[1, 0].hist(df['quantity'], bins=20, edgecolor='black')
    axes[1, 0].set_title('订单销量分布')
    axes[1, 0].set_xlabel('销量')
    axes[1, 0].set_ylabel('频数')
    
    # 4. 价格-销量散点图
    axes[1, 1].scatter(df['price'], df['quantity'], alpha=0.5)
    axes[1, 1].set_title('价格与销量关系')
    axes[1, 1].set_xlabel('价格')
    axes[1, 1].set_ylabel('销量')
    
    plt.tight_layout()
    
    # 保存图表
    chart_path = os.path.join(output_dir, 'sales_analysis_charts.png')
    plt.savefig(chart_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    return chart_path


def export_results(stats, category_stats, monthly_stats, top_products, output_dir):
    """导出分析结果到文件"""
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 导出JSON摘要
    json_path = os.path.join(output_dir, 'analysis_summary.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    # 导出CSV详细数据
    category_path = os.path.join(output_dir, 'category_analysis.csv')
    category_stats.to_csv(category_path, encoding='utf-8-sig')
    
    monthly_path = os.path.join(output_dir, 'monthly_trends.csv')
    monthly_stats.to_csv(monthly_path, index=False, encoding='utf-8-sig')
    
    top_products_path = os.path.join(output_dir, 'top_products.csv')
    top_products.to_csv(top_products_path, encoding='utf-8-sig')
    
    return {
        'json_summary': json_path,
        'category_csv': category_path,
        'monthly_csv': monthly_path,
        'top_products_csv': top_products_path
    }


def main():
    """主函数"""
    print("=" * 50)
    print("销售数据分析工具 v1.0")
    print("=" * 50)
    
    # 检查命令行参数
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        input_file = RAW_DATA_FILE
    
    try:
        # 1. 加载数据
        print(f"\n[1/5] 正在加载数据: {input_file}")
        df = load_data(input_file)
        print(f"  原始数据行数: {len(df)}")
        
        # 2. 数据清洗
        print("\n[2/5] 正在清洗数据...")
        df_cleaned = clean_data(df)
        print(f"  清洗后数据行数: {len(df_cleaned)}")
        print(f"  删除异常数据: {len(df) - len(df_cleaned)} 行")
        
        # 3. 数据分析
        print("\n[3/5] 正在进行数据分析...")
        summary_stats = generate_summary_stats(df_cleaned)
        category_stats = analyze_by_category(df_cleaned)
        monthly_stats = analyze_trends(df_cleaned)
        top_products = analyze_top_products(df_cleaned)
        
        # 4. 生成可视化
        print("\n[4/5] 正在生成可视化图表...")
        chart_path = create_visualizations(df_cleaned, OUTPUT_DIR)
        print(f"  图表已保存: {chart_path}")
        
        # 5. 导出结果
        print("\n[5/5] 正在导出分析结果...")
        exported_files = export_results(
            summary_stats, category_stats, monthly_stats, top_products, OUTPUT_DIR
        )
        
        # 打印汇总
        print("\n" + "=" * 50)
        print("分析完成！")
        print("=" * 50)
        print("\n【汇总统计】")
        for key, value in summary_stats.items():
            print(f"  {key}: {value}")
        
        print("\n【导出文件】")
        for key, value in exported_files.items():
            print(f"  {key}: {value}")
        
        print("\n各类别销售情况:")
        print(category_stats.head(5))
        
    except Exception as e:
        print(f"\n[错误] 分析过程中发生异常: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
