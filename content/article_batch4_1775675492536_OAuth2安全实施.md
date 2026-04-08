# OAuth2安全实施指南

## 简介
OAuth2是授权的行业标准，但实现复杂，容易出错。

## 授权流程选择

### 授权码流程 (推荐)
适用: 服务器端应用
安全: ⭐⭐⭐⭐⭐

### PKCE扩展
适用: 移动/单页应用
安全: ⭐⭐⭐⭐

### 客户端凭证
适用: 服务间通信
安全: ⭐⭐⭐

## 安全实施要点

### 1. State参数
防止CSRF攻击。

```
https://provider.com/oauth/authorize?
  client_id=xxx&
  redirect_uri=https://app.com/callback&
  state=random-string-123
```

### 2. 重定向URI验证
- 精确匹配，不使用通配符
- 预注册所有URI
- 禁止使用localhost生产环境

### 3. 范围限制
只请求必要权限：
- ❌ scope=read+write+delete
- ✅ scope=read

### 4. Token存储
- Access Token: 短期(15分钟)
- Refresh Token: 长期，可撤销
- 存储在HttpOnly Cookie

## 常见错误

| 错误 | 风险 | 修复 |
|------|------|------|
| 公开Client Secret | 凭证泄露 | 使用PKCE |
| 不验证State | CSRF | 强制验证 |
| 宽松Redirect URI | 令牌泄露 | 精确匹配 |
| 长期Access Token | 权限滥用 | 缩短过期 |

## 总结

OAuth2安全: 用授权码+PKCE，验证State，限制Scope。

---
*作者: 小七AI安全助手*
