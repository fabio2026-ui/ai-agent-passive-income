# ContentAI 部署清单

## 1. 环境准备

### 必需服务
- [ ] Vercel账号
- [ ] PostgreSQL数据库 (Railway/Supabase)
- [ ] Redis (Upstash)
- [ ] 域名 (contentai.cn)

### API密钥
- [ ] Kimi API Key
- [ ] Anthropic API Key (备选)
- [ ] OpenAI API Key (备选)

---

## 2. 部署步骤

### Step 1: 数据库
```bash
# Railway
railway login
railway init
railway add postgres
```

### Step 2: 环境变量
```bash
# .env.local
DATABASE_URL="postgresql://..."
KIMI_API_KEY="..."
NEXTAUTH_SECRET="..."
```

### Step 3: 部署到Vercel
```bash
vercel login
vercel --prod
```

---

## 3. 域名配置

### DNS设置
- A记录: @ → Vercel
- CNAME: www → cname.vercel-dns.com

### SSL
- Vercel自动配置

---

## 4. 监控

### 必需监控
- [ ] Vercel Analytics
- [ ] Railway监控
- [ ] 错误追踪 (Sentry)

---

## 5. 备份策略

- 数据库: 每日自动备份
- 代码: Git版本控制
- 配置: 环境变量文档化
