# Cloudflare DNS 配置步骤 (eucrossborder.com)
# 小七生成 - 2026-04-10 23:58 GMT+8

---

## ✅ 你已经完成
- [x] 域名在 Cloudflare
- [x] GitHub Pages 分支就绪

---

## 🔧 现在配置 (3分钟)

### 步骤 1: 登录 Cloudflare
```
https://dash.cloudflare.com
```

### 步骤 2: 找到域名
点击: **eucrossborder.com**

### 步骤 3: 进入 DNS 设置
左侧菜单 → **DNS** → **Records**

### 步骤 4: 添加 CNAME 记录
点击 **"Add record"**

```
Type: CNAME
Name: scanner
Target: fabio2026-ui.github.io
TTL: Auto
Proxy status: DNS only (灰色云 ☁️)
```

点击 **Save**

---

## 🔧 GitHub Pages 配置 (2分钟)

### 步骤 5: 访问 GitHub 设置
```
https://github.com/fabio2026-ui/ai-agent-passive-income/settings/pages
```

### 步骤 6: 配置自定义域名
```
Custom domain: scanner.eucrossborder.com
```

点击 **Save**

### 步骤 7: 勾选 HTTPS
```
☑️ Enforce HTTPS
```

---

## ⏱️ 等待时间

| 阶段 | 时间 |
|------|------|
| Cloudflare DNS 生效 | 1-5 分钟 |
| GitHub 验证域名 | 2-10 分钟 |
| HTTPS 证书颁发 | 5-30 分钟 |

---

## ✅ 完成后访问

```
https://scanner.eucrossborder.com
```

---

## 🆘 如果 HTTPS 报错

GitHub Pages 显示 "Unavailable for your site because..."

**解决:**
1. 先取消勾选 "Enforce HTTPS"
2. 等待 5 分钟
3. 重新勾选 "Enforce HTTPS"

---

*小七配置指南*
