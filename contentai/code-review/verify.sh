#!/bin/bash

# 部署前验证脚本

echo "========================================"
echo "ContentAI Code Review 部署验证"
echo "========================================"
echo ""

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() { echo -e "${GREEN}✅${NC} $1"; }
check_fail() { echo -e "${RED}❌${NC} $1"; }
check_warn() { echo -e "${YELLOW}⚠️${NC} $1"; }

ERRORS=0

# 检查必要文件
echo "📁 检查文件..."
if [ -f "index.html" ]; then
    check_pass "index.html 存在"
    SIZE=$(ls -lh index.html | awk '{print $5}')
    LINES=$(wc -l < index.html)
    echo "   📄 大小: $SIZE, 行数: $LINES"
else
    check_fail "index.html 不存在"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "README.md" ]; then
    check_pass "README.md 存在"
else
    check_warn "README.md 不存在"
fi

# 检查HTML结构
echo ""
echo "🔍 检查HTML结构..."
if grep -q "<!DOCTYPE html>" index.html; then
    check_pass "DOCTYPE声明正确"
else
    check_fail "缺少DOCTYPE声明"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "<title>" index.html; then
    check_pass "标题标签存在"
else
    check_fail "缺少标题标签"
    ERRORS=$((ERRORS + 1))
fi

# 检查关键JavaScript函数
echo ""
echo "🔧 检查JavaScript功能..."
JS_FUNCTIONS=("startReview" "parseRepoUrl" "fetchRepoFiles" "callAI" "runMultiAgentReview")
for func in "${JS_FUNCTIONS[@]}"; do
    if grep -q "function $func\|async function $func" index.html; then
        check_pass "函数 $func 存在"
    else
        check_fail "函数 $func 不存在"
        ERRORS=$((ERRORS + 1))
    fi
done

# 检查API调用
echo ""
echo "🌐 检查API配置..."
if grep -q "api.moonshot.cn" index.html; then
    check_pass "Moonshot API配置正确"
else
    check_fail "缺少Moonshot API配置"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "api.github.com" index.html; then
    check_pass "GitHub API配置正确"
else
    check_fail "缺少GitHub API配置"
    ERRORS=$((ERRORS + 1))
fi

# 检查Agent定义
echo ""
echo "🤖 检查多Agent系统..."
AGENTS=("agent-architect" "agent-security" "agent-performance" "agent-quality" "agent-bug" "agent-summary")
for agent in "${AGENTS[@]}"; do
    if grep -q "id=\"$agent\"" index.html; then
        check_pass "Agent $agent 已定义"
    else
        check_fail "Agent $agent 未定义"
        ERRORS=$((ERRORS + 1))
    fi
done

# 检查结果
echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！${NC}"
    echo ""
    echo "🚀 准备就绪，可以部署！"
    echo ""
    echo "部署方式:"
    echo "  1. GitHub Pages: push到gh-pages分支"
    echo "  2. IPFS: 使用deploy.sh脚本"
    echo "  3. Netlify: 拖放index.html到app.netlify.com/drop"
    echo ""
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS 个问题${NC}"
    echo "请先修复问题后再部署"
    exit 1
fi
