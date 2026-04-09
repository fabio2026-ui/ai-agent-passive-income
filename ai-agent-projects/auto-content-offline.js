#!/usr/bin/env node
/**
 * 备份内容生成系统 - 离线模式
 * 小七AI Agent - 预置模板
 */

const fs = require('fs');

// 预置的高质量文章模板
const ARTICLE_TEMPLATES = [
  {
    keyword: 'XSS攻击防护',
    category: 'security',
    content: `# XSS攻击防护完全指南 (2025版)

## 简介
跨站脚本攻击(XSS)仍是2025年最常见的Web安全漏洞之一。本文将提供实战级的防护方案。

## 什么是XSS攻击

XSS攻击允许攻击者将恶意脚本注入到其他用户浏览的网页中。主要分为三类：
- **反射型XSS**: 通过URL参数注入
- **存储型XSS**: 恶意脚本存储在服务器
- **DOM型XSS**: 通过客户端JavaScript注入

## 防护措施

### 1. 输入验证与净化
使用DOMPurify净化HTML输入，确保用户输入不包含恶意脚本。

### 2. Content Security Policy (CSP)
配置CSP头部限制页面可以加载的资源，阻止内联脚本的执行。

### 3. 输出编码
React等现代框架自动转义输出。原生JavaScript需要手动编码特殊字符。

## 2025年新趋势

- **Trusted Types API**: Google推行的全新防护机制
- **自动XSS检测工具**: 集成到CI/CD流程
- **AI驱动的漏洞扫描**: 实时检测潜在XSS

## 总结

XSS防护需要多层次策略：输入验证、输出编码、CSP策略、定期安全审计。

---
*作者: 小七AI安全助手*
*标签: #XSS #CyberSecurity #WebSecurity*
`
  },
  {
    keyword: 'SQL注入检测',
    category: 'security',
    content: `# SQL注入检测与防护实战手册

## 简介
SQL注入攻击依然是数据库安全的首要威胁。本文介绍2025年最新的检测和防护技术。

## SQL注入原理

攻击者通过在输入中插入SQL代码，操纵数据库查询逻辑。

## 检测方法

### 1. 静态代码分析
使用Semgrep等工具扫描代码中的SQL拼接模式。

### 2. 动态测试
使用SQLMap自动化检测注入点，进行渗透测试。

### 3. 运行时监控
启用数据库查询日志，监控异常查询模式。

## 防护措施

### 参数化查询 (最佳实践)
始终使用参数化查询或预编译语句，绝不要拼接SQL字符串。

### ORM框架
使用Prisma、TypeORM等现代ORM框架，自动防护SQL注入。

## 2025年工具推荐

| 工具 | 类型 | 价格 |
|------|------|------|
| Snyk | SAST | 免费起步 |
| SQLMap | DAST | 开源 |
| Burp Suite | 综合 | $399/年 |

## 总结

使用参数化查询 + 定期扫描 + WAF防护，可有效防御SQL注入。

---
*作者: 小七AI安全助手*
*标签: #SQLInjection #DatabaseSecurity #DevSecOps*
`
  },
  {
    keyword: 'API安全最佳实践',
    category: 'security',
    content: `# API安全最佳实践 (2025完整指南)

## 简介
API安全是现代应用安全的基石。本文涵盖从认证到监控的全方位防护策略。

## 1. 认证与授权

### JWT最佳实践
- 使用强签名算法(HS256/RS256)
- 设置短有效期(1小时内)
- 实现Token刷新机制

### OAuth 2.1 (2025标准)
- PKCE必用: 所有公共客户端
- 最短token有效期: 5分钟
- 刷新token轮换: 强制启用

## 2. 速率限制
实施请求频率限制，防止暴力攻击和滥用。

## 3. 输入验证
使用Zod、Joi等Schema验证库，严格验证所有输入。

## 4. 安全Headers
使用Helmet中间件自动配置安全HTTP头部。

## 5. API版本控制
实施语义化版本控制，平滑演进API。

## 6. 监控与日志
记录所有API调用，设置异常检测告警。

## API安全清单

- [ ] 使用HTTPS (TLS 1.3+)
- [ ] 实现认证机制
- [ ] 添加速率限制
- [ ] 验证所有输入
- [ ] 实施最小权限原则
- [ ] 启用安全Headers
- [ ] 记录安全事件
- [ ] 定期安全审计

## 2025年新趋势

- **GraphQL安全**: 查询深度限制、复杂度分析
- **gRPC安全**: mTLS强制、证书轮转
- **API网关**: 统一安全策略、流量管理

---
*作者: 小七AI安全助手*
*标签: #APISecurity #BestPractices #DevSecOps*
`
  },
  {
    keyword: '供应链攻击防范',
    category: 'security',
    content: `# 供应链攻击防范企业级方案

## 简介
供应链攻击(如SolarWinds事件)已成为国家级威胁。本文提供企业级防护策略。

## 什么是供应链攻击

攻击者通过入侵软件供应商，将恶意代码植入合法软件，进而攻击下游客户。

## 攻击向量

1. **恶意依赖包**: npm/pypi恶意包
2. **构建系统入侵**: CI/CD管道污染
3. **第三方服务**: 被入侵的SaaS服务
4. **开源贡献**: 恶意PR合并

## 防护措施

### 1. 依赖管理
使用npm audit、Snyk等工具持续监控依赖漏洞。

### 2. 依赖锁定
使用package-lock.json或yarn.lock确保依赖版本一致性。

### 3. SBOM (软件物料清单)
生成并维护SBOM，追踪所有软件组件。

### 4. 签名验证
验证npm包签名，使用Cosign签名容器镜像。

### 5. 隔离构建环境
使用多阶段Docker构建，最小化攻击面。

## 企业级策略

### 1. 供应商安全评估
- 安全认证 (SOC2, ISO 27001)
- 渗透测试报告
- 事件响应计划

### 2. 零信任架构
- 持续验证所有组件
- 微隔离
- 最小权限

### 3. 威胁情报
- 订阅CVE数据库
- 行业信息共享 (ISAC)
- 自动化响应

## 2025年工具栈

| 类别 | 工具 | 用途 |
|------|------|------|
| SCA | Snyk, OWASP DC | 依赖漏洞扫描 |
| SAST | Semgrep, SonarQube | 代码安全分析 |
| SBOM | Syft, CycloneDX | 物料清单生成 |
| 签名 | Sigstore, Cosign | 制品签名验证 |

## 总结

供应链安全需要全生命周期管理：从依赖选择、构建安全、到运行时监控。

---
*作者: 小七AI安全助手*
*标签: #SupplyChain #EnterpriseSecurity #DevSecOps*
`
  }
];

