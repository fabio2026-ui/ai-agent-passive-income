# ContentAI 技术架构文档
**版本**: MVP v0.1
**日期**: 2026-04-02
**架构师**: 小七

---

## 1. 技术选型

### 1.1 前端
| 层级 | 技术 | 理由 |
|------|------|------|
| 小程序 | 微信小程序原生 | 最快上线，用户基数大 |
| Web端 | Next.js 14 + Tailwind CSS | SEO友好，开发效率高 |
| 状态管理 | Zustand | 轻量，学习成本低 |

### 1.2 后端
| 层级 | 技术 | 理由 |
|------|------|------|
| 框架 | Next.js API Routes | 前后端一体，部署简单 |
| 数据库 | PostgreSQL + Prisma | 成熟稳定，类型安全 |
| 缓存 | Redis | 会话管理，限流 |
| 文件存储 | Cloudflare R2 | 成本低，全球CDN |

### 1.3 AI层
| 服务 | 用途 | 成本 |
|------|------|------|
| Kimi (Moonshot) | 主力中文生成 | ¥0.012/1K tokens |
| Claude (Anthropic) | 高质量长文 | $0.008/1K tokens |
| OpenAI GPT-4 | 备选/英文 | $0.03/1K tokens |

**策略**: 多模型冗余，自动降级

### 1.4 基础设施
| 服务 | 用途 |
|------|------|
| Vercel | 前端托管 + Serverless |
| Railway/Render | 后端托管 |
| Cloudflare | DNS + CDN + R2 |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                               │
├──────────────┬─────────────────┬────────────────────────────┤
│ 微信小程序    │   Next.js Web   │      未来: iOS/Android      │
└──────────────┴─────────────────┴────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API网关层                             │
├─────────────────────────────────────────────────────────────┤
│  • 认证 (JWT)  • 限流  • 日志  • 监控                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        业务服务层                            │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   用户服务    │   内容服务   │   支付服务   │    AI服务      │
│  - 注册/登录  │  - 生成文案  │  - 订阅管理  │  - 多模型调用  │
│  - 用户管理   │  - 历史记录  │  - 订单处理  │  - 模板引擎    │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                               │
├──────────────┬──────────────┬───────────────────────────────┤
│  PostgreSQL  │    Redis     │       Cloudflare R2          │
│  - 用户数据   │  - 会话缓存  │       - 静态资源              │
│  - 内容数据   │  - 限流计数  │       - 导出文件              │
└──────────────┴──────────────┴───────────────────────────────┘
```

---

## 3. 数据库Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  name          String?
  avatar        String?
  plan          Plan      @default(FREE)
  credits       Int       @default(10)  // 剩余生成次数
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  contents      Content[]
  payments      Payment[]
  
  @@map("users")
}

// 套餐类型
enum Plan {
  FREE      // 免费: 10次/月
  BASIC     // ¥29/月: 100次
  PRO       // ¥99/月: 500次
  BUSINESS  // ¥299/月: 无限
}

// 内容生成记录
model Content {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  platform      Platform  // 小红书/抖音/公众号
  title         String    // 主题
  keywords      String[]  // 关键词
  prompt        String    // 完整提示词
  result        String    @db.Text  // 生成结果
  
  status        Status    @default(COMPLETED)
  tokensUsed    Int       @default(0)
  model         String    @default("kimi")
  
  isFavorite    Boolean   @default(false)
  isDeleted     Boolean   @default(false)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("contents")
}

// 平台类型
enum Platform {
  XIAOHONGSHU   // 小红书
  DOUYIN        // 抖音
  WECHAT        // 公众号
  WEIBO         // 微博
  ZHIHU         // 知乎
}

// 生成状态
enum Status {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// 支付记录
model Payment {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  plan          Plan
  amount        Float     // 金额
  currency      String    @default("CNY")
  status        PaymentStatus @default(PENDING)
  
  provider      String    // wechat/alipay
  providerOrderId String?
  
  paidAt        DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

---

## 4. API设计

### 4.1 认证相关
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### 4.2 内容生成
```
POST /api/content/generate
Body: {
  platform: "xiaohongshu" | "douyin" | "wechat",
  title: string,
  keywords: string[],
  tone?: "professional" | "casual" | "funny",
  length?: "short" | "medium" | "long"
}

GET  /api/content/list?page=1&limit=20
GET  /api/content/:id
DELETE /api/content/:id
POST /api/content/:id/favorite
```

### 4.3 用户管理
```
GET  /api/user/profile
PUT  /api/user/profile
GET  /api/user/credits
GET  /api/user/plan
```

### 4.4 支付
```
POST /api/payment/create
Body: { plan: "basic" | "pro" | "business" }

POST /api/payment/webhook/wechat
POST /api/payment/webhook/alipay
```

---

## 5. AI提示词模板

### 5.1 小红书文案模板
```
你是一位资深小红书文案专家。

请根据以下信息创作一篇小红书文案：
- 主题: {{title}}
- 关键词: {{keywords}}
- 风格: {{tone}}
- 长度: {{length}}

要求：
1. 标题要有吸引力，使用emoji
2. 正文要有干货，结构清晰
3. 结尾要有互动引导
4. 添加相关话题标签
5. 符合小红书平台调性

输出格式：
【标题】
...

【正文】
...

【话题标签】
...
```

### 5.2 抖音脚本模板
```
你是一位抖音短视频脚本专家。

请根据以下信息创作一个抖音视频脚本：
- 主题: {{title}}
- 关键词: {{keywords}}
- 时长: {{duration}}秒
- 风格: {{style}}

要求：
1. 开头3秒必须有爆点
2. 内容要有节奏感
3. 标注画面、台词、音效
4. 结尾要有引导关注/点赞

输出格式：
【视频标题】
...

【脚本】
镜头1 (0-3s): ...
镜头2 (3-10s): ...
...

【字幕文案】
...

【推荐BGM】
...
```

---

## 6. 部署架构

### 6.1 开发环境
```
本地开发 -> GitHub -> Vercel Preview
```

### 6.2 生产环境
```
GitHub Main Branch -> Vercel Production
                    -> Railway (DB)
                    -> Upstash (Redis)
```

### 6.3 CI/CD
- GitHub Actions自动部署
- 自动运行测试
- 自动数据库迁移

---

## 7. 成本估算（月度）

| 项目 | 费用 | 备注 |
|------|------|------|
| Vercel Pro | $20 | 前端托管 |
| Railway | $50 | 后端+数据库 |
| Upstash Redis | $10 | 缓存 |
| Cloudflare R2 | $5 | 文件存储 |
| AI API | $100-500 | 按用量 |
| **总计** | **~$200-600** | 视用户量 |

---

## 8. 开发里程碑

### Week 1 (4/2-4/9)
- [ ] 项目初始化
- [ ] 数据库搭建
- [ ] 认证系统
- [ ] 基础UI框架

### Week 2 (4/9-4/16)
- [ ] AI生成接口
- [ ] 小红书模板
- [ ] 抖音模板
- [ ] 内容列表

### Week 3 (4/16-4/23)
- [ ] 支付系统
- [ ] 微信小程序
- [ ] 历史记录
- [ ] 收藏功能

### Week 4 (4/23-4/30)
- [ ] 内测发布
- [ ] Bug修复
- [ ] 性能优化
- [ ] 数据监控

---

**下一步**: 立即开始代码开发！
