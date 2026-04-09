# Cloudflare API Token 续期指南

> 📅 **到期提醒**: 请在 **2026年3月27日前** 完成Token续期
> 
> 🔄 **最后更新**: 2026-03-21

---

## 一、检查当前Token状态

### 1.1 查看现有Token列表

登录 Cloudflare Dashboard: https://dash.cloudflare.com/profile/api-tokens

或运行以下命令检查已配置的Token:

```bash
# 如果有配置 CF_API_TOKEN 环境变量
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 1.2 Token状态检查清单

| 检查项 | 状态 | 备注 |
|--------|------|------|
| 当前Token过期时间 | ⬜ | 需手动检查 |
| Token权限范围 | ⬜ | 确认是否满足需求 |
| 使用Token的服务 | ⬜ | 记录所有使用位置 |
| Token最后使用时间 | ⬜ | 检查是否有异常 |

---

## 二、Token续期步骤

### 2.1 准备工作

1. **备份当前配置**
   ```bash
   # 备份环境变量
   env | grep -i cloudflare > cloudflare-env-backup-$(date +%Y%m%d).txt
   
   # 备份配置文件
   cp .env .env.backup-$(date +%Y%m%d)
   ```

2. **确认使用Token的服务清单**
   - [ ] DNS更新脚本
   - [ ] CI/CD Pipeline
   - [ ] Terraform配置
   - [ ] 其他自动化工具

### 2.2 创建新Token

#### 方式一：通过 Dashboard 创建 (推荐)

1. 访问: https://dash.cloudflare.com/profile/api-tokens
2. 点击 **"Create Token"**
3. 选择使用模板或自定义权限:
   
   **常用权限模板:**
   
   | 用途 | 权限建议 |
   |------|----------|
   | DNS管理 | Zone:Read, DNS:Edit |
   | SSL/TLS | Zone:Read, SSL:Edit |
   | 完整管理 | Zone:Read, Zone:Edit, DNS:Edit, SSL:Edit |
   | R2存储 | Account:Read, R2:Edit |

4. 设置 **Account Resources** 和 **Zone Resources**
5. **设置Token有效期** (建议3-6个月)
6. 复制并安全保存Token (⚠️ 只显示一次)

#### 方式二：通过 API 创建

```bash
# 使用现有Token创建新Token
curl -X POST "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "Production API Token - $(date +%Y-%m)",
    "policies": [
      {
        "effect": "allow",
        "resources": {
          "com.cloudflare.api.account.zone.*": "*"
        },
        "permission_groups": [
          {
            "id": "c8fed203ed3043cba015a93ad1616f1f",
            "name": "Zone Read"
          },
          {
            "id": "82e64a83756745bbbb1c9c2701bf816b", 
            "name": "DNS Edit"
          }
        ]
      }
    ],
    "not_before": "2026-03-21T00:00:00Z",
    "expires_on": "2026-06-21T23:59:59Z",
    "condition": {
      "request.ip": {
        "in": ["YOUR_IP_ADDRESS/32"],
        "not_in": []
      }
    }
  }'
```

### 2.3 验证新Token

```bash
# 测试新Token
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $NEW_CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 2.4 更新配置

1. **更新环境变量**
   ```bash
   export CF_API_TOKEN="your-new-token-here"
   ```

2. **更新.env文件**
   ```bash
   # 编辑 .env 文件
   sed -i 's/CF_API_TOKEN=.*/CF_API_TOKEN=your-new-token-here/' .env
   ```

3. **更新CI/CD Secrets**
   - GitHub Actions: Settings → Secrets and variables → Actions
   - GitLab CI: Settings → CI/CD → Variables
   - Vercel: Project Settings → Environment Variables

4. **更新Terraform配置**
   ```bash
   # 如果使用 Terraform Cloud
   terraform login
   
   # 更新变量
   terraform workspace variable set CF_API_TOKEN "your-new-token-here" -sensitive
   ```

### 2.5 验证服务正常运行

```bash
# DNS查询测试
dig +short @1.1.1.1 your-domain.com

# API调用测试
./scripts/test-cloudflare-api.sh
```

### 2.6 删除旧Token

确认所有服务都使用新Token后:

1. 访问: https://dash.cloudflare.com/profile/api-tokens
2. 找到旧Token
3. 点击 **"Revoke"** 按钮

---

## 三、自动化续期脚本

脚本位置: `./scripts/cloudflare-token-renewal.sh`

功能:
- ✅ 检查Token过期时间
- ✅ 自动发送续期提醒
- ✅ 验证Token有效性
- ✅ 生成续期报告

使用方法:
```bash
# 设置环境变量
export CF_API_TOKEN="your-current-token"

# 运行检查
./scripts/cloudflare-token-renewal.sh check

# 查看Token详情
./scripts/cloudflare-token-renewal.sh info
```

---

## 四、最佳实践

### 4.1 Token管理原则

1. **最小权限原则**: 只授予必要的权限
2. **定期轮换**: 建议每3个月轮换一次
3. **IP限制**: 为Token添加IP白名单
4. **到期提醒**: 设置日历提醒，提前1-2周续期
5. **使用命名规范**: 包含日期和用途，如 `prod-dns-2026-03`

### 4.2 轮换策略

推荐采用 **滚动轮换 (Rolling Rotation)**:

```
Step 1: 创建新Token (新旧Token并行运行)
Step 2: 更新所有服务使用新Token
Step 3: 验证所有服务正常运行
Step 4: 删除旧Token
```

### 4.3 监控建议

- 设置Token过期前7天、3天、1天的提醒
- 监控API调用失败率
- 记录Token使用日志

---

## 五、紧急恢复

如果Token意外过期或失效:

1. **立即登录Dashboard**: https://dash.cloudflare.com
2. **使用Global API Key** (如果有) 作为备用
3. **快速创建新Token** 并更新到所有服务
4. **检查服务状态** 确认恢复

---

## 六、相关链接

- [Cloudflare API Tokens Docs](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Cloudflare API Reference](https://developers.cloudflare.com/api/)
- [Permission Groups List](https://developers.cloudflare.com/fundamentals/api/reference/permissions/)

---

## 七、本次续期记录

| 项目 | 内容 |
|------|------|
| 续期截止日期 | 2026-03-27 |
| 计划完成日期 | 2026-03-25 |
| 负责人员 | - |
| 旧Token ID | - |
| 新Token ID | - |
| 续期完成时间 | - |
| 验证结果 | - |
