# Website Builder - No-Code Studio
# 小七团队开发
# 无代码网站构建器

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum
import json
import os

class ElementType(Enum):
    HEADING = "heading"
    TEXT = "text"
    IMAGE = "image"
    BUTTON = "button"
    DIVIDER = "divider"
    SPACER = "spacer"
    CONTAINER = "container"
    GRID = "grid"
    FORM = "form"
    VIDEO = "video"
    MAP = "map"

@dataclass
class Style:
    color: str = "#000000"
    background_color: str = "transparent"
    font_size: str = "16px"
    font_weight: str = "normal"
    text_align: str = "left"
    padding: str = "16px"
    margin: str = "0"
    border_radius: str = "0"
    border: str = "none"
    width: str = "100%"
    height: str = "auto"
    
    def to_css(self) -> str:
        return f"""
            color: {self.color};
            background-color: {self.background_color};
            font-size: {self.font_size};
            font-weight: {self.font_weight};
            text-align: {self.text_align};
            padding: {self.padding};
            margin: {self.margin};
            border-radius: {self.border_radius};
            border: {self.border};
            width: {self.width};
            height: {self.height};
        """

@dataclass
class Element:
    id: str
    type: ElementType
    content: str = ""
    styles: Style = field(default_factory=Style)
    children: List['Element'] = field(default_factory=list)
    attributes: Dict = field(default_factory=dict)

