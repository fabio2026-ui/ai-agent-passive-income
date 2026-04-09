# 🇪🇺 EU CrossBorder API

简单的EU VAT计算API，支持所有27个欧盟成员国的标准税率查询和计算。

## 🌐 部署地址

**生产环境**: `https://eucrossborder-api.yhongwb.workers.dev`

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 部署到Cloudflare Workers
```bash
npm run deploy
```

## 📡 API 端点

### 1. 计算 VAT
```
GET /api/vat/calculate?country={code}&amount={value}&type={net|gross}
POST /api/vat/calculate
```

**参数**:
- `country` (必填) - 2位国家代码，如 DE, FR, IT
- `amount` (必填) - 金额
- `type` (可选) - `net` (默认) 或 `gross`

**示例**:
```bash
curl "https://eucrossborder-api.yhongwb.workers.dev/api/vat/calculate?country=DE&amount=100&type=net"
```

**响应**:
```json
{
  "success": true,
  "data": {
    "country": "DE",
    "countryName": "Germany",
    "currency": "EUR",
    "rate": 0.19,
    "ratePercent": "19%",
    "inputType": "net",
    "inputAmount": 100.00,
    "netAmount": 100.00,
    "vatAmount": 19.00,
    "grossAmount": 119.00
  }
}
```

### 2. 获取所有税率
```
GET /api/vat/rates
```

### 3. 获取国家列表
```
GET /api/vat/countries
```

### 4. 健康检查
```
GET /health
```

## 🌍 支持的国家

| 代码 | 国家 | 标准VAT | 货币 |
|------|------|---------|------|
| DE | Germany | 19% | EUR |
| FR | France | 20% | EUR |
| IT | Italy | 22% | EUR |
| ES | Spain | 21% | EUR |
| NL | Netherlands | 21% | EUR |
| BE | Belgium | 21% | EUR |
| AT | Austria | 20% | EUR |
| PT | Portugal | 23% | EUR |
| PL | Poland | 23% | PLN |
| SE | Sweden | 25% | SEK |
| DK | Denmark | 25% | DKK |
| ... | 更多国家 | - | - |

**全部27个欧盟成员国都支持**

## 💡 使用示例

### 计算净价到含税价
```bash
curl "https://eucrossborder-api.yhongwb.workers.dev/api/vat/calculate?country=FR&amount=100&type=net"
# 结果: 净价 €100 + VAT €20 = 总价 €120
```

### 从含税价反推
```bash
curl "https://eucrossborder-api.yhongwb.workers.dev/api/vat/calculate?country=IT&amount=122&type=gross"
# 结果: 总价 €122 = 净价 €100 + VAT €22
```

### POST 请求
```bash
curl -X POST https://eucrossborder-api.yhongwb.workers.dev/api/vat/calculate \
  -H "Content-Type: application/json" \
  -d '{"country":"NL","amount":50,"type":"net"}'
```

## 📝 特性

- ✅ 支持所有27个欧盟成员国
- ✅ 2025年最新标准VAT税率
- ✅ 净价/含税价双向计算
- ✅ RESTful API
- ✅ CORS 支持
- ✅ 交互式文档页面
- ⚡ 边缘部署，全球低延迟

## 🔧 技术栈

- Cloudflare Workers
- JavaScript ES2022
- Wrangler CLI

## 📄 License

MIT
