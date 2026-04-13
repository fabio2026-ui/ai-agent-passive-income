// 自动化监控 Worker - 小七部署
// 功能: 自动追踪网站流量、GitHub Stars、收入指标

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 健康检查
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 获取统计数据
    if (url.pathname === '/api/stats') {
      const stats = await env.KV.get('stats');
      return new Response(stats || '{}', {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 记录访问
    if (url.pathname === '/api/track') {
      const today = new Date().toISOString().split('T')[0];
      const key = `visits:${today}`;
      
      let visits = await env.KV.get(key) || '0';
      visits = parseInt(visits) + 1;
      await env.KV.put(key, visits.toString());
      
      return new Response(JSON.stringify({ visits }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 返回监控面板
    return new Response(MONITORING_DASHBOARD, {
      headers: { 'Content-Type': 'text/html' }
    });
  },
  
  // 定时任务 - 每小时抓取一次 GitHub 数据
  async scheduled(event, env) {
    const response = await fetch('https://api.github.com/repos/fabio2026-ui/ai-agent-passive-income');
    const data = await response.json();
    
    const stats = {
      timestamp: new Date().toISOString(),
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.watchers_count
    };
    
    await env.KV.put('github_stats', JSON.stringify(stats));
  }
};

const MONITORING_DASHBOARD = `
<!DOCTYPE html>
<html>
<head>
  <title>小七自动监控系统</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 10px 0; }
    .metric { font-size: 32px; font-weight: bold; color: #007AFF; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
  </style>
</head>
<body>
  <h1>🚀 小七自动监控系统</h1>
  <p>自动追踪: GitHub Stars | 网站访问 | 收入指标</p>
  
  <div class="grid">
    <div class="card">
      <h3>GitHub Stars</h3>
      <div class="metric" id="stars">加载中...</div>
    </div>
    <div class="card">
      <h3>今日访问</h3>
      <div class="metric" id="visits">加载中...</div>
    </div>
    <div class="card">
      <h3>Forks</h3>
      <div class="metric" id="forks">加载中...</div>
    </div>
  </div>
  
  <script>
    fetch('/api/stats').then(r => r.json()).then(data => {
      document.getElementById('stars').textContent = data.stars || 0;
      document.getElementById('forks').textContent = data.forks || 0;
    });
  </script>
</body>
</html>
`;
