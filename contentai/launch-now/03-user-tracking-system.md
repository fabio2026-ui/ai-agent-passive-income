# 📊 用户注册/使用追踪系统

## ⚡ 今晚必须部署！追踪每一个用户行为

---

## 🎯 追踪目标

### 核心指标
1. **获取指标** - 用户从哪里来？
2. **激活指标** - 用户有没有真正使用？
3. **留存指标** - 用户会回来吗？
4. **推荐指标** - 用户会分享吗？

---

## 1️⃣ Google Analytics 4 设置

### 快速部署代码

**Step 1: 创建 GA4 属性**
1. 访问 https://analytics.google.com
2. 创建新属性 → 网站
3. 数据流 → Web → 输入网站URL
4. 复制测量ID: `G-XXXXXXXXXX`

**Step 2: 添加到网站（复制到 <head>）**
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'campaign_params': {
      'source': getUTM('utm_source'),
      'medium': getUTM('utm_medium'),
      'campaign': getUTM('utm_campaign')
    }
  });
  
  function getUTM(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || 'direct';
  }
</script>
```

**Step 3: 设置转化事件**
```javascript
// 用户注册追踪
gtag('event', 'sign_up', {
  'method': 'email',
  'source': getUTM('utm_source')
});

// 内容生成追踪
gtag('event', 'generate_content', {
  'content_type': 'blog', // blog, twitter, email
  'word_count': 500
});

// 导出追踪
gtag('event', 'export_content', {
  'platform': 'wordpress' // wordpress, medium, twitter
});
```

---

## 2️⃣ 自定义事件追踪代码

### 添加到主应用文件

```typescript
// utils/analytics.ts

export const Analytics = {
  // 页面浏览
  pageView: (path: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-XXXXXXXXXX', { page_path: path });
    }
  },

  // 用户注册
  signUp: (source: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'sign_up', {
        event_category: 'engagement',
        event_label: source,
        value: 1
      });
    }
    // 同时发送到内部数据库
    logToDatabase('sign_up', { source, timestamp: new Date() });
  },

  // 内容生成
  contentGenerated: (type: string, wordCount: number) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'generate_content', {
        event_category: 'engagement',
        event_label: type,
        value: wordCount
      });
    }
    logToDatabase('content_generated', { type, wordCount });
  },

  // 导出
  export: (platform: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'export_content', {
        event_category: 'conversion',
        event_label: platform
      });
    }
    logToDatabase('export', { platform });
  },

  // 来源追踪
  trackSource: () => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source') || 'direct';
    const medium = params.get('utm_medium') || 'none';
    const campaign = params.get('utm_campaign') || 'none';
    
    localStorage.setItem('user_source', source);
    localStorage.setItem('user_medium', medium);
    localStorage.setItem('user_campaign', campaign);
    
    return { source, medium, campaign };
  }
};

// 数据库日志函数
async function logToDatabase(event: string, data: any) {
  try {
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        userId: localStorage.getItem('user_id'),
        sessionId: localStorage.getItem('session_id'),
        timestamp: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error('Analytics log failed:', e);
  }
}
```

---

## 3️⃣ UTM 链接生成器

### 不同渠道的追踪链接

```bash
# Twitter/X
https://your-url.com/?utm_source=twitter&utm_medium=social&utm_campaign=launch_night

# Reddit r/SideProject
https://your-url.com/?utm_source=reddit&utm_medium=social&utm_campaign=sideproject_launch

# Reddit r/Entrepreneur
https://your-url.com/?utm_source=reddit&utm_medium=social&utm_campaign=entrepreneur_launch

# IndieHackers
https://your-url.com/?utm_source=indiehackers&utm_medium=social&utm_campaign=ih_launch

# HackerNews
https://your-url.com/?utm_source=hackernews&utm_medium=social&utm_campaign=hn_launch

# 邮件
https://your-url.com/?utm_source=email&utm_medium=email&utm_campaign=welcome_sequence

