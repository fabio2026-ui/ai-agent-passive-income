# API网关安全配置指南

## 简介
API网关是API的前门，配置安全至关重要。

## 核心安全功能

### 1. 认证授权
- JWT验证
- OAuth2/OIDC
- API Key
- mTLS

### 2. 速率限制
防止滥用和DDoS。

```
- 每分钟100请求/IP
- 每秒10请求/API Key
- 突发允许20请求
```

### 3. 请求验证
- Schema验证
- 大小限制
- 内容过滤

### 4. 响应保护
- 敏感数据过滤
- 错误信息隐藏
- 响应缓存

## 主流网关对比

| 网关 | 特点 | 适用 |
|------|------|------|
| Kong | 插件丰富 | 企业 |
| AWS API Gateway | 托管服务 | AWS |
| NGINX | 高性能 | 自托管 |
| Zuul | Spring生态 | Java |
| Envoy | 云原生 | K8s |

## Kong配置示例

```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 100
      policy: redis
  - name: jwt
    config:
      uri_param_names: jwt
  - name: cors
    config:
      origins: ["https://app.com"]
```

## 安全清单

- [ ] 强制HTTPS
- [ ] 认证启用
- [ ] 速率限制
- [ ] 输入验证
- [ ] 日志记录
- [ ] 监控告警

## 总结

API网关: 统一入口、安全控制、流量管理。

---
*作者: 小七AI安全助手*
