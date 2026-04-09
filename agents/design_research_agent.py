#!/usr/bin/env python3
"""
Design Research Agent - 设计研究专家
分析顶级设计案例，提供可复用的设计模式和配色方案
"""

import json
from pathlib import Path

class DesignResearchAgent:
    """设计研究专家Agent"""
    
    # 顶级案例库
    CASE_STUDIES = {
        "airbnb": {
            "year": 2009,
            "stage": "Seed",
            "colors": {"primary": "#FF5A5F", "secondary": "#00A699", "accent": "#FC642D"},
            "fonts": ("Circular", "Circular"),
            "key_element": "三图痛点对比"
        },
        "dropbox": {
            "year": 2007,
            "stage": "Seed",
            "colors": {"primary": "#0061FF", "secondary": "#000000", "accent": "#9B59B6"},
            "fonts": ("Sharp Grotesk", "Atlas Grotesk"),
            "key_element": "3分钟视频代替文字"
        },
        "canva": {
            "year": 2013,
            "stage": "Series A",
            "colors": {"primary": "#7B2CBF", "secondary": "#00C4CC", "accent": "#FF6B9D"},
            "fonts": ("Open Sans", "Open Sans"),
            "key_element": "真实设计作品背景"
        },
        "stripe": {
            "year": 2010,
            "stage": "Series A",
            "colors": {"primary": "#635BFF", "secondary": "#0A2540", "accent": "#00D4AA"},
            "fonts": ("Camphor", "Camphor"),
            "key_element": "代码片段作为设计"
        },
        "figma": {
            "year": 2015,
            "stage": "Series B",
            "colors": {"primary": "#F24E1E", "secondary": "#1E1E1E", "accent": "#A259FF"},
            "fonts": ("Whyte", "Whyte"),
            "key_element": "多人协作光标展示"
        },
        "sequoia": {
            "year": 2024,
            "stage": "Template",
            "colors": {"primary": "#DC2626", "secondary": "#1F2937", "accent": "#F59E0B"},
            "fonts": ("Inter", "Inter"),
            "key_element": "10页标准结构"
        }
    }
    
    # 配色方案数据库
    COLOR_PALETTES = {
        "tech_blue": {
            "primary": "#0066FF",
            "secondary": "#1A1A2E",
            "accent": "#00D4AA",
            "background": "#FFFFFF",
            "text": "#0F0F0F",
            "mood": "专业、可信、科技"
        },
        "warm_red": {
            "primary": "#FF5A5F",
            "secondary": "#2D2D2D",
            "accent": "#00A699",
            "background": "#FFFFFF",
            "text": "#484848",
            "mood": "热情、冲动、人文"
        },
        "deep_purple": {
            "primary": "#7B2CBF",
            "secondary": "#1A1A2E",
            "accent": "#00C4CC",
            "background": "#FFFFFF",
            "text": "#2D2D2D",
            "mood": "创意、未来、神秘"
        },
        "forest_green": {
            "primary": "#059669",
            "secondary": "#064E3B",
            "accent": "#F59E0B",
            "background": "#F0FDF4",
            "text": "#1F2937",
            "mood": "自然、可持续、健康"
        },
        "midnight_dark": {
            "primary": "#6366F1",
            "secondary": "#0F0F23",
            "accent": "#22D3EE",
            "background": "#0F0F23",
            "text": "#F8FAFC",
            "mood": "高端、神秘、未来"
        },
        "soft_pastel": {
            "primary": "#FB7185",
            "secondary": "#818CF8",
            "accent": "#34D399",
            "background": "#FFF1F2",
            "text": "#4B5563",
            "mood": "友好、年轻、轻松"
        }
    }
    
    # 字体搭配数据库
    FONT_COMBINATIONS = {
        "modern_clean": {
            "heading": "Inter",
            "body": "Inter",
            "style": "极简现代，适合SaaS",
            "weights": "800/400"
        },
        "elegant_editorial": {
            "heading": "Playfair Display",
            "body": "Inter",
            "style": "优雅编辑，适合金融/咨询",
            "weights": "700/400"
        },
        "bold_startup": {
            "heading": "Archivo Black",
            "body": "Source Sans Pro",
            "style": "Bold冲击，适合DTC品牌",
            "weights": "400/400"
        },
        "tech_future": {
            "heading": "Space Grotesk",
            "body": "Inter",
            "style": "几何未来，适合AI/Web3",
            "weights": "700/400"
        },
        "developer_friendly": {
            "heading": "JetBrains Mono",
            "body": "Inter",
            "style": "开发者审美，适合技术产品",
            "weights": "800/400"
        }
    }
    
    @classmethod
    def recommend_scheme(cls, industry: str, stage: str, mood: str = None) -> dict:
        """根据行业和阶段推荐设计方案"""
        
        industry_mapping = {
            "saas": ("tech_blue", "modern_clean"),
            "fintech": ("tech_blue", "elegant_editorial"),
            "ecommerce": ("warm_red", "bold_startup"),
            "dtc": ("warm_red", "bold_startup"),
            "health": ("forest_green", "modern_clean"),
            "ai": ("deep_purple", "tech_future"),
            "web3": ("midnight_dark", "tech_future"),
            "consumer": ("soft_pastel", "bold_startup"),
            "enterprise": ("tech_blue", "modern_clean")
        }
        
        color_key, font_key = industry_mapping.get(industry, ("tech_blue", "modern_clean"))
        
        # 根据融资阶段调整
        if stage.lower() in ["seed", "pre-seed", "angel"]:
            # 早期更bold，需要attention
            font_key = "bold_startup"
        elif stage.lower() in ["series c", "series d", "growth"]:
            # 后期更professional
            font_key = "elegant_editorial"
        
        return {
            "colors": cls.COLOR_PALETTES[color_key],
            "fonts": cls.FONT_COMBINATIONS[font_key],
            "reference": cls._get_reference_case(industry, stage)
        }
    
    @classmethod
    def _get_reference_case(cls, industry: str, stage: str) -> str:
        """获取参考案例"""
        mapping = {
            "saas": "stripe",
            "fintech": "stripe",
            "ecommerce": "airbnb",
            "dtc": "airbnb",
            "ai": "figma"
        }
        return mapping.get(industry, "sequoia")
    
    @classmethod
    def generate_style_guide(cls, project_name: str, industry: str, stage: str) -> str:
        """生成完整风格指南"""
        scheme = cls.recommend_scheme(industry, stage)
        colors = scheme["colors"]
        fonts = scheme["fonts"]
        ref = scheme["reference"]
        
        return f"""# {project_name} - Design Style Guide

## 配色方案 ({ref} inspired)

| 用途 | 色值 | 预览 |
|------|------|------|
| 主色 | `{colors['primary']}` | <span style="background:{colors['primary']};padding:4px 16px;border-radius:4px;color:white">Primary</span> |
| 辅色 | `{colors['secondary']}` | <span style="background:{colors['secondary']};padding:4px 16px;border-radius:4px;color:white">Secondary</span> |
| 强调 | `{colors['accent']}` | <span style="background:{colors['accent']};padding:4px 16px;border-radius:4px;color:white">Accent</span> |
| 背景 | `{colors['background']}` | <span style="background:{colors['background']};border:1px solid #ccc;padding:4px 16px;border-radius:4px">Background</span> |
| 文字 | `{colors['text']}` | <span style="color:{colors['text']}">Text Color</span> |

**情绪**: {colors['mood']}

## 字体搭配

- **标题**: {fonts['heading']} ({fonts['weights'].split('/')[0]})
- **正文**: {fonts['body']} ({fonts['weights'].split('/')[1]})
- **风格**: {fonts['style']}

## Tailwind CDN引用

```html
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family={fonts['heading'].replace(' ', '+')}:wght@400;600;700;800&family={fonts['body'].replace(' ', '+')}:wght@300;400;500;600&display=swap" rel="stylesheet">
```

## 页面结构建议

1. **Cover**: 大标题 + 一句话 + 3个核心数字
2. **Problem**: 痛点大图 + 一句话描述
3. **Why Now**: 三个驱动力（图标+短句）
4. **Solution**: 产品截图 + 核心价值
5. **Market**: TAM大数字
6. **Business Model**: 收入来源 + 单位经济
7. **Traction**: 增长曲线 + 里程碑
8. **Team**: 头像 + 背景
9. **Financials**: 3年表格
10. **Closing**: 强行动号召

---
Generated by Design Research Agent
"""
    
    @classmethod
    def list_all_options(cls):
        """列出所有可用选项"""
        print("🎨 Available Color Palettes:")
        for name, palette in cls.COLOR_PALETTES.items():
            print(f"   {name}: {palette['mood']}")
        
        print("\n🔤 Available Font Combinations:")
        for name, fonts in cls.FONT_COMBINATIONS.items():
            print(f"   {name}: {fonts['style']}")
        
        print("\n📚 Reference Cases:")
        for name, case in cls.CASE_STUDIES.items():
            print(f"   {name} ({case['year']}): {case['key_element']}")


