# Cloudflare 域名托管指南 (Namecheap → Cloudflare)
# 小七生成
# 时间: 2026-04-10 23:54 GMT+8

---

## 🎯 目标
把 `eucrossborder.com` 从 Namecheap DNS 迁移到 Cloudflare DNS
实现: `scanner.eucrossborder.com` → GitHub Pages

---

## 步骤 1: Cloudflare 添加域名 (3分钟)

### 1.1 登录 Cloudflare
```
https://dash.cloudflare.com
```

### 1.2 点击 "+ Add a Site"

### 1.3 输入域名
```
eucrossborder.com
```

### 1.4 选择计划
```
FREE (Free)
点击 Continue
```

### 1.5 等待扫描 DNS 记录
Cloudflare 会自动扫描现有的 DNS 记录

---

## 步骤 2: 配置 DNS 记录 (2分钟)

### 2.1 添加 CNAME 记录
```
Type: CNAME
Name: scanner
Target: fabio2026-ui.github.io
Proxy status: DNS only (灰色云)
TTL: Auto
```

### 2.2 保留现有记录
保留扫描到的所有现有记录 (MX, A, TXT 等)

---

## 步骤 3: 复制 Cloudflare NS 服务器 (1分钟)

Cloudflare 会给你两个 Nameserver:
```
示例:
- lara.ns.cloudflare.com
- greg.ns.cloudflare.com
```

**复制这两个地址**

---

## 步骤 4: Namecheap 修改 NS (2分钟)

### 4.1 登录 Namecheap
```
https://ap.www.namecheap.com/
```

### 4.2 找到 eucrossborder.com → Manage

### 4.3 找到 "Nameservers" 部分

### 4.4 选择 "Custom DNS"

### 4.5 粘贴 Cloudflare NS
```
Nameserver 1: lara.ns.cloudflare.com
Nameserver 2: greg.ns.cloudflare.com
```

### 4.6 点击 Save

---

## 步骤 5: Cloudflare 确认 (1分钟)

### 5.1 回到 Cloudflare
点击 "Done, check nameservers"

### 5.2 等待验证 (通常几分钟到几小时)

---

## 步骤 6: GitHub Pages 配置 (完成后)

域名托管转移完成后:
```
1. GitHub → Settings → Pages
2. Custom domain: scanner.eucrossborder.com
3. Enforce HTTPS: ✅
```

---

## ⏱️ 时间线

| 步骤 | 时间 |
|------|------|
| Cloudflare 添加域名 | 3分钟 |
| 配置 DNS | 2分钟 |
| Namecheap 改 NS | 2分钟 |
| DNS 传播 | 30分钟-24小时 |
| **总计** | **< 10分钟操作 + 等待** |

---

## ✅ 完成后

```
https://scanner.eucrossborder.com  →  GitHub Pages
```

自动获得:
- ✅ SSL/HTTPS (Cloudflare 提供)
- ✅ CDN 加速
- ✅ DDoS 保护
- ✅ 更快的全球访问

---

## 🔧 备选: 如果你无法登录 Namecheap

**方案: 域名转移 (Transfer) 到 Cloudflare Registrar**

条件:
- 域名注册超过 60 天
- 域名未锁定
- 有转移授权码 (Auth Code)

时间: 5-7 天

---

**建议: 先尝试登录 Namecheap 改 NS，不行再考虑转移。**

---

*小七生成*
