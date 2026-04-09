#!/usr/bin/env python3
"""
项目群优化中心 - UNICORN帝国业务线管理
基于中央情报共享库，自动优化10个垂直品类

10个垂直品类:
1. 瑜伽袜 (Yoga Socks) - 原型
2. 宠物用品 (Pet Products)
3. 睡眠产品 (Sleep Products)  
4. 厨房小工具 (Kitchen Gadgets)
5. 美容工具 (Beauty Tools)
6. 办公用品 (Office Supplies)
7. 运动配件 (Fitness Accessories)
8. 婴儿用品 (Baby Products)
9. 汽车配件 (Car Accessories)
10. 园艺工具 (Gardening Tools)
"""

import sys
sys.path.insert(0, '/root/.openclaw/workspace/shared_intel')

from intel_hub import IntelHub, get_intel, set_intel, is_fresh
from datetime import datetime
from typing import Dict, List, Optional
import json

class ProjectPortfolio:
    """UNICORN项目群管理"""
    
    PROJECTS = {
        "yoga_socks": {
            "name": "瑜伽袜",
            "category": "fitness",
            "status": "live",
            "margin": 0.47,
            "keywords": ["yoga socks", "grip socks", "pilates socks"],
            "platforms": ["tiktok", "amazon", "shopify"]
        },
        "pet_products": {
            "name": "宠物用品",
            "category": "pet",
            "status": "pipeline",
            "margin": 0.40,
            "keywords": ["pet accessories", "dog toys", "cat products"],
            "platforms": ["tiktok", "amazon"]
        },
        "sleep_products": {
            "name": "睡眠产品",
            "category": "wellness",
            "status": "pipeline",
            "margin": 0.45,
            "keywords": ["sleep mask", "white noise", "sleep aid"],
            "platforms": ["tiktok", "shopify"]
        },
        "kitchen_gadgets": {
            "name": "厨房小工具",
            "category": "kitchen",
            "status": "pipeline",
            "margin": 0.38,
            "keywords": ["kitchen gadgets", "cooking tools", "food prep"],
            "platforms": ["tiktok", "amazon"]
        },
        "beauty_tools": {
            "name": "美容工具",
            "category": "beauty",
            "status": "pipeline",
            "margin": 0.55,
            "keywords": ["beauty tools", "skincare", "face roller"],
            "platforms": ["tiktok", "shopify"]
        },
        "office_supplies": {
            "name": "办公用品",
            "category": "office",
            "status": "pipeline",
            "margin": 0.42,
            "keywords": ["desk accessories", "office gadgets", "workspace"],
            "platforms": ["amazon", "shopify"]
        },
        "fitness_accessories": {
            "name": "运动配件",
            "category": "fitness",
            "status": "pipeline",
            "margin": 0.44,
            "keywords": ["resistance bands", "workout gear", "fitness"],
            "platforms": ["tiktok", "amazon"]
        },
        "baby_products": {
            "name": "婴儿用品",
            "category": "baby",
            "status": "pipeline",
            "margin": 0.48,
            "keywords": ["baby accessories", "parenting", "baby care"],
            "platforms": ["tiktok", "amazon"]
        },
        "car_accessories": {
            "name": "汽车配件",
            "category": "automotive",
            "status": "pipeline",
            "margin": 0.35,
            "keywords": ["car accessories", "auto gadgets", "car organizers"],
            "platforms": ["amazon", "shopify"]
        },
        "gardening_tools": {
            "name": "园艺工具",
            "category": "garden",
            "status": "pipeline",
            "margin": 0.40,
            "keywords": ["gardening tools", "plant accessories", "indoor garden"],
            "platforms": ["tiktok", "amazon"]
        }
    }
    
    def __init__(self):
        self.hub = IntelHub()
        self.trends = None
        self.apps = None
        self.market_intel = None
    
    def load_intelligence(self) -> bool:
        """从中央情报库加载数据"""
        self.trends = get_intel("market", "google_trends")
        self.apps = get_intel("market", "app_store_trends") or get_intel("market", "play_store_trends")
        self.market_intel = get_intel("market", "fiverr_trends")
        
        fresh_count = sum([
            is_fresh("market", "google_trends"),
            is_fresh("market", "app_store_trends"),
            is_fresh("market", "fiverr_trends")
        ])
        
        print(f"📚 情报加载完成: {fresh_count}/3 数据源新鲜")
        return fresh_count >= 1
    
    def analyze_opportunities(self) -> List[Dict]:
        """基于趋势数据，分析各项目机会"""
        opportunities = []
        
        if not self.trends:
            print("⚠️ 无趋势数据，请先运行中央情报局更新")
            return opportunities
        
        rising = self.trends.get("rising", [])
        
        for project_id, project in self.PROJECTS.items():
            score = 0
            signals = []
            
            for keyword in project["keywords"]:
                # 检查关键词是否在上升趋势中
                for trend in rising:
                    trend_term = trend.get("term", "").lower()
                    if any(kw in trend_term for kw in keyword.split()):
                        score += 10
                        signals.append({
                            "type": "rising_keyword",
                            "keyword": trend.get("term"),
                            "growth": trend.get("growth", "N/A"),
                            "match": keyword
                        })
            
            # 检查相关类别热度
            category_signals = self._check_category_trends(project["category"])
            score += category_signals.get("score", 0)
            signals.extend(category_signals.get("signals", []))
            
            # 计算优先级
            priority = "high" if score >= 20 else "medium" if score >= 10 else "low"
            
            opportunities.append({
                "project_id": project_id,
                "name": project["name"],
                "current_status": project["status"],
                "opportunity_score": score,
                "priority": priority,
                "signals": signals,
                "recommended_action": self._recommend_action(project, score, signals)
            })
        
        # 按分数排序
        opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)
        return opportunities
    
    def _check_category_trends(self, category: str) -> Dict:
        """检查类别趋势"""
        score = 0
        signals = []
        
        category_keywords = {
            "fitness": ["workout", "fitness", "gym", "exercise", "yoga"],
            "pet": ["pet", "dog", "cat", "petcare"],
            "wellness": ["wellness", "sleep", "health", "selfcare"],
            "kitchen": ["cooking", "kitchen", "food", "recipe"],
            "beauty": ["beauty", "skincare", "makeup", "glow"],
            "office": ["productivity", "workspace", "office", "desk"],
            "baby": ["baby", "parenting", "mom", "parent"],
            "automotive": ["car", "auto", "driving", "vehicle"],
            "garden": ["garden", "plants", "green", "nature"]
        }
        
        keywords = category_keywords.get(category, [])
        
        if self.trends:
            for trend in self.trends.get("rising", []):
                term = trend.get("term", "").lower()
                if any(kw in term for kw in keywords):
                    score += 5
                    signals.append({
                        "type": "category_trend",
                        "trend": trend.get("term"),
                        "related_category": category
                    })
        
        return {"score": score, "signals": signals}
    
    def _recommend_action(self, project: Dict, score: int, signals: List) -> str:
        """生成行动建议"""
        if score >= 20:
            if project["status"] == "pipeline":
                return "🔥 立即启动：市场热度极高，建议本周启动设计和供应链对接"
            else:
                return "📈 加大投入：已上线项目，建议增加广告预算，扩大产能"
        elif score >= 10:
            if project["status"] == "pipeline":
                return "⚡ 准备启动：市场有信号，建议准备设计和样品"
            else:
                return "💡 优化迭代：关注用户反馈，准备V2版本"
        else:
            if project["status"] == "pipeline":
                return "⏸️ 暂缓观察：市场信号弱，建议观察或调整方向"
            else:
                return "🔄 维持现状：保持稳定运营，等待新机会"
    
    def generate_launch_plan(self, top_n: int = 3) -> Dict:
        """生成启动计划"""
        opportunities = self.analyze_opportunities()
        top_opportunities = [o for o in opportunities if o["priority"] in ["high", "medium"]][:top_n]
        
        plan = {
            "generated_at": datetime.now().isoformat(),
            "based_on": "google_trends",
            "next_launches": []
        }
        
        for i, opp in enumerate(top_opportunities, 1):
            project = self.PROJECTS[opp["project_id"]]
            
            launch_item = {
                "priority": i,
                "project": opp["name"],
                "timeline": "本周" if opp["priority"] == "high" else "下周",
                "actions": [
                    f"AI设计: 生成{opp['name']}产品图 (Midjourney)",
                    f"供应链: 联系1688厂商询价",
                    f"内容: 准备TikTok脚本3条",
                    f"上架: {'Shopify+TikTok Shop' if 'tiktok' in project['platforms'] else 'Amazon'}",
                ],
                "signals": [s["keyword"] if "keyword" in s else s.get("trend", "") for s in opp["signals"][:3]],
                "expected_margin": f"{project['margin']*100:.0f}%"
            }
            
            plan["next_launches"].append(launch_item)
        
        # 保存到共享库
        set_intel("market", "launch_plan", plan)
        
        return plan
    
    def optimize_live_projects(self) -> List[Dict]:
        """优化已上线项目"""
        optimizations = []
        
        live_projects = {k: v for k, v in self.PROJECTS.items() if v["status"] == "live"}
        
        if not live_projects:
            print("ℹ️ 暂无已上线项目")
            return optimizations
        
        for project_id, project in live_projects.items():
            opt = {
                "project": project["name"],
                "optimizations": []
            }
            
            # 基于趋势数据给出优化建议
            if self.trends:
                rising_keywords = [t.get("term", "").lower() for t in self.trends.get("rising", [])]
                
                # 检查是否需要添加新关键词
                for kw in project["keywords"]:
                    related_trends = [t for t in rising_keywords if kw.split()[0] in t]
                    if related_trends:
                        opt["optimizations"].append({
                            "type": "keyword_expansion",
                            "suggestion": f"广告关键词添加: {', '.join(related_trends[:3])}",
                            "reason": "相关词在上升趋势"
                        })
            
            # 检查平台趋势
            if self.apps:
                top_categories = self._extract_top_categories(self.apps)
                if project["category"] in str(top_categories).lower():
                    opt["optimizations"].append({
                        "type": "platform_expansion",
                        "suggestion": "考虑开发配套App或小程序",
                        "reason": "该类别App Store热度高"
                    })
            
            if opt["optimizations"]:
                optimizations.append(opt)
        
        return optimizations
    
    def _extract_top_categories(self, app_data: Dict) -> List[str]:
        """提取热门类别"""
        if not app_data or "top_apps" not in app_data:
            return []
        
        categories = {}
        for app in app_data.get("top_apps", []):
            cat = app.get("category", "Other")
            categories[cat] = categories.get(cat, 0) + 1
        
        return sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]
    
    def generate_full_report(self) -> str:
        """生成完整报告"""
        print("🏭 UNICORN项目群优化报告")
        print("=" * 60)
        
        # 1. 加载情报
        if not self.load_intelligence():
            print("⚠️ 情报数据不足，建议先运行中央情报局更新")
        
        # 2. 分析机会
        print("\n📊 机会分析")
        print("-" * 60)
        opportunities = self.analyze_opportunities()
        
        for opp in opportunities[:5]:
            status_emoji = "🟢" if opp["current_status"] == "live" else "🟡"
            priority_emoji = "🔥" if opp["priority"] == "high" else "⚡" if opp["priority"] == "medium" else "⚪"
            
            print(f"\n{status_emoji} {priority_emoji} {opp['name']}")
            print(f"   机会分数: {opp['opportunity_score']}/100")
            print(f"   建议: {opp['recommended_action']}")
            
            if opp["signals"]:
                print(f"   市场信号:")
                for sig in opp["signals"][:2]:
                    if "keyword" in sig:
                        print(f"      ↗ {sig['keyword']}: {sig.get('growth', '')}")
        
        # 3. 生成启动计划
        print("\n\n🚀 启动计划")
        print("-" * 60)
        plan = self.generate_launch_plan(3)
        
        for item in plan["next_launches"]:
            print(f"\n{item['priority']}. {item['project']} ({item['timeline']})")
            print(f"   预期利润率: {item['expected_margin']}")
            print(f"   市场信号: {', '.join(item['signals'])}")
            print(f"   行动清单:")
            for action in item["actions"]:
                print(f"      • {action}")
        
        # 4. 优化建议
        print("\n\n💡 已上线项目优化")
        print("-" * 60)
        optimizations = self.optimize_live_projects()
        
        if optimizations:
            for opt in optimizations:
                print(f"\n{opt['project']}:")
                for o in opt["optimizations"]:
                    print(f"   • {o['type']}: {o['suggestion']}")
        else:
            print("   暂无特别优化建议")
        
        print("\n" + "=" * 60)
        print("✅ 报告已保存到共享库: market/launch_plan")
        
        return "report_generated"


def main():
    """主程序"""
    portfolio = ProjectPortfolio()
    portfolio.generate_full_report()


if __name__ == "__main__":
    main()
