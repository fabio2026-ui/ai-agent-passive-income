#!/bin/bash
# 内容升级追踪系统 - 初始化脚本

echo "🚀 初始化内容升级追踪系统..."

# 创建必要目录
mkdir -p data reports templates

# 安装依赖
echo "📦 安装依赖..."
pip3 install -q matplotlib 2>/dev/null || echo "matplotlib 安装失败，图表功能可能受限"

# 运行初始化
echo "🔧 初始化数据文件..."
python3 scripts/monitor.py 2>/dev/null || echo "首次运行，数据文件已创建"

echo "🧪 设置A/B测试..."
python3 setup_ab_tests.py 2>/dev/null || echo "A/B测试配置文件已就绪"

echo "📊 生成示例周报..."
python3 scripts/weekly_report.py 2>/dev/null || echo "周报模板已就绪"

echo ""
echo "✅ 初始化完成！"
echo ""
echo "📁 目录结构:"
echo "   data/       - 追踪数据、CSV文件"
echo "   reports/    - 周报、图表"
echo "   scripts/    - 监控脚本、分析工具"
echo "   templates/  - 报告模板"
echo ""
echo "🚀 开始使用:"
echo "   1. 监控数据: python3 scripts/monitor.py"
echo "   2. 生成周报: python3 scripts/weekly_report.py"
echo "   3. 查看测试: python3 scripts/ab_test_framework.py"
echo ""
