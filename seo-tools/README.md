# SEO工具套件 (SEO Tools Suite)

专业的SEO优化工具集，用于分析和优化AI Agent被动收入网站的内容。

## 📦 包含工具

### 1. seo-analyzer.js - SEO分析器
分析所有文章的SEO得分，包括：
- 标题优化度
- 描述质量
- 标题结构 (H1-H6)
- 关键词密度
- 可读性评分
- 内链和外链
- 图片ALT标签
- 内容长度

### 2. meta-generator.js - Meta标签生成器
自动生成完整的Meta标签：
- HTML Meta标签
- Open Graph标签
- Twitter Card标签
- Schema.org结构化数据
- JSON-LD格式

### 3. keywords-optimizer.js - 关键词优化器
关键词分析和建议：
- 当前关键词提取
- 关键词密度分析
- 缺失关键词发现
- 长尾关键词建议
- LSI语义关键词
- 搜索量和竞争度估算

### 4. sitemap-generator.js - 站点地图生成器
生成多种格式的站点地图：
- XML Sitemap (搜索引擎)
- Image Sitemap (图片SEO)
- News Sitemap (新闻内容)
- HTML Sitemap (用户友好)
- RSS Feed (订阅)
- robots.txt

### 5. seo-report.js - SEO综合报告
整合所有分析结果：
- JSON数据报告
- Markdown报告
- HTML可视化报告
- 行动计划

## 🚀 快速开始

### 一键运行所有工具
```bash
cd seo-tools
node run-seo-tools.js
```

### 运行单个工具
```bash
# 仅运行SEO分析
node run-seo-tools.js --analyze

# 仅生成关键词报告
node run-seo-tools.js --keywords

# 仅生成Meta标签
node run-seo-tools.js --meta

# 仅生成Sitemap
node run-seo-tools.js --sitemap

# 仅生成报告
node run-seo-tools.js --report
```

### 监听模式 (开发时使用)
```bash
# 监听content目录变化，自动重新分析
node run-seo-tools.js --watch
```

## 📁 输出文件结构

```
seo-tools/
├── reports/
│   ├── SEO_REPORT.md              # Markdown格式报告
│   ├── SEO_REPORT.html            # 可视化HTML报告
│   ├── complete-seo-report.json   # 完整数据
│   ├── seo-analysis.json          # SEO分析数据
│   ├── keywords-analysis.json     # 关键词分析数据
│   └── ACTION_PLAN.json           # 行动计划
├── meta-data/
│   ├── meta-data.json             # 所有Meta数据
│   └── [文章名].html              # 单个文章的Meta标签
└── seo-report.json                # SEO得分汇总

public/
├── sitemap.xml                    # XML站点地图
├── sitemap.html                   # HTML站点地图
├── image-sitemap.xml              # 图片站点地图
├── news-sitemap.xml               # 新闻站点地图
├── sitemap-index.xml              # 站点地图索引
├── rss.xml                        # RSS订阅源
└── robots.txt                     # 搜索引擎规则
```

## 📊 SEO评分标准

### 各维度满分100分

| 维度 | 权重 | 评分标准 |
|------|------|----------|
| 标题 | 12.5% | 20-60字符，含关键词 |
| 描述 | 12.5% | 50-160字符 |
| 标题结构 | 12.5% | H1(1个)+H2/H3层级 |
| 关键词 | 12.5% | 密度1-3%，自然分布 |
| 可读性 | 12.5% | 段落清晰，列表使用 |
| 链接 | 12.5% | 有内链和外链 |
| 图片 | 12.5% | 有图片+alt文本 |
| 内容长度 | 12.5% | 建议1500字以上 |

### 总分等级
- 🟢 优秀 (80-100): 无需修改
- 🟡 良好 (60-79): 小幅优化
- 🟠 一般 (40-59): 需要改进
- 🔴 较差 (0-39): 急需优化

## 🔧 配置选项

编辑 `run-seo-tools.js` 修改配置：

```javascript
const CONFIG = {
  contentDir: './public/content',    // 内容目录
  outputDir: './seo-tools',          // 输出目录
  siteName: '你的网站名称',
  siteUrl: 'https://your-domain.com'
};
```

## 📈 使用示例

### 1. 分析单篇文章
```javascript
const SEOAnalyzer = require('./seo-analyzer');

const analyzer = new SEOAnalyzer({ contentDir: './public/content' });
const result = await analyzer.analyzeFile('./public/content/article.md');
console.log(result);
```

### 2. 生成单个Meta
```javascript
const MetaGenerator = require('./meta-generator');

const generator = new MetaGenerator();
const meta = await generator.generateForFile('./public/content/article.md');
console.log(meta.html);
```

### 3. 自定义关键词库
```javascript
const KeywordsOptimizer = require('./keywords-optimizer');

const optimizer = new KeywordsOptimizer({
  keywordDatabase: {
    core: ['你的', '核心', '关键词'],
    longTail: ['长尾关键词1', '长尾关键词2']
  }
});
```

## 🔄 CI/CD集成

### GitHub Actions示例
```yaml
name: SEO Analysis

on:
  push:
    paths:
      - 'public/content/**'

jobs:
  seo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd seo-tools && node run-seo-tools.js
      - uses: actions/upload-artifact@v2
        with:
          name: seo-reports
          path: seo-tools/reports/
```

## 📝 最佳实践

1. **定期运行**: 建议每周运行一次完整分析
2. **关注低分文章**: 优先优化得分低于60的文章
3. **关键词策略**: 保持关键词密度1-3%，避免堆砌
4. **内容更新**: 更新文章后重新生成sitemap
5. **监控排名**: 结合Google Search Console监控效果

## 🐛 故障排除

### 问题: 找不到文章
**解决**: 检查 `contentDir` 配置是否正确

### 问题: 中文显示乱码
**解决**: 确保文件保存为UTF-8编码

### 问题: 缺少依赖
**解决**: 
```bash
# 监听模式需要chokidar
npm install chokidar --save-dev
```

## 📚 相关资源

- [Google SEO入门指南](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Schema.org文档](https://schema.org/)
- [Sitemap协议](https://www.sitemaps.org/protocol.html)

## 📄 License

MIT

---

Made with ❤️ for AI Agent Passive Income Project
