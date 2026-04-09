# 🤖 Mac机器人协作系统说明

========================================
🎯 当前可协作的方式
========================================

## 方式1: Python控制服务器 (端口9999)

你的Mac运行着 `ai_secure_v2.py`，我已经可以通过Tailscale连接它。

### 我能做的：
```bash
# 通过API调用执行命令
curl -H "X-Auth-Token: Fabio_Secure_999" \
     https://fabiomacbook-air.tail284095.ts.net:9999/execute \
     -d '{"command": "ls ~/ai-empire/"}'
```

### 实际应用：
- ✅ 让Mac执行脚本
- ✅ 下载/处理文件
- ✅ 渲染视频
- ✅ 检查系统状态

---

## 方式2: OpenClaw节点系统 (需要配对)

你的Mac可以作为一个"节点"注册到OpenClaw Gateway。

### 设置步骤：

**Mac端（你执行）：**
```bash
# 1. 启动节点
openclaw node start

# 2. 获取配对码
openclaw node pair
# 输出: Pairing code: ABC123
```

**服务器端（我执行）：**
```bash
# 3. 批准配对
openclaw node approve ABC123

# 4. 现在可以通过节点控制Mac
openclaw node run fabiomacbook-air -- ls ~/ai-empire/
```

### 配对后我能做的：
- ✅ 执行任意Mac命令
- ✅ 访问Mac文件系统
- ✅ 启动/停止Mac上的程序
- ✅ 摄像头/屏幕（如果允许）

---

## 方式3: 定时任务 (Cron)

在Mac上设置定时任务，让机器人自动运行。

### 设置方式：
```bash
# 编辑crontab
crontab -e

# 添加定时任务
0 9 * * * bash ~/ai-empire/scripts/daily-tasks.sh
0 */2 * * * bash ~/ai-empire/scripts/monitor-health.sh
```

### 机器人自动运行：
- ✅ 每天自动投标
- ✅ 每小时检查系统
- ✅ 自动备份数据

========================================
🤖 6大机器人当前状态
========================================

| 机器人 | 位置 | 状态 | 协作方式 |
|--------|------|------|----------|
| CodeSoldier | 服务器 | ✅ 运行 | 直接控制 |
| VideoCraftsman | 服务器 | ✅ 待命 | 直接控制 |
| WriterBot | 服务器 | ✅ 运行 | 直接控制 |
| IntelAnalyst | 服务器 | ✅ 待命 | 直接控制 |
| TestHound | 服务器 | ✅ 待命 | 直接控制 |
| MedicBot | 服务器 | ✅ 运行 | 直接控制 |

**Mac端机器人：**
- ai_secure服务器 ✅ 运行中 (端口9999)
- 待部署: 节点客户端 (需要配对)

========================================
⚡ 立即建立协作
========================================

## 方案A: 通过Python服务器 (已可用)

**你现在可以执行：**
```bash
# 告诉ai_secure执行我的脚本
curl -H "X-Auth-Token: Fabio_Secure_999" \
  https://fabiomacbook-air.tail284095.ts.net:9999/execute \
  -d '{"command": "bash ~/ai-empire/scripts/video-renderer.sh"}'
```

**我会生成任务脚本，你一键执行。**

---

## 方案B: 节点配对 (推荐，恢复完整控制)

**步骤：**
1. 你在Mac执行: `openclaw node pair`
2. 发我配对码
3. 我 approve
4. 之后我可以直接命令Mac机器人

---

## 方案C: 混合模式 (最实用)

**服务器机器人:**
- 负责内容生成、策略分析
- 在服务器运行，不依赖Mac

**Mac机器人 (通过Python服务器):**
- 负责执行渲染、文件操作
- 你一键触发，自动完成

========================================
🎯 现在怎么选？
========================================

**回复：**

**"配对"** → 你给我配对码，2分钟后恢复完整控制

**"用Python服务器"** → 我生成命令脚本，你一键执行

**"演示"** → 我先演示一个任务，看看协作效果

**选哪个？** 🤖
========================================
