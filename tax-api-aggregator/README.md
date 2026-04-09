# 🏛️ Tax API Aggregator - 税务API聚合器

统一的税务计算API服务，将12个税务API打包成单一接口，提供€29/月订阅服务。

## ✨ 功能特性

- 🔐 **API密钥认证** - 安全的多租户访问控制
- 💳 **Stripe订阅** - €29/月，自动计费管理
- 📊 **12个税务API** - 覆盖欧盟主要税种
- ⚡ **Cloudflare Workers** - 边缘部署，全球低延迟
- 🚦 **速率限制** - 智能API配额管理
- 📈 **使用统计** - 详细的API调用分析

## 🚀 快速开始

### 1. 注册账号

```bash
curl -X POST https://api.taxaggregator.eu/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "name": "Your Company",
    "password": "secure-password"
  }'
```

响应:
```json
{
  "success": true,
  "data": {
    "tenant_id": "tenant-uuid",
    "api_key": "tap_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "message": "Registration successful..."
  }
}
```

### 2. 订阅服务

```bash
curl -X POST https://api.taxaggregator.eu/v1/subscription/checkout \
  -H "Authorization: Bearer YOUR_API_KEY"
```

会返回Stripe结账URL，完成支付后API立即激活。

### 3. 开始使用

```bash
curl -X POST https://api.taxaggregator.eu/v1/tax/vat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "country": "DE",
    "category": "standard"
  }'
```

## 📚 API端点

### 税务计算API (12个)

| 端点 | 描述 | 方法 |
|------|------|------|
| `/v1/tax/vat` | 增值税(VAT)计算 | POST |
| `/v1/tax/corporate` | 企业所得税 | POST |
| `/v1/tax/personal-income` | 个人所得税 | POST |
| `/v1/tax/customs` | 关税计算 | POST |
| `/v1/tax/excise` | 消费税 | POST |
| `/v1/tax/property` | 房产税 | POST |
| `/v1/tax/stamp-duty` | 印花税 | POST |
| `/v1/tax/vehicle` | 车船税 | POST |
| `/v1/tax/resource` | 资源税 | POST |
| `/v1/tax/land-value` | 土地增值税 | POST |
| `/v1/tax/land-use` | 城镇土地使用税 | POST |
| `/v1/tax/environmental` | 环境保护税 | POST |

### 管理API

| 端点 | 描述 | 方法 |
|------|------|------|
| `/v1/subscription/checkout` | 创建订阅结账 | POST |
| `/v1/subscription/portal` | 客户门户 | POST |
| `/v1/subscription/status` | 订阅状态 | GET |
| `/v1/api-keys` | API密钥管理 | GET/POST |
| `/v1/usage` | 使用统计 | GET |

## 💰 定价

| 套餐 | 月费 | 请求配额 | 支持 |
|------|------|----------|------|
| **Basic** | €29 | 1,000/小时 | 邮件 |
| **Professional** | €99 | 10,000/小时 | 优先 |
| **Enterprise** | €299 | 100,000/小时 | 专属 |

## 🔧 部署

### 环境变量配置

```bash
# 设置Stripe密钥
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put JWT_SECRET
```

### 数据库初始化

```bash
# 创建D1数据库
wrangler d1 create tax-api-db

# 运行迁移
wrangler d1 migrations apply tax-api-db --local
wrangler d1 migrations apply tax-api-db
```

### 部署

```bash
npm install
npm run deploy
```

## 📖 示例代码

### JavaScript/Node.js

```javascript
const client = {
  apiKey: 'tap_your_api_key',
  baseUrl: 'https://api.taxaggregator.eu',

  async calculateVAT(amount, country) {
    const response = await fetch(`${this.baseUrl}/v1/tax/vat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, country }),
    });
    return response.json();
  }
};

// 使用
const result = await client.calculateVAT(100, 'DE');
console.log(result.data.total_amount); // 119.00
```

### Python

```python
import requests

API_KEY = "tap_your_api_key"
BASE_URL = "https://api.taxaggregator.eu"

def calculate_vat(amount, country):
    response = requests.post(
        f"{BASE_URL}/v1/tax/vat",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"amount": amount, "country": country}
    )
    return response.json()

# 使用
result = calculate_vat(100, "DE")
print(result["data"]["total_amount"])  # 119.00
```

### cURL

```bash
# VAT计算
curl -X POST https://api.taxaggregator.eu/v1/tax/vat \
  -H "Authorization: Bearer tap_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"country":"DE"}'

# 企业所得税
curl -X POST https://api.taxaggregator.eu/v1/tax/corporate \
  -H "Authorization: Bearer tap_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"amount":50000,"country":"DE"}'

# 个人所得税
curl -X POST https://api.taxaggregator.eu/v1/tax/personal-income \
  -H "Authorization: Bearer tap_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"amount":60000,"country":"DE"}'
```

## 📋 响应格式

成功响应:
```json
{
  "success": true,
  "data": {
    "original_amount": 100,
    "tax_amount": 19,
    "total_amount": 119,
    "tax_rate": 19,
    "currency": "EUR",
    "breakdown": [{
      "name": "Standard VAT",
      "rate": 19,
      "amount": 19
    }]
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "v1"
  }
}
```

错误响应:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_COUNTRY",
    "message": "不支持的国家代码: XX"
  },
  "meta": {...}
}
```

## 🌐 支持的国家

### 增值税(VAT) - 欧盟27国
AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE

### 其他税种
主要支持: DE, FR, ES, NL, IT, AT, BE 等欧盟主要经济体

## 🔒 安全

- 所有API调用需要Bearer Token认证
- HTTPS强制加密
- API密钥可单独撤销
- 速率限制防止滥用
- 订阅过期自动拒绝访问

## 📞 支持

- 📧 Email: support@taxaggregator.eu
- 📖 文档: https://docs.taxaggregator.eu
- 💬 Discord: https://discord.gg/taxapi

## 📄 License

MIT License - 详见 LICENSE 文件

---

Built with ❤️ on Cloudflare Workers