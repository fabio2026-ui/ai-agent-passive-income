/**
 * AI Agent被动收入系统 - 文章数据
 * 包含所有51篇文章的元数据和分类信息
 */

const articlesData = [
    // Web应用安全 (8篇)
    {
        id: "web-security-1",
        title: "XSS攻击防护完全指南 (2025版)",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "深入讲解跨站脚本攻击(XSS)的原理、类型和防护措施，包含实战代码示例。",
        fileName: "article_1775512003850_XSS攻击防护.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["XSS", "Web安全", "前端安全"]
    },
    {
        id: "web-security-2",
        title: "SQL注入检测与防护实战手册",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "SQL注入漏洞原理分析、检测方法和多层防护策略。",
        fileName: "article_1775512003851_SQL注入检测.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["SQL注入", "数据库安全", "Web安全"]
    },
    {
        id: "web-security-3",
        title: "Web应用防火墙WAF配置指南",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "WAF工作原理、规则配置和常见攻击防护策略。",
        fileName: "article_batch2_1775568054522_Web应用防火墙WAF.md",
        date: "2025-04-10",
        size: "1.3KB",
        tags: ["WAF", "防火墙", "Web安全"]
    },
    {
        id: "web-security-4",
        title: "React安全开发实战指南",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "React应用常见安全问题及最佳实践，包括 dangerouslySetInnerHTML 等高危API的使用规范。",
        fileName: "article_1775512105260_React安全开发.md",
        date: "2025-04-10",
        size: "2.1KB",
        tags: ["React", "前端安全", "JavaScript"]
    },
    {
        id: "web-security-5",
        title: "供应链攻击防范企业级方案",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "第三方依赖安全管理、SBOM生成和供应链风险评估。",
        fileName: "article_1775512003852_供应链攻击防范.md",
        date: "2025-04-10",
        size: "1.7KB",
        tags: ["供应链安全", "依赖管理", "SBOM"]
    },
    {
        id: "web-security-6",
        title: "Web应用防火墙高级配置",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "高级WAF规则编写、自定义防护策略和绕过检测。",
        fileName: "article_batch4_1775675492722_Web应用防火墙.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["WAF", "规则引擎", "安全防护"]
    },
    {
        id: "web-security-7",
        title: "安全意识培训体系搭建",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "企业安全意识培训方案设计、模拟钓鱼测试和效果评估。",
        fileName: "article_batch4_1775675492654_安全意识培训.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["安全培训", "安全意识", "钓鱼测试"]
    },
    {
        id: "web-security-8",
        title: "漏洞管理程序设计",
        category: "web-security",
        categoryName: "Web应用安全",
        excerpt: "漏洞生命周期管理、优先级评估和修复流程优化。",
        fileName: "article_batch4_1775675492710_漏洞管理程序.md",
        date: "2025-04-10",
        size: "1.0KB",
        tags: ["漏洞管理", "风险评估", "修复流程"]
    },

    // API安全 (5篇)
    {
        id: "api-security-1",
        title: "API安全最佳实践 (2025完整指南)",
        category: "api-security",
        categoryName: "API安全",
        excerpt: "API安全设计原则、认证授权、速率限制和监控告警全指南。",
        fileName: "article_1775512003852_API安全最佳实践.md",
        date: "2025-04-10",
        size: "1.3KB",
        tags: ["API安全", "REST API", "安全设计"]
    },
    {
        id: "api-security-2",
        title: "JWT安全最佳实践",
        category: "api-security",
        categoryName: "API安全",
        excerpt: "JWT token安全生成、存储和验证，防止token劫持和篡改。",
        fileName: "article_batch4_1775675492523_JWT安全最佳实践.md",
        date: "2025-04-10",
        size: "1.4KB",
        tags: ["JWT", "认证", "Token安全"]
    },
    {
        id: "api-security-3",
        title: "OAuth2安全实施指南",
        category: "api-security",
        categoryName: "API安全",
        excerpt: "OAuth2.1标准实施、PKCE流程和授权服务器安全。",
        fileName: "article_batch4_1775675492536_OAuth2安全实施.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["OAuth2", "授权", "SSO"]
    },
    {
        id: "api-security-4",
        title: "API网关安全架构",
        category: "api-security",
        categoryName: "API安全",
        excerpt: "API网关安全功能、流量管理和威胁防护策略。",
        fileName: "article_batch4_1775675492687_API网关安全.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["API网关", "流量控制", "安全防护"]
    },
    {
        id: "api-security-5",
        title: "数据防泄漏(DLP)实施",
        category: "api-security",
        categoryName: "API安全",
        excerpt: "敏感数据识别、分类和防泄漏技术实现。",
        fileName: "article_batch4_1775675492697_数据防泄漏.md",
        date: "2025-04-10",
        size: "1.3KB",
        tags: ["DLP", "数据安全", "敏感数据"]
    },

    // 云安全与容器 (5篇)
    {
        id: "cloud-security-1",
        title: "Docker安全扫描与CI/CD集成",
        category: "cloud-security",
        categoryName: "云安全与容器",
        excerpt: "容器镜像安全扫描、漏洞检测和流水线集成。",
        fileName: "article_1775512105259_Docker安全扫描.md",
        date: "2025-04-10",
        size: "1.7KB",
        tags: ["Docker", "容器安全", "CI/CD"]
    },
    {
        id: "cloud-security-2",
        title: "云安全基础指南",
        category: "cloud-security",
        categoryName: "云安全与容器",
        excerpt: "云安全共享责任模型、CSPM和云原生安全架构。",
        fileName: "article_batch2_1775568054578_云安全基础.md",
        date: "2025-04-10",
        size: "1.3KB",
        tags: ["云安全", "CSPM", "共享责任模型"]
    },
    {
        id: "cloud-security-3",
        title: "容器安全加固实践",
        category: "cloud-security",
        categoryName: "云安全与容器",
        excerpt: "Kubernetes安全、容器运行时防护和网络隔离。",
        fileName: "article_batch3_1775568568048_容器安全加固.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["Kubernetes", "容器安全", "K8s安全"]
    },
    {
        id: "cloud-security-4",
        title: "云安全态势管理(CSPM)",
        category: "cloud-security",
        categoryName: "云安全与容器",
        excerpt: "多云环境安全配置管理、合规检查和持续监控。",
        fileName: "article_batch4_1775675492558_云安全态势管理.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["CSPM", "云配置", "合规"]
    },
    {
        id: "cloud-security-5",
        title: "移动端应用安全",
        category: "cloud-security",
        categoryName: "云安全与容器",
        excerpt: "iOS/Android应用安全、代码混淆和防逆向工程。",
        fileName: "article_batch4_1775675492604_移动端应用安全.md",
        date: "2025-04-10",
        size: "1.8KB",
        tags: ["移动安全", "iOS", "Android", "逆向防护"]
    },

    // 认证与访问控制 (5篇)
    {
        id: "identity-1",
        title: "身份认证最佳实践",
        category: "identity-access",
        categoryName: "认证与访问控制",
        excerpt: "多因素认证、密码策略和身份认证架构设计。",
        fileName: "article_batch2_1775568054567_身份认证最佳实践.md",
        date: "2025-04-10",
        size: "1.5KB",
        tags: ["身份认证", "MFA", "密码安全"]
    },
    {
        id: "identity-2",
        title: "零信任架构实施",
        category: "identity-access",
        categoryName: "认证与访问控制",
        excerpt: "零信任架构设计、实施路线和最佳实践。",
        fileName: "article_batch4_1775675492676_零信任架构实施.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["零信任", "ZTA", "网络安全"]
    },
    {
        id: "identity-3",
        title: "身份与访问管理(IAM)",
        category: "identity-access",
        categoryName: "认证与访问控制",
        excerpt: "IAM体系设计、权限模型和访问控制策略。",
        fileName: "article_batch4_1775675492620_身份与访问管理.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["IAM", "访问控制", "RBAC"]
    },
    {
        id: "identity-4",
        title: "零信任架构",
        category: "identity-access",
        categoryName: "认证与访问控制",
        excerpt: "零信任安全模型原理、核心组件和实施策略。",
        fileName: "article_1775512105258_零信任架构.md",
        date: "2025-04-10",
        size: "1.6KB",
        tags: ["零信任", "网络安全", "边界安全"]
    },
    {
        id: "identity-5",
        title: "网络分割架构设计",
        category: "identity-access",
        categoryName: "认证与访问控制",
        excerpt: "网络微分段、VLAN设计和东西向流量控制。",
        fileName: "article_batch3_1775568568027_网络分割架构.md",
        date: "2025-04-10",
        size: "1.0KB",
        tags: ["网络分割", "微分段", "网络安全"]
    },

    // 威胁防护 (6篇)
    {
        id: "threat-1",
        title: "勒索软件防护策略",
        category: "threat-protection",
        categoryName: "威胁防护",
        excerpt: "勒索软件攻击链分析、预防和应急响应策略。",
        fileName: "article_batch3_1775568567984_勒索软件防护.md",
        date: "2025-04-10",
        size: "0.9KB",
        tags: ["勒索软件", "恶意软件", "应急响应"]
    },
    {
        id: "threat-2",
        title: "AI安全威胁与防护",
        category: "threat-protection",
        categoryName: "威胁防护",
        excerpt: "AI系统安全风险、对抗攻击和模型保护。",
        fileName: "article_batch3_1775568568006_AI安全威胁.md",
        date: "2025-04-10",
        size: "0.9KB",
        tags: ["AI安全", "对抗攻击", "模型安全"]
    },
    {
        id: "threat-3",
        title: "供应链安全",
        category: "threat-protection",
        categoryName: "威胁防护",
        excerpt: "软件供应链安全风险、SBOM和依赖安全。",
        fileName: "article_batch4_1775675492664_供应链安全.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["供应链安全", "SBOM", "依赖管理"]
    },
    {
        id: "threat-4",
        title: "区块链智能合约安全",
        category: "threat-protection",
        categoryName: "威胁防护",
        excerpt: "智能合约漏洞、审计方法和安全开发实践。",
        fileName: "article_batch4_1775675492593_区块链智能合约安全.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["区块链", "智能合约", "Web3安全"]
    },
    {
        id: "threat-5",
        title: "威胁情报平台",
        category: "threat-protection",
        categoryName: "威胁防护",
        excerpt: "威胁情报收集、分析和应用，IOC管理。",
        fileName: "article_batch3_1775568568037_威胁情报平台.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["威胁情报", "IOC", "安全运营"]
    },
    {
        id: "threat-6",
        title: "加密货币安全保管完全指南",
        category: "threat-protection",
        categoryName: "威胁防护",
        excerpt: "数字钱包安全、助记词保管和交易风险防范。",
        fileName: "article_batch2_1775568054556_加密货币安全.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["加密货币", "钱包安全", "区块链"]
    },

    // 合规与审计 (5篇)
    {
        id: "compliance-1",
        title: "SOC2合规指南",
        category: "compliance",
        categoryName: "合规与审计",
        excerpt: "SOC2认证要求、控制措施和审计准备。",
        fileName: "article_batch3_1775568567995_SOC2合规指南.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["SOC2", "合规", "审计"]
    },
    {
        id: "compliance-2",
        title: "SIEM日志分析",
        category: "compliance",
        categoryName: "合规与审计",
        excerpt: "SIEM平台选型、日志收集和安全事件分析。",
        fileName: "article_batch4_1775675492570_SIEM日志分析.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["SIEM", "日志分析", "安全运营"]
    },
    {
        id: "compliance-3",
        title: "隐私保护技术",
        category: "compliance",
        categoryName: "合规与审计",
        excerpt: "GDPR/CCPA合规、数据匿名化和隐私计算。",
        fileName: "article_batch3_1775568568059_隐私保护技术.md",
        date: "2025-04-10",
        size: "1.0KB",
        tags: ["隐私保护", "GDPR", "数据保护"]
    },
    {
        id: "compliance-4",
        title: "日志分析与监控",
        category: "compliance",
        categoryName: "合规与审计",
        excerpt: "日志管理策略、监控告警和合规报告。",
        fileName: "article_batch2_1775568054589_日志分析与监控.md",
        date: "2025-04-10",
        size: "1.5KB",
        tags: ["日志分析", "监控", "合规"]
    },
    {
        id: "compliance-5",
        title: "安全编排自动化(SOAR)",
        category: "compliance",
        categoryName: "合规与审计",
        excerpt: "SOAR平台实施、剧本编排和自动化响应。",
        fileName: "article_batch4_1775675492633_安全编排自动化.md",
        date: "2025-04-10",
        size: "1.4KB",
        tags: ["SOAR", "自动化", "安全运营"]
    },

    // 渗透测试 (4篇)
    {
        id: "pentest-1",
        title: "渗透测试入门指南",
        category: "penetration-testing",
        categoryName: "渗透测试",
        excerpt: "渗透测试方法论、工具链和报告编写。",
        fileName: "article_batch2_1775568054534_渗透测试入门.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["渗透测试", "安全测试", "漏洞评估"]
    },
    {
        id: "pentest-2",
        title: "红队渗透测试",
        category: "penetration-testing",
        categoryName: "渗透测试",
        excerpt: "红队战术技术、对抗演练和蓝队配合。",
        fileName: "article_batch4_1775675492644_红队渗透测试.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["红队", "对抗演练", "APT模拟"]
    },
    {
        id: "pentest-3",
        title: "GitHub安全扫描",
        category: "penetration-testing",
        categoryName: "渗透测试",
        excerpt: "代码仓库安全扫描、密钥检测和漏洞发现。",
        fileName: "article_batch4_1775675492548_GitHub安全扫描.md",
        date: "2025-04-10",
        size: "1.4KB",
        tags: ["代码安全", "GitHub", "SCA"]
    },

    // DevSecOps (5篇)
    {
        id: "devsecops-1",
        title: "DevSecOps实践指南",
        category: "devsecops",
        categoryName: "DevSecOps",
        excerpt: "安全左移、CI/CD集成和安全文化建设。",
        fileName: "article_batch2_1775568054545_DevSecOps实践.md",
        date: "2025-04-10",
        size: "1.3KB",
        tags: ["DevSecOps", "CI/CD", "安全左移"]
    },
    {
        id: "devsecops-2",
        title: "Node.js生产环境安全加固",
        category: "devsecops",
        categoryName: "DevSecOps",
        excerpt: "Node.js应用安全配置、依赖管理和运行时防护。",
        fileName: "article_1775512105260_Node.js安全加固.md",
        date: "2025-04-10",
        size: "3.0KB",
        tags: ["Node.js", "后端安全", "生产环境"]
    },
    {
        id: "devsecops-3",
        title: "DevSecOps管道设计",
        category: "devsecops",
        categoryName: "DevSecOps",
        excerpt: "安全测试集成、质量门禁和自动化部署。",
        fileName: "article_batch4_1775675492581_DevSecOps管道.md",
        date: "2025-04-10",
        size: "1.1KB",
        tags: ["DevSecOps", "CI/CD", "安全测试"]
    },

    // 事件响应 (3篇)
    {
        id: "incident-1",
        title: "应急响应计划",
        category: "incident-response",
        categoryName: "事件响应",
        excerpt: "安全事件响应流程、团队组织和事后分析。",
        fileName: "article_batch2_1775568054600_应急响应计划.md",
        date: "2025-04-10",
        size: "1.3KB",
        tags: ["应急响应", "IR", "事件处理"]
    },
    {
        id: "incident-2",
        title: "事件响应计划",
        category: "incident-response",
        categoryName: "事件响应",
        excerpt: "事件分类、响应流程和恢复策略。",
        fileName: "article_batch4_1775675492732_事件响应计划.md",
        date: "2025-04-10",
        size: "1.2KB",
        tags: ["事件响应", "IR计划", "恢复策略"]
    },

    // 被动收入 (2篇)
    {
        id: "passive-1",
        title: "开发者被动收入实战策略",
        category: "passive-income",
        categoryName: "被动收入",
        excerpt: "从代码到现金流，开发者变现路径和实战案例。",
        fileName: "article_batch3_1775568568016_被动收入策略.md",
        date: "2025-04-10",
        size: "1.4KB",
        tags: ["被动收入", "开发者变现", "副业"]
    },
    {
        id: "passive-2",
        title: "被动收入策略进阶",
        category: "passive-income",
        categoryName: "被动收入",
        excerpt: "多元化收入来源、自动化运营和规模化增长。",
        fileName: "article_batch3_1775675263743_被动收入策略.md",
        date: "2025-04-10",
        size: "1.4KB",
        tags: ["被动收入", "自动化", "规模增长"]
    }
];

