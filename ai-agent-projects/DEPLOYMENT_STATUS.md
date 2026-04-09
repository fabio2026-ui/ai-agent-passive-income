# 部署方案调整

## ⚠️ API Token 权限限制

当前 Cloudflare API Token (`cfat_Kq2d2bLPJItUCdjvQ74OKdy31fL4Ve0Hkfp8Reng949b5c67`) 权限:
- ✅ Pages:Edit (部分)
- ❌ Workers Scripts:Edit (缺少)
- ❌ Workers KV:Edit (缺少)

**直接部署 Worker 失败** - 需要 Workers 权限。

---

## 🔄 替代部署方案

### 方案A: GitHub Pages + 现有项目 (推荐)
将支付页面添加到已部署的项目中:

**操作步骤**:
1. 复制 `pricing.html` 到 `codeguard-landing/public/`
2. 访问 `https://codeguard-landing.pages.dev/pricing.html`

### 方案B: 静态 HTML 直接托管
使用现有的静态托管能力

### 方案C: 升级 Cloudflare Token 权限
需要你在 Cloudflare 后台添加 Workers 权限

---

## ✅ 立即可用的替代方案

让我将 pricing 页面集成到已部署的 CodeGuard Landing 项目中：