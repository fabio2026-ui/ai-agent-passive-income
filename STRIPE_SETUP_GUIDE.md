# Stripe Payment Links 设置指南

## 快速创建 (5分钟)

### 步骤1: 登录 Stripe Dashboard
**链接**: https://dashboard.stripe.com/payment-links

### 步骤2: 创建3个产品

#### Product 1: Starter Credits
```
名称: CodeGuard Starter Credits
描述: 100 credits for security scans
价格: $10.00 (One-time)
```

#### Product 2: Pro Credits
```
名称: CodeGuard Pro Credits  
描述: 1,000 credits for security scans - Most Popular
价格: $85.00 (One-time)
```

#### Product 3: Enterprise Credits
```
名称: CodeGuard Enterprise Credits
描述: 10,000 credits for security scans
价格: $750.00 (One-time)
```

### 步骤3: 获取链接
创建后你会得到类似这样的链接:
```
https://buy.stripe.com/xxxxxXXXXxxxxx
```

### 步骤4: 给我链接
把3个链接发给我，我立即更新到:
- buy.html
- pricing.html
- 所有CTA按钮

---

## 完成后效果

用户点击 "Pay with Card" → 直接跳转到 Stripe Checkout → 支付完成 → 自动返回

**无需Workers，无需代码，立即生效！**