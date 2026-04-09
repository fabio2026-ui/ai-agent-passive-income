# 🧘 BreathAI 部署与推广指南

## ✅ 项目状态

| 项目 | 状态 |
|------|------|
| 代码完整性 | ✅ 已修复并构建成功 |
| 构建输出 | ✅ `dist/` 目录已生成 (599KB) |
| PWA支持 | ✅ 已配置 (manifest.json + Service Worker) |
| 待部署 | ⏳ 需要Cloudflare API Token |

---

## 🚀 部署到 Cloudflare Pages (推荐)

### 方法1: 使用 Wrangler CLI

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace/breath-ai

# 2. 登录 Cloudflare (会打开浏览器)
wrangler login

# 3. 部署到 Pages
wrangler pages deploy dist --project-name=breath-ai --branch=main
```

### 方法2: 通过 Git 集成自动部署

1. 在 GitHub 创建 `breath-ai` 仓库
2. 推送代码:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/breath-ai.git
git push -u origin main
```
3. 在 Cloudflare Dashboard → Pages → 创建项目 → 连接 GitHub 仓库
4. 构建设置:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`

### 方法3: 手动上传

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 前往 Pages → 创建项目 → 直接上传
3. 上传 `/root/.openclaw/workspace/breath-ai/dist` 文件夹
4. 项目将自动部署并获得 `.pages.dev` 域名

---

## 📱 推广文案 (中文)

### 短文案 (适合社交媒体)

**版本1 - 简洁有力:**
```
🧘‍♀️ BreathAI - 你的随身呼吸教练

3分钟科学呼吸引导，瞬间减压放松
✅ 5种专业呼吸模式
✅ 离线可用，无需注册
✅ 支持PWA安装

🆓 免费版每日3次
💎 Pro版解锁无限

[链接]
```

**版本2 - 功能导向:**
```
压力太大？睡不好？试试 BreathAI 🌊

基于科学的 4-7-8 呼吸法，3分钟让你:
🧘 放松身心
😴 改善睡眠
⚡ 提升专注

免费下载，立即体验 👇
[链接]
```

**版本3 - 情感共鸣:**
```
深呼吸，慢下来 🌿

在这个快节奏的世界里，给自己3分钟。
BreathAI 用科学的方法，帮你找回内心的平静。

无需冥想经验，跟着呼吸就好。

立即体验 → [链接]
```

---

### 长文案 (适合博客/论坛)

```
# 推荐一个超实用的呼吸训练App - BreathAI

最近工作压力很大，朋友推荐了一个叫 BreathAI 的呼吸训练应用，用了几天感觉真的很有帮助，来分享一下。

## 什么是 BreathAI？

BreathAI 是一个专注于呼吸引导的 PWA 应用，不需要下载安装，打开网页就能用。它基于多种科学的呼吸技巧，包括:

- **4-7-8 放松呼吸法** (免费) - 吸气4秒，屏息7秒，呼气8秒，超有效的减压方法
- **盒式呼吸** (Pro) - 美国海军海豹突击队使用的技巧，快速恢复专注
- **共振呼吸** (Pro) - 提高心率变异性，长期练习对身体很有益

## 我的使用体验

界面很简洁，有漂亮的呼吸圆圈动画引导你跟着呼吸。每天工作间隙花3分钟做一次，真的能感觉到放松了不少。

免费版每天可以用3次，对轻度使用已经够用了。重度用户可以考虑 Pro 版，一年不到20刀。

## 技术亮点

- ✅ 纯前端应用，离线可用
- ✅ 可以安装到手机主屏幕像原生App一样使用
- ✅ 数据存在本地，隐私无忧
- ✅ 响应式设计，手机电脑都好用

## 立即体验

[你的部署链接]

不需要注册，打开就能用。推荐给同样需要放松的朋友们 🧘‍♀️
```

---

## 🎨 视觉素材建议

### 配色方案
- 主色: `#14b8a6` (teal-500)
- 背景: `#0f172a` (slate-900)
- 强调: `#a855f7` (purple-500)

### 截图重点
1. **首页** - 展示多种呼吸模式卡片
2. **呼吸引导页** - 展示动态呼吸圆圈动画
3. **统计页** - 展示练习数据追踪
4. **移动端** - 展示PWA安装后的效果

---

## 📊 部署后检查清单

- [ ] 网站可通过 HTTPS 访问
- [ ] 移动端显示正常
- [ ] PWA安装提示出现 (Chrome/Edge)
- [ ] 离线模式下可正常使用
- [ ] 分享链接测试通过

---

## 🔧 常见问题

**Q: 为什么需要 Pro 版？**
A: 免费版每日限3次训练，Pro版无限使用全部功能。

**Q: 数据会同步吗？**
A: 目前数据存在本地浏览器，跨设备需要分别记录。

**Q: 有iOS/Android App吗？**
A: 使用 PWA 技术，可以安装到主屏幕，体验接近原生App。

---

## 📦 文件说明

- `breath-ai-deploy.tar.gz` - 可直接上传的构建包
- `dist/` - 构建输出目录
- `wrangler.toml` - Cloudflare Pages 配置文件

---

*BreathAI v1.0.0 - 让每一次呼吸都充满意义*
