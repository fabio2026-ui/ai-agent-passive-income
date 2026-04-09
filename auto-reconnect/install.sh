#!/bin/bash
# 断线自动重连守护进程 - 安装脚本

set -e

echo "========================================="
echo "断线自动重连守护进程 - 安装脚本"
echo "========================================="

# 创建目录
echo "[1/6] 创建目录..."
mkdir -p /etc/auto-reconnect
mkdir -p /var/lib/auto-reconnect
mkdir -p /var/log
mkdir -p /usr/local/bin

# 复制文件
echo "[2/6] 安装主程序..."
cp auto-reconnect/daemon.py /usr/local/bin/auto-reconnect-daemon
chmod +x /usr/local/bin/auto-reconnect-daemon

# 复制配置
echo "[3/6] 安装配置文件..."
cp auto-reconnect/config.json /etc/auto-reconnect/config.json
chmod 644 /etc/auto-reconnect/config.json

# 安装systemd服务
echo "[4/6] 安装systemd服务..."
cp auto-reconnect/auto-reconnect.service /etc/systemd/system/
chmod 644 /etc/systemd/system/auto-reconnect.service

# 重载systemd
echo "[5/6] 重载systemd..."
systemctl daemon-reload

# 设置权限
echo "[6/6] 设置权限..."
touch /var/log/auto-reconnect.log
chmod 644 /var/log/auto-reconnect.log

# 创建README
cat > /etc/auto-reconnect/README.md << 'EOF'
# 断线自动重连守护进程

## 功能
- 每分钟检测系统连接状态
- 自动重连策略
- 重连失败时发送邮件通知
- 备用通道和完全模式

## 命令

```bash
# 启动服务
systemctl start auto-reconnect

# 停止服务
systemctl stop auto-reconnect

# 查看状态
systemctl status auto-reconnect

# 查看日志
journalctl -u auto-reconnect -f

# 开机自启
systemctl enable auto-reconnect
```

## 日志
- 主日志: /var/log/auto-reconnect.log
- 状态文件: /var/lib/auto-reconnect/state.json

## 配置
配置文件: /etc/auto-reconnect/config.json
EOF

echo ""
echo "========================================="
echo "安装完成!"
echo "========================================="
echo ""
echo "启动命令: systemctl start auto-reconnect"
echo "开机自启: systemctl enable auto-reconnect"
echo "查看日志: journalctl -u auto-reconnect -f"
echo ""
