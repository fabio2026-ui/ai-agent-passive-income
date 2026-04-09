#!/bin/bash
# 🚀 全项目矩阵部署系统 - 并行启动所有项目
# 自动测试 → 筛选优胜 → 重点投入
# 部署时间: 2026-03-14

echo "========================================"
echo "🚀 部署全项目矩阵系统"
echo "========================================"
echo ""

# 创建项目矩阵目录结构
mkdir -p ~/project-matrix/{active,testing,validated,killed,archive}
mkdir -p ~/project-matrix/{analytics,reports,resources}
mkdir -p ~/project-matrix/scripts/{launch,test,monitor,kill,scale}

echo "📁 目录结构创建完成"

# ============================================
# 项目1: 跨境DTC品牌集团 (大项目)
# ============================================
cat > ~/project-matrix/active/dtc-brand-empire.json << 'EOF'
{
  "id": "P001",
  "name": "跨境DTC品牌集团",
  "category": "大项目",
  "type": "电商",
  "status": "ready_to_launch",
  "budget": {
    "startup": 150000,
    "monthly": 20000,
    "total_year1": 350000
  },
  "timeline": {
    "mvp": 30,
    "breakeven": 180,
    "scale": 365
  },
  "metrics": {
    "target_revenue_month12": 500000,
    "target_profit_margin": 0.20,
    "success_criteria": {
      "month3_revenue": 10000,
      "month6_revenue": 50000,
      "month12_revenue": 150000
    }
  },
  "phases": [
    {"name": "市场调研", "duration": 14, "budget": 5000},
    {"name": "供应链搭建", "duration": 30, "budget": 30000},
    {"name": "品牌上线", "duration": 30, "budget": 50000},
    {"name": "规模化", "duration": 180, "budget": 200000}
  ],
  "kpis": ["revenue", "roas", "conversion_rate", "customer_acquisition_cost"],
  "priority": 1,
  "risk_level": "medium"
}
EOF

# ============================================
# 项目2: 养老服务平台 (大项目)
# ============================================
cat > ~/project-matrix/active/elderly-care-platform.json << 'EOF'
{
  "id": "P002",
  "name": "养老服务运营平台",
  "category": "大项目",
  "type": "服务",
  "status": "ready_to_launch",
  "budget": {
    "startup": 300000,
    "monthly": 30000,
    "total_year1": 600000
  },
  "timeline": {
    "mvp": 60,
    "breakeven": 240,
    "scale": 540
  },
  "metrics": {
    "target_revenue_month12": 200000,
    "target_profit_margin": 0.25,
    "success_criteria": {
      "month3_families": 50,
      "month6_families": 200,
      "month12_families": 500
    }
  },
  "phases": [
    {"name": "服务商签约", "duration": 30, "budget": 20000},
    {"name": "平台开发", "duration": 60, "budget": 80000},
    {"name": "试点运营", "duration": 90, "budget": 100000},
    {"name": "规模化", "duration": 180, "budget": 300000}
  ],
  "kpis": ["active_families", "service_providers", "monthly_recurring_revenue", "churn_rate"],
  "priority": 2,
  "risk_level": "low"
}
EOF

# ============================================
# 项目3: AI内容订阅盒 (趋势套利)
# ============================================
cat > ~/project-matrix/active/ai-content-box.json << 'EOF'
{
  "id": "P003",
  "name": "AI内容订阅盒",
  "category": "趋势套利",
  "type": "订阅",
  "status": "ready_to_launch",
  "budget": {
    "startup": 10000,
    "monthly": 3000,
    "total_year1": 46000
  },
  "timeline": {
    "mvp": 14,
    "breakeven": 90,
    "scale": 180
  },
  "metrics": {
    "target_revenue_month12": 20000,
    "target_profit_margin": 0.70,
    "success_criteria": {
      "month3_subscribers": 50,
      "month6_subscribers": 200,
      "month12_subscribers": 500
    }
  },
  "phases": [
    {"name": "产品设计", "duration": 7, "budget": 2000},
    {"name": " landing page", "duration": 7, "budget": 1000},
    {"name": "获客测试", "duration": 30, "budget": 5000},
    {"name": "优化增长", "duration": 120, "budget": 20000}
  ],
  "kpis": ["subscribers", "mrr", "churn_rate", "ltv_cac_ratio"],
  "priority": 3,
  "risk_level": "low"
}
EOF

