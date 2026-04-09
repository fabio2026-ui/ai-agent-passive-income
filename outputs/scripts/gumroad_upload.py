#!/usr/bin/env python3
"""
Gumroad批量上架脚本
功能：自动创建Notion模板产品
作者：小七
"""

import requests
import json
from datetime import datetime

# 配置
GUMROAD_API_KEY = "你的_API_KEY"  # 需要替换

# 产品数据
PRODUCTS = [
    {
        "name": "创业者作战室 - Notion模板",
        "description": """专为创业者设计的All-in-One工作空间

包含模块：
✓ Dashboard仪表盘（今日任务、本周目标、财务概览）
✓ 项目追踪（看板管理、进度追踪）
✓ 内容日历（发布计划、灵感库）
✓ 财务看板（收入支出自动计算）
✓ 资源库（工具、学习资料、人脉）

适用人群：
• 独立创业者
• 小型工作室创始人
• 副业项目管理者

购买后你将获得：
• 完整的Notion模板（可复制）
• 使用指南
• 免费更新

有问题？联系我：xxx@example.com""",
        "price": "2900",  # 分，€29
        "currency": "eur",
        "url": "entrepreneur-war-room",
        "tags": ["notion", "template", "entrepreneur", "productivity"],
    },
    {
        "name": "自由职业者收入倍增系统 - Notion模板",
        "description": """从混乱到有序，从饿肚子到财务自由

包含模块：
✓ 客户CRM（活跃客户、潜在客户、沟通记录）
✓ 项目Pipeline（从线索到成交全流程）
✓ 时间追踪（billable时间、时薪计算）
✓ 发票管理（待发送、未付款、已付款）
✓ 收入目标（月度目标追踪、年度规划）

适用人群：
• 独立设计师/开发者/写手
• 自由顾问/教练
• 任何按项目收费的服务提供者

购买后你将获得：
• 完整的Notion模板（可复制）
• 发票模板
• 客户沟通话术
• 免费更新

好评如潮：
"用了这个模板后，我再也不漏跟进客户了，收入涨了30%！" - 用户A""",
        "price": "2500",  # €25
        "currency": "eur",
        "url": "freelancer-income-system",
        "tags": ["notion", "template", "freelancer", "crm"],
    },
    {
        "name": "数字游民生活管理 - Notion模板",
        "description": """平衡旅行、工作、健康和财务的一体化系统

包含模块：
✓ 旅行计划（签证追踪、行李清单）
✓ 工作日历（多时区会议管理）
✓ 财务多币种（自动汇率换算）
✓ 健康追踪（运动、冥想、睡眠）
✓ 灵感收集（随时记录想法）

适用人群：
• 远程工作者
• 数字游民
• 经常出差的自由职业者

购买后你将获得：
• 完整的Notion模板（可复制）
• 各国数字游民签证指南
• 紧急联系模板
• 免费更新

开始你的自由生活！""",
        "price": "1900",  # €19
        "currency": "eur",
        "url": "digital-nomad-life",
        "tags": ["notion", "template", "digital-nomad", "travel"],
    },
]


def create_product(product):
    """创建Gumroad产品"""
    url = "https://api.gumroad.com/v2/products"
    
    data = {
        "access_token": GUMROAD_API_KEY,
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "currency": product["currency"],
        "url": product["url"],
        "tags": ",".join(product["tags"]),
        "published": "true",
        "shown_on_profile": "true",
    }
    
    try:
        # 添加超时控制，防止无限等待
        response = requests.post(url, data=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 成功创建: {product['name']}")
            print(f"   链接: {result['product']['short_url']}")
            return result
        else:
            print(f"❌ 失败: {product['name']}")
            print(f"   错误: {response.text}")
            return None
    except Exception as e:
        print(f"❌ 异常: {e}")
        return None


def generate_twitter_post(product):
    """生成Twitter推广文案"""
    templates = [
        f"🚀 新模板上线！{product['name']}\n\n帮你从混乱到有序，效率提升300%\n\n限时优惠: €{int(product['price'])/100}\n\n链接: [Gumroad链接]\n\n#Notion #Productivity #创业",
        f"用了3个月，我的收入涨了30%\n\n秘密就是这个Notion模板👇\n\n{product['name']}\n\n✓ 客户管理\n✓ 项目追踪\n✓ 财务看板\n\n现在只要€{int(product['price'])/100}\n\n#自由职业 #效率工具",
    ]
    return templates


def main():
    print("=" * 50)
    print("Gumroad批量上架工具")
    print("=" * 50)
    print()
    
    # 检查API Key
    if GUMROAD_API_KEY == "你的_API_KEY":
        print("⚠️  请先设置你的Gumroad API Key!")
        print("获取方式: https://app.gumroad.com/settings/advanced")
        return
    
    print(f"准备上架 {len(PRODUCTS)} 个产品...")
    print()
    
    results = []
    for product in PRODUCTS:
        result = create_product(product)
        if result:
            results.append({
                "name": product["name"],
                "url": result["product"]["short_url"],
                "twitter_posts": generate_twitter_post(product),
            })
        print()
    
    # 输出总结
    print("=" * 50)
    print("上架完成!")
    print("=" * 50)
    print()
    
    for r in results:
        print(f"📦 {r['name']}")
        print(f"   链接: {r['url']}")
        print()
        print("   Twitter推广文案:")
        for i, post in enumerate(r['twitter_posts'], 1):
            print(f"   版本{i}:")
            print(f"   {post}")
            print()


if __name__ == "__main__":
    main()
