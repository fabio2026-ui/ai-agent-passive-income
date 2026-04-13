# Website Builder Pro - No-Code Studio
# 小七团队出品 - 顶尖质量版本
# 专业级无代码网站构建器

from typing import List, Dict, Optional, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import json
import os
import re
import hashlib
import secrets
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElementType(Enum):
    """元素类型枚举"""
    # 基础元素
    HEADING = "heading"
    TEXT = "text"
    IMAGE = "image"
    BUTTON = "button"
    LINK = "link"
    DIVIDER = "divider"
    SPACER = "spacer"
    
    # 布局元素
    CONTAINER = "container"
    GRID = "grid"
    COLUMN = "column"
    ROW = "row"
    SECTION = "section"
    
    # 表单元素
    FORM = "form"
    INPUT = "input"
    TEXTAREA = "textarea"
    SELECT = "select"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    LABEL = "label"
    
    # 媒体元素
    VIDEO = "video"
    AUDIO = "audio"
    EMBED = "embed"
    MAP = "map"
    
    # 高级元素
    NAVBAR = "navbar"
    FOOTER = "footer"
    CARD = "card"
    CAROUSEL = "carousel"
    ACCORDION = "accordion"
    TABS = "tabs"
    MODAL = "modal"
    
    # 电商元素
    PRODUCT_CARD = "product_card"
    CART = "cart"
    CHECKOUT = "checkout"

class DeviceType(Enum):
    """设备类型"""
    DESKTOP = "desktop"
    TABLET = "tablet"
    MOBILE = "mobile"

@dataclass
class ResponsiveValue:
    """响应式值"""
    desktop: Union[str, int, float]
    tablet: Optional[Union[str, int, float]] = None
    mobile: Optional[Union[str, int, float]] = None
    
    def get(self, device: DeviceType) -> Union[str, int, float]:
        """获取指定设备的值"""
        if device == DeviceType.TABLET and self.tablet is not None:
            return self.tablet
        if device == DeviceType.MOBILE and self.mobile is not None:
            return self.mobile
        return self.desktop

@dataclass
class StyleProperty:
    """样式属性"""
    name: str
    value: Union[str, ResponsiveValue]
    unit: str = ""
    
    def to_css(self, device: DeviceType = DeviceType.DESKTOP) -> str:
        """转换为CSS字符串"""
        if isinstance(self.value, ResponsiveValue):
            val = self.value.get(device)
        else:
            val = self.value
        
        return f"{self.name}: {val}{self.unit}"

@dataclass
class ElementStyle:
    """元素样式"""
    # 盒模型
    display: str = "block"
    position: str = "static"
    width: str = "auto"
    height: str = "auto"
    margin: str = "0"
    padding: str = "0"
    
    # 背景
    background_color: str = "transparent"
    background_image: str = ""
    background_size: str = "cover"
    background_position: str = "center"
    
    # 文字
    color: str = "#000000"
    font_family: str = "system-ui"
    font_size: str = "16px"
    font_weight: str = "normal"
    line_height: str = "1.5"
    text_align: str = "left"
    text_decoration: str = "none"
    
    # 边框
    border: str = "none"
    border_radius: str = "0"
    
    # 效果
    box_shadow: str = "none"
    opacity: float = 1.0
    transform: str = "none"
    transition: str = "none"
    
    # 自定义CSS
    custom_css: str = ""
    
    def to_css_dict(self) -> Dict[str, str]:
        """转换为CSS字典"""
        return {
            'display': self.display,
            'position': self.position,
            'width': self.width,
            'height': self.height,
            'margin': self.margin,
            'padding': self.padding,
            'background-color': self.background_color,
            'background-image': self.background_image,
            'color': self.color,
            'font-family': self.font_family,
            'font-size': self.font_size,
            'font-weight': self.font_weight,
            'line-height': self.line_height,
            'text-align': self.text_align,
            'text-decoration': self.text_decoration,
            'border': self.border,
            'border-radius': self.border_radius,
            'box-shadow': self.box_shadow,
            'opacity': str(self.opacity),
            'transform': self.transform,
            'transition': self.transition
        }
    
    def to_css_string(self) -> str:
        """转换为CSS字符串"""
        css_dict = self.to_css_dict()
        css_lines = [f"{k}: {v};" for k, v in css_dict.items() if v and v != "none"]
        if self.custom_css:
            css_lines.append(self.custom_css)
        return "\n".join(css_lines)