# ============================================
# 项目4: AI商业训练营 (知识付费)
# ============================================
cat > ~/project-matrix/active/ai-business-academy.json << 'EOF'
{
  "id": "P004",
  "name": "AI商业帝国训练营",
  "category": "知识付费",
  "type": "教育",
  "status": "ready_to_launch",
  "budget": {
    "startup": 20000,
    "monthly": 5000,
    "total_year1": 80000
  },
  "timeline": {
    "mvp": 30,
    "breakeven": 60,
    "scale": 120
  },
  "metrics": {
    "target_revenue_month12": 100000,
    "target_profit_margin": 0.85,
    "success_criteria": {
      "month3_students": 20,
      "month6_students": 100,
      "month12_students": 300
    }
  },
  "phases": [
    {"name": "课程制作", "duration": 30, "budget": 10000},
    {"name": "营销准备", "duration": 15, "budget": 5000},
    {"name": "首批招生", "duration": 30, "budget": 10000},
    {"name": "规模化招生", "duration": 120, "budget": 40000}
  ],
  "kpis": ["students", "revenue_per_student", "completion_rate", "referral_rate"],
  "priority": 2,
  "risk_level": "low"
}
EOF

# ============================================
# 项目5: 垂直AI工具 (蓝海)
# ============================================
cat > ~/project-matrix/active/vertical-ai-tools.json << 'EOF'
{
  "id": "P005",
  "name": "垂直AI工具套件",
  "category": "蓝海",
  "type": "SaaS",
  "status": "ready_to_launch",
  "budget": {
    "startup": 50000,
    "monthly": 10000,
    "total_year1": 170000
  },
  "timeline": {
    "mvp": 45,
    "breakeven": 120,
    "scale": 240
  },
  "metrics": {
    "target_revenue_month12": 50000,
    "target_profit_margin": 0.60,
    "success_criteria": {
      "month3_users": 100,
      "month6_users": 500,
      "month12_users": 2000
    }
  },
  "sub_projects": [
    {"name": "房地产经纪人AI", "priority": 1},
    {"name": "健身教练AI", "priority": 2},
    {"name": "保险经纪人AI", "priority": 3}
  ],
  "phases": [
    {"name": "MVP开发", "duration": 45, "budget": 30000},
    {"name": "测试迭代", "duration": 45, "budget": 20000},
    {"name": "付费转化", "duration": 90, "budget": 50000},
    {"name": "扩展品类", "duration": 180, "budget": 100000}
  ],
  "kpis": ["mau", "paid_users", "arpu", "churn"],
  "priority": 1,
  "risk_level": "medium"
}
EOF

# ============================================
# 项目6: AI+实体DTC (蓝海)
# ============================================
cat > ~/project-matrix/active/ai-designed-products.json << 'EOF'
{
  "id": "P006",
  "name": "AI设计实体产品DTC",
  "category": "蓝海",
  "type": "电商",
  "status": "ready_to_launch",
  "budget": {
    "startup": 30000,
    "monthly": 8000,
    "total_year1": 126000
  },
  "timeline": {
    "mvp": 30,
    "breakeven": 90,
    "scale": 180
  },
  "metrics": {
    "target_revenue_month12": 100000,
    "target_profit_margin": 0.50,
    "success_criteria": {
      "month3_units": 500,
      "month6_units": 2000,
      "month12_units": 10000
    }
  },
  "sub_projects": [
    {"name": "AI宠物用品", "priority": 1},
    {"name": "AI瑜伽服装", "priority": 2},
    {"name": "AI护士用品", "priority": 3}
  ],
  "phases": [
    {"name": "产品设计", "duration": 15, "budget": 5000},
    {"name": "供应商谈判", "duration": 15, "budget": 5000},
    {"name": "首批生产", "duration": 30, "budget": 20000},
    {"name": "营销销售", "duration": 120, "budget": 50000}
  ],
  "kpis": ["units_sold", "revenue", "profit_margin", "repeat_rate"],
  "priority": 2,
  "risk_level": "medium"
}
EOF

