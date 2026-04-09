# mail.tm API 使用文档

## 📋 概览

| 项目 | 值 |
|------|-----|
| 邮箱地址 | `ai_67dd6c1a002c@sharebot.net` |
| 域名 | `sharebot.net` |
| API 基础地址 | `https://api.mail.tm` |
| 账户ID | `69beb6c7e56dbb95a90f24cf` |

---

## 🔐 认证信息

### JWT Token
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3NzQxMDYzMTgsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJhZGRyZXNzIjoiYWlfNjdkZDZjMWEwMDJjQHNoYXJlYm90Lm5ldCIsImlkIjoiNjliZWI2YzdlNTZkYmI5NWE5MGYyNGNmIiwibWVyY3VyZSI6eyJzdWJzY3JpYmUiOlsiL2FjY291bnRzLzY5YmViNmM3ZTU2ZGJiOTVhOTBmMjRjZiJdfX0.i542sJaJ3UGtP_6edTjCmDKqc0fd50IocvGiRCQTXrDC4OLl8A02D3RIEhH6Fur3tTzg8rxnaPDI1yK4MMvl3A
```

### 请求头格式
```bash
Authorization: Bearer <TOKEN>
Content-Type: application/json
Accept: application/ld+json
```

---

## 🚀 快速开始

### 1. 检查新邮件
```bash
/root/.openclaw/workspace/scripts/mailtm.sh check
```

### 2. 列出所有邮件
```bash
/root/.openclaw/workspace/scripts/mailtm.sh list
```

### 3. 读取指定邮件
```bash
/root/.openclaw/workspace/scripts/mailtm.sh read <message_id>
```

### 4. 持续监控
```bash
/root/.openclaw/workspace/scripts/mailtm.sh watch
```

---

## 📡 API 端点

### 获取域名列表
```bash
GET https://api.mail.tm/domains
```

### 创建账户
```bash
POST https://api.mail.tm/accounts
Content-Type: application/json

{
  "address": "your_email@domain.com",
  "password": "your_password"
}
```

### 获取 Token
```bash
POST https://api.mail.tm/token
Content-Type: application/json

{
  "address": "your_email@domain.com",
  "password": "your_password"
}
```

### 获取邮件列表
```bash
GET https://api.mail.tm/messages
Authorization: Bearer <TOKEN>
```

### 获取邮件详情
```bash
GET https://api.mail.tm/messages/{id}
Authorization: Bearer <TOKEN>
```

### 删除邮件
```bash
DELETE https://api.mail.tm/messages/{id}
Authorization: Bearer <TOKEN>
```

### 获取账户信息
```bash
GET https://api.mail.tm/me
Authorization: Bearer <TOKEN>
```

---

## 📁 配置文件

配置文件位置：`/root/.openclaw/workspace/config/mailtm/credentials.conf`

```bash
EMAIL=ai_67dd6c1a002c@sharebot.net
PASSWORD=***加密***
TOKEN=***JWT Token***
API_BASE=https://api.mail.tm
DOMAIN=sharebot.net
```

---

## 🔧 脚本命令

| 命令 | 说明 |
|------|------|
| `check` | 检查一次新邮件 |
| `list` | 列出所有邮件 |
| `read <id>` | 读取指定邮件详情 |
| `delete <id>` | 删除指定邮件 |
| `watch` | 持续监控（每30秒） |
| `token` | 刷新 JWT Token |
| `help` | 显示帮助 |

---

## 🔔 系统通知集成

### 检查并通知
```bash
/root/.openclaw/workspace/scripts/mailtm_notify.sh check
```

### 发送测试通知
```bash
/root/.openclaw/workspace/scripts/mailtm_notify.sh test
```

---

## 📝 示例代码

### Bash 完整示例
```bash
#!/bin/bash

# 配置
TOKEN="your_jwt_token"
API_BASE="https://api.mail.tm"

# 获取邮件列表
curl -s "${API_BASE}/messages" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/ld+json" | jq '.'

# 获取单封邮件
curl -s "${API_BASE}/messages/message_id_here" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/ld+json" | jq '.'
```

### Python 示例
```python
import requests

API_BASE = "https://api.mail.tm"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/ld+json"
}

# 获取邮件列表
response = requests.get(f"{API_BASE}/messages", headers=headers)
messages = response.json()

for msg in messages.get("hydra:member", []):
    print(f"From: {msg['from']['address']}")
    print(f"Subject: {msg['subject']}")
    print(f"Preview: {msg['intro']}")
    print("-" * 40)
```

### JavaScript/Node.js 示例
```javascript
const axios = require('axios');

const API_BASE = 'https://api.mail.tm';
const TOKEN = 'your_jwt_token';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Accept': 'application/ld+json'
};

// 获取邮件列表
async function getMessages() {
  const response = await axios.get(`${API_BASE}/messages`, { headers });
  return response.data['hydra:member'];
}

getMessages().then(messages => {
  messages.forEach(msg => {
    console.log(`From: ${msg.from.address}`);
    console.log(`Subject: ${msg.subject}`);
    console.log('---');
  });
});
```

---

## ⚠️ 注意事项

1. **Token 过期**: JWT Token 可能会过期，使用 `./mailtm.sh token` 刷新
2. **隐私保护**: 配置文件包含敏感信息，已设置权限 `600`
3. **存储限制**: 每个账户配额 40MB
4. **邮件保留**: 邮件保留时间可能有限，重要邮件请及时处理
5. **API 限制**: 请合理使用 API，避免频繁请求

---

## 🔗 相关链接

- mail.tm 官网: https://mail.tm
- API 文档: https://api.mail.tm/docs

---

**生成时间**: 2026-03-21  
**版本**: 1.0
