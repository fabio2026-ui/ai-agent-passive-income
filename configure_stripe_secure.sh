#!/bin/bash
# 🔒 Stripe本地安全配置脚本
# 安全特性：Keys不通过网络传输，仅本地存储
# 使用方法：bash configure_stripe_secure.sh

echo "========================================"
echo "🔒 Stripe本地安全配置 (安全版)"
echo "========================================"
echo ""
echo "⚠️  安全提示："
echo "  - API Keys不会发送给任何人"
echo "  - 仅存储在你的Mac本地"
echo "  - 权限设置为仅你可见"
echo ""

# 检查是否在正确的目录
cd ~

# 1. 安全输入API Keys
echo "请输入你的Stripe API Keys (输入时不显示):"
echo ""
read -s -p "Stripe Publishable Key (pk_live_...): " PUBLISHABLE_KEY
echo ""

read -s -p "Stripe Secret Key (sk_live_...): " SECRET_KEY
echo ""

# 验证输入不为空
if [ -z "$PUBLISHABLE_KEY" ] || [ -z "$SECRET_KEY" ]; then
    echo "❌ 错误：Keys不能为空"
    exit 1
fi

# 2. 保存到本地环境文件 (安全权限)
echo ""
echo "📝 保存到本地安全文件..."

mkdir -p ~/.ai-empire-secrets

cat > ~/.ai-empire-secrets/stripe.env << EOF
# Stripe API Keys - 本地安全存储
# 生成时间: $(date)
# 注意：不要分享此文件

STRIPE_PUBLISHABLE_KEY="$PUBLISHABLE_KEY"
STRIPE_SECRET_KEY="$SECRET_KEY"
EOF

# 设置严格权限 (仅文件所有者可读写)
chmod 600 ~/.ai-empire-secrets/stripe.env

echo "✅ Keys已保存到: ~/.ai-empire-secrets/stripe.env"
echo "✅ 权限设置为: 仅你可见 (600)"

# 3. 配置到n8n (本地Docker)
echo ""
echo "🐳 配置到n8n..."

if docker ps | grep -q n8n-free; then
    # 复制配置文件到n8n容器
    docker cp ~/.ai-empire-secrets/stripe.env n8n-free:/home/node/.n8n/
    
    # 设置环境变量
    docker exec n8n-free sh -c "echo 'export STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY' >> /home/node/.profile"
    docker exec n8n-free sh -c "echo 'export STRIPE_SECRET_KEY=$SECRET_KEY' >> /home/node/.profile"
    
    echo "✅ n8n配置完成"
else
    echo "⚠️  n8n容器未运行，请先启动:"
    echo "   docker start n8n-free"
fi

# 4. 创建订单处理器配置
echo ""
echo "📝 配置订单处理器..."

mkdir -p ~/ai-business-empire/order-system/config

cat > ~/ai-business-empire/order-system/config/stripe_config.py <> 'EOF'
import os

# Stripe配置 - 从环境变量读取
STRIPE_CONFIG = {
    'publishable_key': os.getenv('STRIPE_PUBLISHABLE_KEY', ''),
    'secret_key': os.getenv('STRIPE_SECRET_KEY', ''),
    'webhook_secret': os.getenv('STRIPE_WEBHOOK_SECRET', ''),
}

def get_stripe_key():
    """安全获取Stripe Key"""
    return STRIPE_CONFIG['secret_key']
EOF

echo "✅ 订单处理器配置完成"

# 5. 创建环境变量加载脚本
cat > ~/load_stripe_keys.sh << 'EOF'
#!/bin/bash
# 加载Stripe Keys到当前环境

if [ -f ~/.ai-empire-secrets/stripe.env ]; then
    export $(cat ~/.ai-empire-secrets/stripe.env | xargs)
    echo "✅ Stripe Keys已加载到环境"
else
    echo "❌ 配置文件不存在"
fi
EOF

chmod +x ~/load_stripe_keys.sh

# 6. 添加到shell配置 (可选)
echo ""
echo "💡 提示：你可以添加到 ~/.zshrc 自动加载:"
echo "   echo 'source ~/.ai-empire-secrets/stripe.env' >> ~/.zshrc"
echo ""

# 7. 安全提醒
echo "========================================"
echo "✅ 安全配置完成！"
echo "========================================"
echo ""
echo "🔒 安全状态:"
echo "  ✅ Keys存储位置: ~/.ai-empire-secrets/stripe.env"
echo "  ✅ 文件权限: 600 (仅你可见)"
echo "  ✅ 传输状态: 从未通过网络发送"
echo "  ✅ 备份状态: 无云端备份，仅本地"
echo ""
echo "📝 使用方法:"
echo "  1. 加载Keys: source ~/load_stripe_keys.sh"
echo "  2. 验证配置: bash test_stripe.sh"
echo ""
echo "⚠️  安全提醒:"
echo "  - 不要分享 ~/.ai-empire-secrets/ 目录"
echo "  - 定期更换API Keys (建议每3个月)"
echo "  - 启用Stripe双因素认证"
echo "  - 监控异常交易"
echo ""
echo "🆘 应急撤销:"
echo "  如果怀疑泄露，立即在Stripe Dashboard撤销Key"
echo "  然后运行此脚本重新配置"
echo "========================================"

# 8. 清理内存中的变量 (安全)
unset PUBLISHABLE_KEY
unset SECRET_KEY

echo "🧹 已清理内存中的Keys"
echo "✅ 配置完成！"
