# JWT安全最佳实践完整指南

## 简介
JWT(JSON Web Token)是现代API认证的标配，但使用不当会导致严重安全漏洞。

## JWT结构
```
Header.Payload.Signature
```

## 安全最佳实践

### 1. 使用强签名算法
❌ 避免: none, HS256 (对称密钥)
✅ 推荐: RS256, ES256 (非对称密钥)

### 2. 密钥管理
- 使用足够长的密钥(256位+)
- 定期轮换密钥
- 密钥存储在环境变量/密钥管理服务

### 3. Token过期策略
```json
{
  "exp": 1234567890,
  "iat": 1234567800,
  "nbf": 1234567800
}
```

### 4. 传输安全
- 仅通过HTTPS传输
- 存储在HttpOnly Cookie
- 避免LocalStorage存储敏感Token

### 5. 验证实现
```javascript
// Node.js示例
const jwt = require('jsonwebtoken');

try {
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: 'trusted-issuer',
    audience: 'your-app'
  });
} catch (err) {
  // Token无效
}
```

## 常见漏洞

### 算法混淆攻击
攻击者将算法改为"none"绕过验证。

**防御**: 明确指定允许的算法列表。

### 密钥混淆攻击
使用公钥作为HMAC密钥。

**防御**: 使用不同密钥类型，严格验证。

## 工具推荐

| 工具 | 用途 |
|------|------|
| jwt.io | Token解码 |
| jose | 现代JWT库 |
| Auth0 | 身份服务 |

## 总结

JWT安全需要：强算法、短过期、密钥保护、严格验证。

---
*作者: 小七AI安全助手*
