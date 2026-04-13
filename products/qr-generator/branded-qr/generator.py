# QR Code Generator - Branded QR
# 小七团队开发
# 品牌定制二维码生成器

import qrcode
from PIL import Image, ImageDraw, ImageFont
import io
import base64
from typing import Dict, Optional, Tuple
from dataclasses import dataclass

@dataclass
class QRConfig:
    data: str
    size: int = 300
    fill_color: str = "black"
    back_color: str = "white"
    logo_path: Optional[str] = None
    logo_size_ratio: float = 0.2
    border: int = 4
    error_correction: str = "H"

class BrandedQRGenerator:
    """品牌二维码生成器"""
    
    def __init__(self):
        self.error_levels = {
            'L': qrcode.constants.ERROR_CORRECT_L,
            'M': qrcode.constants.ERROR_CORRECT_M,
            'Q': qrcode.constants.ERROR_CORRECT_Q,
            'H': qrcode.constants.ERROR_CORRECT_H
        }
    
    def generate(self, config: QRConfig) -> Image.Image:
        """生成二维码"""
        # 创建QR码
        qr = qrcode.QRCode(
            version=None,
            error_correction=self.error_levels.get(config.error_correction, qrcode.constants.ERROR_CORRECT_H),
            box_size=10,
            border=config.border
        )
        
        qr.add_data(config.data)
        qr.make(fit=True)
        
        # 生成图像
        img = qr.make_image(fill_color=config.fill_color, back_color=config.back_color)
        img = img.convert('RGB')
        
        # 调整大小
        img = img.resize((config.size, config.size), Image.Resampling.LANCZOS)
        
        # 添加Logo
        if config.logo_path:
            img = self._add_logo(img, config)
        
        return img
    
    def _add_logo(self, img: Image.Image, config: QRConfig) -> Image.Image:
        """添加Logo到二维码中心"""
        try:
            logo = Image.open(config.logo_path)
            
            # 计算Logo大小
            logo_size = int(config.size * config.logo_size_ratio)
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            
            # 如果Logo没有透明通道，转换为RGBA
            if logo.mode != 'RGBA':
                logo = logo.convert('RGBA')
            
            # 计算位置
            pos = ((config.size - logo_size) // 2, (config.size - logo_size) // 2)
            
            # 创建白色背景圆形
            mask = Image.new('L', (logo_size, logo_size), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse([0, 0, logo_size, logo_size], fill=255)
            
            # 应用圆形遮罩
            logo_circle = Image.new('RGBA', (logo_size, logo_size), (255, 255, 255, 255))
            logo_circle.paste(logo, (0, 0), logo)
            logo_circle.putalpha(mask)
            
            # 粘贴到二维码
            img.paste(logo_circle, pos, logo_circle)
            
        except Exception as e:
            print(f"添加Logo失败: {e}")
        
        return img
    
    def generate_with_frame(self, config: QRConfig, frame_text: str = "") -> Image.Image:
        """生成带边框的二维码"""
        qr_img = self.generate(config)
        
        if not frame_text:
            return qr_img
        
        # 创建带边框的画布
        padding = 60
        new_size = (config.size, config.size + padding)
        framed = Image.new('RGB', new_size, config.back_color)
        
        # 粘贴二维码
        framed.paste(qr_img, (0, 0))
        
        # 添加文字
        draw = ImageDraw.Draw(framed)
        
        # 使用默认字体
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        # 计算文字位置
        bbox = draw.textbbox((0, 0), frame_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = (config.size - text_width) // 2
        text_y = config.size + 20
        
        draw.text((text_x, text_y), frame_text, fill=config.fill_color, font=font)
        
        return framed
    
    def generate_batch(self, urls: list, config_template: QRConfig) -> Dict[str, Image.Image]:
        """批量生成二维码"""
        results = {}
        for url in urls:
            config = QRConfig(
                data=url,
                size=config_template.size,
                fill_color=config_template.fill_color,
                back_color=config_template.back_color,
                logo_path=config_template.logo_path
            )
            results[url] = self.generate(config)
        return results
    
    def to_base64(self, img: Image.Image, format: str = "PNG") -> str:
        """转换为base64"""
        buffer = io.BytesIO()
        img.save(buffer, format=format)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/{format.lower()};base64,{img_str}"
    
    def generate_vcard(self, name: str, phone: str, email: str, 
                      company: str = "", title: str = "") -> str:
        """生成vCard格式二维码"""
        vcard = f"""BEGIN:VCARD
VERSION:3.0
N:{name};;;
FN:{name}
ORG:{company}
TITLE:{title}
TEL:{phone}
EMAIL:{email}
END:VCARD"""
        return vcard
    
    def generate_wifi(self, ssid: str, password: str, security: str = "WPA") -> str:
        """生成WiFi连接二维码"""
        return f"WIFI:T:{security};S:{ssid};P:{password};;"
    
    def generate_email(self, to: str, subject: str, body: str) -> str:
        """生成邮件二维码"""
        return f"MATMSG:TO:{to};SUB:{subject};BODY:{body};;"

# 模板预设
TEMPLATES = {
    'social': {
        'fill_color': '#1877F2',  # Facebook蓝
        'back_color': '#FFFFFF',
        'frame_text': '关注我们'
    },
    'payment': {
        'fill_color': '#00C853',  # 支付绿
        'back_color': '#FFFFFF',
        'frame_text': '扫码支付'
    },
    'app_download': {
        'fill_color': '#000000',
        'back_color': '#FFFFFF',
        'frame_text': '下载APP'
    },
    'event': {
        'fill_color': '#FF5722',  # 活动橙
        'back_color': '#FFFFFF',
        'frame_text': '活动签到'
    },
    'modern_dark': {
        'fill_color': '#FFFFFF',
        'back_color': '#1A1A2E',
        'frame_text': ''
    },
    'gradient': {
        'fill_color': '#6366F1',  # 渐变紫
        'back_color': '#F3F4F6',
        'frame_text': ''
    }
}

# 定价
PRICING = {
    'free': {
        'price': 0,
        'features': ['基础二维码', '标准分辨率', 'PNG下载'],
        'limit': '10个/月'
    },
    'pro': {
        'price': 9,
        'features': ['品牌定制', 'Logo嵌入', '所有格式', '高清导出'],
        'limit': '100个/月'
    },
    'business': {
        'price': 29,
        'features': ['批量生成', 'API访问', '动态二维码', '分析追踪'],
        'limit': '1000个/月'
    },
    'enterprise': {
        'price': 99,
        'features': ['无限生成', '白标方案', '专属支持', 'SLA保障'],
        'limit': '无限'
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'pro': 50,
        'business': 15,
        'enterprise': 3
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
    generator = BrandedQRGenerator()
    
    # 生成基础二维码
    config = QRConfig(
        data="https://example.com",
        size=400,
        fill_color="#6366F1",
        back_color="#FFFFFF"
    )
    
    img = generator.generate(config)
    print(f"二维码生成完成: {img.size}")
    
    # 生成带边框的
    framed = generator.generate_with_frame(config, "扫描二维码")
    print(f"带边框二维码生成完成: {framed.size}")
    
    # 生成WiFi二维码
    wifi_qr = generator.generate_wifi("MyWiFi", "password123")
    print(f"\nWiFi二维码数据: {wifi_qr}")
    
    # 生成vCard
    vcard = generator.generate_vcard(
        name="张三",
        phone="+86 138-0000-0000",
        email="zhangsan@example.com",
        company="示例公司",
        title="产品经理"
    )
    print(f"vCard数据已生成")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
