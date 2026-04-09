#!/usr/bin/env python3
"""
PPT Designer Pro - 顶级VC融资路演设计师
用法: python ppt_designer_pro.py <项目名> <融资额> <输出路径>
"""

import sys
import json
from datetime import datetime

class PPTDesignerPro:
    """Sequoia/YC级别的Pitch Deck设计师"""
    
    # 顶级配色方案
    COLOR_SCHEMES = {
        "sequoia": {
            "primary": "#DC2626",      # Sequoia红
            "secondary": "#1F2937",    # 深灰
            "accent": "#F59E0B",       # 金色
            "bg": "#FFFFFF",
            "text": "#111827"
        },
        "yc": {
            "primary": "#FF6600",      # YC橙
            "secondary": "#000000",    # 纯黑
            "accent": "#00D084",       # 科技绿
            "bg": "#FAFAFA",
            "text": "#0F0F0F"
        },
        "airbnb": {
            "primary": "#FF5A5F",      # Airbnb红
            "secondary": "#00A699",    # 青绿
            "accent": "#FC642D",       # 橙红
            "bg": "#FFFFFF",
            "text": "#484848"
        },
        "dropbox": {
            "primary": "#0061FF",      # Dropbox蓝
            "secondary": "#000000",
            "accent": "#9B59B6",       # 紫
            "bg": "#F7F9FA",
            "text": "#1E1919"
        },
        "canva": {
            "primary": "#7B2CBF",      # Canva紫
            "secondary": "#00C4CC",    # 青
            "accent": "#FF6B9D",       # 粉
            "bg": "#FFFFFF",
            "text": "#2D2D2D"
        },
        "stripe": {
            "primary": "#635BFF",      # Stripe紫
            "secondary": "#0A2540",    # 深蓝
            "accent": "#00D4AA",       # 青绿
            "bg": "#FFFFFF",
            "text": "#0A2540"
        }
    }
    
    # YC推荐字体组合
    FONT_PAIRS = {
        "modern": ("Inter", "Inter"),           # 标题+正文都用Inter
        "classic": ("Playfair Display", "Inter"), # 衬线标题+无衬线正文
        "tech": ("JetBrains Mono", "Inter"),      # 等宽标题+现代正文
        "bold": ("Archivo Black", "Source Sans Pro"),
        "elegant": ("Crimson Pro", "Lato")
    }
    
    def __init__(self, scheme="sequoia", font="modern"):
        self.colors = self.COLOR_SCHEMES[scheme]
        self.title_font, self.body_font = self.FONT_PAIRS[font]
        
    def create_deck(self, project_data):
        """创建完整pitch deck"""
        html = self._generate_html(project_data)
        return html
    
    def _generate_html(self, data):
        """生成HTML结构"""
        return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{data['name']} | {data['tagline']}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family={self.title_font.replace(' ', '+')}:wght@400;600;700;800&family={self.body_font.replace(' ', '+')}:wght@300;400;500;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {{
            --primary: {self.colors['primary']};
            --secondary: {self.colors['secondary']};
            --accent: {self.colors['accent']};
        }}
        .slide {{
            width: 100vw;
            height: 100vh;
            page-break-after: always;
            overflow: hidden;
        }}
        .font-title {{ font-family: '{self.title_font}', sans-serif; }}
        .font-body {{ font-family: '{self.body_font}', sans-serif; }}
    </style>
</head>
<body class="font-body">
    {self._slide_cover(data)}
    {self._slide_problem(data)}
    {self._slide_whynow(data)}
    {self._slide_solution(data)}
    {self._slide_market(data)}
    {self._slide_business_model(data)}
    {self._slide_traction(data)}
    {self._slide_team(data)}
    {self._slide_financials(data)}
    {self._slide_roadmap(data)}
    {self._slide_closing(data)}
</body>
</html>'''
    
    def _slide_cover(self, data):
        """封面页 - 冲击力第一"""
        metrics = data.get('metrics', [])
        metrics_html = ''.join([
            f'<div class="text-center"><div class="text-6xl font-title font-bold" style="color: var(--accent)">{m["value"]}</div><div class="text-lg opacity-70 mt-2">{m["label"]}</div></div>'
            for m in metrics[:3]
        ])
        return f'''
