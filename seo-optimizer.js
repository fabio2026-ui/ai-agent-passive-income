#!/usr/bin/env node
/**
 * SEO优化工具集 - 全面的SEO分析和优化工具
 */

const fs = require('fs');
const path = require('path');

class SEOOptimizer {
    constructor(options = {}) {
        this.siteUrl = options.siteUrl || 'https://ai-agent-income.com';
        this.outputDir = options.outputDir || './seo-output';
        this.ensureOutputDir();
    }
    
    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    
    /**
     * 生成完整的站点地图
     */
    generateSitemap(contentDir) {
        const urls = [];
        const now = new Date().toISOString();
        
        // 首页
        urls.push({
            loc: `${this.siteUrl}/`,
            lastmod: now,
            changefreq: 'daily',
            priority: '1.0'
        });
        
        // 导航页面
        urls.push({
            loc: `${this.siteUrl}/navigation.html`,
            lastmod: now,
            changefreq: 'weekly',
            priority: '0.9'
        });
        
        // 分类页面
        const categories = ['ai-agent', 'passive-income', 'automation', 'development', 'marketing', 'tools'];
        categories.forEach(cat => {
            urls.push({
                loc: `${this.siteUrl}/category/${cat}/`,
                lastmod: now,
                changefreq: 'daily',
                priority: '0.8'
            });
        });
        
        // 内容页面
        if (fs.existsSync(contentDir)) {
            this.scanContentDirectory(contentDir, urls);
        }
        
        // 生成XML
        const sitemap = this.buildSitemapXML(urls);
        const outputPath = path.join(this.outputDir, 'sitemap.xml');
        fs.writeFileSync(outputPath, sitemap);
        
        console.log(`✅ Sitemap generated: ${outputPath}`);
        console.log(`📊 Total URLs: ${urls.length}`);
        
        return { urls, outputPath };
    }
    