// Twitter帖子模板
const TWITTER_TEMPLATES = [
  "XSS防护小贴士:\\n1. 始终净化用户输入\\n2. 使用CSP策略\\n3. 现代框架自动转义\\n\\n#CyberSecurity #WebDev",
  "SQL注入仍是2025年Top 3漏洞\\n\\n防御很简单:\\n✅ 参数化查询\\n❌ 永不拼接SQL\\n\\n#DatabaseSecurity #DevSecOps",
  "API安全清单:\\n☑️ HTTPS强制\\n☑️ 速率限制\\n☑️ 输入验证\\n☑️ 认证授权\\n☑️ 安全日志\\n\\n#APISecurity #BestPractices",
  "供应链攻击正在上升\\n\\n保护你的依赖:\\n1. 锁定版本\\n2. 定期审计\\n3. 验证签名\\n\\n#SupplyChainSecurity",
  "零信任架构 = 永不信任，始终验证\\n\\n2025年必备安全策略\\n\\n#ZeroTrust #CyberSecurity"
];

// 主函数
async function main() {
  console.log('🚀 启动备份内容生成系统\\n');
  
  // 创建目录
  if (!fs.existsSync('content')) fs.mkdirSync('content');
  if (!fs.existsSync('marketing')) fs.mkdirSync('marketing');
  if (!fs.existsSync('output')) fs.mkdirSync('output');
  
  let articleCount = 0;
  let tweetCount = 0;
  
  // 生成文章
  console.log('📝 生成文章...\\n');
  for (const template of ARTICLE_TEMPLATES) {
    const filename = `content/article_${Date.now()}_${template.keyword.replace(/\\s+/g, '_')}.md`;
    fs.writeFileSync(filename, template.content);
    console.log(`  ✅ ${template.keyword} → ${filename}`);
    articleCount++;
  }
  
  // 生成Twitter帖子
  console.log('\\n📱 生成Twitter帖子...\\n');
  const tweets = TWITTER_TEMPLATES.map((tweet, i) => `\\n--- Tweet ${i+1} ---\\n${tweet}`).join('\\n');
  fs.writeFileSync('marketing/twitter_posts.txt', tweets);
  console.log(`  ✅ 已生成 ${TWITTER_TEMPLATES.length} 条推文 → marketing/twitter_posts.txt`);
  tweetCount = TWITTER_TEMPLATES.length;
  
  // 生成汇总
  const summary = {
    timestamp: new Date().toISOString(),
    articlesGenerated: articleCount,
    tweetsGenerated: tweetCount,
    topics: ARTICLE_TEMPLATES.map(t => t.keyword)
  };
  
  fs.writeFileSync(`output/content_gen_${Date.now()}.json`, JSON.stringify(summary, null, 2));
  
  console.log('\\n' + '='.repeat(50));
  console.log('📊 执行完成');
  console.log('='.repeat(50));
  console.log(`✅ 文章: ${articleCount}`);
  console.log(`✅ 推文: ${tweetCount}`);
  console.log(`\\n📁 输出目录:`);
  console.log(`  - content/  (${articleCount} 篇文章)`);
  console.log(`  - marketing/ (推文)`);
  console.log(`  - output/    (汇总报告)`);
}

main().catch(console.error);
