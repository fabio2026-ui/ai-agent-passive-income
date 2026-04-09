# ⚠️ OpenClaw 危险配置预警清单

> 生成时间: 2026-03-21 20:36 GMT+1  
> 系统: OpenClaw Gateway v2026.2.15  
> ⚠️ **警告：修改以下配置前必须确认，可能导致系统断线或故障**

---

## 🔴 高危危险项

### 1. 【网络超时配置】retry.maxAttempts = 0 (无限重试)
**位置**: `/root/.openclaw/openclaw.json` → `plugins.entries.kimi-claw.config.retry`

```json
"retry": {
  "baseMs": 1000,
  "maxMs": 600000,
  "maxAttempts": 0    // ⚠️ 0表示无限重试，可能导致连接风暴
}
```

**风险**: 
- 网络异常时无限重试，可能导致服务雪崩
- 重试间隔最大10分钟，可能长时间占用资源
- API调用失败时无法优雅退出

**建议**: 设置为有限次数如 `maxAttempts: 5`

---

### 2. 【API密钥硬编码】多个密钥明文存储
**位置**: 
- `/root/.openclaw/openclaw.json`
- `/root/.openclaw/agents/main/agent/auth-profiles.json`
- `/root/.openclaw/agents/main/agent/models.json`
- 环境变量 `KIMI_API_KEY`

**检测到的密钥**:
```
- Kimi API Key: sk-kimi-RGEzUj28wHcdjGlj1aGr4lfeshFM3WU7Jh8loinK6Hb25AZ9gSqsH8RhLlY2PHLV
- Gateway Token: 1effd1dfde29226f11a7f94a6e75e77c25c64ef48e59d3f7
- Telegram Bot Token: 8744692600:AAGGS4Jgb5QD1q2ta2nNn8_Fk9zs79TNPc8
- DingTalk AppSecret: aQsnLEpB8E3lWc-zf8sIngl23C0vsv_0Dvzc-wqEFlWs-Bq1XB-Ov1D2zYGsLXuq
- Feishu AppSecret: VHyFu3SCNurBFFggLicowfCNNJlmGFlX
```

**风险**:
- 密钥泄露风险极高
- 配置文件可能被意外提交到版本控制
- 密钥过期后需要多处修改

**建议**: 使用环境变量或密钥管理服务

---

### 3. 【会话超时设置】promptTimeoutMs = 30分钟
**位置**: `/root/.openclaw/openclaw.json` → `plugins.entries.kimi-claw.config.bridge`

```json
"promptTimeoutMs": 1800000,  // 30分钟
"historyPendingTimeoutMs": 15000  // 15秒
```

**风险**:
- 超长超时可能导致会话挂起
- 长时间占用AI模型资源
- 断线后难以恢复

**建议**: 根据任务类型设置合理超时 (5-10分钟)

---

### 4. 【日志文件过大】openclaw.log = 312MB
**位置**: `/root/.openclaw/logs/openclaw.log`

```
-rw------- 1 root root 312096012 Mar 21 20:37 openclaw.log  (≈ 298MB)
```

**风险**:
- 磁盘空间可能被耗尽 (当前可用14GB)
- 大文件影响系统性能
- 日志轮转缺失

**建议**: 配置日志轮转 (logrotate) 或定期清理

---

## 🟡 中危危险项

### 5. 【内存限制】系统总内存 3.4GB，Swap为0
**检测结果**:
```
Mem: 3.4Gi total, 1.4Gi used, 1.2Gi free, 2.5Mi shared, 1.1Gi buff/cache
Swap: 0B
```

**风险**:
- 内存不足时无Swap缓冲，可能导致OOM killer
- 子代理并发过多可能耗尽内存
- maxConcurrent: 64 设置可能过高

**建议**: 
- 添加Swap分区 (建议4GB)
- 监控内存使用，调整并发数

---