// 分类元数据
const categoriesData = [
    {
        id: "web-security",
        name: "Web应用安全",
        slug: "web-security",
        icon: "🛡️",
        description: "Web应用安全防护技术，包括XSS、SQL注入、WAF配置等",
        articleCount: 8,
        color: "#667eea"
    },
    {
        id: "api-security",
        name: "API安全",
        slug: "api-security",
        icon: "🔌",
        description: "API安全设计、认证授权和网关防护",
        articleCount: 5,
        color: "#764ba2"
    },
    {
        id: "cloud-security",
        name: "云安全与容器",
        slug: "cloud-security",
        icon: "☁️",
        description: "云安全架构、Docker安全和Kubernetes加固",
        articleCount: 5,
        color: "#4c51bf"
    },
    {
        id: "identity-access",
        name: "认证与访问控制",
        slug: "identity-access",
        icon: "🔐",
        description: "身份认证、IAM和零信任架构",
        articleCount: 5,
        color: "#38a169"
    },
    {
        id: "threat-protection",
        name: "威胁防护",
        slug: "threat-protection",
        icon: "🛡️",
        description: "勒索软件防护、AI安全威胁和区块链安全",
        articleCount: 6,
        color: "#dd6b20"
    },
    {
        id: "compliance",
        name: "合规与审计",
        slug: "compliance",
        icon: "📋",
        description: "SOC2合规、SIEM日志分析和隐私保护",
        articleCount: 5,
        color: "#319795"
    },
    {
        id: "penetration-testing",
        name: "渗透测试",
        slug: "penetration-testing",
        icon: "🎯",
        description: "渗透测试方法论、红队演练和代码审计",
        articleCount: 3,
        color: "#e53e3e"
    },
    {
        id: "devsecops",
        name: "DevSecOps",
        slug: "devsecops",
        icon: "⚙️",
        description: "安全左移、CI/CD集成和自动化安全测试",
        articleCount: 3,
        color: "#805ad5"
    },
    {
        id: "incident-response",
        name: "事件响应",
        slug: "incident-response",
        icon: "🚨",
        description: "安全事件响应、应急处理和事后分析",
        articleCount: 2,
        color: "#d69e2e"
    },
    {
        id: "passive-income",
        name: "被动收入",
        slug: "passive-income",
        icon: "💰",
        description: "开发者变现策略、被动收入实战指南",
        articleCount: 2,
        color: "#38b2ac"
    }
];

// 获取分类文章
function getArticlesByCategory(categoryId) {
    return articlesData.filter(article => article.category === categoryId);
}

// 获取文章总数
function getTotalArticleCount() {
    return articlesData.length;
}

// 搜索文章
function searchArticles(query) {
    const lowerQuery = query.toLowerCase();
    return articlesData.filter(article => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

// 分页获取文章
function getArticlesPage(page = 1, perPage = 9) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
        articles: articlesData.slice(start, end),
        total: articlesData.length,
        totalPages: Math.ceil(articlesData.length / perPage),
        currentPage: page
    };
}

// 导出数据（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        articlesData,
        categoriesData,
        getArticlesByCategory,
        getTotalArticleCount,
        searchArticles,
        getArticlesPage
    };
}
