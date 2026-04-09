# Tech Scanner - Daily Cron Job
# 技术扫描机器人定时任务

## 添加定时任务

### 方法1: 使用系统cron
```bash
# 编辑crontab
crontab -e

# 添加以下行（每天上午9点执行）
0 9 * * * /root/.openclaw/workspace/skills/tech-scanner/daily-scan.sh >> /root/.openclaw/workspace/output/tech-scanner/cron.log 2>&1

# 或者使用OpenClaw的cron功能
```

### 方法2: OpenClaw Cron配置
```yaml
# 在OpenClaw配置中添加
cron_jobs:
  - name: "tech-scanner-daily"
    schedule: "0 9 * * *"
    command: "/root/.openclaw/workspace/skills/tech-scanner/daily-scan.sh"
    working_dir: "/root/.openclaw/workspace"
    output: "/root/.openclaw/workspace/output/tech-scanner/cron.log"
```

## 手动测试
```bash
# 立即执行一次扫描
/root/.openclaw/workspace/skills/tech-scanner/daily-scan.sh

# 检查结果
ls -la /root/.openclaw/workspace/output/tech-scanner/
```

## 通知配置

### Telegram通知
在脚本中添加:
```bash
# 发送报告到Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument" \
  -F "chat_id=${TELEGRAM_CHAT_ID}" \
  -F "document=@${REPORT_FILE}" \
  -F "caption=📡 今日技术扫描报告"
```

## 监控

### 检查cron是否正常运行
```bash
# 查看cron日志
tail -f /var/log/cron.log

# 查看最近一次运行
tail -20 /root/.openclaw/workspace/output/tech-scanner/cron.log
```

### 报告归档
- 每日报告保存在: `output/tech-scanner/report-YYYY-MM-DD.md`
- 保留最近30天的报告
- 自动清理旧报告
