#!/usr/bin/env python3
"""
App代码批量生成器 - 从概念到代码，一键生成
为100个App自动生成完整代码
"""

import os
import json
from datetime import datetime

class AppCodeGenerator:
    """App代码批量生成器"""
    
    def __init__(self, output_dir="/root/ai-empire/app-matrix"):
        self.output_dir = output_dir
        self.generated_count = 0
        
    def generate_webapp(self, app_config: dict) -> str:
        """生成单个Web App代码"""
        
        name = app_config["name"]
        name_en = app_config.get("name_en", name.replace(" ", ""))
        keyword = app_config.get("keyword", "product")
        category = app_config.get("category", "utility")
        
        # 根据类别选择颜色主题
        themes = {
            "health": ("#10b981", "#059669"),  # 绿色
            "utility": ("#6366f1", "#4f46e5"),  # 紫色
            "lifestyle": ("#f59e0b", "#d97706"),  # 橙色
            "productivity": ("#3b82f6", "#2563eb"),  # 蓝色
            "parenting": ("#ec4899", "#db2777"),  # 粉色
            "social": ("#8b5cf6", "#7c3aed"),  # 紫罗兰
            "business": ("#14b8a6", "#0d9488"),  # 青色
            "creative": ("#f97316", "#ea580c"),  # 橙红
            "learning": ("#06b6d4", "#0891b2"),  # 天蓝
            "education": ("#84cc16", "#65a30d"),  #  lime
        }
        
        primary, primary_dark = themes.get(category, themes["utility"])
        
        html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>{name}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, sans-serif; background: #f8fafc; padding-bottom: 80px; }}
        .header {{ background: linear-gradient(135deg, {primary}, {primary_dark}); padding: 50px 20px 30px; 
                   border-radius: 0 0 30px 30px; color: white; text-align: center; }}
        .header h1 {{ font-size: 24px; margin-bottom: 10px; }}
        .header p {{ opacity: 0.9; font-size: 14px; }}
        .section {{ padding: 20px; }}
        .card {{ background: white; border-radius: 16px; padding: 20px; margin-bottom: 15px; 
                 box-shadow: 0 2px 8px rgba(0,0,0,0.05); }}
        .card h3 {{ color: #1e293b; margin-bottom: 10px; }}
        .card p {{ color: #64748b; font-size: 14px; line-height: 1.6; }}
        .btn {{ background: {primary}; color: white; border: none; padding: 14px 24px; 
                border-radius: 12px; font-size: 16px; width: 100%; margin-top: 10px; cursor: pointer; }}
        .btn:active {{ transform: scale(0.98); }}
        .feature-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }}
        .feature-item {{ background: #f1f5f9; padding: 15px; border-radius: 12px; text-align: center; }}
        .feature-icon {{ font-size: 28px; margin-bottom: 5px; }}
        .feature-text {{ font-size: 12px; color: #475569; }}
        .bottom-nav {{ position: fixed; bottom: 0; left: 0; right: 0; background: white; 
                       border-top: 1px solid #e2e8f0; display: flex; justify-content: space-around; 
                       padding: 12px 0 24px; }}
        .nav-item {{ text-align: center; color: #64748b; font-size: 11px; }}
        .nav-item.active {{ color: {primary}; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 {name}</h1>
        <p>基于{keyword}趋势的爆款App</p>
    </div>
    
    <div class="section">
        <div class="card">
            <h3>✨ 核心功能</h3>
            <p>{name}帮助你更好地管理{keyword}，提供智能化建议和数据追踪。</p>
            <div class="feature-grid">
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">数据分析</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🤖</div>
                    <div class="feature-text">AI建议</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div class="feature-text">随时记录</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">☁️</div>
                    <div class="feature-text">云同步</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>🎯 开始使用</h3>
            <p>点击下方按钮体验{name}的核心功能。</p>
            <button class="btn" onclick="startApp()">立即体验</button>
        </div>
        
        <div class="card">
            <h3>👑 升级到Pro</h3>
            <p>解锁无限AI建议、高级数据分析、云同步备份等功能。</p>
            <button class="btn" onclick="upgrade()" style="background: linear-gradient(135deg, #fbbf24, #f59e0b);">升级 Pro - ¥19/月</button>
        </div>
    </div>
    
    <div class="bottom-nav">
        <div class="nav-item active">🏠<br>首页</div>
        <div class="nav-item">📊<br>统计</div>
        <div class="nav-item">➕<br>记录</div>
        <div class="nav-item">👤<br>我的</div>
    </div>
    
    <script>
        function startApp() {{
            alert('🎉 欢迎使用{name}！\\n\\n功能开发中，敬请期待...');
        }}
        
        function upgrade() {{
            if (confirm('确认升级到{name} Pro?\\n\\n¥19/月 解锁全部功能')) {{
                alert('✅ 感谢支持！\\n\\n(演示模式：实际支付需要接入支付系统)');
            }}
        }}
        
        // 页面加载动画
        document.addEventListener('DOMContentLoaded', function() {{
            console.log('{name} v1.0.0 loaded');
            console.log('Category: {category}');
            console.log('Keyword: {keyword}');
        }});
    </script>
</body>
</html>"""
        
        return html
    
    
    def generate_batch(self, apps: list, batch_size: int = 10) -> list:
        """批量生成App代码"""
        
        generated = []
        
        for i, app in enumerate(apps[:batch_size], 1):
            app_id = app.get("id", f"APP_{i:03d}")
            app_name = app.get("name", f"App_{i}")
            
            # 创建目录
            app_dir = f"{self.output_dir}/{app_id}-{app_name.replace(' ', '-')}"
            os.makedirs(app_dir, exist_ok=True)
            
            # 生成Web App
            html_content = self.generate_webapp(app)
            with open(f"{app_dir}/index.html", "w", encoding="utf-8") as f:
                f.write(html_content)
            
            # 生成配置文件
            config = {
                "id": app_id,
                "name": app_name,
                "name_en": app_name.replace(" ", ""),
                "category": app.get("category", "utility"),
                "keyword": app.get("keyword", "product"),
                "trend": app.get("trend", "+0%"),
                "mvp_days": app.get("mvp_days", 3),
                "mrr_target": app.get("mrr_target", 3000),
                "generated_at": datetime.now().isoformat(),
                "files": ["index.html"]
            }
            
            with open(f"{app_dir}/app.json", "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            
            generated.append({
                "id": app_id,
                "name": app_name,
                "path": app_dir,
                "config": config
            })
            
            self.generated_count += 1
            print(f"✅ Generated: {app_id} - {app_name}")
        
        return generated
    
    def generate_deployment_script(self, apps: list) -> str:
        """生成批量部署脚本"""
        
        script = """#!/bin/bash
# AI App Matrix - 批量部署脚本
# 自动生成于 {timestamp}

BASE_DIR="/var/www/app-matrix"
NGINX_CONF="/etc/nginx/sites-available/app-matrix"

echo "🚀 开始部署 {count} 个App..."

# 创建基础目录
mkdir -p $BASE_DIR
cd $BASE_DIR

# 部署每个App
{app_deployments}

# 生成Nginx配置
cat > $NGINX_CONF << 'EOF'
server {{
    listen 80;
    server_name apps.your-domain.com;
    
    {nginx_locations}
    
    location / {{
        root $BASE_DIR/landing;
        index index.html;
    }}
}}
EOF

# 重启Nginx
nginx -t && systemctl reload nginx

echo "✅ 部署完成！"
echo "访问: http://apps.your-domain.com/"
""".format(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            count=len(apps),
            app_deployments="\n".join([
                f"# Deploy {app['id']}\ncp -r {app['path']} $BASE_DIR/{app['id'].lower()}"
                for app in apps
            ]),
            nginx_locations="\n    ".join([
                f"location /{app['id'].lower()} {{\n        alias $BASE_DIR/{app['id'].lower()};\n        try_files $uri $uri/ /index.html;\n    }}"
                for app in apps
            ])
        )
        
        return script
    
    def print_summary(self, generated: list):
        """打印生成摘要"""
        
        print("\n" + "="*80)
        print("📦 批量代码生成完成")
        print("="*80)
        
        print(f"\n✅ 成功生成: {len(generated)} 个App")
        print(f"📁 输出目录: {self.output_dir}")
        
        print("\n📱 生成的App列表:")
        for app in generated:
            config = app["config"]
            print(f"  • [{app['id']}] {app['name']:20} | "
                  f"类别: {config['category']:12} | "
                  f"目标MRR: ${config['mrr_target']:,}")
        
        total_mrr = sum(app["config"]["mrr_target"] for app in generated)
        print(f"\n💰 本批次收入潜力: ${total_mrr:,}/月")
        
        print("\n🚀 下一步:")
        print(f"  1. 检查代码: cd {self.output_dir}")
        print("  2. 本地测试: python3 -m http.server 8080")
        print("  3. 部署上线: 运行 deploy.sh")
        
        print("\n" + "="*80)


def main():
    """主程序 - 生成TOP 10爆款App"""
    
    # TOP 10 App配置
    top_10_apps = [
        {"id": "APP_003", "name": "瑜伽袜测评", "keyword": "yoga socks", "trend": "+3200%", "category": "utility", "mvp_days": 2, "mrr_target": 2000},
        {"id": "APP_042", "name": "玉石滚轮指南", "keyword": "face roller", "trend": "+3100%", "category": "utility", "mvp_days": 2, "mrr_target": 3000},
        {"id": "APP_001", "name": "AI瑜伽教练", "keyword": "yoga", "trend": "+3200%", "category": "health", "mvp_days": 3, "mrr_target": 5000},
        {"id": "APP_022", "name": "白噪音", "keyword": "white noise", "trend": "+1800%", "category": "utility", "mvp_days": 2, "mrr_target": 5000},
        {"id": "APP_002", "name": "普拉提助手", "keyword": "pilates", "trend": "+2800%", "category": "health", "mvp_days": 3, "mrr_target": 4000},
        {"id": "APP_043", "name": "刮痧教程", "keyword": "gua sha", "trend": "+2900%", "category": "utility", "mvp_days": 3, "mrr_target": 3500},
        {"id": "APP_052", "name": "番茄专注", "keyword": "pomodoro", "trend": "+1500%", "category": "productivity", "mvp_days": 2, "mrr_target": 4000},
        {"id": "APP_032", "name": "切菜器测评", "keyword": "kitchen gadgets", "trend": "+1600%", "category": "utility", "mvp_days": 2, "mrr_target": 2500},
        {"id": "APP_036", "name": "饮水提醒", "keyword": "water reminder", "trend": "+1200%", "category": "health", "mvp_days": 2, "mrr_target": 3000},
        {"id": "APP_082", "name": "浇水提醒", "keyword": "water reminder", "trend": "+1200%", "category": "utility", "mvp_days": 2, "mrr_target": 2500},
    ]
    
    # 创建生成器
    generator = AppCodeGenerator()
    
    print("🏭 App代码批量生成器启动")
    print(f"目标：生成 {len(top_10_apps)} 个爆款App")
    print("="*60)
    
    # 批量生成
    generated = generator.generate_batch(top_10_apps)
    
    # 生成部署脚本
    deploy_script = generator.generate_deployment_script(generated)
    with open(f"{generator.output_dir}/deploy.sh", "w") as f:
        f.write(deploy_script)
    os.chmod(f"{generator.output_dir}/deploy.sh", 0o755)
    
    # 打印摘要
    generator.print_summary(generated)
    
    print("\n✅ TOP 10 爆款App代码已生成完毕！")


if __name__ == "__main__":
    main()