class WebsiteBuilder:
    """无代码网站构建器"""
    
    def __init__(self):
        self.pages = {}
        self.components = {}
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict:
        """加载预设模板"""
        return {
            'landing': {
                'name': '落地页',
                'sections': ['hero', 'features', 'testimonials', 'cta', 'footer']
            },
            'portfolio': {
                'name': '作品集',
                'sections': ['header', 'gallery', 'about', 'contact']
            },
            'blog': {
                'name': '博客',
                'sections': ['header', 'featured', 'posts', 'sidebar', 'footer']
            },
            'ecommerce': {
                'name': '电商',
                'sections': ['header', 'products', 'cart', 'checkout']
            },
            'saas': {
                'name': 'SaaS',
                'sections': ['hero', 'features', 'pricing', 'faq', 'footer']
            }
        }
    
    def create_page(self, name: str, template: str = None) -> str:
        """创建新页面"""
        page_id = f"page_{len(self.pages)}"
        
        self.pages[page_id] = {
            'name': name,
            'elements': [],
            'template': template,
            'styles': {
                'body': {
                    'font_family': 'system-ui, -apple-system, sans-serif',
                    'margin': '0',
                    'padding': '0',
                    'background_color': '#ffffff'
                }
            }
        }
        
        # 如果选择了模板，自动添加对应区块
        if template and template in self.templates:
            for section in self.templates[template]['sections']:
                self._add_template_section(page_id, section)
        
        return page_id
    
    def _add_template_section(self, page_id: str, section_type: str):
        """添加模板区块"""
        section = Element(
            id=f"{section_type}_{len(self.pages[page_id]['elements'])}",
            type=ElementType.CONTAINER,
            styles=Style(
                padding="60px 20px",
                background_color="#ffffff" if section_type not in ['hero', 'cta'] else "#6366F1"
            )
        )
        
        # 根据区块类型添加内容
        if section_type == 'hero':
            section.children = [
                Element(
                    id="hero_title",
                    type=ElementType.HEADING,
                    content="构建你的梦想网站",
                    styles=Style(
                        color="#ffffff",
                        font_size="48px",
                        font_weight="bold",
                        text_align="center"
                    )
                ),
                Element(
                    id="hero_subtitle",
                    type=ElementType.TEXT,
                    content="无需代码，几分钟内创建专业网站",
                    styles=Style(
                        color="#ffffff",
                        font_size="20px",
                        text_align="center"
                    )
                ),
                Element(
                    id="hero_cta",
                    type=ElementType.BUTTON,
                    content="立即开始",
                    styles=Style(
                        background_color="#ffffff",
                        color="#6366F1",
                        padding="16px 32px",
                        border_radius="8px",
                        text_align="center"
                    )
                )
            ]
        elif section_type == 'features':
            section.children = [
                Element(
                    id=f"feature_{i}",
                    type=ElementType.CONTAINER,
                    styles=Style(
                        width="30%",
                        padding="20px",
                        display="inline-block"
                    )
                )
                for i in range(3)
            ]
        
        self.pages[page_id]['elements'].append(section)
    
    def add_element(self, page_id: str, element: Element, parent_id: str = None):
        """添加元素到页面"""
        if parent_id:
            # 找到父元素并添加
            self._add_to_parent(self.pages[page_id]['elements'], parent_id, element)
        else:
            self.pages[page_id]['elements'].append(element)
    
    def _add_to_parent(self, elements: List[Element], parent_id: str, new_element: Element) -> bool:
        """递归查找父元素"""
        for el in elements:
            if el.id == parent_id:
                el.children.append(new_element)
                return True
            if self._add_to_parent(el.children, parent_id, new_element):
                return True
        return False
    
    def update_element(self, page_id: str, element_id: str, **kwargs):
        """更新元素"""
        element = self._find_element(self.pages[page_id]['elements'], element_id)
        if element:
            for key, value in kwargs.items():
                if hasattr(element, key):
                    setattr(element, key, value)
    
    def _find_element(self, elements: List[Element], element_id: str) -> Optional[Element]:
        """递归查找元素"""
        for el in elements:
            if el.id == element_id:
                return el
            found = self._find_element(el.children, element_id)
            if found:
                return found
        return None
    
    def delete_element(self, page_id: str, element_id: str):
        """删除元素"""
        self.pages[page_id]['elements'] = [
            el for el in self.pages[page_id]['elements'] 
            if el.id != element_id
        ]
    
    def generate_html(self, page_id: str) -> str:
        """生成HTML代码"""
        page = self.pages.get(page_id)
        if not page:
            return ""
        
        html = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page['name']}</title>
    <style>
        body {{{self._dict_to_css(page['styles']['body'])}}}
        * {{ box-sizing: border-box; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
    </style>
</head>
<body>
    {self._elements_to_html(page['elements'])}
</body>
</html>
"""
        return html
    
    def _elements_to_html(self, elements: List[Element]) -> str:
        """将元素列表转为HTML"""
        html_parts = []
        
        for el in elements:
            style = el.styles.to_css()
            tag = self._get_html_tag(el.type)
            
            if el.children:
                children_html = self._elements_to_html(el.children)
                html = f'<{tag} style="{style}" id="{el.id}">{children_html}</{tag}>'
            else:
                content = el.content.replace('\n', '<br>')
                html = f'<{tag} style="{style}" id="{el.id}">{content}</{tag}>'
            
            html_parts.append(html)
        
        return '\n'.join(html_parts)
    
    def _get_html_tag(self, element_type: ElementType) -> str:
        """获取元素对应的HTML标签"""
        mapping = {
            ElementType.HEADING: 'h2',
            ElementType.TEXT: 'p',
            ElementType.IMAGE: 'img',
            ElementType.BUTTON: 'button',
            ElementType.DIVIDER: 'hr',
            ElementType.SPACER: 'div',
            ElementType.CONTAINER: 'div',
            ElementType.GRID: 'div',
            ElementType.FORM: 'form',
            ElementType.VIDEO: 'video',
            ElementType.MAP: 'iframe'
        }
        return mapping.get(element_type, 'div')
    
    def _dict_to_css(self, styles: Dict) -> str:
        """将字典转为CSS字符串"""
        return '; '.join([f"{k.replace('_', '-')}: {v}" for k, v in styles.items()])
    
    def export_project(self, project_name: str, output_dir: str = "./exports"):
        """导出完整项目"""
        project_dir = os.path.join(output_dir, project_name)
        os.makedirs(project_dir, exist_ok=True)
        
        # 导出所有页面
        for page_id, page_data in self.pages.items():
            html = self.generate_html(page_id)
            filename = f"{page_data['name'].lower().replace(' ', '_')}.html"
            
            with open(os.path.join(project_dir, filename), 'w', encoding='utf-8') as f:
                f.write(html)
        
        # 导出项目配置
        config = {
            'name': project_name,
            'pages': {k: {'name': v['name'], 'template': v['template']} 
                     for k, v in self.pages.items()},
            'templates': list(self.templates.keys())
        }
        
        with open(os.path.join(project_dir, 'config.json'), 'w') as f:
            json.dump(config, f, indent=2)
        
        return project_dir
    
    def get_templates(self) -> List[Dict]:
        """获取所有可用模板"""
        return [
            {'id': k, 'name': v['name'], 'sections': v['sections']}
            for k, v in self.templates.items()
        ]
    
    def duplicate_page(self, page_id: str, new_name: str) -> str:
        """复制页面"""
        if page_id not in self.pages:
            return None
        
        new_id = f"page_{len(self.pages)}"
        self.pages[new_id] = {
            'name': new_name,
            'elements': json.loads(json.dumps(self.pages[page_id]['elements'], default=lambda x: x.__dict__)),
            'template': self.pages[page_id]['template'],
            'styles': self.pages[page_id]['styles'].copy()
        }
        
        return new_id

# 定价
PRICING = {
    'free': {
        'pages': 1,
        'templates': ['basic'],
        'storage_mb': 50,
        'features': ['基础编辑器', '导出HTML']
    },
    'starter': {
        'price': 9,
        'pages': 5,
        'templates': ['all'],
        'storage_mb': 500,
        'features': ['自定义域名', '表单收集', '基础SEO']
    },
    'pro': {
        'price': 29,
        'pages': 50,
        'storage_gb': 5,
        'features': ['电商功能', '会员系统', '高级分析', 'A/B测试']
    },
    'agency': {
        'price': 79,
        'pages': 999,
        'storage_gb': 20,
        'client_accounts': 10,
        'features': ['白标', '客户端管理', 'API访问', '优先支持']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 30,
        'pro': 10,
        'agency': 3
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['agency'] * PRICING['agency']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    builder = WebsiteBuilder()
    
    # 创建落地页
    page_id = builder.create_page("我的产品落地页", template="landing")
    print(f"✅ 页面创建: {page_id}")
    
    # 查看模板
    templates = builder.get_templates()
    print(f"\n可用模板: {len(templates)}个")
    for t in templates:
        print(f"  - {t['name']}")
    
    # 生成HTML
    html = builder.generate_html(page_id)
    print(f"\nHTML代码长度: {len(html)} 字符")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
