#!/usr/bin/env python3
"""
利润计算器 - 一键算清每个项目的真实利润
考虑所有成本：产品、运费、平台费、广告、退货
"""

import sys
sys.path.insert(0, '/root/.openclaw/workspace/shared_intel')
from intel_hub import set_intel

class ProfitCalculator:
    """电商利润计算器"""
    
    # 平台费率
    PLATFORM_FEES = {
        "amazon": {
            "referral_fee": 0.15,      # 15%销售佣金
            "fulfillment_fee": 5.5,    # FBA费用（假设）
            "storage_fee": 0.5,        # 仓储费/月
        },
        "shopify": {
            "payment_fee": 0.029,      # 2.9% + 30¢
            "fixed_fee": 0.30,
            "platform_fee": 0.029,     # Shopify Payments
        },
        "tiktok_shop": {
            "commission": 0.05,        # 5%（目前优惠期）
            "payment_fee": 0.025,      # 2.5%
        }
    }
    
    # 运费估算（到美西）
    SHIPPING_COSTS = {
        "express": 6.0,      # 空运快递
        "sea": 2.0,          # 海运
        "air": 4.5,          # 空运经济
    }
    
    # 其他费用
    OTHER_COSTS = {
        "packaging": 0.5,    # 包装
        "returns_rate": 0.05, # 退货率5%
        "ads_rate": 0.15,    # 广告占销售额15%
    }
    
    def calculate(self, product_cost: float, selling_price: float, 
                  platform: str = "amazon", shipping: str = "sea",
                  monthly_volume: int = 1000) -> dict:
        """计算完整利润结构"""
        
        # 1. 产品成本
        unit_product = product_cost
        
        # 2. 运费（分摊到每个）
        unit_shipping = self.SHIPPING_COSTS[shipping]
        
        # 3. 到岸成本
        landed_cost = unit_product + unit_shipping
        
        # 4. 平台费用
        fees = self.PLATFORM_FEES[platform]
        if platform == "amazon":
            platform_fee = selling_price * fees["referral_fee"] + fees["fulfillment_fee"]
        elif platform == "shopify":
            platform_fee = selling_price * (fees["payment_fee"] + fees["platform_fee"]) + fees["fixed_fee"]
        else:  # tiktok
            platform_fee = selling_price * (fees["commission"] + fees["payment_fee"])
        
        # 5. 包装
        packaging = self.OTHER_COSTS["packaging"]
        
        # 6. 广告（假设占销售额15%）
        ads_cost = selling_price * self.OTHER_COSTS["ads_rate"]
        
        # 7. 退货损失（假设5%退货率，损失产品+运费）
        return_loss = landed_cost * self.OTHER_COSTS["returns_rate"]
        
        # 总成本
        total_cost = landed_cost + platform_fee + packaging + ads_cost + return_loss
        
        # 利润
        profit = selling_price - total_cost
        margin = (profit / selling_price) * 100
        roi = (profit / landed_cost) * 100
        
        # 月度预测
        monthly_revenue = selling_price * monthly_volume
        monthly_profit = profit * monthly_volume
        
        return {
            "selling_price": selling_price,
            "costs": {
                "product": unit_product,
                "shipping": unit_shipping,
                "landed_cost": landed_cost,
                "platform_fee": round(platform_fee, 2),
                "packaging": packaging,
                "ads": round(ads_cost, 2),
                "returns": round(return_loss, 2),
            },
            "total_cost": round(total_cost, 2),
            "profit_per_unit": round(profit, 2),
            "margin_percent": round(margin, 1),
            "roi_percent": round(roi, 1),
            "monthly_projection": {
                "volume": monthly_volume,
                "revenue": round(monthly_revenue, 0),
                "profit": round(monthly_profit, 0),
            },
            "breakeven": {
                "ads_rate": f"{self.OTHER_COSTS['ads_rate']*100}%",
                "max_cac": round(profit, 2),  # 最大可承受获客成本
            }
        }
    
    def calculate_all_platforms(self, product_cost: float, selling_price: float) -> dict:
        """对比所有平台的利润"""
        results = {}
        for platform in ["amazon", "shopify", "tiktok_shop"]:
            results[platform] = self.calculate(product_cost, selling_price, platform)
        return results


def main():
    calc = ProfitCalculator()
    
    print("💰 电商利润计算器")
    print("=" * 60)
    
    # 示例：瑜伽袜
    print("\n📦 示例：瑜伽袜")
    print("-" * 60)
    
    yoga_socks = calc.calculate_all_platforms(
        product_cost=3.5,      # 1688采购价
        selling_price=24.99    # 亚马逊售价
    )
    
    for platform, data in yoga_socks.items():
        print(f"\n{platform.upper()}:")
        print(f"  售价: ${data['selling_price']}")
        print(f"  总成本: ${data['total_cost']}")
        print(f"  单件利润: ${data['profit_per_unit']}")
        print(f"  利润率: {data['margin_percent']}%")
        print(f"  ROI: {data['roi_percent']}%")
        print(f"  月销1000件利润: ${data['monthly_projection']['profit']}")
    
    # 最佳平台推荐
    best = max(yoga_socks.items(), key=lambda x: x[1]['profit_per_unit'])
    print(f"\n🏆 最佳平台: {best[0].upper()} (单件利润 ${best[1]['profit_per_unit']})")
    
    # 保存到共享库
    set_intel("market", "profit_calculations", yoga_socks)
    print("\n💾 计算结果已保存到共享库")


if __name__ == "__main__":
    main()
