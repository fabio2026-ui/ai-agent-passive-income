#!/bin/bash
# Chrome Web Store 批量上传脚本
# 需要: Chrome Web Store API access

# 配置（需要手动获取）
CLIENT_ID="你的Client_ID"
CLIENT_SECRET="你的Client_SECRET"
REFRESH_TOKEN="你的Refresh_Token"

# 扩展目录列表
EXTENSIONS=(
  "seo-analyzer"
  "screenshot-tool" 
  "color-picker"
  "link-checker"
)

echo "========================================"
echo "🚀 Chrome Web Store 批量上传"
echo "========================================"
echo ""

for ext in "${EXTENSIONS[@]}"; do
  echo "📦 处理: $ext"
  
  if [ -d "/root/ai-empire/chrome-extensions/$ext" ]; then
    # 打包为zip
    cd "/root/ai-empire/chrome-extensions"
    
    # 使用tar创建zip兼容格式
    tar -czf "${ext}.tar.gz" "$ext"
    
    echo "  ✅ 打包完成: ${ext}.tar.gz"
    echo "  📋 下一步: 在开发者控制台手动上传"
    echo ""
  else
    echo "  ❌ 目录不存在: $ext"
  fi
done

echo "========================================"
echo "📤 手动上传步骤:"
echo "========================================"
echo ""
echo "1. 访问: https://chrome.google.com/webstore/devconsole"
echo "2. 点击 'New Item'"
echo "3. 选择打包文件"
echo "4. 填写商店信息"
echo "5. 提交审核"
echo ""
echo "打包文件位置:"
ls -lh /root/ai-empire/chrome-extensions/*.tar.gz
