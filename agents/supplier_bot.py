#!/usr/bin/env python3
"""
UNICORN供应商开发机器人
自动处理10个品类的供应商联系
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
    
    def generate_email_template(self, category_key):
        """生成供应商邮件模板"""
        cat = self.categories[category_key]
        
        email_cn = f"""主题：{cat['name']}采购合作咨询 - 长期订单

您好，

我是UNICORN采购负责人，在1688上看到贵司的产品，很感兴趣。

【采购需求】
产品：{cat['name']}
首批试单：{cat['moq']}件
目标价格：{cat['target_price']}

【合作要求】
1. 需提供样品（费用我方承担）
2. 支持OEM贴牌
3. 交货周期：确认样品后30天
4. 付款方式：30%定金，70%出货前付清

【公司介绍】
- 专注跨境电商5年
- 主要销售市场：欧美
- 月出货量：10,000+件

如贵司能满足以上要求，请回复：
- 产品目录/PDF
- 工厂实拍照片
- 现有客户案例

期待合作！

Best regards,
UNICORN采购部
联系人：艾琳
微信：XXXXX
"""
        
        email_en = f"""Subject: {cat['name']} Wholesale Inquiry - Long Term Partnership

Dear Supplier,

We are UNICORN, a cross-border e-commerce company. We found your products on 1688 and are interested in cooperation.

【Order Details】
Product: {cat['name']}
Trial Order: {cat['moq']} pcs
Target Price: {cat['target_price']}

【Requirements】
1. Samples required (we pay shipping)
2. OEM/Private label support
3. Lead time: 30 days after sample approval
4. Payment: 30% deposit, 70% before shipment

【About Us】
- 5 years in cross-border e-commerce
- Main markets: US, Europe
- Monthly volume: 10,000+ units

Please reply with:
- Product catalog
- Factory photos
- Existing client references

Looking forward to working with you!

Best regards,
UNICORN Procurement
Contact: Ailin
WeChat: XXXXX
"""
        
        return {"cn": email_cn, "en": email_en}
    
    def generate_wechat_script(self, category_key):
        """生成微信话术"""
        cat = self.categories[category_key]
        
        script = f"""【初次联系】
您好，我是在1688上看到贵司{cat['name']}的买家，想了解一下：
1. 起订量多少？
2. 价格区间？
3. 能做贴牌吗？

【跟进】
您好，之前咨询的{cat['name']}，方便发一下：
- 产品图片
- 价格表
- 工厂视频吗？

【谈价】
这个价格有点超出我们预算，我们计划首批{cn['moq']}件，后续每月3000+，能给个更好的价格吗？

【催样】
您好，样品费已转，麻烦尽快安排。我们急着想看质量，确认后能马上下单大货。
"""
        return script
    
    def generate_checklist(self):
        """生成避坑检查清单"""
        checklist = """# 供应商评估检查清单

## 基础信息
- [ ] 营业执照真实有效
- [ ] 工厂实地考察视频
- [ ] 生产能力证明
- [ ] 出口经验（有无外贸部）

## 产品质量
- [ ] 样品质量检查
- [ ] 材质/成分说明
- [ ] 检测报告（如有）
- [ ] 包装方案确认

## 价格谈判
- [ ] 明确MOQ和价格阶梯
- [ ] 运费分摊方式
- [ ] 付款条款协商
- [ ] 账期可能性（长期合作后）

## 风险控制
- [ ] 合同条款审核
- [ ] 质检标准约定
- [ ] 延期交货赔偿
- [ ] 次品处理方案

## 沟通记录
- [ ] 所有承诺书面确认
- [ ] 关键人联系方式
- [ ] 备用供应商信息
"""
        return checklist
    
    def run(self):
        """运行供应商机器人"""
        print("🏭 UNICORN供应商开发机器人启动")
        print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        for key, cat in self.categories.items():
            print(f"\n📦 品类: {cat['name']}")
            
            # 生成邮件模板
            emails = self.generate_email_template(key)
            with open(f"/root/ai-empire/unicorn/supplier_bot/{key}_email_cn.txt", "w") as f:
                f.write(emails["cn"])
            with open(f"/root/ai-empire/unicorn/supplier_bot/{key}_email_en.txt", "w") as f:
                f.write(emails["en"])
            
            # 生成微信话术
            script = self.generate_wechat_script(key)
            with open(f"/root/ai-empire/unicorn/supplier_bot/{key}_wechat.txt", "w") as f:
                f.write(script)
            
            print(f"   ✅ 邮件模板生成")
            print(f"   ✅ 微信话术生成")
        
        # 生成通用检查清单
        checklist = self.generate_checklist()
        with open("/root/ai-empire/unicorn/supplier_bot/checklist.md", "w") as f:
            f.write(checklist)
        
        # 保存配置
        config = {
            "generated_at": datetime.now().isoformat(),
            "categories": self.categories,
            "total_templates": len(self.categories) * 3
        }
        with open("/root/ai-empire/unicorn/supplier_bot/config.json", "w") as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        print("\n" + "="*60)
        print("✅ 所有供应商模板已生成")
        print(f"📁 输出目录: /root/ai-empire/unicorn/supplier_bot/")
        print(f"📊 生成模板: {len(self.categories)}品类 × 3套话术 = {len(self.categories)*3}套")


if __name__ == "__main__":
    bot = SupplierBot()
    bot.run()
