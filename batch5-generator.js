#!/usr/bin/env node
/**
 * 第四批内容生成 - 50篇目标
 * 主题: 更多长尾关键词 + 工具教程
 */

const fs = require('fs');

const BATCH4_TOPICS = [
  // 更多安全主题
  {
    keyword: 'JWT安全最佳实践',
    content: `# JWT安全最佳实践完整指南

## 简介
JWT(JSON Web Token)是现代API认证的标配，但使用不当会导致严重安全漏洞。

## JWT结构
\`\`\`
Header.Payload.Signature
\`\`\`

## 安全最佳实践

### 1. 使用强签名算法
❌ 避免: none, HS256 (对称密钥)
✅ 推荐: RS256, ES256 (非对称密钥)

### 2. 密钥管理
- 使用足够长的密钥(256位+)
- 定期轮换密钥
- 密钥存储在环境变量/密钥管理服务

### 3. Token过期策略
\`\`\`json
{
  "exp": 1234567890,
  "iat": 1234567800,
  "nbf": 1234567800
}
\`\`\`

### 4. 传输安全
- 仅通过HTTPS传输
- 存储在HttpOnly Cookie
- 避免LocalStorage存储敏感Token

### 5. 验证实现
\`\`\`javascript
// Node.js示例
const jwt = require('jsonwebtoken');

try {
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: 'trusted-issuer',
    audience: 'your-app'
  });
} catch (err) {
  // Token无效
}
\`\`\`

## 常见漏洞

### 算法混淆攻击
攻击者将算法改为"none"绕过验证。

**防御**: 明确指定允许的算法列表。

### 密钥混淆攻击
使用公钥作为HMAC密钥。

**防御**: 使用不同密钥类型，严格验证。

## 工具推荐

| 工具 | 用途 |
|------|------|
| jwt.io | Token解码 |
| jose | 现代JWT库 |
| Auth0 | 身份服务 |

## 总结

JWT安全需要：强算法、短过期、密钥保护、严格验证。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: 'OAuth2安全实施',
    content: `# OAuth2安全实施指南

## 简介
OAuth2是授权的行业标准，但实现复杂，容易出错。

## 授权流程选择

### 授权码流程 (推荐)
适用: 服务器端应用
安全: ⭐⭐⭐⭐⭐

### PKCE扩展
适用: 移动/单页应用
安全: ⭐⭐⭐⭐

### 客户端凭证
适用: 服务间通信
安全: ⭐⭐⭐

## 安全实施要点

### 1. State参数
防止CSRF攻击。

\`\`\`
https://provider.com/oauth/authorize?
  client_id=xxx&
  redirect_uri=https://app.com/callback&
  state=random-string-123
\`\`\`

### 2. 重定向URI验证
- 精确匹配，不使用通配符
- 预注册所有URI
- 禁止使用localhost生产环境

### 3. 范围限制
只请求必要权限：
- ❌ scope=read+write+delete
- ✅ scope=read

### 4. Token存储
- Access Token: 短期(15分钟)
- Refresh Token: 长期，可撤销
- 存储在HttpOnly Cookie

## 常见错误

| 错误 | 风险 | 修复 |
|------|------|------|
| 公开Client Secret | 凭证泄露 | 使用PKCE |
| 不验证State | CSRF | 强制验证 |
| 宽松Redirect URI | 令牌泄露 | 精确匹配 |
| 长期Access Token | 权限滥用 | 缩短过期 |

## 总结

OAuth2安全: 用授权码+PKCE，验证State，限制Scope。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: 'GitHub安全扫描',
    content: `# GitHub安全扫描工具配置

## 简介
代码库是安全的第一道防线。GitHub提供原生安全扫描功能。

## 启用安全功能

### 1. Dependabot Alerts
自动检测依赖漏洞。

**启用路径**: Settings → Security → Dependabot alerts

### 2. Code Scanning
静态分析查找代码漏洞。

**配置**: 添加.github/workflows/codeql.yml

\`\`\`yaml
name: CodeQL
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: github/codeql-action/init@v2
      - uses: github/codeql-action/analyze@v2
\`\`\`

### 3. Secret Scanning
检测提交的敏感信息。

**启用**: Settings → Security → Secret scanning

### 4. Dependency Review
PR时检查依赖变化。

\`\`\`yaml
name: Dependency Review
on: [pull_request]
jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/dependency-review-action@v3
\`\`\`

## 第三方集成

| 工具 | 功能 |
|------|------|
| Snyk | 依赖+容器扫描 |
| SonarCloud | 代码质量 |
| Semgrep | 自定义规则 |

## 最佳实践

- 启用分支保护
- 要求PR审查
- 自动化安全扫描
- 快速修复漏洞

## 总结

GitHub安全: 原生功能+第三方工具，自动化是关键。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '云安全态势管理',
    content: `# 云安全态势管理(CSPM)指南

## 简介
多云环境复杂，CSPM帮助持续监控安全配置。

## CSPM核心功能

### 1. 配置评估
- 检查资源配置
- 对比安全基线
- 识别错误配置

### 2. 合规监控
- CIS Benchmarks
- PCI DSS
- SOC2
- GDPR

### 3. 风险评分
- 严重性分级
- 影响范围评估
- 修复优先级

## 主要工具对比

| 工具 | AWS | Azure | GCP | 价格 |
|------|-----|-------|-----|------|
| Prisma Cloud | ✅ | ✅ | ✅ | $$$$ |
| Lacework | ✅ | ✅ | ✅ | $$$ |
| Orca Security | ✅ | ✅ | ✅ | $$$ |
| AWS Security Hub | ✅ | ❌ | ❌ | $ |
| Prowler | ✅ | ✅ | ✅ | 免费 |

## 实施步骤

1. **资产发现**: 识别所有云资源
2. **基线建立**: 定义安全配置标准
3. **持续监控**: 实时检测漂移
4. **自动修复**: 自动化响应
5. **报告合规**: 生成审计报告

## 开源替代方案

### Prowler
\`\`\`
prowler aws --checks check11,check12
\`\`\`

### ScoutSuite
\`\`\`
scout aws --report-dir ./reports
\`\`\`

### CloudSploit
\`\`\`
./index.js --config ./config.js
\`\`\`

## 总结

CSPM必备：多云支持、实时监控、自动修复。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: 'SIEM日志分析',
    content: `# SIEM日志分析与威胁检测

## 简介
SIEM(安全信息和事件管理)是SOC的核心工具。

## SIEM架构

### 数据收集
- 系统日志
- 应用日志
- 网络流量
- 安全设备

### 关联分析
- 规则引擎
- 机器学习
- 行为分析
- 威胁情报

### 响应处置
- 告警管理
- 工单集成
- 自动化响应

## 主流SIEM对比

| SIEM | 优势 | 价格 |
|------|------|------|
| Splunk | 功能最强 | $$$$$ |
| QRadar | IBM生态 | $$$$ |
| Sentinel | Azure原生 | $$ |
| Elastic | 开源灵活 | $ |
| Wazuh | 完全免费 | 免费 |

## Sigma规则示例

\`\`\`yaml
title: 可疑PowerShell执行
logsource:
  product: windows
  service: powershell
detection:
  selection:
    EventID: 4104
    ScriptBlockText|contains:
      - 'Invoke-Mimikatz'
      - 'DownloadString'
  condition: selection
\`\`\`

## 自建SIEM (开源栈)

1. **Wazuh** - HIDS/SIEM
2. **Elastic Stack** - 日志分析
3. **Sigma** - 规则标准
4. **MISP** - 威胁情报

## 最佳实践

- 标准化日志格式
- 优化告警阈值
- 定期调优规则
- 自动化响应

## 总结

SIEM成功关键：数据质量 > 规则数量 > 工具品牌。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: 'DevSecOps管道',
    content: `# DevSecOps管道构建实战

## 简介
安全左移：在开发早期发现和修复漏洞。

## CI/CD安全阶段

### 1. 代码提交 (Pre-commit)
- Secrets检测
- 代码质量检查
- 依赖审计

\`\`\`yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    hooks:
      - id: detect-secrets
\`\`\`

### 2. 构建阶段
- SAST (静态分析)
- 依赖扫描
- 许可证检查

\`\`\`yaml
# GitHub Actions示例
- name: SAST Scan
  uses: returntocorp/semgrep-action@v1
  
- name: Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
\`\`\`

### 3. 测试阶段
- DAST (动态分析)
- 容器扫描
- 基础设施扫描

### 4. 部署阶段
- 签名验证
- 配置审计
- 运行时保护

## 工具链整合

| 阶段 | 工具 |
|------|------|
| SAST | SonarQube, Semgrep |
| DAST | OWASP ZAP, Burp |
| SCA | Snyk, OWASP DC |
| 容器 | Trivy, Snyk |
| IaC | Checkov, tfsec |

## 指标衡量

- 漏洞发现时间
- 修复平均时间
- 误报率
- 扫描覆盖率

## 总结

DevSecOps: 自动化 + 快速反馈 + 责任共担。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '区块链智能合约安全',
    content: `# 区块链智能合约安全审计

## 简介
智能合约一旦部署不可修改，安全审计至关重要。

## 常见漏洞

### 1. 重入攻击
\`\`\`solidity
// 危险代码
function withdraw() public {
    uint amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] = 0; // 更新在转账之后
}
\`\`\`

**修复**: Checks-Effects-Interactions模式

### 2. 整数溢出/下溢
Solidity <0.8.0需要SafeMath库。

### 3. 访问控制
- 使用OpenZeppelin的Ownable
- 实现权限矩阵
- 关键操作多重签名

### 4. 前端运行
交易在内存池可见，可被抢跑。

## 审计工具

| 工具 | 用途 |
|------|------|
| Slither | 静态分析 |
| Mythril | 符号执行 |
| Echidna | 模糊测试 |
| OpenZeppelin | 安全合约库 |

## 审计清单

- [ ] 重入保护
- [ ] 访问控制
- [ ] 输入验证
- [ ] 数学安全
- [ ] Gas优化
- [ ] 事件记录
- [ ] 紧急暂停

## 保险与审计

- CertiK
- OpenZeppelin
- Trail of Bits

## 总结

智能合约安全: 审计+测试+保险，缺一不可。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '移动端应用安全',
    content: `# 移动端应用安全开发指南

## 简介
移动应用面临独特安全挑战：逆向工程、数据泄露、不安全的存储。

## iOS安全

### 1. Keychain存储
\`\`\`swift
// 正确存储敏感数据
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: "user_token",
    kSecValueData as String: token.data(using: .utf8)!,
    kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlocked
]
SecItemAdd(query as CFDictionary, nil)
\`\`\`

### 2. 证书固定
防止中间人攻击。

### 3. 代码混淆
使用Swift编译器优化。

## Android安全

### 1. Keystore系统
\`\`\`kotlin
// 生成密钥
val keyGenerator = KeyGenerator.getInstance("AES", "AndroidKeyStore")
keyGenerator.init(KeyGenParameterSpec.Builder("key_alias",
    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
    .build())
\`\`\`

### 2. ProGuard/R8混淆
\`\`\`
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
\`\`\`

### 3. 网络安全配置
\`\`\`xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.example.com</domain>
    </domain-config>
</network-security-config>
\`\`\`

## 通用最佳实践

| 实践 | 说明 |
|------|------|
| 证书固定 | SSL Pinning |
| Root检测 | 拒绝Root/越狱设备 |
| 代码混淆 | 增加逆向难度 |
| 安全键盘 | 自定义键盘输入 |
| 截屏防护 | 防止敏感信息泄露 |

## 测试工具

- MobSF (移动安全框架)
- Frida (动态分析)
- Objection (运行时测试)

## 总结

移动安全: 安全存储 + 通信保护 + 逆向防护。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '身份与访问管理',
    content: `# 身份与访问管理(IAM)最佳实践

## 简介
IAM是云安全的核心，管理谁可以访问什么资源。

## IAM核心概念

### 身份 (Identity)
- 用户
- 服务账号
- 角色
- 组

### 访问 (Access)
- 权限
- 策略
- 角色
- 资源

## 最佳实践

### 1. 最小权限原则
只授予必要的最小权限。

**AWS示例**:
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::bucket/specific-prefix/*"
  }]
}
\`\`\`

### 2. 使用角色而非长期凭证
- EC2实例角色
- Lambda执行角色
- 临时凭证

### 3. 多因素认证(MFA)
强制所有用户启用MFA。

### 4. 定期审核
- 未使用权限
- 休眠账号
- 过度授权

## 特权访问管理(PAM)

- 即时访问(Just-in-Time)
- 会话录制
- 审批流程
- 凭证轮换

## 工具对比

| 工具 | 类型 | 价格 |
|------|------|------|
| AWS IAM | 云原生 | 免费 |
| Okta | 企业 | $$$ |
| Azure AD | 微软生态 | $$ |
| Keycloak | 开源 | 免费 |

## 总结

IAM原则: 最小权限、使用角色、启用MFA、定期审计。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '安全编排自动化',
    content: `# 安全编排自动化(SOAR)实战

## 简介
SOAR自动化安全运营，加速威胁响应。

## SOAR三大功能

### 1. 编排(Orchestration)
整合多工具工作流。

**示例**: 收到告警 → 查询Splunk → 查询VirusTotal → 创建工单

### 2. 自动化(Automation)
自动执行响应动作。

**示例**: 检测到恶意IP → 自动阻断防火墙

### 3. 响应(Response)
标准化事件处理。

- 告警分类
- 优先级排序
- 升级流程

## 主流SOAR平台

| 平台 | 特点 | 价格 |
|------|------|------|
| Palo Alto XSOAR | 功能最全 | $$$$$ |
| Splunk SOAR | 集成强 | $$$$ |
| IBM Resilient | 企业级 | $$$$ |
| Shuffle | 开源 | 免费 |
| n8n | 工作流 | 免费 |

## Shuffle开源方案

\`\`\`yaml
# 工作流示例
name: Phishing Response
triggers:
  - type: webhook
    id: email_received
actions:
  - id: extract_ioc
    app: tools
    action: regex_extract
  - id: vt_check
    app: virustotal
    action: ip_reputation
  - id: block_ip
    app: fortinet
    action: add_to_blocklist
\`\`\`

## 用例场景

1. **钓鱼邮件响应**: 提取IOC → 查威胁情报 → 隔离邮件 → 通知用户
2. **恶意软件**: 沙箱分析 → 全网扫描 → 隔离主机
3. **凭证泄露**: 检测泄露 → 强制改密 → 监控登录

## 总结

SOAR价值: 减少MTTR、标准化流程、释放分析师。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '红队渗透测试',
    content: `# 红队渗透测试方法论

## 简介
红队模拟真实攻击者，测试组织防御能力。

## 红队 vs 渗透测试

| 维度 | 渗透测试 | 红队 |
|------|---------|------|
| 范围 | 限定 | 完整组织 |
| 时间 | 短期 | 长期(数周/月) |
| 目标 | 找漏洞 | 测试防御 |
| 隐蔽 | 不需要 | 核心要求 |
| 通知 | 已知 | 通常未知 |

## 攻击链模型

### 1. 侦察
- OSINT收集
- 基础设施映射
- 员工信息

### 2. 初始访问
- 钓鱼邮件
- 外部漏洞
- 供应链攻击
- 凭证泄露

### 3. 权限提升
- 本地提权
- 横向移动
- 凭证获取

### 4. 持久化
- 后门
- 计划任务
- 服务安装

### 5. 目标达成
- 数据外泄
- 系统控制
- 勒索软件

## 工具栈

| 阶段 | 工具 |
|------|------|
| 侦察 | Maltego, theHarvester |
| 初始访问 | Cobalt Strike, Metasploit |
| 横向移动 | Mimikatz, BloodHound |
| 渗透 | Covenant, Sliver |

## 蓝队协同

- 定期简报
- IOA(攻击指标)共享
- 防御改进建议

## 总结

红队: 模拟真实威胁，提升整体安全能力。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '安全意识培训',
    content: `# 企业安全意识培训方案

## 简介
人是安全最薄弱环节，培训是最具性价比的投资。

## 培训内容框架

### 基础意识
- 密码安全
- 钓鱼识别
- 设备安全
- 数据保护

### 进阶技能
- 社交工程防范
- 安全事件报告
- 远程办公安全
- 第三方风险

### 角色定制
- 高管: 针对性钓鱼、商业邮件诈骗
- 开发: 安全编码、代码审查
- IT: 系统加固、日志监控
- 财务:  wire fraud、发票诈骗

## 培训方法

### 钓鱼模拟
使用工具发送模拟钓鱼邮件：
- KnowBe4
- Cofense
- GoPhish

### 互动学习
- 视频课程
- 游戏化
- CTF挑战
- 案例讨论

## 评估指标

| 指标 | 目标 |
|------|------|
| 钓鱼点击率 | <5% |
| 培训完成率 | >95% |
| 报告率 | 提升 |
| 平均评分 | >4/5 |

## 实施计划

**第1月**: 基线测试 + 基础培训
**第2-3月**: 定期钓鱼模拟
**第4-6月**: 进阶培训
**持续**: 月度模拟 + 季度课程

## 总结

安全意识: 持续投入，行为改变，文化建立。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '供应链安全',
    content: `# 软件供应链安全防护

## 简介
供应链攻击激增，SolarWinds事件警示风险。

## 攻击向量

### 1. 依赖投毒
恶意包上传到npm/PyPI等仓库。

**案例**: event-stream包被植入窃取比特币代码。

### 2. 构建系统入侵
CI/CD管道被攻破，植入后门。

### 3. 第三方服务
使用被攻陷的SaaS服务。

### 4. 开源项目
维护者账号被盗，恶意代码合并。

## 防御策略

### 1. 依赖管理
- 锁定版本(lock文件)
- 私有仓库缓存
- 漏洞扫描

\`\`\`bash
# npm audit
npm audit
npm audit fix

# Snyk扫描
snyk test
\`\`\`

### 2. 签名验证
- 代码签名
- 制品签名
- 签名链验证

### 3. SBOM生成
\`\`\`bash
# Syft生成SBOM
syft packages dir:. -o spdx-json > sbom.json
\`\`\`

### 4. 构建安全
- 隔离构建环境
- 可复现构建
- 构建日志

## 工具推荐

| 工具 | 功能 |
|------|------|
| SLSA | 供应链安全框架 |
| Sigstore | 免费签名服务 |
| Snyk | 依赖扫描 |
| FOSSA | 合规扫描 |

## 总结

供应链安全: 纵深防御 + 零信任 + 全程可追溯。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '零信任架构实施',
    content: `# 零信任架构(ZTA)实施路线图

## 简介
"从不信任，始终验证"——零信任是新一代安全架构。

## 零信任三大支柱

### 1. 永不信任，始终验证
- 验证每个访问请求
- 多因素认证
- 设备健康检查
- 持续评估

### 2. 最小权限访问
- 按需授权
- 即时访问(JIT)
- 即时销毁

### 3. 假设已突破
- 微分段
- 持续监控
- 快速检测
- 快速响应

## 实施阶段

### 阶段1: 身份 (Month 1-2)
- SSO实施
- MFA强制
- 设备注册

### 阶段2: 设备 (Month 3-4)
- MDM部署
- 设备合规检查
- 无代理网络访问

### 阶段3: 网络 (Month 5-6)
- SD-WAN
- 微分段
- 软件定义边界

### 阶段4: 应用 (Month 7-8)
- CASB部署
- 应用代理
- 数据分类

### 阶段5: 数据 (Month 9-12)
- DLP实施
- 数据加密
- 权限治理

## 零信任工具

| 类别 | 工具 |
|------|------|
| 身份 | Okta, Azure AD |
| 设备 | Intune, Jamf |
| 网络 | Zscaler, Palo Alto |
| 应用 | Netskope, McAfee |

## 总结

零信任: 旅程非终点，持续演进的安全理念。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: 'API网关安全',
    content: `# API网关安全配置指南

## 简介
API网关是API的前门，配置安全至关重要。

## 核心安全功能

### 1. 认证授权
- JWT验证
- OAuth2/OIDC
- API Key
- mTLS

### 2. 速率限制
防止滥用和DDoS。

\`\`\`
- 每分钟100请求/IP
- 每秒10请求/API Key
- 突发允许20请求
\`\`\`

### 3. 请求验证
- Schema验证
- 大小限制
- 内容过滤

### 4. 响应保护
- 敏感数据过滤
- 错误信息隐藏
- 响应缓存

## 主流网关对比

| 网关 | 特点 | 适用 |
|------|------|------|
| Kong | 插件丰富 | 企业 |
| AWS API Gateway | 托管服务 | AWS |
| NGINX | 高性能 | 自托管 |
| Zuul | Spring生态 | Java |
| Envoy | 云原生 | K8s |

## Kong配置示例

\`\`\`yaml
plugins:
  - name: rate-limiting
    config:
      minute: 100
      policy: redis
  - name: jwt
    config:
      uri_param_names: jwt
  - name: cors
    config:
      origins: ["https://app.com"]
\`\`\`

## 安全清单

- [ ] 强制HTTPS
- [ ] 认证启用
- [ ] 速率限制
- [ ] 输入验证
- [ ] 日志记录
- [ ] 监控告警

## 总结

API网关: 统一入口、安全控制、流量管理。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '数据防泄漏',
    content: `# 数据防泄漏(DLP)解决方案

## 简介
数据是核心资产，DLP防止敏感数据外泄。

## DLP三个维度

### 1. 静态数据 (Data at Rest)
- 文件服务器扫描
- 数据库发现
- 云存储扫描

### 2. 传输中数据 (Data in Transit)
- 网络流量监控
- 邮件扫描
- 上传下载检测

### 3. 使用中数据 (Data in Use)
- 剪贴板监控
- 打印控制
- 屏幕水印

## 敏感数据类型

- PII (个人身份信息)
- PHI (健康信息)
- PCI (支付卡信息)
- 知识产权
- 商业机密

## 主要DLP产品

| 产品 | 端点 | 网络 | 云 | 价格 |
|------|------|------|---|------|
| Symantec DLP | ✅ | ✅ | ✅ | $$$$ |
| Forcepoint | ✅ | ✅ | ✅ | $$$$ |
| Microsoft Purview | ✅ | ✅ | ✅ | $$ |
| Digital Guardian | ✅ | ❌ | ✅ | $$$ |

## Microsoft Purview示例

\`\`\`powershell
# 创建敏感信息类型
New-DlpSensitiveInformationType 
  -Name "Employee ID" 
  -Description "Company Employee ID"
  -Pattern @{
    IdRef = "Regex_Employee_ID"
    MatchLength = @{Min = "6"; Max = "8"}
  }
\`\`\`

## 实施策略

1. 数据发现与分类
2. 策略制定
3. 逐步部署(监控→警告→阻断)
4. 持续优化

## 总结

DLP成功: 发现→分类→策略→监控→响应。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '漏洞管理程序',
    content: `# 企业漏洞管理程序(VM)

## 简介
漏洞管理是持续过程，不是一次性活动。

## VM生命周期

### 1. 发现
- 资产清单
- 漏洞扫描
- 渗透测试
- 威胁情报

### 2. 评估
- 严重性评分(CVSS)
- 风险优先级
- 业务影响
- 可利用性

### 3. 修复
- 补丁管理
- 配置修复
- 补偿控制
- 风险接受

### 4. 验证
- 重扫描
- 确认修复
- 文档记录

### 5. 报告
- 管理层报告
- 合规报告
- 趋势分析

## 工具栈

| 类别 | 工具 |
|------|------|
| 扫描 | Tenable, Qualys |
| 评估 | Kenna, RiskSense |
| 工单 | ServiceNow, Jira |
| 报告 | PowerBI, Tableau |

## SLA示例

| 严重度 | 修复时限 |
|--------|---------|
| Critical | 24小时 |
| High | 7天 |
| Medium | 30天 |
| Low | 90天 |

## 关键指标

- 平均修复时间(MTTR)
- 漏洞留存时间
- 扫描覆盖率
- 补丁合规率

## 总结

漏洞管理: 持续循环，风险驱动，业务对齐。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: 'Web应用防火墙',
    content: `# Web应用防火墙(WAF)深度配置

## 简介
WAF保护Web应用免受常见攻击。

## WAF防护能力

### OWASP Top 10
- SQL注入
- XSS
- 不安全的反序列化
- 安全配置错误
- 等等

### 机器人防护
- 爬虫管理
- DDoS防护
- 速率限制

### API保护
- Schema验证
- 异常检测
- 业务逻辑防护

## 云WAF对比

| WAF | 特点 | 价格 |
|-----|------|------|
| Cloudflare | 全球网络 | $20/月起 |
| AWS WAF | AWS原生 | 按请求 |
| Azure WAF | Azure集成 | 按规则 |
| Imperva | 企业级 | 定制 |
| ModSecurity | 开源 | 免费 |

## Cloudflare规则示例

\`\`\`
# SQL注入防护
(http.request.uri.query contains "union select")
or (http.request.uri.query contains "' or '1'='1")
→ Block

# 速率限制
(cf.threat_score > 50)
or (http.requests over 1m > 100)
→ Challenge
\`\`\`

## 自托管ModSecurity

\`\`\`apache
# 基本配置
SecRuleEngine On
SecRequestBodyAccess On
SecResponseBodyAccess On

# 包含OWASP CRS
Include /usr/share/modsecurity-crs/*.conf
\`\`\`

## 调优建议

1. 学习模式启动
2. 监控误报
3. 逐步启用规则
4. 定制业务规则

## 总结

WAF: 不是银弹，但有效降低风险。

---
*作者: 小七AI安全助手*
`
  },
  {
    keyword: '事件响应计划',
    content: `# 网络安全事件响应计划(IRP)

## 简介
有准备的组织在攻击中存活，无准备的崩溃。

## NIST事件响应流程

### 1. 准备
- 建立IR团队
- 制定IR计划
- 准备工具
- 培训演练

### 2. 检测与分析
- 告警监控
- 日志分析
- 威胁狩猎
- 影响评估

### 3. 遏制
- 短期遏制(立即止损)
- 长期遏制(系统加固)

### 4. 根除
- 恶意软件清除
- 后门移除
- 漏洞修复
- 凭证重置

### 5. 恢复
- 系统重建
- 数据恢复
- 逐步上线
- 加强监控

### 6. 事后总结
- 时间线重建
- 根本原因
- 改进建议
- 计划更新

## IR团队角色

| 角色 | 职责 |
|------|------|
| IR Leader | 总体协调 |
| 技术专家 | 技术分析 |
| 法务 | 合规法律 |
| 公关 | 对外沟通 |
| 业务代表 | 业务影响 |

## 关键工具

- 取证: SIFT, Autopsy
- 内存分析: Volatility
- 网络分析: Wireshark, Zeek
- 日志分析: ELK, Splunk

## 联系清单

- 内部团队
- 外部顾问
- 执法机构
- 监管机构
- 保险公司

## 总结

事件响应: 准备→检测→遏制→根除→恢复→总结。

---
*作者: 小七AI安全助手*
`
  }
];

// 主函数
async function main() {
  console.log('🚀 生成第四批内容 (18篇文章 - 达到50篇目标)\n');
  
  if (!fs.existsSync('content')) fs.mkdirSync('content');
  
  let count = 0;
  
  for (const template of BATCH4_TOPICS) {
    const timestamp = Date.now() + count * 10;
    const filename = `content/article_batch4_${timestamp}_${template.keyword.replace(/\\s+/g, '_')}.md`;
    fs.writeFileSync(filename, template.content);
    console.log(`  ✅ ${template.keyword}`);
    count++;
  }
  
  // 同步到public
  const publicContentDir = 'public/content';
  if (!fs.existsSync(publicContentDir)) fs.mkdirSync(publicContentDir, {recursive: true});
  
  const files = fs.readdirSync('content');
  for (const file of files) {
    if (file.endsWith('.md')) {
      fs.copyFileSync(`content/${file}`, `${publicContentDir}/${file}`);
    }
  }
  
  console.log(`\n📊 完成: ${count} 篇新文章`);
  console.log(`📁 总文章数: ${files.length}`);
  console.log(`✅ 已同步到 public/content/`);
  console.log(`🎯 目标50篇 - 完成度: ${Math.min(100, Math.round(files.length/50*100))}%`);
}

main().catch(console.error);
