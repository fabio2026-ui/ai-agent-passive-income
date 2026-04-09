#!/bin/bash
# ContentAI 快速部署脚本

echo "🚀 ContentAI 部署脚本"
echo "======================"

# 检查环境
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  需要设置 VERCEL_TOKEN 环境变量"
    echo "获取方式: npx vercel login && npx vercel tokens"
    exit 1
fi

# 部署到Vercel
echo "📦 部署到Vercel..."
npx vercel --token "$VERCEL_TOKEN" --prod --yes

echo "✅ 部署完成!"