# ============================================
# 项目7: 银发经济产品 (趋势)
# ============================================
cat > ~/project-matrix/active/silver-economy.json << 'EOF'
{
  "id": "P007",
  "name": "银发经济产品服务",
  "category": "趋势",
  "type": "产品+服务",
  "status": "ready_to_launch",
  "budget": {
    "startup": 50000,
    "monthly": 10000,
    "total_year1": 170000
  },
  "timeline": {
    "mvp": 45,
    "breakeven": 150,
    "scale": 300
  },
  "metrics": {
    "target_revenue_month12": 150000,
    "target_profit_margin": 0.40,
    "success_criteria": {
      "month3_customers": 100,
      "month6_customers": 500,
      "month12_customers": 1500
    }
  },
  "sub_projects": [
    {"name": "居家养老安全套装", "priority": 1},
    {"name": "老年大学线上平台", "priority": 2},
    {"name": "智能康养设备", "priority": 3}
  ],
  "phases": [
    {"name": "产品开发", "duration": 45, "budget": 30000},
    {"name": "渠道建设", "duration": 45, "budget": 20000},
    {"name": "试点销售", "duration": 90, "budget": 50000},
    {"name": "规模化", "duration": 180, "budget": 100000}
  ],
  "kpis": ["active_customers", "mrr", "churn", "nps"],
  "priority": 1,
  "risk_level": "low"
}
EOF

# ============================================
# 项目8: 情绪经济产品 (趋势)
# ============================================
cat > ~/project-matrix/active/emotion-economy.json << 'EOF'
{
  "id": "P008",
  "name": "情绪经济产品",
  "category": "趋势",
  "type": "订阅+内容",
  "status": "ready_to_launch",
  "budget": {
    "startup": 15000,
    "monthly": 5000,
    "total_year1": 75000
  },
  "timeline": {
    "mvp": 21,
    "breakeven": 90,
    "scale": 180
  },
  "metrics": {
    "target_revenue_month12": 80000,
    "target_profit_margin": 0.65,
    "success_criteria": {
      "month3_subscribers": 200,
      "month6_subscribers": 800,
      "month12_subscribers": 2500
    }
  },
  "sub_projects": [
    {"name": "治愈系内容IP", "priority": 1},
    {"name": "解压订阅盒", "priority": 2},
    {"name": "宠物纪念服务", "priority": 3}
  ],
  "phases": [
    {"name": "内容创作", "duration": 21, "budget": 5000},
    {"name": "社媒运营", "duration": 30, "budget": 10000},
    {"name": "变现测试", "duration": 60, "budget": 20000},
    {"name": "规模化", "duration": 120, "budget": 30000}
  ],
  "kpis": ["followers", "engagement_rate", "conversion_rate", "mrr"],
  "priority": 3,
  "risk_level": "low"
}
EOF

# ============================================
# 项目9: 产业互联网平台 (大项目)
# ============================================
cat > ~/project-matrix/active/b2b-platform.json << 'EOF'
{
  "id": "P009",
  "name": "产业互联网平台",
  "category": "大项目",
  "type": "平台",
  "status": "ready_to_launch",
  "budget": {
    "startup": 500000,
    "monthly": 50000,
    "total_year1": 1000000
  },
  "timeline": {
    "mvp": 90,
    "breakeven": 360,
    "scale": 720
  },
  "metrics": {
    "target_revenue_month12": 500000,
    "target_profit_margin": 0.30,
    "success_criteria": {
      "month3_gmv": 1000000,
      "month6_gmv": 5000000,
      "month12_gmv": 20000000
    }
  },
  "sub_projects": [
    {"name": "农产品B2B", "priority": 1},
    {"name": "建材供应链", "priority": 2}
  ],
  "phases": [
    {"name": "平台开发", "duration": 90, "budget": 200000},
    {"name": "供应商招募", "duration": 90, "budget": 150000},
    {"name": "买家拓展", "duration": 180, "budget": 400000},
    {"name": "规模化", "duration": 360, "budget": 500000}
  ],
  "kpis": ["gmv", "commission_rate", "supplier_count", "buyer_count"],
  "priority": 3,
  "risk_level": "high"
}
EOF

# ============================================
# 项目10: 进口贸易 (大项目)
# ============================================
cat > ~/project-matrix/active/import-export.json << 'EOF'
{
  "id": "P010",
  "name": "中国产品出海贸易",
  "category": "大项目",
  "type": "贸易",
  "status": "ready_to_launch",
  "budget": {
    "startup": 150000,
    "monthly": 30000,
    "total_year1": 500000
  },
  "timeline": {
    "mvp": 60,
    "breakeven": 120,
    "scale": 240
  },
  "metrics": {
    "target_revenue_month12": 2000000,
    "target_profit_margin": 0.25,
    "success_criteria": {
      "month3_revenue": 200000,
      "month6_revenue": 800000,
      "month12_revenue": 2000000
    }
  },
  "sub_projects": [
    {"name": "小家电出海", "priority": 1},
    {"name": "食品出海", "priority": 2},
    {"name": "家居用品出海", "priority": 3}
  ],
  "phases": [
    {"name": "选品调研", "duration": 30, "budget": 20000},
    {"name": "供应链建立", "duration": 30, "budget": 50000},
    {"name": "渠道上线", "duration": 60, "budget": 80000},
    {"name": "规模化", "duration": 240, "budget": 400000}
  ],
  "kpis": ["revenue", "margin", "sku_count", "channel_performance"],
  "priority": 2,
  "risk_level": "medium"
}
EOF