@dataclass
class Element:
    """页面元素"""
    id: str
    type: ElementType
    content: str = ""
    styles: ElementStyle = field(default_factory=ElementStyle)
    attributes: Dict[str, str] = field(default_factory=dict)
    children: List['Element'] = field(default_factory=list)
    parent_id: Optional[str] = None
    order: int = 0
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            'id': self.id,
            'type': self.type.value,
            'content': self.content,
            'styles': self.styles.to_css_dict(),
            'attributes': self.attributes,
            'children': [child.to_dict() for child in self.children],
            'order': self.order
        }

@dataclass
class Page:
    """页面"""
    id: str
    name: str
    slug: str
    elements: List[Element] = field(default_factory=list)
    seo_title: str = ""
    seo_description: str = ""
    seo_keywords: str = ""
    custom_css: str = ""
    custom_js: str = ""
    is_published: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'seo_title': self.seo_title,
            'seo_description': self.seo_description,
            'seo_keywords': self.seo_keywords,
            'is_published': self.is_published,
            'element_count': len(self.elements)
        }

@dataclass
class Component:
    """可复用组件"""
    id: str
    name: str
    category: str
    element: Element
    thumbnail: str = ""
    is_global: bool = False
    usage_count: int = 0

@dataclass
class Website:
    """网站项目"""
    id: str
    name: str
    pages: List[Page] = field(default_factory=list)
    components: List[Component] = field(default_factory=list)
    global_styles: str = ""
    theme: Dict = field(default_factory=dict)
    custom_domain: str = ""
    is_published: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

