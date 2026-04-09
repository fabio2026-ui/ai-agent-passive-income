#!/bin/bash
# 使用Kimi API启动AI Agent集群

echo "🚀 使用Kimi API启动AI Agent集群"
echo "================================"
echo ""

# 检查Kimi API Key
if [ -z "$AI_API_KEY" ] && [ -z "$KIMI_API_KEY" ]; then
    echo "⚠️  未检测到Kimi API Key"
    echo ""
    echo "获取Kimi API Key:"
    echo "1. 访问 https://platform.moonshot.cn/"
    echo "2. 登录并创建API Key"
    echo "3. 设置环境变量:"
    echo "   export AI_API_KEY='你的Kimi API Key'"
    echo ""
    exit 1
fi

# 设置Kimi配置
export AI_PROVIDER=${AI_PROVIDER:-kimi}
export AI_BASE_URL=${AI_BASE_URL:-https://api.moonshot.cn/v1}
export AI_MODEL=${AI_MODEL:-moonshot-v1-8k}

echo "✅ 配置确认:"
echo "  Provider: $AI_PROVIDER"
echo "  Model: $AI_MODEL"
echo "  Base URL: $AI_BASE_URL"
echo ""

# 测试Kimi连接
echo "🧪 测试Kimi API连接..."
node -e "
const AIProvider = require('./src/ai-provider.js');
const ai = new AIProvider({
  provider: process.env.AI_PROVIDER,
  apiKey: process.env.AI_API_KEY || process.env.KIMI_API_KEY,
  baseUrl: process.env.AI_BASE_URL,
  model: process.env.AI_MODEL
});

ai.generateContent('你好Kimi，请用一句话介绍自己')
  .then(r => {
    console.log('✅ Kimi连接成功!');
    console.log('响应:', r.substring(0, 100));
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ 连接失败:', e.message);
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Kimi API连接失败"
    echo "请检查API Key是否正确"
    exit 1
fi

echo ""
echo "🎯 启动AI Agent集群..."
node orchestrator.js