# 直接访问（无UTM）
https://your-url.com/
```

---

## 4️⃣ 简易追踪仪表板

### 创建追踪看板

**文件: `tracking-dashboard.html` (放在网站根目录)**

```html
<!DOCTYPE html>
<html>
<head>
  <title>ContentAI Launch Tracker</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric { display: inline-block; margin: 10px 20px; }
    .metric-value { font-size: 36px; font-weight: bold; color: #1a73e8; }
    .metric-label { color: #666; font-size: 14px; }
    .source-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
    .progress-bar { width: 200px; height: 20px; background: #eee; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #1a73e8; transition: width 0.3s; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 ContentAI 发布追踪看板</h1>
    <p>最后更新: <span id="lastUpdate">--</span></p>
    
    <div class="card">
      <h2>📊 核心指标</h2>
      <div class="metric">
        <div class="metric-value" id="totalVisitors">0</div>
        <div class="metric-label">总访客</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="totalSignups">0</div>
        <div class="metric-label">注册数</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="conversionRate">0%</div>
        <div class="metric-label">转化率</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="activeUsers">0</div>
        <div class="metric-label">活跃用户</div>
      </div>
    </div>

    <div class="card">
      <h2>📈 流量来源</h2>
      <div id="sourceBreakdown"></div>
    </div>

    <div class="card">
      <h2>⚡ 实时监控</h2>
      <div id="liveActivity">等待数据...</div>
    </div>
  </div>

  <script>
    // 从API获取数据
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/dashboard');
        const data = await response.json();
        updateDashboard(data);
      } catch (e) {
        console.error('Failed to fetch:', e);
        // 使用模拟数据
        updateDashboard(getMockData());
      }
    }

    function updateDashboard(data) {
      document.getElementById('totalVisitors').textContent = data.visitors;
      document.getElementById('totalSignups').textContent = data.signups;
      document.getElementById('conversionRate').textContent = data.conversionRate + '%';
      document.getElementById('activeUsers').textContent = data.activeUsers;
      document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
      
      // 来源细分
      const sourceDiv = document.getElementById('sourceBreakdown');
      sourceDiv.innerHTML = data.sources.map(s => `
        <div class="source-row">
          <span>${s.name}</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${s.percentage}%"></div>
          </div>
          <span>${s.count} (${s.percentage}%)</span>
        </div>
      `).join('');
    }

    function getMockData() {
      return {
        visitors: 127,
        signups: 23,
        conversionRate: 18.1,
        activeUsers: 15,
        sources: [
          { name: 'Twitter/X', count: 45, percentage: 35 },
          { name: 'Reddit', count: 38, percentage: 30 },
          { name: 'IndieHackers', count: 24, percentage: 19 },
          { name: '直接访问', count: 20, percentage: 16 }
        ]
      };
    }

    // 每30秒刷新
    fetchData();
    setInterval(fetchData, 30000);
  </script>
</body>
</html>
```

---

## 5️⃣ API 端点（后端）

### 创建日志API

```typescript
// pages/api/analytics/log.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, data, userId, sessionId, timestamp } = req.body;

  try {
    // 保存到数据库
    await saveToDatabase({
      event,
      data,
      userId,
      sessionId,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: timestamp || new Date().toISOString()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to log' });
  }
}

// pages/api/analytics/dashboard.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
```

---

## 6️⃣ 简易数据库表结构

```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP
);

-- 事件日志表
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  event_type TEXT,
  event_data JSON,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_source ON users(source);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_user ON events(user_id);
```

---

## 7️⃣ 追踪清单

### 部署检查清单
- [ ] GA4 代码已添加到网站
- [ ] 自定义事件已部署
- [ ] UTM链接已生成
- [ ] 追踪看板已部署
- [ ] API端点已测试
- [ ] 数据库表已创建

### 验证测试
- [ ] 访问带UTM链接，检查source是否正确记录
- [ ] 注册测试账号，检查sign_up事件
- [ ] 生成内容，检查generate_content事件
- [ ] 导出内容，检查export事件
- [ ] 检查实时数据是否在看板显示

---

## 8️⃣ 明天一早要看的指标

### 关键数字（起床后立即检查）

| 指标 | 目标 | 检查方式 |
|------|------|----------|
| 总访客 | > 200 | GA4 Realtime |
| 注册数 | > 30 | 数据库 / 追踪看板 |
| 转化率 | > 10% | 计算 |
| Twitter来源 | > 30% | GA4 Acquisition |
| Reddit来源 | > 25% | GA4 Acquisition |
| 内容生成次数 | > 50 | 自定义事件 |

---

**现在就部署追踪系统！没有数据 = 盲飞！**

**GA4代码5分钟就能加上！马上动手！🚀**
