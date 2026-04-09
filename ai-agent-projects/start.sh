#!/bin/bash
# AI Agent快速启动脚本
# 设置环境并启动所有项目

echo "🚀 AI AGENT快速启动"
echo "==================="
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# 检查环境变量
if [ -z "$CLAUDE_API_KEY" ]; then
    echo "⚠️  CLAUDE_API_KEY not set"
    echo ""
    echo "To get your API key:"
    echo "1. Visit https://console.anthropic.com/"
    echo "2. Create an account"
    echo "3. Generate API key"
    echo ""
    echo "Then run:"
    echo "export CLAUDE_API_KEY='your_key_here'"
    echo ""
    echo "Or create a .env file with your key"
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# 安装依赖
echo "📦 Installing dependencies..."
npm install --silent

# 运行测试
echo ""
echo "🧪 Running tests..."
node test-all.js

echo ""
echo "🎯 Starting AI Agent Orchestrator..."
echo "======================================"
node orchestrator.js

echo ""
echo "✅ AI Agents are running!"
echo "Monitor with: pm2 logs"