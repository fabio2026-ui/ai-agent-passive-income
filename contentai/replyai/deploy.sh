#!/bin/bash
# ReplyAI Chrome Extension IPFS Deployment Script
# 自动打包并部署到IPFS

echo "========================================"
echo "  ReplyAI Chrome Extension 部署脚本"
echo "========================================"
echo ""

# 工作目录
WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$WORK_DIR/dist"
ZIP_FILE="replyai-extension.zip"

echo "📁 工作目录: $WORK_DIR"

# 检查依赖
echo "🔍 检查依赖..."

if ! command -v ipfs &> /dev/null; then
    echo "❌ 未找到IPFS，请先安装:"
    echo "   https://docs.ipfs.io/install/"
    exit 1
fi

echo "✅ IPFS 已安装"

# 检查IPFS守护进程
if ! ipfs swarm peers &> /dev/null; then
    echo "⚠️  IPFS守护进程未运行，请先启动:"
    echo "   ipfs daemon"
    exit 1
fi

echo "✅ IPFS 守护进程运行中"

# 清理旧文件
echo "🧹 清理旧文件..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# 打包扩展文件
echo "📦 打包扩展文件..."

# 创建ZIP（排除不需要的文件）
cd "$WORK_DIR"
zip -r "$DIST_DIR/$ZIP_FILE" \
  manifest.json \
  popup.html popup.js popup.css \
  content.js \
  background.js \
  options.html options.js \
  icons/ \
  -x "*.sh" "*.md" "dist/*" "__MACOSX/*"

echo "✅ 扩展已打包: $DIST_DIR/$ZIP_FILE"

# 上传到IPFS
echo "🚀 上传到IPFS..."

# 上传ZIP文件
ZIP_HASH=$(ipfs add -Q "$DIST_DIR/$ZIP_FILE")
echo "✅ ZIP文件CID: $ZIP_HASH"

# 上传整个扩展目录
EXTENSION_HASH=$(ipfs add -r -Q "$WORK_DIR")
echo "✅ 扩展目录CID: $EXTENSION_HASH"

# 创建访问链接
echo ""
echo "========================================"
echo "🎉 部署完成!"
echo "========================================"
echo ""
echo "📦 扩展下载地址:"
echo "   IPFS: ipfs://$ZIP_HASH"
echo "   HTTP: https://ipfs.io/ipfs/$ZIP_HASH"
echo "   HTTP: https://gateway.pinata.cloud/ipfs/$ZIP_HASH"
echo ""
echo "📂 扩展目录地址:"
echo "   IPFS: ipfs://$EXTENSION_HASH"
echo "   HTTP: https://ipfs.io/ipfs/$EXTENSION_HASH"
echo ""

# 生成安装指南
cat > "$DIST_DIR/install-guide.md" << EOF
# ReplyAI 安装指南

## 下载地址

### IPFS下载
- https://ipfs.io/ipfs/$ZIP_HASH
- https://gateway.pinata.cloud/ipfs/$ZIP_HASH

## 安装步骤

### Chrome浏览器

1. 下载 replyai-extension.zip 文件
2. 解压ZIP文件到任意文件夹
3. 打开Chrome浏览器，访问 chrome://extensions/
4. 开启右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹
7. 完成！

### 配置使用

1. 点击扩展图标打开ReplyAI
2. 输入您的OpenAI API Key (sk-...)
3. 访问Gmail或Outlook，打开任意邮件
4. 点击"读取当前邮件" → "生成智能回复"
5. 点击"插入到邮件"完成

## 获取API Key

访问 https://platform.openai.com/api-keys

---
版本: 1.0.0 | CID: $EXTENSION_HASH
EOF

echo "📝 安装指南: $DIST_DIR/install-guide.md"
echo ""
echo "✨ 完成!"