<div class="slide flex flex-col justify-center items-center text-white" style="background: linear-gradient(135deg, {self.colors['secondary']} 0%, {self.colors['primary']} 100%);">
    <p class="text-sm tracking-[0.3em] uppercase opacity-70 mb-8">{data.get('stage', 'Series A')} Pitch Deck</p>
    <h1 class="text-8xl font-title font-bold mb-6">{data['name']}</h1>
    <p class="text-3xl opacity-90 mb-20">{data['tagline']}</p>
    <div class="flex gap-20">{metrics_html}</div>
</div>'''

    def _slide_problem(self, data):
        """Problem页 - 大图+一句话"""
        return f'''
<div class="slide bg-white flex">
    <div class="w-1/2 flex items-center justify-center p-16" style="background: {self.colors['secondary']};">
        <div class="text-center text-white">
            <div class="text-9xl font-title font-bold mb-8" style="color: var(--primary);">-40%</div>
            <p class="text-2xl opacity-80">Average Amazon seller margin<br/>after all fees</p>
        </div>
    </div>
    <div class="w-1/2 flex flex-col justify-center p-20">
        <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">01 / The Problem</p>
        <h2 class="text-6xl font-title font-bold mb-12 leading-tight" style="color: {self.colors['text']};">E-commerce has a<br/>profit problem</h2>
        <div class="space-y-8">
            <div class="flex items-start gap-4">
                <span class="text-4xl" style="color: var(--primary);">❌</span>
                <div>
                    <h3 class="text-2xl font-semibold mb-2">Platform dependency kills margins</h3>
                    <p class="text-xl opacity-60">Sellers lose 30-50% to Amazon fees</p>
                </div>
            </div>
            <div class="flex items-start gap-4">
                <span class="text-4xl" style="color: var(--primary);">❌</span>
                <div>
                    <h3 class="text-2xl font-semibold mb-2">Product-market fit is expensive</h3>
                    <p class="text-xl opacity-60">$500K-2M to test, most fail</p>
                </div>
            </div>
        </div>
    </div>
</div>'''

    def _slide_whynow(self, data):
        """Why Now页 - 时机三要素"""
        drivers = [
            {"icon": "🤖", "title": "AI Design", "desc": "Cost dropped 100x in 2 years"},
            {"icon": "📱", "title": "TikTok Shop", "desc": "Traffic arbitrage window"},
            {"icon": "🏭", "title": "China Supply", "desc": "Digital-native manufacturing"}
        ]
        cards = ''.join([
            f'<div class="p-12 rounded-3xl text-center" style="background: {self.colors["secondary"]};"><div class="text-6xl mb-6">{d["icon"]}</div><h3 class="text-3xl font-title font-bold text-white mb-4">{d["title"]}</h3><p class="text-xl opacity-70 text-white">{d["desc"]}</p></div>'
            for d in drivers
        ])
        return f'''
<div class="slide bg-white flex flex-col justify-center px-20">
    <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">02 / Why Now</p>
    <h2 class="text-6xl font-title font-bold mb-20">Three forces converging in 2026</h2>
    <div class="grid grid-cols-3 gap-8">{cards}</div>
    <p class="text-center text-2xl mt-16 opacity-60">This window closes in 18-24 months</p>
</div>'''

    def _slide_solution(self, data):
        """Solution页 - 公式展示"""
        return f'''
<div class="slide flex flex-col justify-center px-24 bg-white">
    <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">03 / Our Solution</p>
    <h2 class="text-6xl font-title font-bold mb-16">The AI-Native CPG Formula</h2>
    
    <div class="flex items-center justify-center gap-8 text-4xl font-bold mb-20" style="color: {self.colors['secondary']};">
        <span class="px-8 py-4 rounded-2xl text-white" style="background: {self.colors['primary']};">AI Design</span>
        <span class="text-6xl opacity-30">+</span>
        <span class="px-8 py-4 rounded-2xl text-white" style="background: {self.colors['secondary']};">China Supply</span>
        <span class="text-6xl opacity-30">+</span>
        <span class="px-8 py-4 rounded-2xl" style="background: {self.colors['accent']};">Emotional Value</span>
    </div>
    
    <div class="grid grid-cols-3 gap-12">
        <div class="text-center">
            <div class="text-6xl font-bold mb-4" style="color: var(--primary);">10×</div>
            <p class="text-xl opacity-60">Design speed vs traditional</p>
        </div>
        <div class="text-center">
            <div class="text-6xl font-bold mb-4" style="color: var(--primary);">$2-15</div>
            <p class="text-xl opacity-60">Unit cost, 7-day samples</p>
        </div>
        <div class="text-center">
            <div class="text-6xl font-bold mb-4" style="color: var(--primary);">70%</div>
            <p class="text-xl opacity-60">Gross margins via storytelling</p>
        </div>
    </div>
