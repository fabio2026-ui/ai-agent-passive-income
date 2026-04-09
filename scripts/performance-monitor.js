#!/usr/bin/env node
/**
 * Performance Monitor Script
 * 自动检查项目性能指标并生成报告
 */

const fs = require('fs');
const path = require('path');

// 配置
const PROJECTS = [
  { name: 'ai-diet-coach', path: './ai-diet-coach', type: 'vite' },
  { name: 'ai-diary-pro', path: './ai-diary-pro', type: 'vite' },
  { name: 'focus-forest-ai', path: './focus-forest-ai', type: 'vite' },
  { name: 'breath-ai', path: './breath-ai', type: 'vite' },
  { name: 'habit-ai-app', path: './habit-ai-app', type: 'vite' },
  { name: 'api-aggregator', path: './api-aggregator/src', type: 'worker' },
];

// 性能阈值
const THRESHOLDS = {
  maxBundleSize: 500 * 1024, // 500KB
  maxChunkCount: 10,
  maxInitialLoad: 3 * 1024 * 1024, // 3MB
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查Vite配置
function checkViteConfig(projectPath) {
  const configFiles = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];
  const configPath = configFiles
    .map(f => path.join(projectPath, f))
    .find(fs.existsSync);

  if (!configPath) {
    return { valid: false, error: 'No Vite config found' };
  }

  const config = fs.readFileSync(configPath, 'utf-8');
  const checks = {
    codeSplitting: config.includes('manualChunks'),
    terser: config.includes('minify: \'terser\'') || config.includes('minify: "terser"'),
    sourcemap: config.includes('sourcemap: true'),
    visualizer: config.includes('rollup-plugin-visualizer'),
    cssCodeSplit: config.includes('cssCodeSplit'),
    assetsInline: config.includes('assetsInlineLimit'),
  };

  return {
    valid: true,
    checks,
    score: Object.values(checks).filter(Boolean).length / Object.keys(checks).length
  };
}

// 检查package.json
function checkPackageJson(projectPath) {
  const packagePath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    return { valid: false, error: 'No package.json found' };
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const checks = {
    hasBuildScript: !!pkg.scripts?.build,
    hasAnalyzeScript: !!pkg.scripts?.['build:analyze'],
    hasTerser: !!pkg.devDependencies?.terser || !!pkg.dependencies?.terser,
    hasVisualizer: !!pkg.devDependencies?.['rollup-plugin-visualizer'],
    modernReact: pkg.dependencies?.react?.startsWith('^18'),
  };

  return {
    valid: true,
    checks,
    dependencies: Object.keys(pkg.dependencies || {}).length,
    devDependencies: Object.keys(pkg.devDependencies || {}).length,
    score: Object.values(checks).filter(Boolean).length / Object.keys(checks).length
  };
}

// 检查API优化
function checkAPIOptimization(projectPath) {
  const indexPath = path.join(projectPath, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    return { valid: false, error: 'No index.js found' };
  }

  const code = fs.readFileSync(indexPath, 'utf-8');
  
  const checks = {
    hasCache: code.includes('Cache') || code.includes('cache'),
    hasLRU: code.includes('LRU'),
    hasStaticResponses: code.includes('STATIC_RESPONSES'),
    hasResponseTimeHeader: code.includes('X-Response-Time'),
    hasCorsHeaders: code.includes('corsHeaders'),
  };

  return {
    valid: true,
    checks,
    score: Object.values(checks).filter(Boolean).length / Object.keys(checks).length
  };
}

// 检查数据库优化
function checkDatabaseOptimization(projectPath) {
  const dbPath = path.join(projectPath, 'src/db/database.ts');
  
  if (!fs.existsSync(dbPath)) {
    return { valid: false, error: 'No database.ts found' };
  }

  const code = fs.readFileSync(dbPath, 'utf-8');
  
  const checks = {
    hasQueryCache: code.includes('QueryCache'),
    hasPagination: code.includes('paginated') || code.includes('page'),
    hasBatchOperations: code.includes('batch') || code.includes('bulk'),
    hasCacheInvalidation: code.includes('invalidate'),
    hasIndexHint: code.includes('index') || code.includes('.where('),
  };

  return {
    valid: true,
    checks,
    score: Object.values(checks).filter(Boolean).length / Object.keys(checks).length
  };
}

