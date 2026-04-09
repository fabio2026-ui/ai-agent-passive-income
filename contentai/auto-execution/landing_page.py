#!/usr/bin/env python3
"""
ContentAI 落地页与线索收集系统
"""

from flask import Flask, render_template_string, request, jsonify
import json
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

# 存储路径
DATA_DIR = Path('/root/.openclaw/workspace/contentai/auto-execution/data')
DATA_DIR.mkdir(exist_ok=True)

# 落地页模板
LANDING_PAGE_TEMPLATE = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ContentAI - AI内容创作变现平台</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            width: 100%;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            font-size: 2.5em;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .tagline {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .features {
            margin: 30px 0;
        }
        .feature {
            display: flex;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 10px;
            transition: transform 0.2s;
        }
        .feature:hover {
            transform: translateX(5px);
        }
        .feature-icon {
            font-size: 1.5em;
            margin-right: 15px;
        }
        .cta-section {
            margin-top: 30px;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            color: white;
        }
        .cta-section h2 {
            margin-bottom: 20px;
            text-align: center;
        }
        .email-form {
            display: flex;
            gap: 10px;
        }
        .email-form input {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 8px;
            font-size: 1em;
        }
        .email-form button {
            padding: 15px 30px;
            background: #333;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: background 0.2s;
        }
        .email-form button:hover {
            background: #555;
        }
        .social-links {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .social-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
        .donate-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: center;
        }
        .donate-section h3 {
            margin-bottom: 15px;
            color: #333;
        }
        .crypto-address {
            font-family: monospace;
            background: #333;
            color: #0f0;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            word-break: break-all;
            font-size: 0.9em;
        }
        .success-message {
            display: none;
            padding: 15px;
            background: #d4edda;
            color: #155724;
            border-radius: 8px;
            margin-top: 15px;
            text-align: center;
        }
        .stats {
            margin-top: 30px;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            text-align: center;
        }
        .stats-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🚀 ContentAI</h1>
        </div>
        
        <p class="tagline">
            AI驱动的内容创作与变现平台<br>
            让创作更简单，让变现更高效
        </p>
        
        <div class="features">
            <div class="feature">
                <span class="feature-icon">🤖</span>
                <span>AI智能写作 - 一键生成文章、脚本、文案</span>
            </div>
            <div class="feature">
                <span class="feature-icon">📱</span>
                <span>多平台发布 - 微信、小红书、抖音、Twitter</span>
            </div>
            <div class="feature">
                <span class="feature-icon">📊</span>
                <span>数据分析 - 实时追踪，优化策略</span>
            </div>
            <div class="feature">
                <span class="feature-icon">💰</span>
                <span>变现工具 - 广告、订阅、联盟营销</span>
            </div>
        </div>
        
        <div class="cta-section">
            <h2>🎁 免费抢先体验</h2>
            <p style="text-align: center; margin-bottom: 20px;">
                留下邮箱，第一时间获取内测资格
            </p>
            <form class="email-form" id="signupForm">
                <input type="email" name="email" placeholder="输入您的邮箱" required>
                <button type="submit">立即加入</button>
            </form>
            <div class="success-message" id="successMessage">
                ✅ 感谢订阅！我们会尽快联系您
            </div>
        </div>
        
        <div class="stats">
            <div class="stats-number" id="subscriberCount">{{ subscriber_count }}</div>
            <div>人已加入等待列表</div>
        </div>
        
        <div class="donate-section">
            <h3>☕ 支持我们</h3>
            <p>如果您认可我们的理念，欢迎捐赠支持</p>
            <div style="margin-top: 15px;">
                <strong>ETH/USDT (ERC-20):</strong>
                <div class="crypto-address">0xd43b2D60B0b03cEcce6f71dF765648dA511dAa98</div>
            </div>
            <div style="margin-top: 10px;">
                <strong>BTC:</strong>
                <div class="crypto-address">bc1q6d6zffkv4h6g7qjx8g6527g3tz3qptnxg5cuvg</div>
            </div>
        </div>
        
        <div class="social-links">
            <a href="https://t.me/contentai_bot">📱 Telegram</a>
            <a href="mailto:contact@contentai.example.com">📧 邮箱</a>
        </div>
    </div>
    
    <script>
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            
            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email})
                });
                
                if (response.ok) {
                    document.getElementById('successMessage').style.display = 'block';
                    e.target.reset();
                    // 更新计数
                    const countEl = document.getElementById('subscriberCount');
                    countEl.textContent = parseInt(countEl.textContent) + 1;
                }
            } catch (error) {
                alert('提交失败，请重试');
            }
        });
    </script>
</body>
</html>
'''

def get_subscriber_count():
    """获取订阅者数量"""
    subscriber_file = DATA_DIR / 'subscribers.json'
    if subscriber_file.exists():
        with open(subscriber_file, 'r') as f:
            data = json.load(f)
            return len(data)
    return 0

@app.route('/')
def landing_page():
    """落地页"""
    count = get_subscriber_count()
    return render_template_string(LANDING_PAGE_TEMPLATE, subscriber_count=count)

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    """邮箱订阅API"""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'error': '邮箱不能为空'}), 400
    
    subscriber_file = DATA_DIR / 'subscribers.json'
    subscribers = []
    
    if subscriber_file.exists():
        with open(subscriber_file, 'r') as f:
            subscribers = json.load(f)
    
    # 检查是否已存在
    if any(s['email'] == email for s in subscribers):
        return jsonify({'error': '该邮箱已订阅'}), 400
    
    # 添加新订阅者
    subscribers.append({
        'email': email,
        'subscribed_at': datetime.now().isoformat(),
        'source': 'landing_page'
    })
    
    with open(subscriber_file, 'w') as f:
        json.dump(subscribers, f, indent=2)
    
    return jsonify({'success': True, 'message': '订阅成功'})

@app.route('/api/stats')
def stats():
    """统计数据API"""
    return jsonify({
        'subscribers': get_subscriber_count(),
        'last_updated': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)