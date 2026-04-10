# Invoice Generator - Billing Studio
# 小七团队开发
# 发票生成器

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json

@dataclass
class Company:
    name: str
    address: str
    email: str
    phone: str
    tax_id: str = ""
    logo: str = ""
    bank_info: Dict = field(default_factory=dict)

@dataclass
class LineItem:
    description: str
    quantity: float
    unit_price: float
    tax_rate: float = 0.0
    discount: float = 0.0
    
    @property
    def subtotal(self) -> float:
        return self.quantity * self.unit_price
    
    @property
    def tax_amount(self) -> float:
        return self.subtotal * (self.tax_rate / 100)
    
    @property
    def total(self) -> float:
        return self.subtotal + self.tax_amount - self.discount

@dataclass
class Invoice:
    id: str
    invoice_number: str
    issue_date: str
    due_date: str
    from_company: Company
    to_company: Company
    items: List[LineItem] = field(default_factory=list)
    notes: str = ""
    terms: str = ""
    status: str = "draft"  # draft, sent, paid, overdue
    paid_date: Optional[str] = None
    
    @property
    def subtotal(self) -> float:
        return sum(item.subtotal for item in self.items)
    
    @property
    def total_tax(self) -> float:
        return sum(item.tax_amount for item in self.items)
    
    @property
    def total_discount(self) -> float:
        return sum(item.discount for item in self.items)
    
    @property
    def total(self) -> float:
        return sum(item.total for item in self.items)

