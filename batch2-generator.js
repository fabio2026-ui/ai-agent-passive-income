#!/usr/bin/env node
/**
 * 批量内容生成器 - 第2批
 * 小七AI Agent
 */

const fs = require('fs');

// 剩余4个主题
const REMAINING_TEMPLATES = [
  {
    keyword: '零信任架构',
    category: 'architecture',
    content: `# 零信任架构实施手册 (2025企业版)

## 简介
"永不信任，始终验证"——零信任已成为现代企业安全的黄金标准。

## 什么是零信任

零信任安全模型假设网络内外都存在威胁，不信任任何用户或设备，始终进行验证。

## 核心原则

### 1. 永不信任，始终验证
每个访问请求都必须经过身份验证、授权和加密。

### 2. 最小权限原则
用户只能访问完成工作所需的最小资源集合。

### 3. 假设已失陷
设计系统时假设攻击者已在网络内部。

## 实施步骤

### 第1步: 身份识别
- 部署多因素认证(MFA)
- 实施单点登录(SSO)
- 统一身份管理

### 第2步: 设备验证
- 设备健康检查
- 合规性验证
- 持续监控

### 第3步: 网络分段
- 微隔离
- 软件定义边界
- 东西向流量控制

### 第4步: 数据保护
- 数据分类
- 加密存储和传输
- 数据丢失防护(DLP)

## 技术栈

| 组件 | 推荐工具 |
|------|---------|
| 身份管理 | Okta, Azure AD |
| 网络访问 | Zscaler, Cloudflare Access |
| 端点安全 | CrowdStrike, SentinelOne |
| SIEM | Splunk, Datadog |

## 实施挑战

1. **遗留系统**: 逐步迁移策略
2. **用户体验**: 平衡安全与便利
3. **成本控制**: 分阶段投资

## ROI分析

- **安全事件减少**: 60-80%
- **平均检测时间**: 从天缩短到分钟
- **合规成本**: 降低40%

## 总结

零信任不是产品，而是战略。需要组织、技术和文化的全面变革。

---
*作者: 小七AI安全助手*
*标签: #ZeroTrust #EnterpriseSecurity #Architecture*
`
  },
  {
    keyword: 'Docker安全扫描',
    category: 'devops',
    content: `# Docker安全扫描与CI/CD集成指南

## 简介
容器化带来便利的同时也带来了新的安全风险。本文介绍Docker安全扫描的最佳实践。

## 容器安全风险

### 镜像漏洞
- 基础镜像包含已知CVE
- 过时依赖包
- 恶意软件注入

### 运行时风险
- 特权容器
- 敏感信息泄露
- 网络暴露

## 安全扫描工具

### 1. Trivy (推荐)
\`\`\`bash
# 安装
docker pull aquasec/trivy

# 扫描镜像
trivy image myapp:latest

# 扫描Dockerfile
trivy fs --scanners vuln,secret,misconfig .
\`\`\`

### 2. Snyk Container
\`\`\`bash
# 扫描并监控
snyk container test myapp:latest
snyk container monitor myapp:latest
\`\`\`

### 3. Grype
\`\`\`bash
grype myapp:latest -o json > scan-results.json
\`\`\`

## CI/CD集成

### GitHub Actions
\`\`\`yaml
- name: Scan Docker image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:latest'
    format: 'sarif'
    output: 'trivy-results.sarif'
\`\`\`

### GitLab CI
\`\`\`yaml
docker-scan:
  stage: security
  image: aquasec/trivy
  script:
    - trivy image --exit-code 1 --severity HIGH myapp:latest
\`\`\`

## 安全加固清单

- [ ] 使用最小化基础镜像 (alpine, distroless)
- [ ] 非root用户运行
- [ ] 只读文件系统
- [ ] 资源限制 (CPU/内存)
- [ ] 健康检查
- [ ] 安全扫描集成
- [ ] 镜像签名验证

## 2025年新趋势

- **SBOM生成**: 自动化物料清单
- **供应链签名**: Sigstore/Cosign集成
- **运行时防护**: Falco行为监控

## 总结

容器安全需要左移，在构建阶段就进行扫描，而不是部署后才发现问题。

---
*作者: 小七AI安全助手*
*标签: #Docker #ContainerSecurity #DevSecOps*
`
  },
  {
    keyword: 'React安全开发',
    category: 'frontend',
    content: `# React安全开发实战指南

## 简介
React虽提供一定安全保护，但开发者仍需了解常见漏洞和防护措施。

## React内置保护

### 自动转义
\`\`\`jsx
// ✅ 自动转义
function UserProfile({ user }) {
  return <div>{user.name}</div>;
}
// 输出: &lt;script&gt;alert(1)&lt;/script&gt;
\`\`\`

### dangerouslySetInnerHTML警告
\`\`\`jsx
// ⚠️ 危险！需确保HTML已净化
function HtmlContent({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
\`\`\`

## 常见漏洞

### 1. XSS通过URL参数
\`\`\`jsx
// ❌ 危险：直接使用URL参数
function Search() {
  const query = new URLSearchParams(window.location.search).get('q');
  return <div>{query}</div>; // 仍需转义
}
\`\`\`

### 2. 第三方库漏洞
\`\`\`bash
# 检查依赖
npm audit
yarn audit
\`\`\`

### 3. 不安全的Props
\`\`\`jsx
// ❌ 避免
<Component href={userInput} />

// ✅ 验证
const safeUrl = new URL(userInput).href;
\`\`\`

## 安全最佳实践

### 使用DOMPurify
\`\`\`jsx
import DOMPurify from 'dompurify';

function SafeHtml({ html }) {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
\`\`\`

### CSP配置
\`\`\`html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self'">
\`\`\`

### 依赖管理
\`\`\`json
// package.json
{
  "resolutions": {
    "lodash": "^4.17.21"
  }
}
\`\`\`

## 安全测试

### ESLint安全规则
\`\`\`json
{
  "extends": [
    "plugin:security/recommended"
  ]
}
\`\`\`

### 单元测试
\`\`\`javascript
test('prevents XSS', () => {
  const malicious = '<script>alert(1)</script>';
  render(<Component input={malicious} />);
  expect(screen.getByText(/script/)).toBeInTheDocument();
});
\`\`\`

## 检查清单

- [ ] 避免使用dangerouslySetInnerHTML
- [ ] 验证所有外部输入
- [ ] 使用最新版React
- [ ] 定期运行npm audit
- [ ] 配置CSP策略
- [ ] 启用HTTPS

## 总结

React提供基础保护，但安全仍是开发者的责任。遵循最佳实践，定期审计依赖。

---
*作者: 小七AI安全助手*
*标签: #React #FrontendSecurity #JavaScript*
`
  },
  {
    keyword: 'Node.js安全加固',
    category: 'backend',
    content: `# Node.js生产环境安全加固指南

## 简介
Node.js应用在生产环境面临多种安全威胁。本文提供全面的加固方案。

## 环境安全

### 1. 环境变量保护
\`\`\`bash
# .env文件
NODE_ENV=production
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
\`\`\`

### 2. 禁用不安全的HTTP方法
\`\`\`javascript
// Express
app.use((req, res, next) => {
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).send('Method Not Allowed');
  }
  next();
});
\`\`\`

## 依赖安全

### 自动漏洞扫描
\`\`\`bash
# package.json scripts
{
  "scripts": {
    "security:audit": "npm audit",
    "security:fix": "npm audit fix"
  }
}
\`\`\`

### 使用Snyk
\`\`\`bash
snyk test
snyk monitor
\`\`\`

## 输入验证

### 使用Zod
\`\`\`javascript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
  role: z.enum(['user', 'admin'])
});

app.post('/users', (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  // 处理有效数据
});
\`\`\`

## 认证与授权

### JWT实现
\`\`\`javascript
const jwt = require('jsonwebtoken');

// 生成Token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h', algorithm: 'HS256' }
);

// 验证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
\`\`\`

## 安全Headers

### Helmet中间件
\`\`\`javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
\`\`\`

## 日志与监控

### 安全事件记录
\`\`\`javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// 记录认证失败
app.use((err, req, res, next) => {
  if (err.status === 401) {
    securityLogger.warn('Authentication failed', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date()
    });
  }
  next(err);
});
\`\`\`

## 生产环境检查清单

- [ ] 使用生产环境变量
- [ ] 启用HTTPS/TLS
- [ ] 配置安全Headers
- [ ] 实施速率限制
- [ ] 验证所有输入
- [ ] 使用参数化查询
- [ ] 定期更新依赖
- [ ] 监控安全事件
- [ ] 启用日志记录
- [ ] 实施备份策略

## 总结

Node.js安全需要纵深防御：从代码到基础设施的全方位保护。

---
*作者: 小七AI安全助手*
*标签: #NodeJS #BackendSecurity #Production*
`
  }
];

// 主函数
async function main() {
  console.log('🚀 生成第2批内容 (4篇文章)\n');
  
  // 创建目录
  if (!fs.existsSync('content')) fs.mkdirSync('content');
  
  let count = 0;
  
  // 生成文章
  for (const template of REMAINING_TEMPLATES) {
    const filename = `content/article_${Date.now()}_${template.keyword.replace(/\\s+/g, '_')}.md`;
    fs.writeFileSync(filename, template.content);
    console.log(`  ✅ ${template.keyword}`);
    count++;
  }
  
  console.log(`\n📊 完成: ${count} 篇文章`);
  console.log(`📁 总文章数: ${fs.readdirSync('content').length}`);
}

main().catch(console.error);
