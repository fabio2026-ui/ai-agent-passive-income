#!/bin/bash
# OpenClaw 本地MoE模型一键部署脚本
# 自动安装Ollama、下载模型、配置OpenClaw

set -e

echo "========================================"
echo "🚀 OpenClaw 本地MoE模型部署脚本"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查系统
ARCH=$(uname -m)
OS=$(uname -s)
echo "📋 系统信息: $OS $ARCH"

# 第一步：安装Ollama
echo ""
echo "📦 步骤1: 安装Ollama"
echo "========================================"

if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✅ Ollama已安装${NC}"
    ollama --version
else
    echo "🔧 正在安装Ollama..."
    
    if [[ "$OS" == "Linux" ]]; then
        curl -fsSL https://ollama.com/install.sh | sh
    elif [[ "$OS" == "Darwin" ]]; then
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo -e "${RED}请先安装Homebrew: https://brew.sh${NC}"
            exit 1
        fi
    else
        echo -e "${RED}请手动下载安装: https://ollama.com/download${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Ollama安装完成${NC}"
fi

# 第二步：启动Ollama服务
echo ""
echo "📦 步骤2: 启动Ollama服务"
echo "========================================"

if pgrep -x "ollama" > /dev/null; then
    echo -e "${GREEN}✅ Ollama服务已在运行${NC}"
else
    echo "🔧 启动Ollama服务..."
    ollama serve &
    sleep 3
    
    if pgrep -x "ollama" > /dev/null; then
        echo -e "${GREEN}✅ Ollama服务启动成功${NC}"
    else
        echo -e "${RED}❌ Ollama服务启动失败${NC}"
        exit 1
    fi
fi

# 第三步：下载MoE模型
echo ""
echo "📦 步骤3: 下载MoE模型"
echo "========================================"

echo "请选择要下载的模型:"
echo "1) qwen3.5:cloud - 主力推荐（4GB，需8GB内存）"
echo "2) qwen3.5:0.6b - 轻量快速（1GB，需4GB内存）"
echo "3) qwen2.5:7b - 通用平衡（4GB，需8GB内存）"
echo "4) 全部下载（需要16GB+内存）"
echo ""

# 自动检测内存并推荐
MEM_GB=$(free -g | awk '/^Mem:/{print $2}')
if [[ -z "$MEM_GB" ]]; then
    MEM_GB=$(sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024/1024)}')
fi

echo "检测到内存: ${MEM_GB}GB"
echo ""

if [[ "$MEM_GB" -lt 8 ]]; then
    echo -e "${YELLOW}⚠️ 内存较小，推荐选择选项2${NC}"
    MODEL="qwen3.5:0.6b"
elif [[ "$MEM_GB" -lt 16 ]]; then
    echo -e "${GREEN}✅ 推荐选择选项1或3${NC}"
    MODEL="qwen3.5:cloud"
else
    echo -e "${GREEN}✅ 配置充足，可选择任意选项${NC}"
    MODEL="qwen3.5:cloud"
fi

echo ""
echo "正在下载模型: $MODEL"
echo "（这可能需要几分钟，取决于网络速度）"
echo ""

ollama pull $MODEL

echo -e "${GREEN}✅ 模型下载完成${NC}"
ollama list

# 第四步：测试模型
echo ""
echo "📦 步骤4: 测试模型"
echo "========================================"

echo "正在测试模型响应..."
echo "你好" | ollama run $MODEL --verbose 2>&1 | head -20

echo -e "${GREEN}✅ 模型测试完成${NC}"

# 第五步：生成OpenClaw配置
echo ""
echo "📦 步骤5: 生成OpenClaw配置"
echo "========================================"

CONFIG_DIR="$HOME/.openclaw"
CONFIG_FILE="$CONFIG_DIR/config.json"

echo "配置目录: $CONFIG_DIR"
echo "配置文件: $CONFIG_FILE"

# 备份原配置
if [[ -f "$CONFIG_FILE" ]]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
    echo "✅ 已备份原配置"
fi

# 创建配置目录
mkdir -p "$CONFIG_DIR"

# 生成配置
cat > "$CONFIG_FILE" << EOF
{
  "models": {
    "mode": "merge",
    "providers": {
      "ollama": {
        "baseUrl": "http://localhost:11434",
        "apiKey": "ollama-local",
        "api": "openai-completions",
        "models": [
          {
            "id": "$MODEL",
            "name": "Local $MODEL",
            "reasoning": false,
            "input": ["text"],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 128000,
            "maxTokens": 4096
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/$MODEL"
      }
    }
  }
}
EOF

echo -e "${GREEN}✅ 配置文件已生成${NC}"

# 第六步：设置环境变量
echo ""
echo "📦 步骤6: 设置环境变量"
echo "========================================"

SHELL_RC=""
if [[ "$SHELL" == *"bash"* ]]; then
    SHELL_RC="$HOME/.bashrc"
elif [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_RC="$HOME/.zshrc"
fi

if [[ -n "$SHELL_RC" && -f "$SHELL_RC" ]]; then
    if ! grep -q "OLLAMA_API_KEY" "$SHELL_RC"; then
        echo 'export OLLAMA_API_KEY="ollama-local"' >> "$SHELL_RC"
        echo -e "${GREEN}✅ 环境变量已添加到 $SHELL_RC${NC}"
    else
        echo "✅ 环境变量已存在"
    fi
else
    echo -e "${YELLOW}⚠️ 请手动添加环境变量: export OLLAMA_API_KEY=ollama-local${NC}"
fi

# 第七步：总结
echo ""
echo "========================================"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "========================================"
echo ""
echo "📋 总结:"
echo "  - Ollama: 已安装并运行"
echo "  - 模型: $MODEL 已下载"
echo "  - 配置: 已生成在 $CONFIG_FILE"
echo "  - 成本: ¥0/月 (本地运行)"
echo ""
echo "🚀 下一步:"
echo "  1. 重启 OpenClaw Gateway"
echo "     openclaw gateway restart"
echo ""
echo "  2. 验证连接"
echo "     openclaw model test"
echo ""
echo "  3. 开始使用本地模型"
echo "     所有对话将使用本地MoE模型，零Token消耗！"
echo ""
echo "📚 常用命令:"
echo "  ollama list      - 查看已安装模型"
echo "  ollama ps        - 查看运行状态"
echo "  ollama pull xxx  - 下载新模型"
echo ""
echo -e "${GREEN}✅ 部署脚本执行完毕！${NC}"
echo "========================================"
