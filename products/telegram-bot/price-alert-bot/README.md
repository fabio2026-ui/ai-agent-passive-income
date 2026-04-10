# Telegram Price Alert Bot
# 小七团队开发

## 功能
- 监控商品价格变化
- 价格达到目标时自动通知
- 免费版: 3个监控/24小时检查
- Pro版: 50个监控/1小时检查 (€5/月)

## 部署步骤

### 1. 创建 Bot
1. 在 Telegram 搜索 @BotFather
2. 发送 /newbot
3. 设置名称和用户名
4. 保存 Token

### 2. 环境配置
```bash
export TELEGRAM_BOT_TOKEN='your_bot_token_here'
```

### 3. 安装依赖
```bash
pip install -r requirements.txt
```

### 4. 运行
```bash
python bot.py
```

## 定价
- Free: €0 (3监控)
- Pro: €5/月 (50监控)

## 收入预测
- 100用户 × €5 = €500/月
- 500用户 × €5 = €2,500/月
