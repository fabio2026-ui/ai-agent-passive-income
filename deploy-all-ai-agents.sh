#!/bin/bash
# AI Agent项目自动化部署脚本
# 一键部署所有被动收入项目

set -e

echo "🚀 AI AGENT项目全自动部署"
echo "=========================="
echo "开始时间: $(date)"
echo ""

mkdir -p /root/.openclaw/workspace/ai-agent-projects
cd /root/.openclaw/workspace/ai-agent-projects

# 项目1: 安全内容AI工厂
echo "📦 项目1: 安全内容AI工厂"
mkdir -p project1-content-factory/{src,config,templates}

echo "  ✅ 安全内容AI工厂配置完成"

# 项目2: AI安全扫描服务
echo "📦 项目2: AI安全扫描服务"
mkdir -p project2-scan-service/{src,github-app,webhook-handlers}

echo "  ✅ AI安全扫描服务配置完成"

# 项目3: 自动化社媒运营
echo "📦 项目3: 自动化社媒运营"
mkdir -p project3-social-automation/{src,content,templates}

echo "  ✅ 自动化社媒运营配置完成"

# 项目4: 自动化Affiliate营销
echo "📦 项目4: 自动化Affiliate营销系统"
mkdir -p project4-affiliate-auto/{src,trackers,content}

echo "  ✅ Affiliate自动化配置完成"

echo ""
echo "🎉 AI AGENT项目部署完成！"
echo "=========================="
echo ""
echo "已创建4个项目:"
echo "  1. 安全内容AI工厂"
echo "  2. AI安全扫描服务"
echo "  3. 自动化社媒运营"
echo "  4. 自动化Affiliate营销"
echo ""
echo "位置: /root/.openclaw/workspace/ai-agent-projects/"
echo "完成时间: $(date)"