</div>'''

    def _slide_market(self, data):
        """Market页 - 大数字+细分"""
        return f'''
<div class="slide flex items-center justify-center px-20" style="background: {self.colors['secondary']};">
    <div class="text-center text-white">
        <p class="text-sm tracking-widest uppercase mb-8 opacity-70">04 / Market Opportunity</p>
        <div class="text-[12rem] font-title font-bold mb-8" style="color: var(--accent);">$500B</div>
        <p class="text-3xl mb-20 opacity-90">Emotional Commerce Market</p>
        
        <div class="flex justify-center gap-16">
            <div class="text-center">
                <div class="text-5xl font-bold mb-2" style="color: var(--primary);">$2.7B</div>
                <p class="text-lg opacity-60">Yoga Socks alone</p>
            </div>
            <div class="text-center">
                <div class="text-5xl font-bold mb-2" style="color: var(--primary);">$15B</div>
                <p class="text-lg opacity-60">Sleep Products</p>
            </div>
            <div class="text-center">
                <div class="text-5xl font-bold mb-2" style="color: var(--primary);">$80B</div>
                <p class="text-lg opacity-60">Pet Industry</p>
            </div>
        </div>
    </div>
</div>'''

    def _slide_business_model(self, data):
        """Business Model页 - 收入结构+单位经济"""
        return f'''
<div class="slide bg-white flex flex-col justify-center px-20">
    <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">05 / Business Model</p>
    <h2 class="text-6xl font-title font-bold mb-12">DTC-First, Multi-Channel</h2>
    
    <div class="grid grid-cols-2 gap-6 mb-12">
        <div class="p-8 rounded-2xl flex justify-between items-center" style="background: {self.colors['primary']}; color: white;">
            <div><h3 class="text-2xl font-bold">TikTok Shop</h3><p class="opacity-80">Organic + paid, viral potential</p></div>
            <div class="text-5xl font-bold">40%</div>
        </div>
        <div class="p-8 rounded-2xl flex justify-between items-center" style="background: {self.colors['secondary']}; color: white;">
            <div><h3 class="text-2xl font-bold">Direct-to-Consumer</h3><p class="opacity-80">Highest margin, owned data</p></div>
            <div class="text-5xl font-bold">30%</div>
        </div>
        <div class="p-8 rounded-2xl flex justify-between items-center bg-gray-100">
            <div><h3 class="text-2xl font-bold">Amazon</h3><p class="opacity-60">Traffic + credibility</p></div>
            <div class="text-5xl font-bold" style="color: var(--primary);">20%</div>
        </div>
        <div class="p-8 rounded-2xl flex justify-between items-center bg-gray-100">
            <div><h3 class="text-2xl font-bold">B2B Wholesale</h3><p class="opacity-60">Scale play, lower margin</p></div>
            <div class="text-5xl font-bold" style="color: var(--primary);">10%</div>
        </div>
    </div>
    
    <div class="flex justify-center gap-12">
        <div class="text-center px-12 py-6 rounded-2xl" style="background: {self.colors['accent']};">
            <div class="text-4xl font-bold text-white">65%</div>
            <p class="text-white opacity-90">Gross Margin</p>
        </div>
        <div class="text-center px-12 py-6 rounded-2xl" style="background: {self.colors['primary']};">
            <div class="text-4xl font-bold text-white">36%</div>
            <p class="text-white opacity-90">Net Margin</p>
        </div>
        <div class="text-center px-12 py-6 rounded-2xl bg-gray-100">
            <div class="text-4xl font-bold" style="color: var(--primary);">3-5×</div>
            <p class="opacity-60">LTV/CAC</p>
        </div>
    </div>
</div>'''

    def _slide_traction(self, data):
        """Traction页 - 图表+引用"""
        return f'''
