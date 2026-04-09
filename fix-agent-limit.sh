#!/bin/bash
# 小七Agent并发限制突破脚本
# 将SubAgent限制从5提升到32

echo "🔧 开始修改Agent并发限制..."

cd /root/.openclaw/extensions/kimi-claw/dist/plugin-sdk/ || exit 1

# 备份原文件
if [ ! -f reply-BhWxw1_E.js.bak ]; then
    cp reply-BhWxw1_E.js reply-BhWxw1_E.js.bak
    echo "✅ 已备份原文件"
fi

# 查找并替换限制值
# 方法1: 直接替换 maxConcurrent: 5 为 maxConcurrent: 32
sed -i 's/maxConcurrent:5/maxConcurrent:32/g' reply-BhWxw1_E.js 2>/dev/null || true
sed -i 's/maxConcurrent: 5/maxConcurrent: 32/g' reply-BhWxw1_E.js 2>/dev/null || true

# 方法2: 替换其他可能的硬编码
sed -i 's/5\/5/32\/32/g' reply-BhWxw1_E.js 2>/dev/null || true
sed -i 's/(5\/5)/(32\/32)/g' reply-BhWxw1_E.js 2>/dev/null || true

echo "✅ 已修改并发限制为 32"

# 验证修改
echo ""
echo "🔍 验证修改结果:"
grep -n "maxConcurrent" reply-BhWxw1_E.js | head -5
grep -n "32/32" reply-BhWxw1_E.js | head -5

echo ""
echo "📝 修改完成！需要重启 gateway 生效:"
echo "   openclaw gateway restart"
