#!/usr/bin/env python3
"""
UNICORN供应商开发机器人 - v2
"""

import json
from datetime import datetime

class SupplierBot:
    def __init__(self):
        self.categories = {
            "yoga_socks": {"name": "瑜伽袜", "moq": 500, "target_price": "$1.5-2.5"},
            "pet_supplies": {"name": "宠物用品", "moq": 300, "target_price": "$2-8"},
            "sleep_products": {"name": "睡眠用品", "moq": 200, "target_price": "$3-12"},
            "kitchen_tools": {"name": "厨房工具", "moq": 500, "target_price": "$1-5"},
            "beauty": {"name": "美容护肤", "moq": 300, "target_price": "$2-15"},
            "office": {"name": "办公用品", "moq": 500, "target_price": "$1-8"},
            "baby": {"name": "母婴用品", "moq": 200, "target_price": "$3-20"},
            "car": {"name": "汽车用品", "moq": 300, "target_price": "$5-25"},
            "garden": {"name": "园艺用品", "moq": 200, "target_price": "$3-15"},
            "fitness": {"name": "健身用品", "moq": 300, "target_price": "$5-30"}
        }
    
    def run(self):
        print("🏭 UNICORN供应商开发机器人启动")
        print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        for key, cat in self.categories.items():
            # 生成邮件模板
            email_cn = f"""主题：{cat['name']}采购合作咨询 - 长期订单

您好，我是UNICORN采购负责人，在1688上看到贵司的产品。

【采购需求】
产品：{cat['name']}
首批试单：{cat['moq']}件
目标价格：{cat['target_price']}

【要求】
1. 需提供样品
2. 支持OEM贴牌
3. 交货周期30天
4. 付款方式：30%定金，70%出货前付清

请回复：产品目录、工厂照片、现有客户案例

UNICORN采购部
联系人：艾琳
"""
            
            with open(f"/root/ai-empire/unicorn/supplier_bot/{key}_email_cn.txt", "w") as f:
                f.write(email_cn)
            
            print(f"✅ {cat['name']}模板已生成")
        
        print("\n✅ 所有供应商模板已生成！")

if __name__ == "__main__":
    bot = SupplierBot()
    bot.run()