<div class="slide bg-white flex flex-col justify-center px-20">
    <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">06 / Traction</p>
    <h2 class="text-6xl font-title font-bold mb-12">Proven playbook, replicated</h2>
    
    <div class="grid grid-cols-2 gap-12">
        <div class="p-12 rounded-3xl" style="background: {self.colors['secondary']}; color: white;">
            <p class="text-2xl leading-relaxed mb-8 opacity-90">"We've replicated the $2.7M sock playbook across 6 verticals in 90 days. Each brand profitable within 60 days."</p>
            <p class="opacity-60">— Founder, 2026</p>
        </div>
        <div class="grid grid-cols-2 gap-6">
            <div class="p-8 rounded-2xl bg-gray-50 text-center">
                <div class="text-6xl font-bold mb-2" style="color: var(--primary);">6</div>
                <p class="opacity-60">Live Brands</p>
            </div>
            <div class="p-8 rounded-2xl bg-gray-50 text-center">
                <div class="text-6xl font-bold mb-2" style="color: var(--primary);">47%</div>
                <p class="opacity-60">Max Margin</p>
            </div>
            <div class="p-8 rounded-2xl bg-gray-50 text-center">
                <div class="text-6xl font-bold mb-2" style="color: var(--primary);">60d</div>
                <p class="opacity-60">To Profit</p>
            </div>
            <div class="p-8 rounded-2xl bg-gray-50 text-center">
                <div class="text-6xl font-bold mb-2" style="color: var(--primary);">$25K</div>
                <p class="opacity-60">Launch Capital</p>
            </div>
        </div>
    </div>
</div>'''

    def _slide_team(self, data):
        """Team页 - 创始人+AI团队"""
        return f'''
<div class="slide bg-white flex flex-col justify-center px-20">
    <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">07 / Team</p>
    <h2 class="text-6xl font-title font-bold mb-16">Lean, AI-Augmented</h2>
    
    <div class="grid grid-cols-2 gap-12">
        <div class="flex items-center gap-8 p-12 rounded-3xl" style="background: {self.colors['secondary']}; color: white;">
            <div class="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold" style="background: var(--primary);">F</div>
            <div>
                <h3 class="text-3xl font-bold mb-2">Fu Wei</h3>
                <p class="text-xl mb-4" style="color: var(--accent);">Founder & CEO</p>
                <p class="opacity-80">AI Product + China Supply Chain. Built and exited 2 e-commerce brands.</p>
            </div>
        </div>
        <div class="flex items-center gap-8 p-12 rounded-3xl bg-gray-100">
            <div class="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white" style="background: {self.colors['primary']};">AI</div>
            <div>
                <h3 class="text-3xl font-bold mb-2">AI Workforce</h3>
                <p class="text-xl mb-4" style="color: var(--primary);">Design, Copy, Ops</p>
                <p class="opacity-60">Midjourney + Claude + Automation. 1 human = 10 person team.</p>
            </div>
        </div>
    </div>
</div>'''

    def _slide_financials(self, data):
        """Financials页 - 干净表格"""
        return f'''
<div class="slide bg-white flex flex-col justify-center px-20">
    <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">08 / Financial Projections</p>
    <h2 class="text-6xl font-title font-bold mb-12">$100M in 24 months</h2>
    
    <table class="w-full text-left">
        <thead>
            <tr class="border-b-2 border-gray-200">
                <th class="py-6 text-xl text-gray-400 font-medium">Metric</th>
                <th class="py-6 text-xl text-gray-400 font-medium">Year 1</th>
                <th class="py-6 text-xl text-gray-400 font-medium">Year 2</th>
                <th class="py-6 text-xl text-gray-400 font-medium">Year 3</th>
            </tr>
        </thead>
        <tbody class="text-2xl">
            <tr class="border-b border-gray-100">
                <td class="py-8 font-medium">Revenue</td>
                <td class="py-8">$2M</td>
                <td class="py-8 font-bold" style="color: var(--primary);">$10M</td>
                <td class="py-8 font-bold text-4xl" style="color: var(--primary);">$100M</td>
            </tr>
            <tr class="border-b border-gray-100">
                <td class="py-8 font-medium">Gross Profit</td>
                <td class="py-8">$1.3M</td>
                <td class="py-8">$6.5M</td>
                <td class="py-8">$65M</td>
            </tr>
            <tr class="border-b border-gray-100">
                <td class="py-8 font-medium">Net Profit</td>
                <td class="py-8" style="color: var(--accent);">$400K</td>
                <td class="py-8" style="color: var(--accent);">$2.5M</td>
                <td class="py-8 font-bold text-4xl" style="color: var(--accent);">$36M</td>
            </tr>
            <tr>
                <td class="py-8 font-medium">Active Brands</td>
                <td class="py-8">6</td>
                <td class="py-8">8</td>
                <td class="py-8">10</td>
            </tr>
        </tbody>
    </table>