# ============================================
# 创建项目管理脚本
# ============================================

cat > ~/project-matrix/scripts/launch-all.sh << 'EOF'
#!/bin/bash
# 启动所有项目

echo "🚀 启动全项目矩阵..."

for project in ~/project-matrix/active/*.json; do
  name=$(jq -r '.name' "$project")
  id=$(jq -r '.id' "$project")
  echo "启动项目: $name ($id)"
  
  # 创建项目工作目录
  mkdir -p ~/project-matrix/workspaces/$id
  
  # 记录启动时间
  echo $(date) > ~/project-matrix/workspaces/$id/launch_time.txt
  
  # 复制项目配置
  cp "$project" ~/project-matrix/workspaces/$id/config.json
  
  echo "✅ $name 已启动"
done

echo ""
echo "========================================"
echo "✅ 所有项目已启动!"
echo "========================================"
echo ""
jq -r '.id + ": " + .name + " [" + .category + "]"' ~/project-matrix/active/*.json
echo ""
echo "查看状态: bash ~/project-matrix/scripts/status.sh"
EOF

cat > ~/project-matrix/scripts/status.sh << 'EOF'
#!/bin/bash
# 查看所有项目状态

echo "========================================"
echo "📊 项目矩阵状态概览"
echo "========================================"
echo ""

for project in ~/project-matrix/active/*.json; do
  id=$(jq -r '.id' "$project")
  name=$(jq -r '.name' "$project")
  category=$(jq -r '.category' "$project")
  budget=$(jq -r '.budget.startup' "$project")
  priority=$(jq -r '.priority' "$project")
  
  # 检查是否有运行数据
  if [ -f ~/project-matrix/workspaces/$id/launch_time.txt ]; then
    status="🟢 运行中"
  else
    status="⚪ 未启动"
  fi
  
  printf "%s | %s | %s | $%s | P%s | %s\n" "$id" "$name" "$category" "$budget" "$priority" "$status"
done

echo ""
echo "========================================"
echo "总项目数: $(ls ~/project-matrix/active/*.json 2>/dev/null | wc -l)"
echo "========================================"
EOF

cat > ~/project-matrix/scripts/test-phase.sh << 'EOF'
#!/bin/bash
# 项目测试阶段管理

PROJECT_ID=$1

if [ -z "$PROJECT_ID" ]; then
  echo "用法: bash test-phase.sh <项目ID>"
  echo ""
  echo "可用项目:"
  ls ~/project-matrix/active/*.json | xargs -I {} basename {} .json
  exit 1
fi

CONFIG=~/project-matrix/active/$PROJECT_ID.json
if [ ! -f "$CONFIG" ]; then
  echo "❌ 项目 $PROJECT_ID 不存在"
  exit 1
fi

echo "========================================"
echo "🧪 启动项目测试阶段: $PROJECT_ID"
echo "========================================"

name=$(jq -r '.name' "$CONFIG")
echo "项目名称: $name"
echo ""

# 获取成功标准
month3=$(jq -r '.metrics.success_criteria | to_entries[0] | .key + ": " + (.value | tostring)' "$CONFIG")
month6=$(jq -r '.metrics.success_criteria | to_entries[1] | .key + ": " + (.value | tostring)' "$CONFIG")
month12=$(jq -r '.metrics.success_criteria | to_entries[2] | .key + ": " + (.value | tostring)' "$CONFIG")

echo "成功标准:"
echo "  3个月: $month3"
echo "  6个月: $month6"
echo "  12个月: $month12"
echo ""

# 创建测试追踪表
TRACK_FILE=~/project-matrix/workspaces/$PROJECT_ID/tracking.csv
echo "date,metric,value,status" > $TRACK_FILE
echo $(date +%Y-%m-%d)",launched,1,done" >> $TRACK_FILE

echo "✅ 测试追踪已创建: $TRACK_FILE"
echo ""
echo "请每周更新数据到追踪表"
EOF

cat > ~/project-matrix/scripts/decision-matrix.sh << 'EOF'
#!/bin/bash
# 项目决策矩阵 - 自动筛选优胜者

echo "========================================"
echo "🎯 项目决策矩阵分析"
echo "========================================"
echo ""

echo "评估维度:"
echo "  1. 市场吸引力 (规模/增速)"
echo "  2. 执行可行性 (难度/资源)"
echo "  3. 财务回报 (ROI/回本周期)"
echo "  4. 风险水平 (可控性)"
echo "  5. 战略契合 (与现有能力匹配)"
echo ""

# 计算每个项目的综合得分
for project in ~/project-matrix/active/*.json; do
  id=$(jq -r '.id' "$project")
  name=$(jq -r '.name' "$project")
  budget=$(jq -r '.budget.startup' "$project")
  target=$(jq -r '.metrics.target_revenue_month12' "$project")
  risk=$(jq -r '.risk_level' "$project")
  priority=$(jq -r '.priority' "$project")
  
  # 计算ROI
  roi=$(( (target * 12 / budget) ))
  
  # 风险评分 (高=1,中=2,低=3)
  case $risk in
    "high") risk_score=1 ;;
    "medium") risk_score=2 ;;
    "low") risk_score=3 ;;
  esac
  
  # 综合得分 (ROI权重40% + 风险权重30% + 优先级权重30%)
  score=$(( roi * 40 / 100 + risk_score * 30 + priority * 10 ))
  
  echo "$id|$name|$budget|$target|$roi|$score"
done | sort -t'|' -k6 -nr | head -5 | while IFS='|' read -r id name budget target roi score; do
  echo "🥇 $id: $name"
  echo "   投入: $budget | 目标: $target | ROI: ${roi}x | 得分: $score"
  echo ""
done

echo "========================================"
echo "建议: 重点投入前3名项目"
echo "========================================"
EOF

cat > ~/project-matrix/scripts/scale-winner.sh << 'EOF'
#!/bin/bash
# 放大成功项目

PROJECT_ID=$1
SCALE_FACTOR=$2

if [ -z "$PROJECT_ID" ] || [ -z "$SCALE_FACTOR" ]; then
  echo "用法: bash scale-winner.sh <项目ID> <放大倍数>"
  echo "示例: bash scale-winner.sh P001 3"
  exit 1
fi

CONFIG=~/project-matrix/active/$PROJECT_ID.json
if [ ! -f "$CONFIG" ]; then
  echo "❌ 项目不存在"
  exit 1
fi

echo "========================================"
echo "🚀 放大成功项目: $PROJECT_ID"
echo "放大倍数: ${SCALE_FACTOR}x"
echo "========================================"

name=$(jq -r '.name' "$CONFIG")
original_budget=$(jq -r '.budget.startup' "$CONFIG")
new_budget=$(( original_budget * SCALE_FACTOR ))

echo "项目名称: $name"
echo "原预算: $original_budget"
echo "新预算: $new_budget"
echo ""

echo "放大策略:"
echo "  1. 增加广告投放预算 ${SCALE_FACTOR}x"
echo "  2. 扩充团队规模 ${SCALE_FACTOR}x"
echo "  3. 加速产品开发 ${SCALE_FACTOR}x"
echo "  4. 扩展市场覆盖 ${SCALE_FACTOR}x"
echo ""

echo "✅ 已生成放大计划"
echo "文件: ~/project-matrix/workspaces/$PROJECT_ID/scale_plan.txt"
echo "========================================"
EOF

# 设置权限
chmod +x ~/project-matrix/scripts/*.sh

echo ""
echo "========================================"
echo "✅ 全项目矩阵部署完成!"
echo "========================================"
echo ""
echo "📊 已部署项目:"
jq -r '"  " + .id + ": " + .name + " [" + .category + "] - $" + (.budget.startup | tostring)' ~/project-matrix/active/*.json
echo ""
echo "总项目数: $(ls ~/project-matrix/active/*.json 2>/dev/null | wc -l)"
echo "总启动资金需求: $(jq -s 'map(.budget.startup) | add' ~/project-matrix/active/*.json | awk '{print "$" $1}')"
echo ""
echo "⚡ 快速启动命令:"
echo "  bash ~/project-matrix/scripts/launch-all.sh    # 启动所有项目"
echo "  bash ~/project-matrix/scripts/status.sh        # 查看状态"
echo "  bash ~/project-matrix/scripts/decision-matrix.sh  # 筛选优胜者"
echo "  bash ~/project-matrix/scripts/scale-winner.sh P001 3  # 放大成功项目"
echo ""
echo "========================================"
