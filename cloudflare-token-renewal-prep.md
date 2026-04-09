# 🔐 Cloudflare API Token 续期准备文档

## 📋 任务概览
- **执行时间**: 2026年3月22日
- **Token过期时间**: 2026年3月27日 (约5天后)
- **紧急程度**: ⚠️ 高 (建议立即处理)

---

## 1️⃣ 当前Token状态检查

### ✅ Token基本信息
| 属性 | 值 |
|------|-----|
| **Token ID** | f3e4ce267dfddb8ceaec60f132c87f30 |
| **Token值** | cfut_f9dwQfK23NeWkMVKbMhRlnHbbcdzsXx5ZvdEhGoxbe2d2b23 |
| **状态** | ✅ Active (有效，已验证) |
| **验证API** | /client/v4/user/tokens/verify - ✅ 返回200 |

### ⚠️ 权限限制说明
| 权限 | 状态 | 说明 |
|------|------|------|
| #worker:edit | ✅ | Workers编辑 |
| #worker:read | ✅ | Workers读取 |
| #zone:read | ✅ | Zone读取 |
| **Token管理权限** | ❌ | 无法通过API创建新Token |
| **Zone编辑权限** | ❌ | 无法修改DNS记录 |
| **DNS编辑权限** | ❌ | 无法管理DNS |

---

## 2️⃣ 续期步骤（推荐手动方式）

由于当前Token缺少Token管理权限，**必须通过Cloudflare Dashboard手动创建新Token**。

### Step 1: 登录Cloudflare Dashboard
```
访问: https://dash.cloudflare.com
使用账号邮箱和密码登录
```

### Step 2: 进入API Token管理页
```
路径: 右上角头像 → "My Profile" → "API Tokens"
或直接访问: https://dash.cloudflare.com/profile/api-tokens
```

### Step 3: 创建新Token
1. 点击 **"Create Token"** 按钮
2. 选择 **"Custom token"** (自定义令牌)

### Step 4: 配置Token权限

**Token名称建议**: `AI-Empire-Production-Token`

| 权限类别 | 权限 | 级别 | 说明 |
|----------|------|------|------|
| Zone | Zone | Read | 读取Zone信息 |
| Zone | Zone | Edit | 编辑Zone设置 |
| Zone | DNS | Read | 读取DNS记录 |
| Zone | DNS | Edit | 编辑DNS记录 |
| Account | Account | Read | 读取账户信息 |
| Account | Workers Scripts | Edit | Workers编辑 |
| User | API Tokens | Edit | ⚠️ **关键：Token管理权限** |

### Step 5: 资源配置
```
Zone Resources:
  - Include: Specific Zone → eucrossborder.com
  
(可选) Client IP Address Filtering:
  - Operator: Equals
  - Value: [你的服务器IP]
```

### Step 6: TTL设置（重要！）
```
Start Date: [当前日期]
End Date: Never (永不过期) ← 推荐选择
```

### Step 7: 生成并保存Token
1. 点击 **"Continue to summary"**
2. 点击 **"Create Token"**
3. **⚠️ 立即复制Token值** (只显示一次！)
4. 保存到安全位置（密码管理器）

---

## 3️⃣ 新Token替换方案

### 需要更新的文件列表

| 文件路径 | 用途 | 更新方式 |
|----------|------|----------|
| `/root/.openclaw/workspace/.cloudflare-token` | Token存储 | 替换内容 |
| `/root/.openclaw/workspace/.env.cloudflare` | 环境变量导出 | 替换值 |
| `/root/.openclaw/workspace/env-export.sh` | 环境变量脚本 | 替换值 |
| Vercel环境变量 | 部署配置 | Dashboard中更新 |

### 替换命令示例
```bash
# 1. 更新本地Token文件
echo "your-new-token-here" > /root/.openclaw/workspace/.cloudflare-token

# 2. 更新环境变量文件
cat > /root/.openclaw/workspace/.env.cloudflare << 'EOF'
export CLOUDFLARE_API_TOKEN="your-new-token-here"
export CF_API_TOKEN="your-new-token-here"
EOF

# 3. 应用环境变量
source /root/.openclaw/workspace/.env.cloudflare

# 4. 验证新Token
curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer your-new-token-here"
```

---

## 4️⃣ 注意事项

### ⚠️ 重要提醒

1. **Token显示一次性**
   - 创建后只显示一次，务必立即保存
   - 如丢失，需要重新创建

2. **新旧Token并行期**
   - 新Token创建后，旧Token在过期前仍然有效
   - 可以测试新Token确认无误后再停用旧Token

3. **权限规划**
   - 建议新Token包含 `API Tokens:Edit` 权限，便于后续自动化管理
   - 根据最小权限原则，只授予必要的权限

4. **安全存储**
   - 使用密码管理器存储Token
   - 不要在代码仓库中硬编码Token
   - 定期轮换Token（建议每6-12个月）

### 🔄 旧Token处理

```bash
# 旧Token将在2026年3月27日自动过期
# 过期后无需手动删除，自动失效

# 如需立即撤销旧Token，可以在Dashboard中操作:
# https://dash.cloudflare.com/profile/api-tokens → 找到旧Token → Roll
```

---

## 5️⃣ 验证清单

新Token创建后，执行以下验证：

- [ ] 新Token可以通过验证API (verify)
- [ ] 新Token可以列出Zones
- [ ] 新Token可以读取DNS记录
- [ ] 新Token可以编辑DNS记录（如需要）
- [ ] 新Token可以管理Workers
- [ ] 新Token可以创建/管理其他Tokens
- [ ] 所有环境变量已更新
- [ ] 应用已重新加载新Token
- [ ] 生产环境功能测试通过

---

## 6️⃣ 快速参考

### Cloudflare Dashboard链接
- **登录**: https://dash.cloudflare.com
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **Zone**: https://dash.cloudflare.com/eucrossborder.com

### 测试命令
```bash
# 验证Token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.cloudflare.com/client/v4/user/tokens/verify"

# 列出Zones
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones"

# 列出DNS记录
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records"
```

---

**文档生成时间**: 2026-03-22 14:16 CET  
**下次检查建议**: 新Token创建后立即更新此文档