</div>'''

    def _slide_roadmap(self, data):
        """Roadmap页 - 时间线"""
        return f'''
<div class="slide bg-white flex flex-col justify-center px-20">
    <p class="text-sm tracking-widest uppercase mb-4" style="color: var(--primary);">09 / Roadmap</p>
    <h2 class="text-6xl font-title font-bold mb-16">12-Month Execution</h2>
    
    <div class="relative">
        <div class="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2" style="background: linear-gradient(90deg, var(--primary), var(--accent));"></div>
        <div class="flex justify-between relative">
            <div class="text-center w-48">
                <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white" style="background: var(--primary);">Q1</div>
                <h4 class="text-2xl font-bold mb-2">Launch</h4>
                <p class="opacity-60">2 new verticals</p>
            </div>
            <div class="text-center w-48">
                <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white" style="background: var(--primary);">Q2</div>
                <h4 class="text-2xl font-bold mb-2">Scale</h4>
                <p class="opacity-60">TikTok Shop</p>
            </div>
            <div class="text-center w-48">
                <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white" style="background: var(--primary);">Q3</div>
                <h4 class="text-2xl font-bold mb-2">Retain</h4>
                <p class="opacity-60">Subscription</p>
            </div>
            <div class="text-center w-48">
                <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold" style="background: var(--accent);">Q4</div>
                <h4 class="text-2xl font-bold mb-2">Expand</h4>
                <p class="opacity-60">B2B Wholesale</p>
            </div>
            <div class="text-center w-48">
                <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white" style="background: var(--secondary);">Y2</div>
                <h4 class="text-2xl font-bold mb-2">$10M</h4>
                <p class="opacity-60">Revenue target</p>
            </div>
        </div>
    </div>
</div>'''

    def _slide_closing(self, data):
        """Closing页 - 强行动号召"""
        return f'''
<div class="slide flex flex-col justify-center items-center text-center text-white" style="background: {self.colors['secondary']};">
    <p class="text-2xl mb-8 opacity-70">This is a once-in-a-decade arbitrage</p>
    <h2 class="text-7xl font-title font-bold mb-8">Join the Empire</h2>
    <p class="text-3xl mb-12 opacity-90">Seeking <span class="font-bold" style="color: var(--accent);">$5M</span> Series A</p>
    <div class="flex gap-4 mb-16">
        <span class="px-6 py-3 rounded-full text-lg" style="background: var(--primary);">10 Verticals</span>
        <span class="px-6 py-3 rounded-full text-lg" style="background: var(--primary);">$100M Revenue</span>
        <span class="px-6 py-3 rounded-full text-lg" style="background: var(--primary);">Zero Employees</span>
    </div>
    <p class="text-3xl" style="color: var(--accent);">fu@unicornempire.com</p>
</div>'''


def main():
    # 默认创建UNICORN EMPIRE deck
    project = {
        "name": "UNICORN EMPIRE",
        "tagline": "10 Verticals. $100M Revenue. Zero Employees.",
        "stage": "Series A",
        "metrics": [
            {"value": "$100M", "label": "Annual Revenue"},
            {"value": "36%", "label": "Net Margin"},
            {"value": "10", "label": "Independent Brands"}
        ]
    }
    
    designer = PPTDesignerPro(scheme="airbnb", font="modern")
    html = designer.create_deck(project)
    
    output_path = sys.argv[1] if len(sys.argv) > 1 else "/root/ai-empire-share/UNICORN_V3_DECK.html"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ Pitch Deck created: {output_path}")
    print(f"   Scheme: Airbnb (red + teal)")
    print(f"   Font: Inter")
    print(f"   Pages: 12")
    
    # 同时输出配色方案列表供选择
    print("\n🎨 Available Color Schemes:")
    for name in designer.COLOR_SCHEMES.keys():
        print(f"   - {name}")
    print("\n💡 Usage: Edit scheme='airbnb' to change color theme")

if __name__ == "__main__":
    main()