    scanContentDirectory(dir, urls, basePath = '') {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.scanContentDirectory(fullPath, urls, path.join(basePath, item));
            } else if (item.endsWith('.md') || item.endsWith('.html')) {
                const relativePath = path.join(basePath, item).replace(/\\/g, '/');
                const url = `${this.siteUrl}/content/${relativePath.replace('.md', '.html')}`;
                urls.push({
                    loc: url,
                    lastmod: stat.mtime.toISOString(),
                    changefreq: 'weekly',
                    priority: '0.7'
                });
            }
        });
    }
    
    buildSitemapXML(urls) {
        const urlEntries = urls.map(u => `
    <url>
        <loc>${this.escapeXml(u.loc)}</loc>
        <lastmod>${u.lastmod.split('T')[0]}</lastmod>
        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
    </url>`).join('');
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
    }
    
    escapeXml(str) {
        return str.replace(/[<>&'"]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;',
            "'": '&apos;', '"': '&quot;'
        })[c]);
    }
    
    /**
     * 生成robots.txt
     */
    generateRobotsTxt() {
        const content = `# AI Agent被动收入网站Robots.txt
# 允许所有爬虫访问
User-agent: *
Allow: /

# 禁止访问的目录
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /tmp/

# 网站地图
Sitemap: ${this.siteUrl}/sitemap.xml

# 爬取延迟（秒）
Crawl-delay: 1

# 特定爬虫规则
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

User-agent: Bingbot
Allow: /

User-agent: Baiduspider
Allow: /
`;
        
        const outputPath = path.join(this.outputDir, 'robots.txt');
        fs.writeFileSync(outputPath, content);
        console.log(`✅ robots.txt generated: ${outputPath}`);
        
        return outputPath;
    }
    
    /**
     * 生成结构化数据模板
     */
    generateStructuredData() {
        const schemas = {
            // 网站结构
            website: {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "AI Agent被动收入导航",
                "url": this.siteUrl,
                "description": "一站式AI变现资源中心",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${this.siteUrl}/search?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            },
            
            // 组织信息
            organization: {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "AI Agent被动收入",
                "url": this.siteUrl,
                "logo": `${this.siteUrl}/logo.png`,
                "sameAs": [
                    "https://twitter.com/aiagentincome",
                    "https://github.com/aiagent-income"
                ]
            },
            
            // 文章模板
            article: (title, description, date, author) => ({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": title,
                "description": description,
                "author": {
                    "@type": "Person",
                    "name": author || "AI Agent团队"
                },
                "datePublished": date,
                "publisher": {
                    "@type": "Organization",
                    "name": "AI Agent被动收入"
                }
            }),
            
            // 面包屑导航
            breadcrumb: (items) => ({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": items.map((item, i) => ({
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": item.name,
                    "item": item.url
                }))
            }),
            
            // FAQ页面
            faq: (questions) => ({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": questions.map(q => ({
                    "@type": "Question",
                    "name": q.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": q.answer
                    }
                }))
            })
        };
        
        const outputPath = path.join(this.outputDir, 'structured-data-templates.json');
        fs.writeFileSync(outputPath, JSON.stringify(schemas, null, 2));
        console.log(`✅ Structured data templates: ${outputPath}`);
        
        return schemas;
    }
    
    /**
     * 生成RSS订阅源
     */
    generateRSS(articles) {
        const now = new Date().toUTCString();
        
        const items = articles.map(article => `
        <item>
            <title>${this.escapeXml(article.title)}</title>
            <link>${this.siteUrl}${article.url}</link>
            <guid isPermaLink="true">${this.siteUrl}${article.url}</guid>
            <pubDate>${new Date(article.date).toUTCString()}</pubDate>
            <description>${this.escapeXml(article.description)}</description>
            <category>${article.category || 'AI'}</category>
        </item>`).join('');
        
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>AI Agent被动收入导航</title>
        <link>${this.siteUrl}</link>
        <description>最新的AI Agent、被动收入和自动化教程</description>
        <language>zh-CN</language>
        <lastBuildDate>${now}</lastBuildDate>
        <atom:link href="${this.siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
        ${items}
    </channel>
</rss>`;
        
        const outputPath = path.join(this.outputDir, 'rss.xml');
        fs.writeFileSync(outputPath, rss);
        console.log(`✅ RSS feed generated: ${outputPath}`);
        
        return outputPath;
    }
    
    /**
     * 分析文章SEO得分
     */
    analyzeSEO(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const scores = {
            title: this.checkTitle(content),
            description: this.checkDescription(content),
            headings: this.checkHeadings(content),
            keywords: this.checkKeywords(content),
            links: this.checkLinks(content),
            images: this.checkImages(content),
            readability: this.checkReadability(content),
            structuredData: this.checkStructuredData(content)
        };
        
        // 计算总分
        const totalScore = Object.values(scores).reduce((a, b) => a + b.score, 0) / Object.keys(scores).length;
        
        const result = {
            file: filePath,
            totalScore: Math.round(totalScore),
            scores,
            suggestions: this.generateSuggestions(scores)
        };
        
        return result;
    }
    
    checkTitle(content) {
        const titleMatch = content.match(/<title>(.+?)<\/title>/);
        const h1Match = content.match(/<h1>(.+?)<\/h1>/);
        
        let score = 0;
        const issues = [];
        
        if (titleMatch) {
            const title = titleMatch[1];
            if (title.length >= 30 && title.length <= 60) score += 30;
            else issues.push('标题长度应在30-60字符之间');
            if (!title.includes('|') && !title.includes('-')) issues.push('建议添加品牌分隔符');
        } else {
            issues.push('缺少title标签');
        }
        
        if (h1Match) score += 20;
        else issues.push('缺少h1标签');
        
        return { score, issues };
    }
    
    checkDescription(content) {
        const metaDesc = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
        
        let score = 0;
        const issues = [];
        
        if (metaDesc) {
            const desc = metaDesc[1];
            if (desc.length >= 120 && desc.length <= 160) score = 100;
            else if (desc.length > 0) score = 50;
            if (desc.length < 120) issues.push('描述过短，建议120-160字符');
            if (desc.length > 160) issues.push('描述过长，可能截断');
        } else {
            issues.push('缺少meta description');
        }
        
        return { score, issues };
    }
    
    checkHeadings(content) {
        const h2s = content.match(/<h2/g) || [];
        const h3s = content.match(/<h3/g) || [];
        
        let score = 0;
        if (h2s.length >= 2) score += 50;
        if (h3s.length >= 3) score += 50;
        
        return { 
            score, 
            count: { h2: h2s.length, h3: h3s.length },
            issues: score < 100 ? ['建议添加更多H2/H3标题'] : []
        };
    }
    
    checkKeywords(content) {
        // 简化的关键词检查
        const text = content.replace(/<[^>]+>/g, '').toLowerCase();
        const words = text.split(/\s+/).length;
        
        return {
            score: words > 300 ? 100 : Math.round(words / 3),
            wordCount: words,
            issues: words < 300 ? ['内容过短，建议至少300词'] : []
        };
    }
    
    checkLinks(content) {
        const internalLinks = (content.match(/href="\/[^"]*"/g) || []).length;
        const externalLinks = (content.match(/href="https?:\/\//g) || []).length;
        
        let score = 0;
        if (internalLinks >= 2) score += 50;
        if (externalLinks >= 1) score += 50;
        
        return { score, internalLinks, externalLinks };
    }
    
    checkImages(content) {
        const images = content.match(/<img[^>]*>/g) || [];
        const withAlt = content.match(/<img[^>]*alt="[^"]+"/g) || [];
        
        let score = 0;
        if (images.length >= 1) score += 50;
        if (withAlt.length === images.length) score += 50;
        
        return { 
            score, 
            total: images.length, 
            withAlt: withAlt.length,
            issues: images.length === 0 ? ['建议添加图片'] : 
                    withAlt.length < images.length ? ['部分图片缺少alt属性'] : []
        };
    }
    
    checkReadability(content) {
        const text = content.replace(/<[^>]+>/g, '');
        const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim());
        const words = text.split(/\s+/).filter(w => w);
        
        const avgSentenceLength = words.length / sentences.length;
        
        let score = 100;
        if (avgSentenceLength > 25) score -= 30;
        if (avgSentenceLength > 20) score -= 20;
        
        return { score, avgSentenceLength };
    }
    
    checkStructuredData(content) {
        const hasSchema = content.includes('application/ld+json');
        return { score: hasSchema ? 100 : 0, hasSchema };
    }
    
    generateSuggestions(scores) {
        const suggestions = [];
        
        Object.entries(scores).forEach(([key, data]) => {
            if (data.issues) {
                suggestions.push(...data.issues);
            }
        });
        
        return suggestions;
    }
    
    /**
     * 生成完整的SEO报告
     */
    generateFullReport(contentDir) {
        console.log('🔍 Generating full SEO report...\n');
        
        // 1. 站点地图
        const sitemapResult = this.generateSitemap(contentDir);
        
        // 2. robots.txt
        this.generateRobotsTxt();
        
        // 3. 结构化数据模板
        this.generateStructuredData();
        
        // 4. RSS
        this.generateRSS([
            { title: 'AI Agent入门指南', url: '/article1', date: new Date(), description: '入门教程' },
            { title: '被动收入策略', url: '/article2', date: new Date(), description: '变现策略' }
        ]);
        
        // 5. 生成报告摘要
        const report = {
            generatedAt: new Date().toISOString(),
            siteUrl: this.siteUrl,
            sitemap: {
                urlCount: sitemapResult.urls.length,
                path: sitemapResult.outputPath
            },
            files: {
                sitemap: 'sitemap.xml',
                robots: 'robots.txt',
                structuredData: 'structured-data-templates.json',
                rss: 'rss.xml'
            }
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'seo-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('\n✅ SEO optimization complete!');
        console.log(`📁 Output: ${this.outputDir}/`);
        
        return report;
    }
}

// CLI interface
if (require.main === module) {
    const optimizer = new SEOOptimizer({
        siteUrl: process.env.SITE_URL || 'https://ai-agent-income.com',
        outputDir: process.env.OUTPUT_DIR || './seo-output'
    });
    
    const contentDir = process.argv[2] || './content';
    optimizer.generateFullReport(contentDir);
}

module.exports = SEOOptimizer;
