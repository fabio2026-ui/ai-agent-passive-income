"""主程序入口"""
from data_loader import DataLoader, load_csv
from analyzer import analyze_dataset, correlation_analysis
from report_generator import save_summary
import sys

def main():
    """主函数"""
    print("数据分析工具启动...")
    
    config = {
        'data_dir': './data',
        'output_dir': './output'
    }
    
    loader = DataLoader(config)
    
    # 加载数据
    csv_data = load_csv('data/sample.csv')
    
    if csv_data:
        print(f"成功加载 {len(csv_data)} 行数据")
        
        # 转换为分析格式
        dataset = {}
        if len(csv_data) > 0:
            headers = csv_data[0]
            for i, header in enumerate(headers):
                dataset[header] = []
                for row in csv_data[1:]:
                    if i < len(row):
                        try:
                            dataset[header].append(float(row[i]))
                        except:
                            pass
        
        # 分析数据
        analysis_result = analyze_dataset(dataset)
        
        # 生成报告
        output_files = save_summary(analysis_result)
        print(f"报告已生成: {output_files}")
    else:
        print("数据加载失败")
        sys.exit(1)

if __name__ == '__main__':
    main()
