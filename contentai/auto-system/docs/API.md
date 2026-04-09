# ContentAI API 文档

## 基础信息

- **Base URL**: `https://your-domain.com`
- **协议**: HTTPS only
- **数据格式**: JSON

## 公共端点

### 健康检查
```http
GET /api/health
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 获取定价
```http
GET /api/pricing
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "BASIC": { "price": 5, "words": 500, "description": "基础版 - 500词" },
      "PRO": { "price": 15, "words": 1500, "description": "专业版 - 1500词" },
      "ENTERPRISE": { "price": 49, "words": 5000, "description": "企业版 - 5000词" }
    },
    "supportedCryptos": ["BTC", "ETH", "USDT", "USDC"]
  }
}
```

### 获取内容类型
```http
GET /api/content/types
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "types": [
      { "id": "blog_post", "name": "博客文章", "description": "专业的长文博客..." },
      { "id": "product_desc", "name": "产品描述", "description": "compelling 的产品描述..." }
    ]
  }
}
```

## 订单管理

### 创建订单
```http
POST /api/order/create
Content-Type: application/json
```

**请求参数:**
```json
{
  "email": "user@example.com",
  "contentType": "blog_post",
  "topic": "如何提升个人生产力",
  "requirements": "面向职场人士，专业但易懂的风格",
  "tier": "PRO",
  "paymentProvider": "coinbase"
}
```

**参数说明:**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| email | string | ✓ | 用户邮箱 |
| contentType | string | ✓ | 内容类型 ID |
| topic | string | ✓ | 主题/标题 |
| requirements | string | ✗ | 具体要求 |
| tier | string | ✗ | 套餐: BASIC/PRO/ENTERPRISE |
| paymentProvider | string | ✗ | coinbase 或 nowpayments |

**响应示例:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ORD-ABC123XYZ",
    "status": "pending",
    "paymentUrl": "https://commerce.coinbase.com/charges/xxx",
    "paymentId": "charge_id",
    "price": 15,
    "currency": "USD"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 查询订单状态
```http
GET /api/order/status?id=ORD-ABC123XYZ
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-ABC123XYZ",
    "status": "completed",
    "contentType": "blog_post",
    "topic": "如何提升个人生产力",
    "price": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "paidAt": "2024-01-01T00:05:00.000Z",
    "completedAt": "2024-01-01T00:10:00.000Z",
    "deliveredAt": "2024-01-01T00:11:00.000Z"
  }
}
```

## Webhook 端点

### Coinbase Webhook
```http
POST /webhook/coinbase
Headers:
  X-CC-Webhook-Signature: xxx
```

用于接收 Coinbase Commerce 支付状态通知。

### NowPayments IPN
```http
POST /webhook/nowpayments
```

用于接收 NowPayments 支付状态通知。

## 管理端点

### 手动触发处理任务
```http
POST /api/admin/process
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**请求参数:**
```json
{
  "action": "generate"
}
```

**可用动作:**
| 动作 | 说明 |
|------|------|
| generate | 处理待生成订单 |
| deliver | 处理待交付订单 |
| reddit_post | 发布 Reddit 营销帖子 |
| twitter_post | 发布 Twitter 营销推文 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "generated": [
      { "success": true, "orderId": "ORD-xxx", "content": "..." },
      { "success": false, "orderId": "ORD-yyy", "error": "..." }
    ]
  }
}
```

### 获取统计数据
```http
GET /api/admin/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "today": {
      "date": "2024-01-01",
      "total_orders": 10,
      "completed_orders": 8,
      "total_revenue": 120
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 常见错误码
| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| INVALID_EMAIL | 400 | 邮箱格式无效 |
| INVALID_TOPIC | 400 | 主题太短或无效 |
| INVALID_CONTENT_TYPE | 400 | 内容类型无效 |
| ORDER_NOT_FOUND | 404 | 订单不存在 |
| PAYMENT_ERROR | 500 | 支付创建失败 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 状态码

订单状态说明:
| 状态 | 说明 |
|------|------|
| pending | 待支付 |
| paid | 已支付，待生成 |
| generating | 正在生成内容 |
| completed | 内容生成完成 |
| delivered | 已发送到邮箱 |
| failed | 处理失败 |
| refunded | 已退款 |

## 限流

API 默认限流:
- 普通端点: 100 请求/分钟
- 管理端点: 10 请求/分钟
- Webhook: 无限制

超过限流会返回 429 状态码。

## SDK 示例

### JavaScript/TypeScript
```javascript
const API_BASE = 'https://your-domain.com';

async function createOrder(orderData) {
  const response = await fetch(`${API_BASE}/api/order/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
}

// 使用示例
const result = await createOrder({
  email: 'user@example.com',
  contentType: 'blog_post',
  topic: 'AI的未来发展',
  tier: 'PRO'
});

if (result.success) {
  window.location.href = result.data.paymentUrl;
}
```

### cURL
```bash
# 创建订单
curl -X POST https://your-domain.com/api/order/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "contentType": "blog_post",
    "topic": "AI的未来发展",
    "tier": "PRO"
  }'

# 查询订单状态
curl "https://your-domain.com/api/order/status?id=ORD-xxx"
```
