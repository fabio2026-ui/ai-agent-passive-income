# Image Editor - Batch Processor
# 小七团队开发
# 批量图片处理工具

from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import os
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class ResizeMode(Enum):
    FIT = "fit"
    FILL = "fill"
    STRETCH = "stretch"

class OutputFormat(Enum):
    JPEG = "JPEG"
    PNG = "PNG"
    WEBP = "WEBP"

@dataclass
class ProcessingConfig:
    width: Optional[int] = None
    height: Optional[int] = None
    resize_mode: ResizeMode = ResizeMode.FIT
    quality: int = 85
    format: OutputFormat = OutputFormat.JPEG
    sharpen: bool = False
    brightness: float = 1.0
    contrast: float = 1.0
    saturation: float = 1.0
    grayscale: bool = False
    watermark: Optional[str] = None
    watermark_position: str = "bottom_right"

class BatchImageProcessor:
    """批量图片处理器"""
    
    def __init__(self, output_dir: str = "processed"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
    def process_single(self, image_path: str, config: ProcessingConfig) -> str:
        """处理单张图片"""
        # 打开图片
        with Image.open(image_path) as img:
            # 转换为RGB（处理RGBA）
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # 调整大小
            if config.width or config.height:
                img = self._resize(img, config)
            
            # 调整色彩
            if config.brightness != 1.0:
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(config.brightness)
            
            if config.contrast != 1.0:
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(config.contrast)
            
            if config.saturation != 1.0:
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(config.saturation)
            
            # 灰度
            if config.grayscale:
                img = ImageOps.grayscale(img)
                img = img.convert('RGB')
            
            # 锐化
            if config.sharpen:
                img = img.filter(ImageFilter.SHARPEN)
            
            # 添加水印
            if config.watermark:
                img = self._add_watermark(img, config.watermark, config.watermark_position)
            
            # 保存
            output_filename = f"processed_{os.path.basename(image_path)}"
            output_path = os.path.join(self.output_dir, output_filename)
            
            # 根据格式调整扩展名
            if config.format == OutputFormat.PNG:
                output_path = output_path.rsplit('.', 1)[0] + '.png'
            elif config.format == OutputFormat.WEBP:
                output_path = output_path.rsplit('.', 1)[0] + '.webp'
            
            save_kwargs = {'quality': config.quality} if config.format == OutputFormat.JPEG else {}
            img.save(output_path, config.format.value, **save_kwargs)
            
            return output_path
    
    def process_batch(self, image_paths: List[str], config: ProcessingConfig) -> List[str]:
        """批量处理图片"""
        results = []
        for path in image_paths:
            try:
                output_path = self.process_single(path, config)
                results.append(output_path)
            except Exception as e:
                print(f"处理失败 {path}: {e}")
                results.append(None)
        return results
    
    def _resize(self, img: Image.Image, config: ProcessingConfig) -> Image.Image:
        """调整图片大小"""
        original_width, original_height = img.size
        target_width = config.width or original_width
        target_height = config.height or original_height
        
        if config.resize_mode == ResizeMode.STRETCH:
            return img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        elif config.resize_mode == ResizeMode.FIT:
            img.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
            return img
        
        elif config.resize_mode == ResizeMode.FILL:
            # 计算缩放比例
            ratio = max(target_width / original_width, target_height / original_height)
            new_size = (int(original_width * ratio), int(original_height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # 裁剪
            left = (img.width - target_width) // 2
            top = (img.height - target_height) // 2
            return img.crop((left, top, left + target_width, top + target_height))
        
        return img
    
    def _add_watermark(self, img: Image.Image, watermark_text: str, position: str) -> Image.Image:
        """添加文字水印"""
        from PIL import ImageDraw, ImageFont
        
        draw = ImageDraw.Draw(img)
        
        # 尝试使用字体
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        except:
            font = ImageFont.load_default()
        
        # 计算文字大小
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # 计算位置
        padding = 20
        positions = {
            'top_left': (padding, padding),
            'top_right': (img.width - text_width - padding, padding),
            'bottom_left': (padding, img.height - text_height - padding),
            'bottom_right': (img.width - text_width - padding, img.height - text_height - padding),
            'center': ((img.width - text_width) // 2, (img.height - text_height) // 2)
        }
        
        pos = positions.get(position, positions['bottom_right'])
        
        # 添加半透明背景
        overlay = Image.new('RGBA', img.size, (255, 255, 255, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.rectangle(
            [pos[0] - 10, pos[1] - 5, pos[0] + text_width + 10, pos[1] + text_height + 5],
            fill=(0, 0, 0, 128)
        )
        
        # 合并
        img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        draw = ImageDraw.Draw(img)
        draw.text(pos, watermark_text, font=font, fill=(255, 255, 255, 255))
        
        return img
    
    def create_sprite_sheet(self, image_paths: List[str], cols: int = 4) -> str:
        """创建精灵图"""
        images = [Image.open(p) for p in image_paths]
        
        # 获取最大尺寸
        max_width = max(img.width for img in images)
        max_height = max(img.height for img in images)
        
        # 计算行列
        rows = (len(images) + cols - 1) // cols
        
        # 创建画布
        sprite_sheet = Image.new('RGBA', (max_width * cols, max_height * rows))
        
        # 粘贴图片
        for i, img in enumerate(images):
            row = i // cols
            col = i % cols
            x = col * max_width
            y = row * max_height
            sprite_sheet.paste(img, (x, y))
        
        # 保存
        output_path = os.path.join(self.output_dir, 'sprite_sheet.png')
        sprite_sheet.save(output_path)
        
        return output_path
    
    def generate_css_sprites(self, image_paths: List[str], class_name: str = "icon") -> str:
        """生成CSS精灵图代码"""
        sprite_path = self.create_sprite_sheet(image_paths)
        
        css = f""".{class_name} {{
    background-image: url('{os.path.basename(sprite_path)}');
    background-repeat: no-repeat;
    display: inline-block;
}}"""
        
        # 假设等大小
        img = Image.open(image_paths[0])
        width, height = img.size
        
        for i, path in enumerate(image_paths):
            name = os.path.splitext(os.path.basename(path))[0]
            css += f"""
.{class_name}-{name} {{
    width: {width}px;
    height: {height}px;
    background-position: -{i * width}px 0;
}}"""
        
        return css

# 预设配置
PRESETS = {
    'social_media': {
        'instagram': ProcessingConfig(width=1080, height=1080, resize_mode=ResizeMode.FILL),
        'facebook': ProcessingConfig(width=1200, height=630, resize_mode=ResizeMode.FILL),
        'twitter': ProcessingConfig(width=1200, height=675, resize_mode=ResizeMode.FILL),
        'linkedin': ProcessingConfig(width=1200, height=627, resize_mode=ResizeMode.FILL)
    },
    'ecommerce': {
        'thumbnail': ProcessingConfig(width=300, height=300, resize_mode=ResizeMode.FIT, quality=80),
        'product': ProcessingConfig(width=800, height=800, resize_mode=ResizeMode.FIT, quality=90),
        'banner': ProcessingConfig(width=1920, height=600, resize_mode=ResizeMode.FILL)
    },
    'optimization': {
        'web': ProcessingConfig(width=1200, quality=80, format=OutputFormat.WEBP),
        'compress': ProcessingConfig(quality=60),
        'archive': ProcessingConfig(grayscale=True, quality=50)
    }
}

# 定价
PRICING = {
    'free': {
        'images_per_month': 50,
        'features': ['基础调整', '标准格式']
    },
    'pro': {
        'price': 9,
        'images_per_month': 500,
        'features': ['批量处理', '所有格式', '水印', '预设']
    },
    'business': {
        'price': 29,
        'images_per_month': 5000,
        'features': ['API访问', '高级滤镜', '团队协作', '自定义预设']
    },
    'enterprise': {
        'price': 99,
        'images_per_month': 50000,
        'features': ['无限处理', '白标', 'SLA', '专属支持']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'pro': 40,
        'business': 12,
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
    processor = BatchImageProcessor()
    
    print("批量图片处理器已启动")
    print("\n可用预设:")
    for category, presets in PRESETS.items():
        print(f"\n{category}:")
        for name in presets.keys():
            print(f"  - {name}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
