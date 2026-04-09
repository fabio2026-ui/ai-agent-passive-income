#!/usr/bin/env python3
"""
趋势数据获取示例 - Google Trends / App Store / Google Play
展示如何获取应用市场趋势并分析
"""

import sys
sys.path.insert(0, '/root/.openclaw/workspace/shared_intel')

from intel_hub import IntelHub, set_intel, get_intel
from datetime import datetime

class TrendAnalyzer:
    """趋势分析器 - 分析Google Trends、App Store、Google Play数据"""
    
    def __init__(self):
        self.hub = IntelHub()
    
    def analyze_search_trends(self, data: dict) -> dict:
        """分析搜索趋势数据"""
        insights = {
            "timestamp": datetime.now().isoformat(),
            "rising_keywords": [],
            "declining_keywords": [],
            "opportunities": []
        }
        
        # 分析 rising keywords
        if "rising" in data:
            for item in data["rising"][:5]:
                insights["rising_keywords"].append({
                    "keyword": item.get("term"),
                    "growth": item.get("growth", "N/A"),
                    "category": self._categorize_keyword(item.get("term"))
                })
        
        # 识别业务机会
        insights["opportunities"] = self._identify_opportunities(insights["rising_keywords"])
        
        return insights
    
    def analyze_app_trends(self, store_data: dict, store_name: str) -> dict:
        """分析应用商店趋势"""
        insights = {
            "timestamp": datetime.now().isoformat(),
            "store": store_name,
            "top_categories": {},
            "emerging_apps": [],
            "business_insights": []
        }
        
        # 分析热门类别
        if "top_apps" in store_data:
            categories = {}
            for app in store_data["top_apps"][:20]:
                cat = app.get("category", "Other")
                categories[cat] = categories.get(cat, 0) + 1
            insights["top_categories"] = dict(sorted(categories.items(), 
                                                      key=lambda x: x[1], 
                                                      reverse=True)[:5])
        
        # 识别新兴应用（新上榜或增长快）
        if "trending" in store_data:
            insights["emerging_apps"] = [
                {
                    "name": app.get("name"),
                    "category": app.get("category"),
                    "trend_reason": app.get("trend_reason", "N/A")
                }
                for app in store_data["trending"][:5]
            ]
        
        # 业务洞察
        insights["business_insights"] = self._generate_app_insights(
            insights["top_categories"], 
            insights["emerging_apps"]
        )
        
        return insights
    
    def _categorize_keyword(self, keyword: str) -> str:
        """关键词分类"""
        keyword = keyword.lower() if keyword else ""
        
        categories = {
            "AI/工具": ["ai", "gpt", "chatbot", "automation", "productivity"],
            "开发": ["code", "developer", "github", "api", "software"],
            "设计": ["design", "figma", "canva", "creative", "template"],
            "电商": ["shopify", "dropship", "ecommerce", "amazon", "store"],
            "内容": ["video", "tiktok", "youtube", "content", "editing"],
            "营销": ["marketing", "seo", "ads", "growth", "analytics"]
        }
        
        for cat, keywords in categories.items():
            if any(k in keyword for k in keywords):
                return cat
        return "其他"
    
    def _identify_opportunities(self, rising_keywords: list) -> list:
        """识别业务机会"""
        opportunities = []
        
        category_count = {}
        for item in rising_keywords:
            cat = item.get("category", "其他")
            category_count[cat] = category_count.get(cat, 0) + 1
        
        # 如果某个类别出现多次，说明是热点
        for cat, count in category_count.items():
            if count >= 2:
                opportunities.append({
                    "type": "hot_category",
                    "category": cat,
                    "signal_strength": "high" if count >= 3 else "medium",
                    "action": f"考虑开发{cat}相关的产品或服务"
                })
        
        return opportunities
    
    def _generate_app_insights(self, top_categories: dict, emerging_apps: list) -> list:
        """生成应用商店业务洞察"""
        insights = []
        
        # 分析热门类别
        if top_categories:
            top_cat = list(top_categories.keys())[0]
            insights.append({
                "type": "market_demand",
                "insight": f"{top_cat}类应用需求旺盛",
                "recommendation": f"考虑开发{top_cat}相关工具或服务"
            })
        
        # 分析新兴趋势
        ai_apps = [app for app in emerging_apps 
                   if any(kw in app.get("name", "").lower() or 
                          app.get("category", "").lower() 
                          for kw in ["ai", "gpt", "smart", "auto"])]
        
        if ai_apps:
            insights.append({
                "type": "trend_signal",
                "insight": "AI功能成为应用差异化关键",
                "recommendation": "为现有产品添加AI功能，或开发AI-first应用"
            })
        
        return insights
    
    def generate_weekly_report(self) -> dict:
        """生成周度趋势报告"""
        report = {
            "period": "weekly",
            "generated_at": datetime.now().isoformat(),
            "sections": []
        }
        
        # 读取各数据源
        google_trends = get_intel("market", "google_trends")
        app_store = get_intel("market", "app_store_trends")
        play_store = get_intel("market", "play_store_trends")
        software = get_intel("market", "software_trends")
        
        # 分析各部分
        if google_trends:
            search_analysis = self.analyze_search_trends(google_trends)
            report["sections"].append({
                "title": "搜索趋势洞察",
                "data": search_analysis
            })
        
        if app_store:
            ios_analysis = self.analyze_app_trends(app_store, "App Store")
            report["sections"].append({
                "title": "iOS应用趋势",
                "data": ios_analysis
            })
        
        if play_store:
            android_analysis = self.analyze_app_trends(play_store, "Google Play")
            report["sections"].append({
                "title": "Android应用趋势",
                "data": android_analysis
            })
        
        # 综合建议
        report["recommendations"] = self._generate_recommendations(report["sections"])
        
        return report
    
    def _generate_recommendations(self, sections: list) -> list:
        """生成综合建议"""
        recommendations = []
        
        # 汇总所有机会
        all_opportunities = []
        for section in sections:
            data = section.get("data", {})
            if "opportunities" in data:
                all_opportunities.extend(data["opportunities"])
            if "business_insights" in data:
                all_opportunities.extend(data["business_insights"])
        
        # 去重并排序
        seen = set()
        for opp in all_opportunities:
            key = opp.get("type", "") + opp.get("insight", "")[:20]
            if key not in seen:
                seen.add(key)
                recommendations.append(opp)
        
        return recommendations[:5]  # 返回前5条


