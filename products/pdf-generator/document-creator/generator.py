# PDF Generator - Document Creator
# 小七团队开发
# 动态PDF文档生成器

from fpdf import FPDF
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
import io

@dataclass
class PDFConfig:
    title: str
    author: str = ""
    subject: str = ""
    keywords: str = ""
    orientation: str = 'P'  # P or L
    unit: str = 'mm'
    format: str = 'A4'

class DocumentCreator(FPDF):
    """PDF文档生成器"""
    
    def __init__(self, config: PDFConfig):
        super().__init__(orientation=config.orientation, unit=config.unit, format=config.format)
        self.config = config
        self.set_auto_page_break(auto=True, margin=15)
        self.set_metadata()
    
    def set_metadata(self):
        """设置文档元数据"""
        self.set_title(self.config.title)
        self.set_author(self.config.author)
        self.set_subject(self.config.subject)
        self.set_keywords(self.config.keywords)
    
    def header(self):
        """页眉"""
        # Logo或标题
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, self.config.title, ln=True, align='C')
        self.ln(5)
    
    def footer(self):
        """页脚"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')
    
    def add_title(self, text: str, size: int = 24):
        """添加标题"""
        self.set_font('Arial', 'B', size)
        self.cell(0, 15, text, ln=True, align='C')
        self.ln(10)
    
    def add_heading(self, text: str, level: int = 1):
        """添加章节标题"""
        sizes = {1: 18, 2: 14, 3: 12}
        size = sizes.get(level, 12)
        
        self.set_font('Arial', 'B', size)
        self.cell(0, 12, text, ln=True)
        self.ln(3)
    
    def add_paragraph(self, text: str, align: str = 'J'):
        """添加段落"""
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 6, text, align=align)
        self.ln(5)
    
    def add_bullet_list(self, items: List[str]):
        """添加列表"""
        self.set_font('Arial', '', 11)
        for item in items:
            self.cell(5)
            self.cell(5, 6, chr(149), ln=0)  # 子弹符号
            self.multi_cell(0, 6, item)
        self.ln(5)
    
    def add_table(self, headers: List[str], data: List[List], col_widths: List[int] = None):
        """添加表格"""
        if col_widths is None:
            col_widths = [40] * len(headers)
        
        # 表头
        self.set_font('Arial', 'B', 10)
        self.set_fill_color(200, 200, 200)
        for i, header in enumerate(headers):
            self.cell(col_widths[i], 10, header, border=1, fill=True)
        self.ln()
        
        # 数据
        self.set_font('Arial', '', 10)
        for row in data:
            for i, cell in enumerate(row):
                self.cell(col_widths[i], 8, str(cell), border=1)
            self.ln()
        self.ln(5)
    
    def add_image(self, image_path: str, x: int = None, y: int = None, w: int = 0):
        """添加图片"""
        self.image(image_path, x=x, y=y, w=w)
        self.ln(5)

class InvoiceGenerator:
    """发票生成器"""
    
    def __init__(self):
        self.template = {
            'company_name': '小七科技有限公司',
            'company_address': '科技园区100号',
            'company_email': 'billing@xiaoqi.com',
            'tax_id': '123456789'
        }
    
    def generate(self, invoice_data: Dict) -> bytes:
        """生成发票PDF"""
        config = PDFConfig(
            title=f"Invoice {invoice_data['invoice_number']}",
            author=self.template['company_name']
        )
        
        pdf = DocumentCreator(config)
        pdf.add_page()
        
        # 公司信息
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, self.template['company_name'], ln=True)
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, self.template['company_address'], ln=True)
        pdf.cell(0, 6, self.template['company_email'], ln=True)
        pdf.ln(10)
        
        # 发票信息
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, f"INVOICE #{invoice_data['invoice_number']}", ln=True)
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f"Date: {invoice_data['date']}", ln=True)
        pdf.cell(0, 6, f"Due Date: {invoice_data['due_date']}", ln=True)
        pdf.ln(10)
        
        # 客户信息
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 8, "Bill To:", ln=True)
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, invoice_data['customer_name'], ln=True)
        pdf.cell(0, 6, invoice_data['customer_address'], ln=True)
        pdf.ln(10)
        
        # 明细表格
        headers = ['Description', 'Quantity', 'Unit Price', 'Total']
        data = []
        subtotal = 0
        
        for item in invoice_data['items']:
            total = item['quantity'] * item['price']
            subtotal += total
            data.append([
                item['description'],
                str(item['quantity']),
                f"€{item['price']:.2f}",
                f"€{total:.2f}"
            ])
        
        pdf.add_table(headers, data, [80, 30, 40, 40])
        
        # 总计
        tax = subtotal * 0.20  # 20% tax
        total = subtotal + tax
        
        pdf.ln(5)
        pdf.cell(120)
        pdf.cell(30, 8, "Subtotal:", align='R')
        pdf.cell(40, 8, f"€{subtotal:.2f}", align='R', ln=True)
        
        pdf.cell(120)
        pdf.cell(30, 8, "Tax (20%):", align='R')
        pdf.cell(40, 8, f"€{tax:.2f}", align='R', ln=True)
        
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(120)
        pdf.cell(30, 10, "Total:", align='R')
        pdf.cell(40, 10, f"€{total:.2f}", align='R', ln=True)
        
        # 支付信息
        pdf.ln(15)
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(0, 8, "Payment Information:", ln=True)
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f"Bank: Example Bank", ln=True)
        pdf.cell(0, 6, f"Account: 1234567890", ln=True)
        pdf.cell(0, 6, f"Reference: {invoice_data['invoice_number']}", ln=True)
        
        return pdf.output(dest='S').encode('latin-1')

class ReportGenerator:
    """报告生成器"""
    
    def generate_analytics_report(self, data: Dict) -> bytes:
        """生成分析报告"""
        config = PDFConfig(title="Analytics Report")
        pdf = DocumentCreator(config)
        pdf.add_page()
        
        # 封面
        pdf.add_title("Analytics Report", 28)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Generated on {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='C')
        pdf.ln(20)
        
        # 概览
        pdf.add_heading("Executive Summary", 1)
        pdf.add_paragraph(
            f"This report covers the period from {data['start_date']} to {data['end_date']}. "
            f"During this time, we observed significant growth in key metrics."
        )
        
        # 关键指标
        pdf.add_heading("Key Metrics", 2)
        pdf.add_bullet_list([
            f"Total Users: {data['total_users']:,}",
            f"Active Users: {data['active_users']:,}",
            f"Revenue: €{data['revenue']:,.2f}",
            f"Growth Rate: {data['growth_rate']:.1f}%"
        ])
        
        # 详细数据
        pdf.add_heading("Detailed Breakdown", 2)
        headers = ['Metric', 'Current', 'Previous', 'Change']
        table_data = [
            ['Users', str(data['total_users']), str(data['prev_users']), f"{data['user_growth']:.1f}%"],
            ['Revenue', f"€{data['revenue']:.2f}", f"€{data['prev_revenue']:.2f}", f"{data['revenue_growth']:.1f}%"],
            ['Sessions', str(data['sessions']), str(data['prev_sessions']), f"{data['session_growth']:.1f}%"]
        ]
        pdf.add_table(headers, table_data, [50, 40, 40, 40])
        
        # 结论
        pdf.add_heading("Conclusion", 1)
        pdf.add_paragraph(
            "The data shows consistent growth across all key metrics. "
            "Recommendations for next quarter include..."
        )
        
        return pdf.output(dest='S').encode('latin-1')

# 定价
PRICING = {
    'free': {
        'price': 0,
        'documents_per_month': 10,
        'features': ['基础模板', '标准PDF']
    },
    'pro': {
        'price': 15,
        'documents_per_month': 100,
        'features': ['所有模板', '自定义品牌', 'API访问']
    },
    'business': {
        'price': 49,
        'documents_per_month': 1000,
        'features': ['批量生成', '高级模板', '团队协作']
    },
    'enterprise': {
        'price': 199,
        'documents_per_month': 10000,
        'features': ['无限生成', '定制开发', '专属支持']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'pro': 30,
        'business': 10,
        'enterprise': 2
    }
    
    revenue = (
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['business'] * PRICING['business']['price'] +
        monthly_users['enterprise'] * PRICING['enterprise']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    # 发票示例
    invoice_gen = InvoiceGenerator()
    
    invoice_data = {
        'invoice_number': 'INV-2024-001',
        'date': '2024-01-15',
        'due_date': '2024-02-15',
        'customer_name': 'ABC Company',
        'customer_address': '123 Business St',
        'items': [
            {'description': 'SaaS Subscription', 'quantity': 1, 'price': 99.00},
            {'description': 'Support Package', 'quantity': 2, 'price': 49.00}
        ]
    }
    
    pdf_bytes = invoice_gen.generate(invoice_data)
    print(f"发票生成完成: {len(pdf_bytes)} bytes")
    
    # 报告示例
    report_gen = ReportGenerator()
    
    report_data = {
        'start_date': '2024-01-01',
        'end_date': '2024-01-31',
        'total_users': 10000,
        'active_users': 7500,
        'revenue': 50000.00,
        'growth_rate': 25.5,
        'prev_users': 8000,
        'user_growth': 25.0,
        'prev_revenue': 40000.00,
        'revenue_growth': 25.0,
        'sessions': 50000,
        'prev_sessions': 40000,
        'session_growth': 25.0
    }
    
    report_bytes = report_gen.generate_analytics_report(report_data)
    print(f"报告生成完成: {len(report_bytes)} bytes")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