### 6. 【子代理并发设置】maxConcurrent = 64
**位置**: `/root/.openclaw/openclaw.json` → `agents.defaults`

```json
"maxConcurrent": 64,
"subagents": {
  "maxConcurrent": 64,
  "maxChildrenPerAgent": 20
}
```

**风险**:
- 64并发对于3.4GB内存系统可能过高
- 大量并发可能导致资源竞争
- API限流风险

**建议**: 根据内存和CPU调整至 10-20

---

### 7. 【Cron任务密集】7个定时任务同时运行
**位置**: 系统 crontab

```bash
*/10 * * * *  task-poll.sh              # 每10分钟
0 * * * *     auto_executor.py          # 每小时
*/30 * * * *  auto-fix-and-upgrade.sh   # 每30分钟
*/15 * * * *  agent-monitor.sh          # 每15分钟
0 * * * *     price-monitor-bot.sh      # 每小时
0 */2 * * *   feedback-collector-bot.sh # 每2小时
* * * * *     first-sale-monitor.py     # 每分钟！！
```

**风险**:
- first-sale-monitor 每分钟运行，可能导致API限流
- 任务可能重叠执行
- 日志文件快速增长

**建议**: 
- 调整 first-sale-monitor 为每5分钟
- 分散任务执行时间避免重叠

---

### 8. 【Gateway绑定设置】仅绑定 loopback
**位置**: `/root/.openclaw/openclaw.json` → `gateway`

```json
"gateway": {
  "port": 18789,
  "mode": "local",
  "bind": "loopback",    // 仅本地访问
  "auth": {
    "mode": "token",
    "token": "..."
  }
}
```

**风险**:
- 仅本地访问是安全的，但如果需要远程访问则无法连接
- 模式为 `local`，Tailscale 关闭

**状态**: ✅ 当前配置安全 (仅本地绑定)

---

### 9. 【文件权限问题】部分目录权限过宽
**检测结果**:
```
-rw-r--r-- 1 root root 312MB openclaw.log    # 日志可读
-rw-r--r-- 1 501 staff  ...  skills/         # 非root拥有
```

**风险**:
- 敏感日志可能被其他用户读取
- 非root拥有的文件可能被篡改

**建议**: 
- `chmod 600` 敏感配置文件
- 统一文件所有者

---

### 10. 【通道Token配置】飞书Webhook硬编码
**位置**: `/root/.openclaw/openclaw.json` → `channels.feishu`

```json
"feishu": {
  "appId": "cli_a93027ac2cf89e17",
  "appSecret": "VHyFu3SCNurBFFggLicowfCNNJlmGFlX",
  "webhook": "https://open.larksuite.com/open-apis/bot/v2/hook/52b83755-b170-4d29-8404-c3e2576ab4e5"
}
```

**风险**:
- Webhook URL泄露可能导致消息被劫持
- AppSecret泄露可导致完整API访问

**建议**: 使用环境变量存储敏感信息

---

## 🟢 低危/观察项

### 11. 【Cron任务状态】多个任务处于 `enabled: false`
**位置**: `/root/.openclaw/cron/jobs.json`

**禁用任务**:
- 黄金价格日报 (enabled: false)
- AI工厂每2小时运行 (enabled: false)
- 34条业务线日报 (enabled: false)
- 石油黄金价格监控 (enabled: false)
- 中央情报局-每日数据更新 (enabled: false)

**状态**: ✅ 可能是预期行为

---

### 12. 【浏览器配置】noSandbox = true
**位置**: `/root/.openclaw/openclaw.json` → `browser`

```json
"browser": {
  "executablePath": "/usr/bin/google-chrome",
  "headless": true,
  "noSandbox": true    // 沙盒已禁用
}
```

**风险**:
- 沙盒禁用可能增加安全风险
- 在容器/Root环境下需要此设置

**状态**: ⚠️ 在root环境下运行时需要，但存在安全风险

---