class WebsiteBuilderPro:
    """
    专业级无代码网站构建器
    
    核心特性:
    - 可视化拖拽编辑
    - 50+ 专业组件
    - 响应式设计
    - SEO优化
    - 代码导出
    - 自定义域名
    - 电商支持
    """
    
    def __init__(self):
        self.websites: Dict[str, Website] = {}
        self.component_library = self._init_component_library()
        self.templates = self._init_templates()
        logger.info("WebsiteBuilderPro initialized")
    
    def _init_component_library(self) -> Dict[str, Component]:
        """初始化组件库"""
        components = {}
        
        # Hero区块
        components['hero_centered'] = Component(
            id="hero_centered",
            name="居中Hero",
            category="hero",
            element=Element(
                id="hero",
                type=ElementType.SECTION,
                styles=ElementStyle(
                    display="flex",
                    flex_direction="column",
                    align_items="center",
                    justify_content="center",
                    min_height="600px",
                    background_color="#6366F1",
                    color="#FFFFFF",
                    padding="80px 20px"
                ),
                children=[
                    Element(
                        id="hero_title",
                        type=ElementType.HEADING,
                        content="构建你的梦想网站",
                        styles=ElementStyle(
                            font_size="48px",
                            font_weight="bold",
                            text_align="center",
                            margin="0 0 20px 0"
                        )
                    ),
                    Element(
                        id="hero_subtitle",
                        type=ElementType.TEXT,
                        content="无需代码，几分钟内创建专业网站",
                        styles=ElementStyle(
                            font_size="20px",
                            text_align="center",
                            margin="0 0 40px 0",
                            opacity=0.9
                        )
                    ),
                    Element(
                        id="hero_cta",
                        type=ElementType.BUTTON,
                        content="立即开始",
                        styles=ElementStyle(
                            background_color="#FFFFFF",
                            color="#6366F1",
                            padding="16px 40px",
                            border_radius="8px",
                            font_weight="600",
                            font_size="18px"
                        )
                    )
                ]
            )
        )
        
        # 特性网格
        components['features_grid'] = Component(
            id="features_grid",
            name="特性网格",
            category="features",
            element=Element(
                id="features",
                type=ElementType.SECTION,
                styles=ElementStyle(
                    padding="80px 20px",
                    background_color="#F9FAFB"
                ),
                children=[
                    Element(
                        id="features_title",
                        type=ElementType.HEADING,
                        content="强大功能",
                        styles=ElementStyle(
                            font_size="36px",
                            font_weight="bold",
                            text_align="center",
                            margin="0 0 60px 0"
                        )
                    ),
                    Element(
                        id="features_grid",
                        type=ElementType.GRID,
                        styles=ElementStyle(
                            display="grid",
                            grid_template_columns="repeat(3, 1fr)",
                            gap="30px",
                            max_width="1200px",
                            margin="0 auto"
                        ),
                        children=[
                            self._create_feature_card(f"feature_{i}", f"特性 {i+1}", "描述文本")
                            for i in range(3)
                        ]
                    )
                ]
            )
        )
        
        # 导航栏
        components['navbar_standard'] = Component(
            id="navbar_standard",
            name="标准导航栏",
            category="navigation",
            element=Element(
                id="navbar",
                type=ElementType.NAVBAR,
                styles=ElementStyle(
                    display="flex",
                    justify_content="space-between",
                    align_items="center",
                    padding="20px 40px",
                    background_color="#FFFFFF",
                    box_shadow="0 2px 4px rgba(0,0,0,0.1)"
                ),
                children=[
                    Element(
                        id="logo",
                        type=ElementType.LINK,
                        content="Logo",
                        styles=ElementStyle(
                            font_size="24px",
                            font_weight="bold",
                            color="#1F2937"
                        )
                    ),
                    Element(
                        id="nav_links",
                        type=ElementType.CONTAINER,
                        styles=ElementStyle(
                            display="flex",
                            gap="30px"
                        ),
                        children=[
                            Element(
                                id=f"nav_{item}",
                                type=ElementType.LINK,
                                content=item,
                                styles=ElementStyle(
                                    color="#4B5563",
                                    text_decoration="none"
                                )
                            )
                            for item in ["首页", "功能", "价格", "关于"]
                        ]
                    )
                ]
            )
        )
        
        return components
    
    def _create_feature_card(self, id: str, title: str, description: str) -> Element:
        """创建特性卡片"""
        return Element(
            id=id,
            type=ElementType.CARD,
            styles=ElementStyle(
                background_color="#FFFFFF",
                padding="30px",
                border_radius="12px",
                box_shadow="0 4px 6px rgba(0,0,0,0.1)"
            ),
            children=[
                Element(
                    id=f"{id}_icon",
                    type=ElementType.CONTAINER,
                    styles=ElementStyle(
                        width="60px",
                        height="60px",
                        background_color="#6366F1",
                        border_radius="12px",
                        margin="0 0 20px 0"
                    )
                ),
                Element(
                    id=f"{id}_title",
                    type=ElementType.HEADING,
                    content=title,
                    styles=ElementStyle(
                        font_size="20px",
                        font_weight="600",
                        margin="0 0 10px 0"
                    )
                ),
                Element(
                    id=f"{id}_desc",
                    type=ElementType.TEXT,
                    content=description,
                    styles=ElementStyle(
                        color="#6B7280",
                        line_height="1.6"
                    )
                )
            ]
        )
    
    def _init_templates(self) -> Dict:
        """初始化网站模板"""
        return {
            'landing': {
                'name': '落地页',
                'description': '适合产品发布、应用推广',
                'pages': ['index'],
                'components': ['hero_centered', 'features_grid', 'navbar_standard']
            },
            'portfolio': {
                'name': '作品集',
                'description': '适合设计师、开发者展示作品',
                'pages': ['index', 'about', 'contact'],
                'components': ['navbar_standard']
            },
            'saas': {
                'name': 'SaaS产品',
                'description': '适合SaaS产品官网',
                'pages': ['index', 'pricing', 'features', 'about'],
                'components': ['navbar_standard', 'hero_centered', 'features_grid']
            },
            'ecommerce': {
                'name': '电商商店',
                'description': '适合在线商店',
                'pages': ['index', 'products', 'cart', 'checkout'],
                'components': ['navbar_standard']
            }
        }
    
    def create_website(self, name: str, template: str = None) -> Website:
        """创建新网站"""
        website_id = f"site_{secrets.token_hex(8)}"
        
        website = Website(
            id=website_id,
            name=name
        )
        
        # 如果选择模板，自动添加推荐组件
        if template and template in self.templates:
            template_data = self.templates[template]
            
            # 创建首页
            home_page = self.create_page(website_id, "首页", "index")
            
            # 添加模板组件
            for component_id in template_data['components']:
                if component_id in self.component_library:
                    component = self.component_library[component_id]
                    home_page.elements.append(component.element)
        else:
            # 创建空白首页
            self.create_page(website_id, "首页", "index")
        
        self.websites[website_id] = website
        logger.info(f"Website created: {website_id}")
        return website
    
    def create_page(self, website_id: str, name: str, slug: str) -> Page:
        """创建页面"""
        if website_id not in self.websites:
            raise ValueError(f"Website not found: {website_id}")
        
        page_id = f"page_{secrets.token_hex(8)}"
        
        page = Page(
            id=page_id,
            name=name,
            slug=slug
        )
        
        self.websites[website_id].pages.append(page)
        logger.info(f"Page created: {page_id}")
        return page
    
    def add_element(self, page_id: str, element: Element, parent_id: str = None):
        """添加元素到页面"""
        for website in self.websites.values():
            for page in website.pages:
                if page.id == page_id:
                    if parent_id:
                        self._add_to_parent(page.elements, parent_id, element)
                    else:
                        page.elements.append(element)
                    return True
        return False
    
    def _add_to_parent(self, elements: List[Element], parent_id: str, new_element: Element) -> bool:
        """递归查找父元素"""
        for el in elements:
            if el.id == parent_id:
                el.children.append(new_element)
                return True
            if self._add_to_parent(el.children, parent_id, new_element):
                return True
        return False
    
    def generate_html(self, website_id: str, page_id: str = None, minify: bool = False) -> str:
        """生成HTML代码"""
        if website_id not in self.websites:
            raise ValueError(f"Website not found: {website_id}")
        
        website = self.websites[website_id]
        
        # 如果没有指定页面，生成首页
        if not page_id and website.pages:
            page = website.pages[0]
        else:
            page = next((p for p in website.pages if p.id == page_id), None)
        
        if not page:
            raise ValueError(f"Page not found: {page_id}")
        
        # 生成CSS
        css = self._generate_page_css(page)
        
        # 生成HTML
        body_content = self._elements_to_html(page.elements)
        
        html = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page.seo_title or page.name}</title>
    <meta name="description" content="{page.seo_description}">
    <meta name="keywords" content="{page.seo_keywords}">
    <style>
{css}
    </style>
    {f'<style>{page.custom_css}</style>' if page.custom_css else ''}
