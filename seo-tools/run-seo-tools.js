#!/usr/bin/env node
/**
 * SEO Tools Suite - SEO工具套件主入口
 * 一键运行所有SEO优化工具
 * 
 * 使用方法:
 *   node run-seo-tools.js              # 运行完整分析
 *   node run-seo-tools.js --analyze    # 仅运行SEO分析
 *   node run-seo-tools.js --keywords   # 仅运行关键词分析
 *   node run-seo-tools.js --meta       # 仅生成Meta标签
 *   node run-seo-tools.js --sitemap    # 仅生成Sitemap
 *   node run-seo-tools.js --report     # 仅生成报告
 *   node run-seo-tools.js --watch      # 监听模式，文件变化自动分析
 */

const fs = require('fs');
const path = require('path');

// 加载所有工具
const SEOAnalyzer = require('./seo-analyzer');
const MetaGenerator = require('./meta-generator');
const KeywordsOptimizer = require('./keywords-optimizer');
const SitemapGenerator = require('./sitemap-generator');
const SEOReportGenerator = require('./seo-report');

// 配置
const CONFIG = {
  contentDir: './public/content',
  outputDir: './seo-tools',
  siteName: 'AI Agent 被动收入指南',
  siteUrl: 'https://ai-agent-passive-income.com'
};

// 解析命令行参数
const args = process.argv.slice(2);
const flags = {
  analyze: args.includes('--analyze'),
  keywords: args.includes('--keywords'),
  meta: args.includes('--meta'),
  sitemap: args.includes('--sitemap'),
  report: args.includes('--report'),
  watch: args.includes('--watch'),
  help: args.includes('--help') || args.includes('-h')
};

// 如果没有指定具体工具，运行全部
const runAll = !flags.analyze && !flags.keywords && !flags.meta && !flags.sitemap && !flags.report && !flags.watch && !flags.help;

// 显示帮助
function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║               SEO Tools Suite - SEO工具套件                ║
╚═══════════════════════════════════════════════════════════╝

使用方法:
  node run-seo-tools.js [选项]

选项:
  --analyze     仅运行SEO分析器
  --keywords    仅运行关键词优化器
  --meta        仅生成Meta标签
  --sitemap     仅生成站点地图
  --report      仅生成综合报告
  --watch       监听模式，文件变化自动重新分析
  --help, -h    显示帮助信息

默认(无参数): 运行完整SEO分析套件

示例:
  # 运行完整分析
  node run-seo-tools.js

  # 仅生成sitemap
  node run-seo-tools.js --sitemap

  # 监听内容变化
  node run-seo-tools.js --watch

输出文件:
  seo-tools/
  ├── reports/
  │   ├── SEO_REPORT.md          # Markdown报告
  │   ├── SEO_REPORT.html        # HTML可视化报告
  │   ├── complete-seo-report.json
  │   ├── seo-analysis.json
  │   ├── keywords-analysis.json
  │   └── ACTION_PLAN.json
  ├── meta-data/
  │   ├── meta-data.json
  │   └── [文章名].html (Meta标签)
  └── seo-report.json

  public/
  ├── sitemap.xml
  ├── sitemap.html
  ├── rss.xml
  ├── robots.txt
  └── ...
`);
}

// 运行SEO分析器
async function runAnalyzer() {
  console.log('\n📊 运行SEO分析器...');
  const analyzer = new SEOAnalyzer({ contentDir: CONFIG.contentDir });
  await analyzer.analyzeAll();
  analyzer.printConsoleReport();
  analyzer.exportJSON(path.join(CONFIG.outputDir, 'seo-report.json'));
  return analyzer;
}

// 运行关键词优化器
async function runKeywords() {
  console.log('\n🔑 运行关键词优化器...');
  const optimizer = new KeywordsOptimizer({ contentDir: CONFIG.contentDir });
  await optimizer.analyzeAll();
  optimizer.printConsoleReport();
  optimizer.exportReport(path.join(CONFIG.outputDir, 'keywords-report.json'));
  return optimizer;
}

// 运行Meta生成器
async function runMeta() {
  console.log('\n📝 运行Meta标签生成器...');
  const generator = new MetaGenerator({
    contentDir: CONFIG.contentDir,
    siteName: CONFIG.siteName,
    siteUrl: CONFIG.siteUrl
  });
  await generator.generateAll();
  return generator;
}

// 运行Sitemap生成器
async function runSitemap() {
  console.log('\n🗺️  运行站点地图生成器...');
  const generator = new SitemapGenerator({
    contentDir: CONFIG.contentDir,
    outputDir: './public',
    siteName: CONFIG.siteName,
    siteUrl: CONFIG.siteUrl
  });
  await generator.generateFullPackage();
  return generator;
}

// 运行综合报告生成器
async function runReport() {
  console.log('\n📋 运行综合报告生成器...');
  const generator = new SEOReportGenerator({
    contentDir: CONFIG.contentDir,
    siteName: CONFIG.siteName,
    siteUrl: CONFIG.siteUrl
  });
  await generator.generateFullReport();
  return generator;
}

// 监听模式
async function runWatch() {
  console.log('\n👀 启动监听模式...');
  console.log(`   监听目录: ${CONFIG.contentDir}`);
  console.log('   按 Ctrl+C 停止监听\n');
  
  // 首次运行
  await runAllTools();
  
  // 设置文件监听
  const chokidar = require('chokidar');
  const watcher = chokidar.watch(CONFIG.contentDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });
  
  let debounceTimer = null;
  
  watcher.on('change', async (filePath) => {
    console.log(`\n📝 文件变化: ${path.basename(filePath)}`);
    
    // 防抖处理
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log('\n🔄 重新运行SEO分析...');
      await runAllTools();
      console.log('\n👀 继续监听...');
    }, 2000);
  });
}

// 运行所有工具
async function runAllTools() {
  const startTime = Date.now();
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 SEO Tools Suite - 完整分析模式');
  console.log('='.repeat(60));
  
  try {
    // 创建输出目录
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    // 运行所有工具
    await runReport();  // report已经包含了其他工具
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有工具运行完成!');
    console.log(`   总耗时: ${duration}秒`);
    console.log('='.repeat(60));
    
    // 显示报告位置
    console.log('\n📁 生成的文件:');
    console.log(`   报告目录: ${path.resolve(CONFIG.outputDir)}/reports/`);
    console.log(`   站点地图: ${path.resolve('./public')}/`);
    
  } catch (error) {
    console.error('\n❌ 运行出错:', error.message);
    process.exit(1);
  }
}

// 主函数
async function main() {
  // 显示帮助
  if (flags.help) {
    showHelp();
    return;
  }
  
  // 监听模式
  if (flags.watch) {
    try {
      require.resolve('chokidar');
    } catch {
      console.log('⚠️  监听模式需要 chokidar 包，正在安装...');
      const { execSync } = require('child_process');
      execSync('npm install chokidar --save-dev', { stdio: 'inherit' });
    }
    await runWatch();
    return;
  }
  
  // 运行指定工具
  if (runAll) {
    await runAllTools();
  } else {
    const startTime = Date.now();
    
    if (flags.analyze) await runAnalyzer();
    if (flags.keywords) await runKeywords();
    if (flags.meta) await runMeta();
    if (flags.sitemap) await runSitemap();
    if (flags.report) await runReport();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ 完成! 耗时: ${duration}秒`);
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 错误:', error);
  process.exit(1);
});
