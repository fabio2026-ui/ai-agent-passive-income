# Background Remover - AI Photo Studio
# 小七团队开发
# AI背景移除和照片编辑

from PIL import Image
import numpy as np
from typing import Optional, Tuple
from dataclasses import dataclass

@dataclass
class RemovalConfig:
    smooth_edges: bool = True
    feather_amount: int = 2
    output_format: str = "PNG"
    background_color: Optional[Tuple[int, int, int]] = None
    background_image: Optional[str] = None

class AIBackgroundRemover:
    """AI背景移除器"""
    
    def __init__(self):
        self.model_loaded = False
        
    def remove_background(self, image_path: str, config: RemovalConfig) -> Image.Image:
        """移除图片背景"""
        # 打开图片
        img = Image.open(image_path).convert("RGBA")
        
        # 这里应该调用实际的AI模型（如rembg）
        # 模拟处理
        print(f"处理图片: {image_path}")
        print(f"应用配置: 平滑边缘={config.smooth_edges}, 羽化={config.feather_amount}")
        
        # 实际实现会使用深度学习模型
        # 例如: from rembg import remove
        # result = remove(img)
        
        # 模拟结果 - 实际应用中替换为真实AI处理
        result = self._simulate_removal(img)
        
        # 应用后处理
        if config.smooth_edges:
            result = self._smooth_edges(result, config.feather_amount)
        
        # 添加新背景
        if config.background_color:
            result = self._add_solid_background(result, config.background_color)
        elif config.background_image:
            result = self._add_image_background(result, config.background_image)
        
        return result
    
    def _simulate_removal(self, img: Image.Image) -> Image.Image:
        """模拟背景移除（实际应用中使用AI模型）"""
        # 创建透明背景
        data = np.array(img)
        
        # 简单阈值处理 - 仅用于演示
        # 实际应用中使用深度学习分割模型
        r, g, b, a = data.T
        
        # 检测近似白色背景
        white_areas = (r > 200) & (g > 200) & (b > 200)
        data[..., 3][white_areas.T] = 0  # 设为透明
        
        return Image.fromarray(data)
    
    def _smooth_edges(self, img: Image.Image, feather: int) -> Image.Image:
        """平滑边缘"""
        # 应用轻微模糊使边缘更自然
        from PIL import ImageFilter
        return img.filter(ImageFilter.GaussianBlur(radius=feather * 0.5))
    
    def _add_solid_background(self, img: Image.Image, color: Tuple[int, int, int]) -> Image.Image:
        """添加纯色背景"""
        background = Image.new("RGB", img.size, color)
        background.paste(img, mask=img.split()[3])  # 使用alpha通道作为mask
        return background.convert("RGBA")
    
    def _add_image_background(self, img: Image.Image, bg_path: str) -> Image.Image:
        """添加图片背景"""
        background = Image.open(bg_path).convert("RGBA")
        background = background.resize(img.size)
        
        # 合并
        result = Image.alpha_composite(background, img)
        return result
    
    def batch_process(self, image_paths: list, config: RemovalConfig, output_dir: str):
        """批量处理"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        results = []
        for path in image_paths:
            try:
                result = self.remove_background(path, config)
                filename = f"nobg_{os.path.basename(path)}"
                output_path = os.path.join(output_dir, filename)
                result.save(output_path)
                results.append(output_path)
            except Exception as e:
                print(f"处理失败 {path}: {e}")
                
        return results
    
    def replace_background(self, image_path: str, new_background: str, preserve_shadows: bool = True) -> Image.Image:
        """替换背景"""
        # 先移除背景
        config = RemovalConfig(smooth_edges=True)
        subject = self.remove_background(image_path, config)
        
        # 加载新背景
        bg = Image.open(new_background).convert("RGBA")
        bg = bg.resize(subject.size)
        
        # 可选：保留阴影
        if preserve_shadows:
            # 创建阴影层
            shadow = self._create_shadow(subject)
            bg = Image.alpha_composite(bg, shadow)
        
        # 合并主题和新背景
        result = Image.alpha_composite(bg, subject)
        return result
    
    def _create_shadow(self, img: Image.Image) -> Image.Image:
        """创建投影效果"""
        # 提取alpha通道
        alpha = img.split()[3]
        
        # 创建阴影层
        shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        shadow_data = np.array(shadow)
        alpha_data = np.array(alpha)
        
        # 添加半透明黑色
        shadow_data[alpha_data > 0] = [0, 0, 0, 80]
        shadow = Image.fromarray(shadow_data)
        
        # 轻微偏移和模糊
        from PIL import ImageFilter
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=5))
        
        return shadow

# 定价
PRICING = {
    'free': {
        'images_per_month': 10,
        'resolution_limit': 'HD',
        'features': ['基础移除', 'PNG输出']
    },
    'starter': {
        'price': 12,
        'images_per_month': 100,
        'resolution_limit': '4K',
        'features': ['AI移除', '批量处理', '所有格式']
    },
    'pro': {
        'price': 29,
        'images_per_month': 500,
        'resolution_limit': '8K',
        'features': ['高级AI', '背景替换', '阴影保留', 'API访问']
    },
    'business': {
        'price': 99,
        'images_per_month': 2000,
        'resolution_limit': '无限制',
        'features': ['无限分辨率', '团队协作', '白标', '优先处理']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 35,
        'pro': 15,
        'business': 3
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['business'] * PRICING['business']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    remover = AIBackgroundRemover()
    
    print("🎨 AI背景移除器已启动")
    print("\n功能:")
    print("  - 智能背景移除")
    print("  - 背景替换")
    print("  - 批量处理")
    print("  - 阴影保留")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