class InvoiceGenerator:
    """发票生成器"""
    
    def __init__(self):
        self.invoices = {}
        self.templates = self._load_templates()
        self.invoice_counter = 1000
    
    def _load_templates(self) -> Dict:
        """加载发票模板"""
        return {
            'professional': {
                'name': '专业版',
                'colors': {'primary': '#1F2937', 'accent': '#3B82F6'}
            },
            'modern': {
                'name': '现代版',
                'colors': {'primary': '#7C3AED', 'accent': '#EC4899'}
            },
            'minimal': {
                'name': '极简版',
                'colors': {'primary': '#000000', 'accent': '#6B7280'}
            },
            'elegant': {
                'name': '优雅版',
                'colors': {'primary': '#1E3A5F', 'accent': '#059669'}
            }
        }
    
    def generate_invoice_number(self) -> str:
        """生成发票编号"""
        self.invoice_counter += 1
        return f"INV-{datetime.now().strftime('%Y%m')}-{self.invoice_counter}"
    
    def create_invoice(self, from_company: Company, to_company: Company) -> Invoice:
        """创建发票"""
        invoice_id = f"inv_{len(self.invoices)}"
        invoice_number = self.generate_invoice_number()
        
        invoice = Invoice(
            id=invoice_id,
            invoice_number=invoice_number,
            issue_date=datetime.now().strftime('%Y-%m-%d'),
            due_date=(datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            from_company=from_company,
            to_company=to_company
        )
        
        self.invoices[invoice_id] = invoice
        return invoice
    
    def add_item(self, invoice_id: str, item: LineItem):
        """添加明细项"""
        if invoice_id in self.invoices:
            self.invoices[invoice_id].items.append(item)
    
    def update_status(self, invoice_id: str, status: str):
        """更新发票状态"""
        if invoice_id in self.invoices:
            self.invoices[invoice_id].status = status
            if status == 'paid':
                self.invoices[invoice_id].paid_date = datetime.now().strftime('%Y-%m-%d')
    
    def generate_html(self, invoice_id: str, template: str = 'professional') -> str:
        """生成HTML发票"""
        if invoice_id not in self.invoices:
            return ""
        
        inv = self.invoices[invoice_id]
        colors = self.templates.get(template, self.templates['professional'])['colors']
        
        items_html = ""
        for item in inv.items:
            items_html += f"""
            <tr>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>€{item.unit_price:.2f}</td>
                <td>{item.tax_rate}%</td>
                <td>€{item.subtotal:.2f}</td>
            </tr>
            """
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 40px;
        }}
        .invoice {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 50px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid {colors['primary']};
        }}
        .invoice-title {{
            font-size: 36px;
            color: {colors['primary']};
            font-weight: 700;
        }}
        .invoice-number {{
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }}
        .company-info {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }}
        .company {{
            flex: 1;
        }}
        .company-label {{
            font-size: 11px;
            text-transform: uppercase;
            color: #999;
            margin-bottom: 5px;
        }}
        .company-name {{
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
        }}
        .company-details {{
            font-size: 13px;
            color: #666;
            line-height: 1.6;
        }}
        .dates {{
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
        }}
        .date-box {{
            background: #f9fafb;
            padding: 15px 20px;
            border-radius: 8px;
        }}
        .date-label {{
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
        }}
        .date-value {{
            font-weight: 600;
            color: {colors['primary']};
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }}
        th {{
            background: {colors['primary']};
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
        }}
        td {{
            padding: 12px;
            border-bottom: 1px solid #eee;
        }}
        tr:nth-child(even) {{
            background: #f9fafb;
        }}
        .totals {{
            margin-left: auto;
            width: 300px;
            margin-top: 20px;
        }}
        .total-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }}
        .total-row.final {{
            font-size: 20px;
            font-weight: 700;
            color: {colors['primary']};
            border-top: 3px solid {colors['primary']};
            border-bottom: none;
            padding-top: 15px;
        }}
        .status {{
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }}
        .status-paid {{ background: #d1fae5; color: #059669; }}
        .status-draft {{ background: #f3f4f6; color: #6b7280; }}
        .status-overdue {{ background: #fee2e2; color: #dc2626; }}
        .notes {{
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #eee;
        }}
        .notes-title {{
            font-weight: 600;
            margin-bottom: 10px;
        }}
        .notes-content {{
            font-size: 13px;
            color: #666;
            line-height: 1.6;
        }}
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div>
                <div class="invoice-title">发票</div>
                <div class="invoice-number">编号: {inv.invoice_number}</div>
            </div>
            <span class="status status-{inv.status}">{inv.status.upper()}</span>
        </div>
        
        <div class="company-info">
            <div class="company">
                <div class="company-label">开票方</div>
                <div class="company-name">{inv.from_company.name}</div>
                <div class="company-details">
                    {inv.from_company.address}<br>
                    {inv.from_company.email}<br>
                    {inv.from_company.phone}
                </div>
            </div>
            <div class="company">
                <div class="company-label">受票方</div>
                <div class="company-name">{inv.to_company.name}</div>
                <div class="company-details">
                    {inv.to_company.address}<br>
                    {inv.to_company.email}<br>
                    {inv.to_company.phone}
                </div>
            </div>
        </div>
        
        <div class="dates">
            <div class="date-box">
                <div class="date-label">开票日期</div>
                <div class="date-value">{inv.issue_date}</div>
            </div>
            <div class="date-box">
                <div class="date-label">到期日期</div>
                <div class="date-value">{inv.due_date}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>描述</th>
                    <th>数量</th>
                    <th>单价</th>
                    <th>税率</th>
                    <th>小计</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-row">
                <span>小计</span>
                <span>€{inv.subtotal:.2f}</span>
            </div>
            <div class="total-row">
                <span>税费</span>
                <span>€{inv.total_tax:.2f}</span>
            </div>
            {f'<div class="total-row"><span>折扣</span><span>-€{inv.total_discount:.2f}</span></div>' if inv.total_discount > 0 else ''}
            <div class="total-row final">
                <span>总计</span>
                <span>€{inv.total:.2f}</span>
            </div>
        </div>
        
        {f'<div class="notes"><div class="notes-title">备注</div><div class="notes-content">{inv.notes}</div></div>' if inv.notes else ''}
        
        {f'<div class="notes"><div class="notes-title">付款条款</div><div class="notes-content">{inv.terms}</div></div>' if inv.terms else ''}
    </div>
</body>
</html>
"""
        return html
    
    def get_overdue_invoices(self) -> List[Invoice]:
        """获取逾期发票"""
        today = datetime.now()
        overdue = []
        
        for inv in self.invoices.values():
            if inv.status == 'sent':
                due = datetime.strptime(inv.due_date, '%Y-%m-%d')
                if due < today:
                    overdue.append(inv)
        
        return overdue
    
    def get_financial_summary(self) -> Dict:
        """财务汇总"""
        summary = {
            'total_invoiced': 0,
            'total_paid': 0,
            'total_outstanding': 0,
            'total_overdue': 0,
            'invoice_count': len(self.invoices)
        }
        
        for inv in self.invoices.values():
            summary['total_invoiced'] += inv.total
            
            if inv.status == 'paid':
                summary['total_paid'] += inv.total
            else:
                summary['total_outstanding'] += inv.total
                
                if inv in self.get_overdue_invoices():
                    summary['total_overdue'] += inv.total
        
        return summary

# 定价
PRICING = {
    'free': {
        'invoices_per_month': 5,
        'templates': ['basic'],
        'features': ['基础发票', 'PDF导出']
    },
    'starter': {
        'price': 9,
        'invoices_per_month': 50,
        'templates': 'all',
        'features': ['自定义模板', '自动提醒', '付款跟踪']
    },
    'business': {
        'price': 29,
        'invoices_per_month': 999,
        'features': ['多币种', '定期发票', '团队管理', 'API访问']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 25,
        'business': 8
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['business'] * PRICING['business']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    generator = InvoiceGenerator()
    
    # 创建公司信息
    my_company = Company(
        name="小七科技有限公司",
        address="北京市朝阳区科技园区100号",
        email="billing@xiaoqi.tech",
        phone="+86 400-123-4567"
    )
    
    client = Company(
        name="创新客户有限公司",
        address="上海市浦东新区陆家嘴200号",
        email="finance@client.com",
        phone="+86 21-1234-5678"
    )
    
    # 创建发票
    invoice = generator.create_invoice(my_company, client)
    
    # 添加项目
    generator.add_item(invoice.id, LineItem(
        description="网站开发服务",
        quantity=1,
        unit_price=5000.00,
        tax_rate=13
    ))
    
    generator.add_item(invoice.id, LineItem(
        description="维护服务（3个月）",
        quantity=3,
        unit_price=500.00,
        tax_rate=13
    ))
    
    # 生成HTML
    html = generator.generate_html(invoice.id)
    print(f"✅ 发票生成: {invoice.invoice_number}")
    print(f"HTML长度: {len(html)} 字符")
    
    # 财务汇总
    summary = generator.get_financial_summary()
    print(f"\n总开票: €{summary['total_invoiced']:.2f}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