// 生成性能报告
function generateReport() {
  log('\n📊 Performance Optimization Check\n', 'blue');
  log('='.repeat(60));

  const results = [];

  for (const project of PROJECTS) {
    log(`\n🔍 Checking: ${project.name}`, 'yellow');
    
    let result = {
      name: project.name,
      type: project.type,
      score: 0,
      issues: [],
      recommendations: []
    };

    if (project.type === 'vite') {
      // Check Vite config
      const viteCheck = checkViteConfig(project.path);
      if (!viteCheck.valid) {
        result.issues.push(viteCheck.error);
      } else {
        result.score += viteCheck.score * 0.5;
        
        if (!viteCheck.checks.codeSplitting) {
          result.recommendations.push('Add manualChunks for code splitting');
        }
        if (!viteCheck.checks.terser) {
          result.recommendations.push('Enable terser minification');
        }
        if (!viteCheck.checks.visualizer) {
          result.recommendations.push('Add rollup-plugin-visualizer');
        }
      }

      // Check package.json
      const pkgCheck = checkPackageJson(project.path);
      if (!pkgCheck.valid) {
        result.issues.push(pkgCheck.error);
      } else {
        result.score += pkgCheck.score * 0.3;
        
        if (!pkgCheck.checks.hasAnalyzeScript) {
          result.recommendations.push('Add "build:analyze" script');
        }
      }

      // Check database (if applicable)
      const dbCheck = checkDatabaseOptimization(project.path);
      if (dbCheck.valid) {
        result.score += dbCheck.score * 0.2;
        
        if (!dbCheck.checks.hasQueryCache) {
          result.recommendations.push('Add query caching layer');
        }
      }

    } else if (project.type === 'worker') {
      // Check API optimization
      const apiCheck = checkAPIOptimization(project.path);
      if (!apiCheck.valid) {
        result.issues.push(apiCheck.error);
      } else {
        result.score = apiCheck.score;
        
        if (!apiCheck.checks.hasLRU) {
          result.recommendations.push('Implement LRU cache');
        }
        if (!apiCheck.checks.hasStaticResponses) {
          result.recommendations.push('Pre-serialize static responses');
        }
      }
    }

    // Display results
    const scorePercent = Math.round(result.score * 100);
    const scoreColor = scorePercent >= 80 ? 'green' : scorePercent >= 60 ? 'yellow' : 'red';
    
    log(`  Score: ${scorePercent}%`, scoreColor);
    
    if (result.issues.length > 0) {
      log(`  Issues:`, 'red');
      result.issues.forEach(i => log(`    - ${i}`, 'red'));
    }
    
    if (result.recommendations.length > 0) {
      log(`  Recommendations:`, 'yellow');
      result.recommendations.forEach(r => log(`    - ${r}`, 'yellow'));
    }

    if (result.issues.length === 0 && result.recommendations.length === 0) {
      log(`  ✅ All checks passed!`, 'green');
    }

    results.push(result);
  }

  // Summary
  log('\n' + '='.repeat(60));
  log('📈 Summary', 'blue');
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const avgScorePercent = Math.round(avgScore * 100);
  
  log(`  Average Score: ${avgScorePercent}%`, 
    avgScorePercent >= 80 ? 'green' : avgScorePercent >= 60 ? 'yellow' : 'red');
  
  const passedProjects = results.filter(r => r.score >= 0.8).length;
  log(`  Projects Passed: ${passedProjects}/${results.length}`, 'green');
  
  const totalRecommendations = results.reduce((sum, r) => sum + r.recommendations.length, 0);
  log(`  Pending Recommendations: ${totalRecommendations}`, 'yellow');

  // Save report
  const reportPath = '/root/.openclaw/workspace/ai-empire/quality-reports/performance-check-latest.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    averageScore: avgScore,
    results
  }, null, 2));
  
  log(`\n📄 Report saved to: ${reportPath}`, 'blue');

  return results;
}

// 运行检查
if (require.main === module) {
  generateReport();
}

module.exports = { generateReport, checkViteConfig, checkPackageJson };