# 便捷函数
def get_trend_insights() -> dict:
    """获取趋势洞察（供机器人调用）"""
    analyzer = TrendAnalyzer()
    return analyzer.generate_weekly_report()

def check_trending_keyword(keyword: str) -> bool:
    """检查关键词是否在上升趋势"""
    trends = get_intel("market", "google_trends")
    if not trends:
        return None  # 未知
    
    rising = trends.get("rising", [])
    return any(keyword.lower() in item.get("term", "").lower() 
               for item in rising)


def main():
    """演示趋势分析"""
    print("📈 TrendAnalyzer - 趋势分析器")
    print("=" * 50)
    
    analyzer = TrendAnalyzer()
    
    # 示例：分析Google Trends数据
    print("\n🌐 分析 Google Trends 数据...")
    
    # 模拟数据（实际从共享库读取）
    sample_google_data = {
        "rising": [
            {"term": "AI video generator", "growth": "+5000%", "category": "AI/工具"},
            {"term": "ChatGPT API", "growth": "+2500%", "category": "AI/工具"},
            {"term": "Notion AI", "growth": "+1800%", "category": "AI/工具"},
            {"term": "Figma to code", "growth": "+1200%", "category": "设计"},
            {"term": "TikTok Shop seller", "growth": "+900%", "category": "电商"}
        ],
        "top": [
            {"term": "AI tools", "volume": "high"},
            {"term": "make money online", "volume": "high"},
            {"term": "side hustle", "volume": "medium"}
        ]
    }
    
    # 存入共享库（模拟中央情报局已获取）
    set_intel("market", "google_trends", sample_google_data)
    
    # 分析
    insights = analyzer.analyze_search_trends(sample_google_data)
    
    print("\n📊 分析结果:")
    print(f"  上升关键词: {len(insights['rising_keywords'])} 个")
    for kw in insights['rising_keywords']:
        print(f"    - {kw['keyword']}: {kw['growth']} ({kw['category']})")
    
    print(f"\n  💡 业务机会:")
    for opp in insights['opportunities']:
        print(f"    - {opp['action']}")
    
    # 示例：分析App Store数据
    print("\n📱 分析 App Store 数据...")
    
    sample_app_data = {
        "top_apps": [
            {"name": "ChatGPT", "category": "Productivity", "rank": 1},
            {"name": "CapCut", "category": "Photo & Video", "rank": 2},
            {"name": "Temu", "category": "Shopping", "rank": 3},
            {"name": "Notion", "category": "Productivity", "rank": 4},
            {"name": "Canva", "category": "Graphics & Design", "rank": 5},
        ],
        "trending": [
            {"name": "AI Photo Generator", "category": "Photo & Video", "trend_reason": "AI feature"},
            {"name": "Auto Caption", "category": "Productivity", "trend_reason": "content creation"}
        ]
    }
    
    set_intel("market", "app_store_trends", sample_app_data)
    
    app_insights = analyzer.analyze_app_trends(sample_app_data, "App Store")
    
    print(f"\n  热门类别: {app_insights['top_categories']}")
    print(f"  新兴应用: {[app['name'] for app in app_insights['emerging_apps']]}")
    
    print(f"\n  💡 业务洞察:")
    for insight in app_insights['business_insights']:
        print(f"    - {insight['insight']}")
        print(f"      建议: {insight['recommendation']}")
    
    print("\n" + "=" * 50)
    print("✅ 趋势分析完成！数据已存入共享库。")
    print("\n机器人可以调用 get_trend_insights() 获取完整报告")


if __name__ == "__main__":
    main()
