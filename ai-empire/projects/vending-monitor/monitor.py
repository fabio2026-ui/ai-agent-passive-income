#!/usr/bin/env python3
"""
售货机每日监控系统
Vending Machine Daily Monitor
"""

import json
import random
from datetime import datetime, timedelta

def generate_machine_data(machine_id, location):
    """生成单个售货机的模拟数据"""
    # 库存状态 (0-100%)
    stock_levels = {
        "饮料": random.randint(20, 95),
        "零食": random.randint(15, 90),
        "日用品": random.randint(30, 85)
    }
    
    # 销售数据
    daily_sales = random.randint(800, 3500)
    transactions = random.randint(45, 180)
    
    # 设备状态
    status_options = ["正常", "正常", "正常", "正常", "需补货", "故障待修"]
    status = random.choices(status_options, weights=[40, 40, 40, 40, 8, 2])[0]
    
    # 故障详情
    issues = []
    if status == "故障待修":
        issues = random.choice([["制冷系统异常"], ["支付模块故障"], ["货道卡住"]])
    elif any(v < 30 for v in stock_levels.values()):
        issues.append("库存不足")
    
    # 在线率
    uptime = random.uniform(94.5, 99.9)
    
    return {
        "machine_id": machine_id,
        "location": location,
        "status": status,
        "stock_levels": stock_levels,
        "daily_sales": daily_sales,
        "transactions": transactions,
        "avg_ticket": round(daily_sales / transactions, 2) if transactions > 0 else 0,
        "uptime_percent": round(uptime, 1),
        "issues": issues,
        "last_online": (datetime.now() - timedelta(minutes=random.randint(0, 30))).strftime("%H:%M")
    }

def generate_alert(machine, level, message):
    """生成告警"""
    return {
        "time": datetime.now().strftime("%H:%M"),
        "level": level,
        "machine": machine,
        "message": message
    }

def main():
    # 售货机列表
    machines = [
        ("VM-001", "科技园A栋大堂"),
        ("VM-002", "科技园B栋1楼"),
        ("VM-003", "地铁站A出口"),
        ("VM-004", "写字楼大堂"),
        ("VM-005", "商场1楼中庭"),
        ("VM-006", "工业园区东门"),
    ]
    
    # 生成所有机器数据
    all_data = []
    alerts = []
    
    for mid, loc in machines:
        data = generate_machine_data(mid, loc)
        all_data.append(data)
        
        # 生成告警
        if data["status"] == "故障待修":
            alerts.append(generate_alert(mid, "🔴 紧急", f"设备故障: {', '.join(data['issues'])}"))
        elif data["status"] == "需补货":
            low_stock = [k for k, v in data["stock_levels"].items() if v < 30]
            alerts.append(generate_alert(mid, "🟡 提醒", f"需要补货: {', '.join(low_stock)}"))
        elif data["uptime_percent"] < 97:
            alerts.append(generate_alert(mid, "🟠 注意", f"在线率偏低: {data['uptime_percent']}%"))
    
    # 统计数据
    total_sales = sum(m["daily_sales"] for m in all_data)
    total_transactions = sum(m["transactions"] for m in all_data)
    online_count = sum(1 for m in all_data if m["status"] == "正常")
    issue_count = sum(1 for m in all_data if m["status"] != "正常")
    
    # 输出报告
    report_date = datetime.now().strftime("%Y-%m-%d")
    
    print(f"=" * 50)
    print(f"🤖 售货机每日监控报告")
    print(f"📅 {report_date}")
    print(f"=" * 50)
    print()
    
    # 概览
    print("【📊 数据概览】")
    print(f"  设备总数: {len(machines)} 台")
    print(f"  在线正常: {online_count} 台")
    print(f"  需要关注: {issue_count} 台")
    print(f"  今日总销售额: ¥{total_sales:,}")
    print(f"  总交易笔数: {total_transactions} 笔")
    print(f"  平均客单价: ¥{round(total_sales/total_transactions, 2)}")
    print()
    
    # 各机器详情
    print("【📍 设备详情】")
    for m in all_data:
        status_icon = "🟢" if m["status"] == "正常" else "🟡" if "补货" in m["status"] else "🔴"
        print(f"  {status_icon} {m['machine_id']} | {m['location']}")
        print(f"     状态: {m['status']} | 在线率: {m['uptime_percent']}% | 最后在线: {m['last_online']}")
        print(f"     今日销售: ¥{m['daily_sales']} ({m['transactions']}笔) | 客单价: ¥{m['avg_ticket']}")
        stock_str = " | ".join([f"{k}:{v}%" for k, v in m["stock_levels"].items()])
        print(f"     库存: {stock_str}")
        if m["issues"]:
            print(f"     ⚠️ 问题: {', '.join(m['issues'])}")
        print()
    
    # 告警列表
    print("【⚠️ 告警列表】")
    if alerts:
        for a in alerts:
            print(f"  {a['level']} [{a['machine']}] {a['message']}")
    else:
        print("  ✅ 今日无告警，所有设备运行正常")
    print()
    
    # 建议
    print("【💡 操作建议】")
    restock_needed = [m for m in all_data if m["status"] == "需补货"]
    repair_needed = [m for m in all_data if m["status"] == "故障待修"]
    
    if restock_needed:
        print(f"  1. 优先安排补货: {', '.join(m['machine_id'] for m in restock_needed)}")
    if repair_needed:
        print(f"  2. 紧急维修: {', '.join(m['machine_id'] for m in repair_needed)}")
    if not restock_needed and not repair_needed:
        print("  1. 今日无需特殊操作")
        print("  2. 建议检查周销售趋势，优化热销商品")
    
    print()
    print("=" * 50)
    print("报告生成完成")
    print("=" * 50)
    
    # 保存JSON数据供其他系统使用
    output = {
        "date": report_date,
        "summary": {
            "total_machines": len(machines),
            "online": online_count,
            "issues": issue_count,
            "total_sales": total_sales,
            "total_transactions": total_transactions
        },
        "machines": all_data,
        "alerts": alerts
    }
    
    with open("/root/.openclaw/workspace/ai-empire/projects/vending-monitor/latest_report.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 详细数据已保存至: latest_report.json")

if __name__ == "__main__":
    main()
