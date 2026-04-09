# 🔧 OpenClaw 连接问题排查与修复指南

========================================
🔍 当前系统状态诊断
========================================

## 1. Gateway 状态
✅ OpenClaw Gateway: 运行正常
✅ 端口: 18789
✅ 认证: Token模式

## 2. 浏览器控制状态
✅ Chrome Profile: 运行中 (端口18792)
✅ OpenClaw Profile: 待命 (端口18800)
❌ 活跃标签页: 0 (没有连接的页面)
❌ Tailscale模式: OFF

## 3. 节点状态
❌ 无配对节点

========================================
🎯 可能的连接方式回顾
========================================

根据你的描述，之前能控制浏览器，可能是：

### 方式A: Chrome浏览器扩展 (最可能)
- 你在Chrome安装了OpenClaw Browser Relay扩展
- 点击扩展图标"Attach Tab"绑定标签页
- 我通过CDP协议控制该标签页

### 方式B: 本地节点配对
- 你的Mac运行OpenClaw节点
- 节点与Gateway配对连接
- 通过节点执行浏览器操作

### 方式C: Python控制服务器
- 你运行的ai_secure_v2.py
- 通过Tailscale Funnel连接
- 但这是服务器端，不是浏览器控制

========================================
🔧 解决方案
========================================

## 方案1: 重新连接Chrome扩展 (推荐)

### 步骤1: 检查扩展是否安装
1. 打开Chrome浏览器
2. 点击右上角拼图图标（扩展程序）
3. 查找"OpenClaw Browser Relay"
4. 如果没有，需要重新安装

### 步骤2: 连接标签页
1. 打开你想控制的网页（如Fiverr）
2. 点击OpenClaw扩展图标
3. 点击"Attach Tab"或"Connect"
4. 扩展图标变绿/显示ON
5. 告诉我"已连接"

### 步骤3: 验证连接
我会执行测试：
```
browser action=snapshot profile=chrome
```
如果能获取页面内容，说明连接成功！

---

## 方案2: 启用Tailscale模式

### 检查Tailscale状态
```bash
# 在你的Mac上执行
tailscale status
tailscale funnel status
```

### 重新启用Funnel
```bash
# 如果之前配置了Funnel
tailscale funnel 9999
```

### 配置OpenClaw使用Tailscale
```bash
# 编辑配置文件
nano ~/.openclaw/openclaw.json

# 修改gateway部分:
"tailscale": {
  "mode": "on",
  "resetOnExit": false
}
```

---

## 方案3: 节点配对方式

### 在Mac上安装OpenClaw节点
```bash
# 安装OpenClaw
npm install -g openclaw

# 配置节点
openclaw node configure

# 获取配对码
openclaw node pair
```

### 在服务器上配对
```bash
openclaw node approve <配对码>
```

========================================
⚡ 快速诊断命令
========================================

## 在你的Mac上执行：

```bash
# 1. 检查Chrome扩展
ls ~/Library/Application\ Support/Google/Chrome/Default/Extensions/ | grep -i openclaw

# 2. 检查OpenClaw安装
which openclaw
openclaw version

# 3. 检查Tailscale
tailscale status

# 4. 检查端口占用
lsof -i :18789
lsof -i :18792
lsof -i :9999
```

========================================
🚀 立即执行
========================================

## 第一步：告诉我现状
回复以下信息：

1. **Chrome扩展**: 
   - 工具栏有没有OpenClaw图标？
   - 点击后显示什么？

2. **Tailscale**:
   - 运行 `tailscale status` 输出什么？

3. **OpenClaw节点**:
   - 运行 `openclaw version` 有输出吗？

## 第二步：根据情况选择方案

- **有扩展图标** → 方案1: 重新Attach
- **无扩展但有Tailscale** → 方案2: 启用Funnel  
- **都没有** → 方案3: 安装节点

========================================
💡 临时方案
========================================

如果暂时无法恢复浏览器控制，我可以：

1. **通过服务器执行任务**
   - 所有文件管理、脚本执行正常
   - 只是不能控制你的Mac浏览器

2. **指导你手动操作**
   - 我发指令，你执行
   - 配合截图确认

3. **Python控制服务器**
   - 你运行的ai_secure_v2.py
   - 可以执行服务器端命令

========================================
📞 现在行动
========================================

**回复以下之一：**

**"扩展在"** → 我指导你重新Attach

**"看Tailscale"** → 你给我tailscale status输出

**"都没有"** → 我指导安装节点

**"先手动"** → 暂时手动操作，稍后修复

**选哪个？** 🔧
========================================
