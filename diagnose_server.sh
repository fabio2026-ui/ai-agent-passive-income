#!/bin/bash
# 🔍 Python服务器诊断脚本
# 保存为 diagnose.sh

echo "========================================"
echo "🩺 Python服务器诊断"
echo "时间: $(date)"
echo "========================================"

echo ""
echo "1. 检查进程状态..."
ps aux | grep ai_secure | grep -v grep

echo ""
echo "2. 检查端口监听..."
lsof -i :9999

echo ""
echo "3. 测试本地连接..."
curl -s -X POST -H "X-Auth-Token: Fabio_Secure_999" \
  http://127.0.0.1:9999/execute \
  -d '{"command":"echo test"}'

echo ""
echo "4. 检查ai_secure_v2.py是否存在..."
ls -la ~/ai_secure_v2.py 2>&1 || echo "文件不存在"

echo ""
echo "5. 检查文件内容前30行..."
head -30 ~/ai_secure_v2.py 2>&1 || echo "无法读取"

echo ""
echo "========================================"
echo "诊断完成"
echo "========================================"
