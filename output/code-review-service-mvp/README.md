# 多Agent代码审查服务 - 部署指南

## 项目结构
```
code-review-service-mvp/
├── src/
│   └── index.js          # 主服务代码
├── package.json          # 依赖配置
├── wrangler.toml         # Cloudflare Workers配置
└── README.md            # 项目文档
```

## 功能特性
- ✅ 安全审查: SQL注入、硬编码密钥、弱哈希等
- ✅ 性能审查: N+1查询、低效循环、内存优化
- ✅ 风格审查: PEP8规范、命名、文档
- ✅ 并行分析: 3个Agent同时运行
- ✅ REST API: 支持单文件和批量审查

## API端点

### 健康检查
```bash
GET https://code-review-api.yourdomain.com/health
```

### 代码审查
```bash
POST https://code-review-api.yourdomain.com/api/review
Content-Type: application/json

{
  "code": "def hello():\n    print('world')",
  "language": "python"
}
```

### 批量审查
```bash
POST https://code-review-api.yourdomain.com/api/review/batch
Content-Type: application/json

{
  "files": [
    {"filename": "app.py", "code": "..."},
    {"filename": "utils.py", "code": "..."}
  ]
}
```

### 演示
```bash
GET https://code-review-api.yourdomain.com/demo
```

## 部署步骤

1. **安装依赖**
```bash
cd output/code-review-service-mvp
npm install
```

2. **登录Cloudflare**
```bash
npx wrangler login
```

3. **部署**
```bash
npx wrangler deploy
```

4. **自定义域名** (可选)
在 `wrangler.toml` 中添加:
```toml
routes = [{ pattern = "code-review-api.yourdomain.com", custom_domain = true }]
```

## 收费模式建议
- 免费层: 100次审查/月
- 付费层: $9/月，无限次审查
- 团队层: $29/月，批量API + 优先级支持

## 差异化优势
1. **无需AI模型**: 基于规则，响应快，成本低
2. **即时响应**: <500ms完成审查
3. **批量处理**: 一次审查10个文件
4. **免费可用**: 无需OpenAI API Key

---
创建时间: 2026-04-01
状态: MVP完成，待部署
