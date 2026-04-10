# 🎮 Epic Games API 完整指南

## 官方API端点

### 1. 认证API
```
POST https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token
```
**用途**: 获取访问令牌
**必需**: Client ID + Client Secret

### 2. Fortnite API
```
GET https://fortnite-api.com/v2/...
```
**功能**:
- 玩家统计
- 商店物品
- 新闻/事件
- 创意模式内容

### 3. Epic Online Services (EOS)
```
GET https://api.epicgames.dev/...
```
**功能**:
- 好友系统
- 成就
- 排行榜
- 多人游戏

---

## 🔑 需要的凭证

| API类型 | 所需凭证 | 获取难度 | 费用 |
|---------|----------|----------|------|
| **Public API** | 无需认证 | ⭐ 简单 | 免费 |
| **Fortnite API** | API Key | ⭐⭐ 中等 | 免费 |
| **EOS Game Services** | Client ID/Secret | ⭐⭐⭐ 较难 | 免费至$1000+/月 |
| **Epic Games Store** | Partner认证 | ⭐⭐⭐⭐⭐ 困难 | 收入分成 |

---

## 🔄 替代方案

### 方案A: 第三方Fortnite API (推荐)
**网址**: https://fortnite-api.com
```
优点:
✅ 无需认证
✅ 免费使用
✅ 文档完善
✅ 社区活跃

限制:
⚠️ 仅限Fortnite数据
⚠️ 有速率限制
```

### 方案B: Steam API (游戏数据)
**网址**: https://steamapi.io 或官方Steam Web API
```
优点:
✅ 更多游戏支持
✅ 玩家数据丰富
✅ 成就系统
✅ 社区功能

限制:
⚠️ 需要Steam API Key
⚠️ 仅限Steam平台
```

### 方案C: RAWG API (游戏数据库)
**网址**: https://rawg.io/apidocs
```
优点:
✅ 50万+游戏数据
✅ 评分/评论
✅ 截图/视频
✅ 免费层级: 20请求/秒

限制:
⚠️ 商业用途需付费
⚠️ 非实时数据
```

### 方案D: IGDB API (Twitch)
**网址**: https://api-docs.igdb.com
```
优点:
✅ 海量游戏数据
✅ 与Twitch集成
✅ 免费使用
✅ GraphQL支持

限制:
⚠️ 需要Twitch Client ID
⚠️ 学习曲线较陡
```

---

## 💡 推荐组合

### 游戏数据聚合器
| 用途 | 推荐API | 原因 |
|------|---------|------|
| Fortnite特定数据 | fortnite-api.com | 免费、简单 |
| 多平台游戏数据 | Steam API + RAWG | 覆盖面广 |
| 游戏资讯/媒体 | IGDB | 数据全面 |
| 实时玩家数据 | Epic EOS (如有认证) | 官方数据 |

---

## 🚀 快速启动代码

### 使用Fortnite-API (无需认证)
```javascript
// 获取当前商店物品
const response = await fetch('https://fortnite-api.com/v2/shop/br/combined');
const data = await response.json();

// 获取玩家统计 (需要玩家名)
const stats = await fetch('https://fortnite-api.com/v1/stats/br/v2?name=Ninja');
```

### 使用Steam API
```javascript
// 需要API Key: https://steamcommunity.com/dev/apikey
const STEAM_API_KEY = 'your_key';
const response = await fetch(
  `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=76561197960434622`
);
```

---

## ⚠️ 注意事项

1. **Epic官方API** 需要申请，审核严格
2. **EOS服务** 有配额限制，超额需付费
3. **第三方API** 可能有数据延迟
4. **所有API** 都应遵守使用条款

---

## 📊 对比总结

| 方案 | 认证难度 | 数据质量 | 费用 | 推荐度 |
|------|----------|----------|------|--------|
| Epic官方 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$$ | ⭐⭐ |
| Fortnite-API | ⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| Steam API | ⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| RAWG | ⭐⭐ | ⭐⭐⭐ | 免费/付费 | ⭐⭐⭐⭐ |
| IGDB | ⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |

**我的建议**: 先用 **fortnite-api.com** (如果只需要Fortnite) 或 **IGDB** (如果需要通用游戏数据) 快速验证想法，等有明确需求后再申请Epic官方认证。

---
**文档更新**: 2026-04-10
