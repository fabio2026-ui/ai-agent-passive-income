# Subscription Manager - Billing Portal
# 小七团队开发
# 订阅管理和计费系统

import stripe
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

class PlanInterval(Enum):
    MONTHLY = "month"
    YEARLY = "year"
    QUARTERLY = "quarter"

@dataclass
class SubscriptionPlan:
    id: str
    name: str
    description: str
    price: float
    interval: PlanInterval
    features: List[str]
    trial_days: int = 0

class BillingPortal:
    """订阅管理和计费系统"""
    
    def __init__(self, stripe_key: str):
        stripe.api_key = stripe_key
        self.plans = {}
        
    def create_plan(self, plan: SubscriptionPlan) -> str:
        """创建订阅计划"""
        # 创建Stripe产品
        product = stripe.Product.create(
            name=plan.name,
            description=plan.description
        )
        
        # 创建Stripe价格
        price = stripe.Price.create(
            product=product.id,
            unit_amount=int(plan.price * 100),  # 转换为分
            currency='eur',
            recurring={'interval': plan.interval.value}
        )
        
        self.plans[plan.id] = {
            'stripe_product_id': product.id,
            'stripe_price_id': price.id,
            **plan.__dict__
        }
        
        return price.id
    
    def create_customer(self, email: str, name: str = '') -> str:
        """创建客户"""
        customer = stripe.Customer.create(
            email=email,
            name=name
        )
        return customer.id
    
    def create_subscription(self, customer_id: str, plan_id: str, 
                           trial_days: int = None) -> Dict:
        """创建订阅"""
        plan = self.plans.get(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        subscription_data = {
            'customer': customer_id,
            'items': [{'price': plan['stripe_price_id']}],
            'payment_behavior': 'default_incomplete',
            'expand': ['latest_invoice.payment_intent']
        }
        
        if trial_days or plan['trial_days']:
            subscription_data['trial_period_days'] = trial_days or plan['trial_days']
        
        subscription = stripe.Subscription.create(**subscription_data)
        
        return {
            'subscription_id': subscription.id,
            'client_secret': subscription.latest_invoice.payment_intent.client_secret,
            'status': subscription.status
        }
    
    def cancel_subscription(self, subscription_id: str, 
                          immediately: bool = False) -> bool:
        """取消订阅"""
        if immediately:
            stripe.Subscription.delete(subscription_id)
        else:
            stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
        return True
    
    def update_subscription(self, subscription_id: str, new_plan_id: str) -> Dict:
        """升级/降级订阅"""
        plan = self.plans.get(new_plan_id)
        if not plan:
            raise ValueError(f"Plan {new_plan_id} not found")
        
        subscription = stripe.Subscription.retrieve(subscription_id)
        
        stripe.Subscription.modify(
            subscription_id,
            items=[{
                'id': subscription['items']['data'][0].id,
                'price': plan['stripe_price_id']
            }],
            proration_behavior='create_prorations'
        )
        
        return {'status': 'updated'}
    
    def get_customer_portal(self, customer_id: str, return_url: str) -> str:
        """获取客户门户链接"""
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url
        )
        return session.url
    
    def get_invoices(self, customer_id: str) -> List[Dict]:
        """获取发票列表"""
        invoices = stripe.Invoice.list(
            customer=customer_id,
            limit=100
        )
        
        return [{
            'id': inv.id,
            'amount': inv.amount_due / 100,
            'status': inv.status,
            'date': datetime.fromtimestamp(inv.created).isoformat(),
            'pdf': inv.invoice_pdf
        } for inv in invoices.data]
    
    def calculate_mrr(self, subscriptions: List[Dict]) -> float:
        """计算月度经常性收入"""
        mrr = 0
        for sub in subscriptions:
            if sub['status'] == 'active':
                mrr += sub['amount'] / 100
        return mrr
    
    def get_revenue_metrics(self, customer_ids: List[str]) -> Dict:
        """获取收入指标"""
        total_mrr = 0
        total_customers = len(customer_ids)
        active_subscriptions = 0
        churned = 0
        
        for customer_id in customer_ids:
            subs = stripe.Subscription.list(customer=customer_id)
            for sub in subs.data:
                if sub.status == 'active':
                    total_mrr += sub['items']['data'][0]['plan']['amount'] / 100
                    active_subscriptions += 1
                elif sub.status in ['canceled', 'unpaid']:
                    churned += 1
        
        return {
            'mrr': total_mrr,
            'arr': total_mrr * 12,
            'total_customers': total_customers,
            'active_subscriptions': active_subscriptions,
            'churn_rate': churned / (churned + active_subscriptions) if (churned + active_subscriptions) > 0 else 0,
            'arpu': total_mrr / total_customers if total_customers > 0 else 0
        }