def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python design_research_agent.py <command> [args]")
        print("\nCommands:")
        print("  recommend <industry> <stage>   - 推荐设计方案")
        print("  guide <name> <industry> <stage> - 生成风格指南")
        print("  list                           - 列出所有选项")
        return
    
    command = sys.argv[1]
    
    if command == "list":
        DesignResearchAgent.list_all_options()
    
    elif command == "recommend" and len(sys.argv) >= 4:
        industry, stage = sys.argv[2], sys.argv[3]
        scheme = DesignResearchAgent.recommend_scheme(industry, stage)
        print(f"\n🎯 Recommendation for {industry} at {stage}:")
        print(f"   Colors: {scheme['colors']['mood']}")
        print(f"   Fonts: {scheme['fonts']['style']}")
        print(f"   Reference: {scheme['reference']}")
    
    elif command == "guide" and len(sys.argv) >= 5:
        name, industry, stage = sys.argv[2], sys.argv[3], sys.argv[4]
        guide = DesignResearchAgent.generate_style_guide(name, industry, stage)
        
        output_path = f"/root/ai-empire-share/{name.lower().replace(' ', '_')}_style_guide.md"
        with open(output_path, 'w') as f:
            f.write(guide)
        print(f"✅ Style guide created: {output_path}")
    
    else:
        print("Invalid command or missing arguments")

if __name__ == "__main__":
    main()