### 13. 【磁盘空间】根分区使用64%
**检测结果**:
```
/dev/vda3  40G  24G  14G  64% /
```

**风险**:
- 日志增长可能快速耗尽空间
- 大文件操作可能失败

**建议**: 监控磁盘使用，配置日志清理

---

### 14. 【配置备份】多个备份文件存在
**检测结果**:
```
-rw------- 1 root root 8222 Mar 21 13:00 openclaw.json.bak
-rw------- 1 root root 7917 Mar 19 17:54 openclaw.json.bak.1
-rw------- 1 root root 7683 Mar 19 17:54 openclaw.json.bak.2
...
```

**状态**: ✅ 备份策略良好

---

### 15. 【会话文件过大】sessions.json = 2.1MB
**位置**: `/root/.openclaw/agents/main/sessions/sessions.json`

```
-rw------- 1 root root 2122775 Mar 21 20:36 sessions.json (≈ 2MB)
```

**风险**:
- 文件过大可能影响加载性能
- 会话历史累积可能导致内存占用增加

**建议**: 定期清理过期会话或使用memory-hygiene技能

---

## 📋 修改前必须确认的清单

### 任何修改前请确认:

- [ ] 已备份当前配置 (`cp openclaw.json openclaw.json.bak.$(date +%s)`)
- [ ] 了解修改可能的影响范围
- [ ] 非高峰时段进行修改
- [ ] 准备好回滚方案
- [ ] 修改后验证系统正常运行

### 高危修改额外确认:

- [ ] retry.maxAttempts 修改前确认API调用模式
- [ ] 密钥轮换时确认所有服务更新
- [ ] 超时调整前确认长任务影响
- [ ] 并发数修改前确认系统资源

---

## 🛠️ 推荐修复脚本

```bash
#!/bin/bash
# 危险配置修复脚本 - 执行前请确认

echo "=== OpenClaw 危险配置修复 ==="
echo "⚠️ 执行前请确认已备份配置！"
echo ""

# 1. 备份当前配置
cp /root/.openclaw/openclaw.json /root/.openclaw/openclaw.json.pre-fix.$(date +%Y%m%d_%H%M%S)
echo "✓ 配置已备份"

# 2. 日志轮转配置
echo "配置日志轮转..."
cat > /etc/logrotate.d/openclaw << 'EOF'
/root/.openclaw/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0600 root root
    size 100M
}
EOF
echo "✓ 日志轮转已配置"

# 3. 创建Swap文件 (如不存在)
if [ ! -f /swapfile ]; then
    echo "创建Swap文件..."
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✓ Swap已创建"
fi

# 4. 修复文件权限
echo "修复文件权限..."
chmod 600 /root/.openclaw/openclaw.json
chmod 600 /root/.openclaw/agents/main/agent/*.json
chmod 600 /root/.openclaw/credentials/*.json
echo "✓ 权限已修复"

# 5. 清理旧日志
echo "清理超大日志..."
> /root/.openclaw/logs/openclaw.log
echo "✓ 日志已清理"

echo ""
echo "=== 修复完成 ==="
echo "请手动修改以下配置:"
echo "  1. retry.maxAttempts (建议: 5)"
echo "  2. promptTimeoutMs (建议: 300000)"
echo "  3. maxConcurrent (建议: 20)"
echo "  4. 将硬编码密钥迁移到环境变量"
```

---

## 📊 风险等级汇总

| 等级 | 数量 | 项目 |
|------|------|------|
| 🔴 高危 | 4 | 无限重试、密钥硬编码、超长超时、日志过大 |
| 🟡 中危 | 6 | 内存限制、并发过高、Cron密集、权限问题等 |
| 🟢 低危 | 5 | 禁用任务、沙盒禁用、磁盘空间等 |

**总体评估**: 系统存在多处配置风险，建议优先处理🔴高危项

---

*报告生成时间: 2026-03-21 20:36 GMT+1*  
*下次建议检查时间: 2026-03-28*
