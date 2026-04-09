/**
 * 多Agent代码审查服务 MVP
 * 部署: Cloudflare Workers
 * 功能: 并行安全、性能、风格审查
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS配置
app.use('*', cors({
  origin: '*',
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// ============================================================================
// 代码分析引擎 (简化版Agent)
// ============================================================================

class SecurityAgent {
  analyze(code) {
    const issues = [];
    const lines = code.split('\n');
    
    // SQL注入检测
    lines.forEach((line, idx) => {
      if (/query.*=.*f".*\$\{/.test(line) || /query.*=.*\+.*\+/.test(line)) {
        issues.push({
          severity: 'critical',
          line: idx + 1,
          category: 'security',
          description: 'Potential SQL Injection: Dynamic query construction detected',
          suggestion: 'Use parameterized queries or prepared statements'
        });
      }
      
      // 硬编码密钥
      if (/SECRET|API_KEY|PASSWORD|TOKEN.*=.*["\'][^"\']{5,}["\']/.test(line)) {
        issues.push({
          severity: 'high',
          line: idx + 1,
          category: 'security',
          description: 'Hardcoded secret detected',
          suggestion: 'Use environment variables or secure secret management'
        });
      }
      
      // 不安全的哈希
      if (/md5\(|sha1\(/.test(line)) {
        issues.push({
          severity: 'medium',
          line: idx + 1,
          category: 'security',
          description: 'Weak hashing algorithm used',
          suggestion: 'Use bcrypt, Argon2, or SHA-256 for password hashing'
        });
      }
      
      // 路径遍历
      if (/open\(|read_file|write_file.*\+/.test(line) && /user|input|param/.test(code)) {
        issues.push({
          severity: 'high',
          line: idx + 1,
          category: 'security',
          description: 'Potential Path Traversal vulnerability',
          suggestion: 'Validate and sanitize file paths, use allowlists'
        });
      }
      
      // eval/exec危险函数
      if (/eval\(|exec\(|system\(/.test(line)) {
        issues.push({
          severity: 'critical',
          line: idx + 1,
          category: 'security',
          description: 'Dangerous function usage detected',
          suggestion: 'Avoid eval/exec, use safer alternatives'
        });
      }
    });
    
    const score = Math.max(0, 100 - issues.length * 15);
    return {
      reviewer_type: 'security',
      score,
      issues,
      summary: `Found ${issues.length} security issues. Critical: ${issues.filter(i => i.severity === 'critical').length}, High: ${issues.filter(i => i.severity === 'high').length}`
    };
  }
}

class PerformanceAgent {
  analyze(code) {
    const issues = [];
    const lines = code.split('\n');
    
    // N+1查询检测
    let inLoop = false;
    let loopDepth = 0;
    
    lines.forEach((line, idx) => {
      // 检测循环
      if (/for\s+\w+\s+in|while\s+/.test(line)) {
        inLoop = true;
        loopDepth++;
      }
      if (line.trim() === '' || line.includes('return')) {
        if (loopDepth > 0) loopDepth--;
        if (loopDepth === 0) inLoop = false;
      }
      
      // 循环内数据库操作
      if (inLoop && /query|execute|find|get|select|db\./.test(line)) {
        issues.push({
          severity: 'high',
          line: idx + 1,
          category: 'performance',
          description: 'N+1 Query pattern detected: Database operation inside loop',
          suggestion: 'Use bulk operations or join queries instead'
        });
      }
      
      // 低效循环
      if (/for.*range\(\d{4,}\)|while.*True/.test(line)) {
        issues.push({
          severity: 'medium',
          line: idx + 1,
          category: 'performance',
          description: 'Potentially expensive loop detected',
          suggestion: 'Consider optimization or pagination'
        });
      }
      
      // 重复计算
      if (/len\(|count\(|sum\(/.test(line) && inLoop) {
        issues.push({
          severity: 'low',
          line: idx + 1,
          category: 'performance',
          description: 'Function call in loop condition',
          suggestion: 'Cache the result outside the loop'
        });
      }
      
      // 未使用列表推导
      if (/\.append\(/.test(line) && inLoop) {
        const prevLine = lines[idx - 1] || '';
        if (prevLine.includes('= []')) {
          issues.push({
            severity: 'low',
            line: idx + 1,
            category: 'performance',
            description: 'Consider using list comprehension',
            suggestion: 'Replace loop with [x for x in items] pattern'
          });
        }
      }
    });
    
    const score = Math.max(0, 100 - issues.length * 10);
    return {
      reviewer_type: 'performance',
      score,
      issues,
      summary: `Found ${issues.length} performance issues. Focus areas: query optimization, loop efficiency`
    };
  }
}

class StyleAgent {
  analyze(code) {
    const issues = [];
    const lines = code.split('\n');
    
    lines.forEach((line, idx) => {
      // 函数命名规范 (camelCase检测)
      if (/def\s+[A-Z]/.test(line)) {
        issues.push({
          severity: 'low',
          line: idx + 1,
          category: 'style',
          description: 'Function name should be snake_case',
          suggestion: 'Use lowercase with underscores for function names'
        });
      }
      
      // 缺少文档字符串
      if (/def\s+\w+\(/.test(line)) {
        const nextLine = lines[idx + 1] || '';
        if (!nextLine.includes('"""') && !nextLine.includes("'''")) {
          issues.push({
            severity: 'low',
            line: idx + 1,
            category: 'style',
            description: 'Missing docstring for function',
            suggestion: 'Add a docstring explaining the function purpose'
          });
        }
      }
      
      // 行过长
      if (line.length > 100) {
        issues.push({
          severity: 'low',
          line: idx + 1,
          category: 'style',
          description: 'Line exceeds 100 characters',
          suggestion: 'Break into multiple lines for readability'
        });
      }
      
      // 缺少空格 (如 x=1)
      if (/\w=\w/.test(line) && !/==|!=|<=|>=/.test(line)) {
        issues.push({
          severity: 'low',
          line: idx + 1,
          category: 'style',
          description: 'Missing spaces around operator',
          suggestion: 'Use spaces around operators: x = 1'
        });
      }
      
      // 导入排序
      if (/^from\s+\./.test(line)) {
        issues.push({
          severity: 'low',
          line: idx + 1,
          category: 'style',
          description: 'Relative imports should be avoided',
          suggestion: 'Use absolute imports instead'
        });
      }
    });
    
    const score = Math.max(0, 100 - issues.length * 3);
    return {
      reviewer_type: 'style',
      score,
      issues,
      summary: `Found ${issues.length} style issues. Check PEP 8 compliance and documentation`
    };
  }
}

// ============================================================================
// 协调器
// ============================================================================

class ReviewCoordinator {
  constructor() {
    this.agents = {
      security: new SecurityAgent(),
      performance: new PerformanceAgent(),
      style: new StyleAgent()
    };
  }
  
  async review(code) {
    // 并行执行所有审查
    const results = await Promise.all([
      this.agents.security.analyze(code),
      this.agents.performance.analyze(code),
      this.agents.style.analyze(code)
    ]);
    
    // 汇总
    const overallScore = Math.round(
      results.reduce((acc, r) => acc + r.score, 0) / results.length
    );
    
    const allIssues = results.flatMap(r => r.issues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const highIssues = allIssues.filter(i => i.severity === 'high');
    
    // 生成优先修复建议
    const recommendations = [
      ...criticalIssues.slice(0, 3).map(i => `[CRITICAL] Line ${i.line}: ${i.suggestion}`),
      ...highIssues.slice(0, 3).map(i => `[HIGH] Line ${i.line}: ${i.suggestion}`)
    ];
    
    return {
      overall_score: overallScore,
      security_review: results[0],
      performance_review: results[1],
      style_review: results[2],
      total_issues: allIssues.length,
      critical_count: criticalIssues.length,
      high_count: highIssues.length,
      recommendations: recommendations.length > 0 ? recommendations : ['Code looks good! Consider adding more documentation.'],
      executive_summary: this.generateSummary(overallScore, allIssues)
    };
  }
  
  generateSummary(score, issues) {
    if (score >= 90) return 'Excellent code quality. Minor style improvements suggested.';
    if (score >= 75) return 'Good code quality. Address security and performance recommendations.';
    if (score >= 60) return 'Fair code quality. Several issues need attention before deployment.';
    return 'Code needs significant improvements. Critical issues must be addressed.';
  }
}

// ============================================================================
// API路由
// ============================================================================

const coordinator = new ReviewCoordinator();

// 健康检查
app.get('/', (c) => {
  return c.json({
    service: 'Multi-Agent Code Review Service',
    version: '1.0.0',
    status: 'healthy',
    agents: ['security', 'performance', 'style'],
    endpoints: {
      review: 'POST /api/review',
      health: 'GET /health'
    }
  });
});

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 代码审查端点
app.post('/api/review', async (c) => {
  try {
    const { code, language = 'python' } = await c.req.json();
    
    if (!code || typeof code !== 'string') {
      return c.json({ error: 'Code is required' }, 400);
    }
    
    if (code.length > 50000) {
      return c.json({ error: 'Code too large (max 50KB)' }, 400);
    }
    
    const result = await coordinator.review(code);
    
    return c.json({
      success: true,
      language,
      code_length: code.length,
      ...result
    });
    
  } catch (error) {
    return c.json({ 
      error: 'Review failed', 
      message: error.message 
    }, 500);
  }
});

// 批量审查端点
app.post('/api/review/batch', async (c) => {
  try {
    const { files } = await c.req.json();
    
    if (!Array.isArray(files) || files.length > 10) {
      return c.json({ error: 'Files array required (max 10 files)' }, 400);
    }
    
    const results = await Promise.all(
      files.map(async (file) => ({
        filename: file.filename,
        ...await coordinator.review(file.code)
      }))
    );
    
    const avgScore = Math.round(
      results.reduce((acc, r) => acc + r.overall_score, 0) / results.length
    );
    
    return c.json({
      success: true,
      average_score: avgScore,
      files_reviewed: results.length,
      results
    });
    
  } catch (error) {
    return c.json({ 
      error: 'Batch review failed', 
      message: error.message 
    }, 500);
  }
});

// 演示端点
app.get('/demo', async (c) => {
  const demoCode = `
def process_user_data(user_input, db_conn):
    # Security: SQL Injection
    query = f"SELECT * FROM users WHERE name = '{user_input}'"
    result = db_conn.execute(query)
    
    # Security: Hardcoded secret
    SECRET_KEY = "my_secret_key_12345"
    
    # Performance: Inefficient nested loop
    data = []
    for i in range(1000):
        for j in range(1000):
            data.append(i * j)
    
    # Style: Bad naming, no docstring
    def calc(x, y):
        return x + y
    
    # Security: Weak hash
    password_hash = hashlib.md5(user_input.encode()).hexdigest()
    
    return result

# Style: camelCase function name
def anotherFunction():
    x=1
    y=2
    return x+y
`;
  
  const result = await coordinator.review(demoCode);
  
  return c.json({
    demo: true,
    sample_code: demoCode,
    review_result: result
  });
});

export default app;