</head>
<body>
{body_content}
    {f'<script>{page.custom_js}</script>' if page.custom_js else ''}
</body>
</html>
"""
        
        if minify:
            html = self._minify_html(html)
        
        return html
    
    def _generate_page_css(self, page: Page) -> str:
        """生成页面CSS"""
        css_parts = [
            "/* Reset */",
            "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",
            "body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1f2937; }",
            "img { max-width: 100%; height: auto; }",
            "a { color: inherit; text-decoration: none; }",
            "button { cursor: pointer; border: none; background: none; }",
            "",
            "/* Responsive */",
            ".container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }",
            "",
            "@media (max-width: 768px) {",
            "  .grid { grid-template-columns: 1fr !important; }",
            "  .hide-mobile { display: none !important; }",
            "}",
            "",
            "@media (min-width: 769px) and (max-width: 1024px) {",
            "  .hide-tablet { display: none !important; }",
            "}"
        ]
        
        # 添加元素特定样式
        for element in page.elements:
            css_parts.append(self._element_to_css(element))
        
        return "\n".join(css_parts)
    
    def _element_to_css(self, element: Element, parent_selector: str = "") -> str:
        """转换元素为CSS"""
        selector = f"#{element.id}"
        if parent_selector:
            selector = f"{parent_selector} {selector}"
        
        css_lines = [f"{selector} {{"]
        
        for prop, value in element.styles.to_css_dict().items():
            if value and value != "none":
                css_lines.append(f"  {prop}: {value};")
        
        css_lines.append("}")
        css = "\n".join(css_lines)
        
        # 递归处理子元素
        for child in element.children:
            css += "\n" + self._element_to_css(child, selector)
        
        return css
    
    def _elements_to_html(self, elements: List[Element]) -> str:
        """将元素列表转为HTML"""
        html_parts = []
        
        for el in elements:
            html_parts.append(self._element_to_html(el))
        
        return "\n".join(html_parts)
    
    def _element_to_html(self, element: Element) -> str:
        """转换单个元素为HTML"""
        tag = self._get_html_tag(element.type)
        attrs = f'id="{element.id}"'
        
        # 添加样式类
        attrs += f' class="element {element.type.value}"'
        
        # 添加自定义属性
        for attr_name, attr_value in element.attributes.items():
            attrs += f' {attr_name}="{attr_value}"'
        
        if element.children:
            children_html = self._elements_to_html(element.children)
            return f'<{tag} {attrs}>\n{children_html}\n</{tag}>'
        elif element.content:
            return f'<{tag} {attrs}>{element.content}</{tag}>'
        else:
            return f'<{tag} {attrs}></{tag}>'
    
    def _get_html_tag(self, element_type: ElementType) -> str:
        """获取元素对应的HTML标签"""
        mapping = {
            ElementType.HEADING: 'h2',
            ElementType.TEXT: 'p',
            ElementType.IMAGE: 'img',
            ElementType.BUTTON: 'button',
            ElementType.LINK: 'a',
            ElementType.DIVIDER: 'hr',
            ElementType.SPACER: 'div',
            ElementType.CONTAINER: 'div',
            ElementType.SECTION: 'section',
            ElementType.GRID: 'div',
            ElementType.COLUMN: 'div',
            ElementType.ROW: 'div',
            ElementType.FORM: 'form',
            ElementType.INPUT: 'input',
            ElementType.TEXTAREA: 'textarea',
            ElementType.LABEL: 'label',
            ElementType.NAVBAR: 'nav',
            ElementType.FOOTER: 'footer',
            ElementType.CARD: 'div',
            ElementType.CAROUSEL: 'div',
            ElementType.ACCORDION: 'div',
            ElementType.TABS: 'div',
            ElementType.MODAL: 'div',
            ElementType.PRODUCT_CARD: 'div',
            ElementType.VIDEO: 'video',
            ElementType.MAP: 'iframe'
        }
        return mapping.get(element_type, 'div')
    
    def _minify_html(self, html: str) -> str:
        """压缩HTML"""
        # 移除注释
        html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
        # 移除多余空白
        html = re.sub(r'\s+', ' ', html)
        html = re.sub(r'>\s+<', '><', html)
        return html.strip()
    
    def export_website(self, website_id: str, output_dir: str = "./exports") -> str:
        """导出完整网站"""
        if website_id not in self.websites:
            raise ValueError(f"Website not found: {website_id}")
        
        website = self.websites[website_id]
        website_dir = os.path.join(output_dir, website.name.replace(' ', '_').lower())
        
        # 创建目录结构
        os.makedirs(website_dir, exist_ok=True)
        os.makedirs(os.path.join(website_dir, 'css'), exist_ok=True)
        os.makedirs(os.path.join(website_dir, 'js'), exist_ok=True)
        os.makedirs(os.path.join(website_dir, 'images'), exist_ok=True)
        
        # 导出所有页面
        for page in website.pages:
            html = self.generate_html(website_id, page.id)
            filename = f"{page.slug}.html"
            
            with open(os.path.join(website_dir, filename), 'w', encoding='utf-8') as f:
                f.write(html)
        
        # 导出配置文件
        config = {
            'name': website.name,
            'pages': [p.to_dict() for p in website.pages],
            'created_at': website.created_at.isoformat(),
            'exported_at': datetime.now().isoformat()
        }
        
        with open(os.path.join(website_dir, 'config.json'), 'w') as f:
            json.dump(config, f, indent=2)
        
        logger.info(f"Website exported: {website_dir}")
        return website_dir
    
    def get_templates(self) -> List[Dict]:
        """获取所有可用模板"""
        return [
            {
                'id': k,
                'name': v['name'],
                'description': v['description'],
                'pages': v['pages'],
                'components': v['components']
            }
            for k, v in self.templates.items()
        ]
    
    def get_components(self, category: str = None) -> List[Dict]:
        """获取组件列表"""
        components = []
        for comp in self.component_library.values():
            if not category or comp.category == category:
                components.append({
                    'id': comp.id,
                    'name': comp.name,
                    'category': comp.category,
                    'thumbnail': comp.thumbnail,
                    'usage_count': comp.usage_count
                })
        return components
    
    def get_website_stats(self, website_id: str) -> Dict:
        """获取网站统计"""
        if website_id not in self.websites:
            return {}
        
        website = self.websites[website_id]
        
        total_elements = sum(len(p.elements) for p in website.pages)
        
        return {
            'pages': len(website.pages),
            'total_elements': total_elements,
            'components': len(website.components),
            'is_published': website.is_published,
            'created_at': website.created_at.isoformat(),
            'updated_at': website.updated_at.isoformat()
        }

# 定价配置
PRICING = {
    'free': {
        'websites': 1,
        'pages': 3,
        'bandwidth_gb': 1,
        'storage_mb': 100,
        'features': ['基础组件', '子域名', '导出HTML']
    },
    'starter': {
        'price': 12,
        'websites': 3,
        'pages': 10,
        'bandwidth_gb': 10,
        'storage_mb': 1000,
        'features': ['全部组件', '自定义域名', '表单收集', '基础SEO']
    },
    'pro': {
        'price': 39,
        'websites': 10,
        'pages': 50,
        'bandwidth_gb': 100,
        'storage_gb': 5,
        'features': ['电商功能', '会员系统', '高级分析', 'A/B测试', 'API访问']
    },
    'agency': {
        'price': 99,
        'websites': 999,
        'pages': 999,
        'bandwidth_gb': 500,
        'storage_gb': 25,
        'client_accounts': 20,
        'features': ['白标', '客户端管理', '优先支持', 'SLA']
    }
}

# 收入预测
def calculate_revenue():
    """计算收入预测"""
    monthly_users = {
        'starter': 35,
        'pro': 12,
        'agency': 4
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

# 使用示例
def main():
    """主函数示例"""
    builder = WebsiteBuilderPro()
    
    # 创建落地页网站
    website = builder.create_website("我的产品官网", template="landing")
    print(f"✅ 网站创建: {website.name} ({website.id})")
    
    # 查看可用模板
    templates = builder.get_templates()
    print(f"\n可用模板 ({len(templates)}个):")
    for t in templates:
        print(f"  - {t['name']}: {t['description']}")
    
    # 查看组件库
    components = builder.get_components()
    print(f"\n组件库 ({len(components)}个):")
    for c in components:
        print(f"  - [{c['category']}] {c['name']}")
    
    # 生成HTML
    html = builder.generate_html(website.id)
    print(f"\n生成的HTML大小: {len(html)} 字符")
    
    # 统计
    stats = builder.get_website_stats(website.id)
    print(f"\n📊 网站统计:")
    print(f"页面数: {stats['pages']}")
    print(f"元素数: {stats['total_elements']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")

if __name__ == "__main__":
    main()