# 定价页面生成器
def generate_pricing_page(plans: List[SubscriptionPlan]) -> str:
    """生成定价页面HTML"""
    
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>定价</title>
        <style>
            body { font-family: -apple-system, sans-serif; margin: 0; padding: 40px 20px; background: #f5f5f5; }
            .container { max-width: 1000px; margin: 0 auto; }
            h1 { text-align: center; margin-bottom: 40px; }
            .plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
            .plan { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .plan.featured { border: 2px solid #6366F1; transform: scale(1.05); }
            .plan h2 { margin: 0 0 10px; }
            .price { font-size: 36px; font-weight: bold; color: #6366F1; margin: 20px 0; }
            .price span { font-size: 16px; color: #666; }
            .features { list-style: none; padding: 0; margin: 20px 0; }
            .features li { padding: 8px 0; border-bottom: 1px solid #eee; }
            .features li:before { content: "✓"; color: #10B981; margin-right: 8px; }
            button { width: 100%; padding: 12px; background: #6366F1; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
            button:hover { background: #4F46E5; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>选择适合您的计划</h1>
            <div class="plans">
    '''
    
    for i, plan in enumerate(plans):
        featured_class = 'featured' if i == 1 else ''
        interval_text = '月' if plan.interval == PlanInterval.MONTHLY else '年'
        
        html += f'''
            <div class="plan {featured_class}">
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
                <div class="price">€{plan.price}<span>/{interval_text}</span></div>
                <ul class="features">
        '''
        
        for feature in plan.features:
            html += f'<li>{feature}</li>'
        
        html += f'''
                </ul>
                <button onclick="selectPlan('{plan.id}')">选择{plan.name}</button>
            </div>
        '''
    
    html += '''
            </div>
        </div>
        
        <script>
        function selectPlan(planId) {
            window.location.href = '/checkout?plan=' + planId;
        }
        </script>
    </body>
    </html>
    '''
    
    return html

# 定价
PRICING = {
    'free_tier': {
        'price': 0,
        'mrr_limit': 1000,
        'features': ['基础计费', '2个计划']
    },
    'growth': {
        'price': 49,
        'mrr_limit': 10000,
        'features': ['无限计划', '客户门户', '数据分析']
    },
    'scale': {
        'price': 99,
        'mrr_limit': 100000,
        'features': ['高级报表', '团队协作', 'API访问']
    },
    'enterprise': {
        'price': 299,
        'mrr_limit': float('inf'),
        'features': ['定制开发', '专属支持', 'SLA']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'growth': 20,
        'scale': 10,
        'enterprise': 2
    }
    
    revenue = (
        monthly_users['growth'] * PRICING['growth']['price'] +
        monthly_users['scale'] * PRICING['scale']['price'] +
        monthly_users['enterprise'] * PRICING['enterprise']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    # 示例计划
    plans = [
        SubscriptionPlan('starter', '入门版', '适合个人使用', 9, PlanInterval.MONTHLY, 
                        ['1个项目', '基础支持', '1GB存储']),
        SubscriptionPlan('pro', '专业版', '适合小团队', 29, PlanInterval.MONTHLY,
                        ['10个项目', '优先支持', '10GB存储', 'API访问']),
        SubscriptionPlan('enterprise', '企业版', '适合大公司', 99, PlanInterval.MONTHLY,
                        ['无限项目', '专属客服', '100GB存储', 'SSO'])
    ]
    
    # 生成定价页面
    html = generate_pricing_page(plans)
    print("定价页面已生成")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
