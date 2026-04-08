# Web应用防火墙(WAF)深度配置

## 简介
WAF保护Web应用免受常见攻击。

## WAF防护能力

### OWASP Top 10
- SQL注入
- XSS
- 不安全的反序列化
- 安全配置错误
- 等等

### 机器人防护
- 爬虫管理
- DDoS防护
- 速率限制

### API保护
- Schema验证
- 异常检测
- 业务逻辑防护

## 云WAF对比

| WAF | 特点 | 价格 |
|-----|------|------|
| Cloudflare | 全球网络 | $20/月起 |
| AWS WAF | AWS原生 | 按请求 |
| Azure WAF | Azure集成 | 按规则 |
| Imperva | 企业级 | 定制 |
| ModSecurity | 开源 | 免费 |

## Cloudflare规则示例

```
# SQL注入防护
(http.request.uri.query contains "union select")
or (http.request.uri.query contains "' or '1'='1")
→ Block

# 速率限制
(cf.threat_score > 50)
or (http.requests over 1m > 100)
→ Challenge
```

## 自托管ModSecurity

```apache
# 基本配置
SecRuleEngine On
SecRequestBodyAccess On
SecResponseBodyAccess On

# 包含OWASP CRS
Include /usr/share/modsecurity-crs/*.conf
```

## 调优建议

1. 学习模式启动
2. 监控误报
3. 逐步启用规则
4. 定制业务规则

## 总结

WAF: 不是银弹，但有效降低风险。

---
*作者: 小七AI安全助手*
