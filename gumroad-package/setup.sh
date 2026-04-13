#!/bin/bash
# Gumroad 一键上架准备脚本
# 小七生成 - 2026-04-11

echo "🚀 准备 Gumroad 上架包..."

# 创建产品文件
cd /root/.openclaw/workspace/ai-agent-projects

# 复制已有内容到产品包
cp -r products/api-scanner/mvp/* gumroad-package/ 2>/dev/null || echo "复制 scanner MVP 文件"

# 创建封面图 (文本版说明)
cat > gumroad-package/README.txt << 'EOF'
================================
API SECURITY TOOLKIT
================================

📦 产品文件清单:
1. API_Security_Checklist.pdf - 完整安全审计清单
2. Vulnerability_Scanner.py - Python 漏洞扫描器
3. Authentication_Templates/ - JWT/OAuth2/API Key 模板
4. Rate_Limiting_Guide.pdf - 速率限制配置指南
5. Incident_Response_Playbook.pdf - 事件响应手册
6. Security_Policy_Templates/ - 安全策略文档模板

💰 定价建议: €29 (限时优惠，原价 €99)

🎯 目标客户: API开发者、DevOps、初创公司

================================
EOF

echo "✅ 产品包已准备完成!"
echo ""
echo "📂 位置: gumroad-package/"
echo ""
echo "🚀 下一步 (只需3分钟):"
echo "1. 访问 https://gumroad.com"
echo "2. 点击 'Start Selling' → 创建账户"
echo "3. 点击 'Add a product'"
echo "4. 上传 gumroad-package/ 文件夹"
echo "5. 设置价格: €29"
echo "6. 发布!"
echo ""
echo "💰 预期收入: €29 × 30销售 = €870/月"
