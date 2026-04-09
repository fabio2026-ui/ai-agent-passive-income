#!/bin/bash
# MCP Server Installation Script
# 自动安装MCP工具，扩展AI能力

echo "Installing MCP Servers..."

# 1. Filesystem MCP - 文件系统访问
npm install -g @modelcontextprotocol/server-filesystem 2>/dev/null || echo "Filesystem MCP already installed"

# 2. GitHub MCP - GitHub操作
npm install -g @modelcontextprotocol/server-github 2>/dev/null || echo "GitHub MCP already installed"

# 3. Web Search MCP - 搜索能力
npm install -g @modelcontextprotocol/server-brave-search 2>/dev/null || echo "Brave Search MCP already installed"

# 4. Memory MCP - 长期记忆
npm install -g @modelcontextprotocol/server-memory 2>/dev/null || echo "Memory MCP already installed"

echo "MCP Servers installed!"
echo "Next: Configure in openclaw.json"
