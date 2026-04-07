#!/usr/bin/env node
/**
 * 第二批内容生成 - 扩展SEO覆盖
 * 小七AI Agent自主执行
 */

const fs = require('fs');

const BATCH2_TOPICS = [
  {
    keyword: 'Web应用防火墙WAF',
    category: 'security',
    content: `# Web应用防火墙WAF选型与配置指南

## 简介
Web应用防火墙(WAF)是保护Web应用的第一道防线。本文对比主流WAF解决方案。

## 什么是WAF

WAF通过监控、过滤和阻断HTTP流量来保护Web应用，防御SQL注入、XSS等攻击。

## 主流WAF对比

| WAF | 类型 | 价格 | 适合场景 |
|-----|------|------|---------|
| Cloudflare WAF | 云 | 免费-$200/月 | 中小企业 |
| AWS WAF | 云 | 按量计费 | AWS用户 |
| ModSecurity | 开源 | 免费 | 自托管 |
| Imperva | 企业 | 定制 | 大型企业 |

## Cloudflare WAF配置

### 免费版
- OWASP核心规则集
- 基础DDoS防护
- 5条自定义规则

### Pro版($20/月)
- 托管规则集
- 高级DDoS防护
- 25条自定义规则

## ModSecurity配置示例

\`\`\`apache
# 启用ModSecurity
SecRuleEngine On

# 自定义规则
SecRule REQUEST_URI "@contains /admin" \\
  "id:1001,deny,status:403,msg:'Admin access blocked'"
\`\`\`

## 选择建议

- **个人/小团队**: Cloudflare免费版
- **中小企业**: Cloudflare Pro或AWS WAF
- **企业级**: Imperva或自托管ModSecurity

## 总结

WAF是必需的安全层，但不要依赖它替代代码安全。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '渗透测试入门',
    category: 'security',
    content: `# 渗透测试入门完全指南 (2025版)

## 简介
想学习渗透测试？本文提供从零到入门的完整路径。

## 什么是渗透测试

模拟攻击者手段，发现系统漏洞，帮助修复安全问题。

## 学习路径

### 第1阶段: 基础 (1-2个月)
- 网络基础 (TCP/IP, HTTP)
- Linux命令行
- Python/Go基础
- Web技术栈

### 第2阶段: 工具 (2-3个月)
- Nmap端口扫描
- Burp Suite代理
- Metasploit框架
- SQLMap注入测试

### 第3阶段: 实战 (持续)
- CTF比赛
- HackTheBox靶机
- Bug Bounty项目

## 推荐工具

| 工具 | 用途 | 价格 |
|------|------|------|
| Kali Linux | 渗透测试OS | 免费 |
| Burp Suite | Web测试 | $399/年 |
| OWASP ZAP | 开源替代 | 免费 |
| Nmap | 端口扫描 | 免费 |

## 认证路径

1. **eJPT** - 初级 (免费)
2. **OSCP** - 行业标准 ($1,600)
3. **CEH** - 企业认可 ($1,200)

## 法律警告

⚠️ 只在授权系统上测试！
- 自己的系统
- CTF平台
- 有明确授权的渗透测试项目

## 总结

渗透测试是高需求技能，系统学习6-12个月可入门。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: 'DevSecOps实践',
    category: 'devops',
    content: `# DevSecOps实践指南: 安全左移

## 简介
DevSecOps将安全融入开发全流程，实现"安全即代码"。

## 核心理念

- **安全左移**: 早期发现并修复漏洞
- **自动化**: CI/CD集成安全检查
- **共享责任**: 开发+运维+安全团队协作

## CI/CD安全流水线

\`\`\`yaml
# GitLab CI示例
stages:
  - security
  - build
  - deploy

sast:
  stage: security
  image: returntocorp/semgrep
  script:
    - semgrep --config=auto .

dependency_scanning:
  stage: security
  script:
    - npm audit --audit-level=moderate

container_scanning:
  stage: security
  image: aquasec/trivy
  script:
    - trivy image YOUR_REGISTRY_IMAGE
\`\`\`

## 工具栈

| 类别 | 工具 |
|------|------|
| SAST | SonarQube, Semgrep |
| DAST | OWASP ZAP, Burp Suite |
| SCA | Snyk, WhiteSource |
| 秘密检测 | GitLeaks, TruffleHog |

## 实施步骤

1. **评估现状** - 当前安全成熟度
2. **选择工具** - 根据技术栈
3. **集成CI/CD** - 自动化安全检查
4. **培训团队** - 安全意识提升
5. **持续改进** - 度量与优化

## ROI

- 漏洞修复成本降低 80%
- 发布速度提升 40%
- 安全事件减少 60%

## 总结

DevSecOps不是工具，是文化和流程变革。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '加密货币安全',
    category: 'security',
    content: `# 加密货币安全保管完全指南

## 简介
加密货币被盗事件频发。本文教你如何安全保管数字资产。

## 钱包类型

### 热钱包 (在线)
- MetaMask - 浏览器插件
- Trust Wallet - 移动端
- 适合: 小额日常交易

### 冷钱包 (离线)
- Ledger - 硬件钱包
- Trezor - 硬件钱包
- 适合: 大额长期存储

## 安全最佳实践

### 1. 助记词保管
\`\`\`
✅ 手写多份，存放不同地点
✅ 使用金属助记词板 (防火防水)
❌ 绝不截图或存云端
❌ 绝不告诉任何人
\`\`\`

### 2. 防范钓鱼
- 只使用官方网址
- 安装防钓鱼插件
- 验证合约地址

### 3. 交易安全
- 小额测试后再大额转账
- 使用硬件钱包确认交易
- 注意Gas费设置

## 工具推荐

| 工具 | 用途 |
|------|------|
| Revoke.cash | 撤销授权 |
| Etherscan | 链上查询 |
| DeBank | 资产管理 |

## 常见骗局

⚠️ **永远不要相信**:
- "客服"私信
- 高收益投资回报
- 空投需要先转账
- 私信发送的链接

## 总结

你的密钥 = 你的资产。安全第一，谨慎操作。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '身份认证最佳实践',
    category: 'security',
    content: `# 现代身份认证最佳实践 (2025)

## 简介
身份认证是安全的第一道门。本文介绍现代认证方案。

## 认证方式演进

### 1. 密码认证 (传统)
- 单因素，易泄露
- 需要复杂密码策略

### 2. 多因素认证 (MFA)
- 密码 + 手机/硬件密钥
- 大幅提升安全性

### 3. 无密码认证 (未来)
- Passkeys (WebAuthn)
- 生物识别
- 硬件安全密钥

## MFA实施方案

### TOTP (推荐)
\`\`\`javascript
// 使用 speakeasy
const speakeasy = require('speakeasy');

const secret = speakeasy.generateSecret({
  name: 'MyApp'
});

// 验证
const verified = speakeasy.totp.verify({
  secret: user.secret,
  encoding: 'base32',
  token: userInput
});
\`\`\`

### WebAuthn/Passkeys
\`\`\`javascript
// 浏览器原生支持
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array([/* ... */]),
    rp: { name: 'MyApp' },
    user: { id: userId, name: 'user', displayName: 'User' },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }]
  }
});
\`\`\`

## 工具推荐

| 工具 | 用途 | 价格 |
|------|------|------|
| Authy | 2FA管理 | 免费 |
| YubiKey | 硬件密钥 | $50 |
| Okta | 企业SSO | $2/用户/月 |

## 实施建议

1. **强制MFA** - 所有敏感操作
2. **支持Passkeys** - 下一代认证
3. **会话管理** - 短有效期+刷新
4. **异常检测** - 异地登录告警

## 总结

逐步迁移到无密码认证，提升用户体验和安全性。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '云安全基础',
    category: 'cloud',
    content: `# 云安全基础: AWS/Azure/GCP安全入门

## 简介
云安全是共享责任模型。本文介绍三大云平台安全基础。

## 共享责任模型

| 责任 | 云提供商 | 客户 |
|------|---------|------|
| 物理安全 | ✅ | |
| 网络安全 | ✅ | |
| 操作系统 | | ✅ |
| 应用安全 | | ✅ |
| 数据保护 | | ✅ |

## AWS安全基础

### IAM最佳实践
- 使用角色，不用长期凭证
- 最小权限原则
- 启用MFA
- 定期轮换密钥

### 安全服务
- GuardDuty - 威胁检测
- WAF - Web防火墙
- Shield - DDoS防护
- KMS - 密钥管理

## Azure安全基础

### Microsoft Defender for Cloud
- 安全态势管理
- 工作负载保护
- 合规性监控

### 关键服务
- Azure AD - 身份管理
- Key Vault - 密钥管理
- Sentinel - SIEM/SOAR

## GCP安全基础

### Cloud IAM
- 资源层级权限
- 服务账号管理
- 条件访问

### 安全工具
- Security Command Center
- Cloud Armor (WAF)
- Secret Manager

## 通用建议

1. **启用CloudTrail/Activity Log** - 审计日志
2. **配置告警** - 异常行为通知
3. **定期扫描** - 配置漂移检测
4. **加密数据** - 传输和静态加密

## 总结

云安全需要持续监控和自动化防护。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '日志分析与监控',
    category: 'monitoring',
    content: `# 安全日志分析与监控实战

## 简介
日志是安全的眼睛。本文介绍如何有效收集、分析和监控安全日志。

## 日志收集架构

### 架构图
\`\`\`
应用/服务器 → Logstash/Filebeat → Elasticsearch ← Kibana
                    ↓
              SIEM/告警系统
\`\`\`

## 工具对比

| 工具 | 类型 | 价格 | 适用 |
|------|------|------|------|
| ELK Stack | 开源 | 免费 | 自托管 |
| Splunk | 商业 | 昂贵 | 企业 |
| Datadog | SaaS | $15/月 | 云原生 |
| Grafana | 开源 | 免费 | 可视化 |

## ELK快速部署

\`\`\`yaml
# docker-compose.yml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
  
  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  
  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
\`\`\`

## 关键日志源

1. **系统日志** - /var/log/syslog
2. **应用日志** - 访问日志、错误日志
3. **安全日志** - 认证失败、权限变更
4. **网络日志** - 防火墙、IDS/IPS

## 告警规则

\`\`\`
- 多次登录失败 → 暴力攻击
- 异常时间访问 → 内部威胁
- 大流量出站 → 数据泄露
- 权限提升 → 横向移动
\`\`\`

## 总结

集中日志管理是安全运营的基础。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '应急响应计划',
    category: 'security',
    content: `# 网络安全应急响应计划 (IRP)

## 简介
安全事件不可避免，关键是快速响应。本文提供应急响应计划模板。

## 应急响应流程

### 1. 准备阶段
- 组建响应团队
- 制定响应流程
- 准备工具包
- 定期演练

### 2. 检测与分析
- 告警触发
- 事件确认
- 影响评估
- 证据保全

### 3. 遏制与消除
- 隔离受影响系统
- 阻断攻击向量
- 修复漏洞
- 清除恶意软件

### 4. 恢复与总结
- 系统恢复
- 业务恢复
- 事后复盘
- 改进措施

## 响应团队角色

| 角色 | 职责 |
|------|------|
| 事件指挥官 | 总体协调 |
| 技术专家 | 技术分析 |
| 沟通专员 | 内外沟通 |
| 法务顾问 | 法律合规 |

## 关键工具

- **取证**: Autopsy, Volatility
- **网络**: Wireshark, tcpdump
- **内存**: Rekall, MemProcFS
- **沙箱**: Cuckoo, ANY.RUN

## 外部资源

- CISA (美国)
- NCSC (英国)
- 本地CERT组织

## 响应计划模板

\`\`\`
1. 联系清单
   - 响应团队成员
   - 管理层
   - 外部顾问

2. 关键资产清单
   - 核心业务系统
   - 关键数据位置
   - 备份位置

3. 决策树
   - 是否断开网络？
   - 是否报警？
   - 是否通知客户？
\`\`\`

## 总结

准备充分才能从容应对。

---
*作者: 小七AI安全助手*
`
  }
];

// 主函数
async function main() {
  console.log('🚀 生成第二批内容 (8篇文章)\n');
  
  // 创建目录
  if (!fs.existsSync('content')) fs.mkdirSync('content');
  
  let count = 0;
  
  // 生成文章
  for (const template of BATCH2_TOPICS) {
    const filename = `content/article_batch2_${Date.now()}_${template.keyword.replace(/\\s+/g, '_')}.md`;
    fs.writeFileSync(filename, template.content);
    console.log(`  ✅ ${template.keyword}`);
    count++;
    // 稍微延迟避免同名
    await new Promise(r => setTimeout(r, 10));
  }
  
  // 更新public目录
  const publicContentDir = 'public/content';
  if (!fs.existsSync(publicContentDir)) fs.mkdirSync(publicContentDir, {recursive: true});
  
  // 复制到public
  const files = fs.readdirSync('content');
  for (const file of files) {
    fs.copyFileSync(`content/${file}`, `${publicContentDir}/${file}`);
  }
  
  console.log(`\n📊 完成: ${count} 篇新文章`);
  console.log(`📁 总文章数: ${files.length}`);
  console.log(`\n✅ 已同步到 public/content/`);
}

main().catch(console.error);
