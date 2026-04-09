#!/usr/bin/env python3
"""
Design Scientist Pro - 设计科学家
基于数学、几何、黄金比例的超级审美系统

研究维度：
- 黄金比例与斐波那契数列
- 瑞士网格系统
- 色彩数学与感知
- 排版几何学
- 设计系统的数学基础
"""

import math
from dataclasses import dataclass
from typing import List, Tuple, Dict
import json

@dataclass
class GoldenRatio:
    """黄金比例系统 φ = 1.618..."""
    PHI: float = 1.618033988749895
    
    def section(self, length: float) -> Tuple[float, float]:
        """将长度按黄金比例分割"""
        a = length / self.PHI
        b = length - a
        return (a, b)
    
    def sequence(self, n: int) -> List[float]:
        """生成斐波那契数列"""
        seq = [1, 1]
        for i in range(2, n):
            seq.append(seq[i-1] + seq[i-2])
        return seq
    
    def spiral_points(self, n: int = 10) -> List[Tuple[float, float]]:
        """生成黄金螺旋坐标"""
        points = [(0, 0)]
        fib = self.sequence(n)
        directions = [(1, 0), (0, 1), (-1, 0), (0, -1)]  # 右、上、左、下
        
        x, y = 0, 0
        for i, f in enumerate(fib[2:n]):
            dx, dy = directions[i % 4]
            x += dx * f
            y += dy * f
            points.append((x, y))
        
        return points
    
    def typography_scale(self, base: float = 16, levels: int = 6) -> List[float]:
        """基于黄金比例的字体尺寸系统"""
        return [round(base * (self.PHI ** i), 2) for i in range(levels)]


@dataclass  
class SwissGrid:
    """瑞士网格系统 - 国际主义设计风格"""
    columns: int = 12
    gutter_ratio: float = 0.25  # 间距占列宽比例
    margin_ratio: float = 0.1   # 边距占宽度比例
    
    def calculate(self, container_width: float) -> Dict:
        """计算网格参数"""
        margin = container_width * self.margin_ratio
        content_width = container_width - (2 * margin)
        
        # 总间距宽度
        total_gutter = content_width * self.gutter_ratio
        gutter_width = total_gutter / (self.columns - 1)
        
        # 单列宽度
        column_width = (content_width - total_gutter) / self.columns
        
        return {
            "container": container_width,
            "margin": margin,
            "content_width": content_width,
            "column_width": column_width,
            "gutter_width": gutter_width,
            "columns": self.columns
        }
    
    def grid_css(self, container_width: float = 1200) -> str:
        """生成CSS Grid代码"""
        calc = self.calculate(container_width)
        
        return f"""
/* 瑞士网格系统 - {self.columns}列 */
.grid-container {{
    display: grid;
    grid-template-columns: repeat({self.columns}, 1fr);
    gap: {calc['gutter_width']:.1f}px;
    padding: 0 {calc['margin']:.1f}px;
    max-width: {container_width}px;
    margin: 0 auto;
}}

.grid-column {{
    min-width: {calc['column_width']:.1f}px;
}}

/* 跨列辅助类 */
""" + "\n".join([
            f".col-{i} {{ grid-column: span {i}; }}" 
            for i in range(1, self.columns + 1)
        ])


class ColorMathematics:
    """色彩数学 - HSL、对比度、和谐度"""
    
    @staticmethod
    def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
        """RGB转HSL"""
        r, g, b = r/255.0, g/255.0, b/255.0
        max_c = max(r, g, b)
        min_c = min(r, g, b)
        diff = max_c - min_c
        
        # 亮度
        l = (max_c + min_c) / 2
        
        # 饱和度
        if diff == 0:
            s = 0
        else:
            s = diff / (2 - max_c - min_c) if l > 0.5 else diff / (max_c + min_c)
        
        # 色相
        if diff == 0:
            h = 0
        elif max_c == r:
            h = (60 * ((g - b) / diff) + 360) % 360
        elif max_c == g:
            h = (60 * ((b - r) / diff) + 120) % 360
        else:
            h = (60 * ((r - g) / diff) + 240) % 360
            
        return (round(h, 2), round(s * 100, 2), round(l * 100, 2))
    
    @staticmethod
    def luminance(r: int, g: int, b: int) -> float:
        """计算相对亮度 (WCAG标准)"""
        def channel(c):
            c = c / 255.0
            return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
        
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    
    @staticmethod
    def contrast_ratio(color1: Tuple[int, int, int], color2: Tuple[int, int, int]) -> float:
        """计算对比度比率 (WCAG)"""
        l1 = ColorMathematics.luminance(*color1)
        l2 = ColorMathematics.luminance(*color2)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        return round((lighter + 0.05) / (darker + 0.05), 2)
    
    def harmony_wheel(self, base_hue: float) -> Dict[str, Tuple[float, float, float]]:
        """生成色彩和谐方案"""
        return {
            "complementary": ((base_hue + 180) % 360, 70, 50),
            "split_1": ((base_hue + 150) % 360, 70, 50),
            "split_2": ((base_hue + 210) % 360, 70, 50),
            "triadic_1": ((base_hue + 120) % 360, 70, 50),
            "triadic_2": ((base_hue + 240) % 360, 70, 50),
            "analogous_1": ((base_hue + 30) % 360, 70, 50),
            "analogous_2": ((base_hue - 30) % 360, 70, 50),
            "tetradic_1": ((base_hue + 90) % 360, 70, 50),
            "tetradic_2": ((base_hue + 180) % 360, 70, 50),
            "tetradic_3": ((base_hue + 270) % 360, 70, 50),
        }


class TypographyGeometry:
    """排版几何学 - 基线网格、垂直节奏"""
    
    def __init__(self, base_size: float = 16, line_height_ratio: float = 1.5):
        self.base = base_size
        self.line_height = base_size * line_height_ratio
        self.golden = GoldenRatio()
    
    def baseline_grid(self, levels: int = 6) -> List[Dict]:
        """生成基线网格字体系统"""
        sizes = self.golden.typography_scale(self.base, levels)
        
        grid = []
        for i, size in enumerate(sizes):
            # 计算行高为基线单位的倍数
            lines = max(1, round(size / self.line_height))
            actual_line_height = lines * self.line_height
            
            grid.append({
                "level": f"H{i if i > 0 else 'base'}",
                "size": size,
                "line_height": actual_line_height,
                "lines": lines,
                "margin_bottom": self.line_height
            })
        
        return grid
    
    def css_variables(self) -> str:
        """生成CSS变量"""
        grid = self.baseline_grid()
        
        css = ":root {\n"
        css += f"  --base-size: {self.base}px;\n"
        css += f"  --line-height: {self.line_height}px;\n\n"
        
        for item in grid:
            level = item['level'].lower().replace('h', 'text-')
            css += f"  --{level}: {item['size']}px;\n"
            css += f"  --{level}-leading: {item['line_height']}px;\n\n"
        
        css += "}\n"
        return css
    
    def print_specimen(self) -> str:
        """生成字体样张"""
        grid = self.baseline_grid()
        specimen = "\n📐 排版几何系统\n"
        specimen += "=" * 50 + "\n\n"
        
        for item in grid:
            specimen += f"{item['level']:8} | Size: {item['size']:6.1f}px | "
            specimen += f"Line: {item['line_height']:6.1f}px | "
            specimen += f"Lines: {item['lines']}\n"
        
        return specimen


class DesignSystems:
    """设计系统的数学基础"""
    
    # 8pt网格系统
    EIGHT_POINT = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 640, 768]
    
    # 斐波那契间距
    @staticmethod
    def fibonacci_spacing(base: int = 4) -> List[int]:
        """基于斐波那契的间距系统"""
        fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
        return [x * base for x in fib]
    
    # 模块化比例
    MODULAR_RATIOS = {
        "minor_second": 1.067,
        "major_second": 1.125,
        "minor_third": 1.200,
        "major_third": 1.250,
        "perfect_fourth": 1.333,
        "perfect_fifth": 1.500,
        "golden": 1.618,
        "major_sixth": 1.667,
        "minor_seventh": 1.778,
        "major_seventh": 1.875,
        "octave": 2.000
    }
    
    @classmethod
    def modular_scale(cls, base: float, ratio: str, steps: int = 6) -> List[float]:
        """生成模块化比例尺寸"""
        r = cls.MODULAR_RATIOS.get(ratio, 1.618)
        scale = []
        
        # 生成基础值上下的比例
        for i in range(-2, steps):
            size = base * (r ** i)
            scale.append(round(size, 2))
        
        return sorted(scale)


class DesignScientist:
    """设计科学家主类 - 整合所有数学美学系统"""
    
    def __init__(self):
        self.golden = GoldenRatio()
        self.grid = SwissGrid()
        self.color = ColorMathematics()
        self.type = TypographyGeometry()
        self.systems = DesignSystems()
    
    def analyze_composition(self, width: float, height: float) -> Dict:
        """分析构图的黄金比例"""
        ratio = width / height
        
        # 判断接近哪种经典比例
        ratios = {
            "golden": 1.618,
            "silver": 2.414,
            "sqrt2": 1.414,
            "sqrt3": 1.732,
            "4:3": 4/3,
            "16:9": 16/9,
            "1:1": 1.0
        }
        
        closest = min(ratios.items(), key=lambda x: abs(x[1] - ratio))
        
        return {
            "dimensions": (width, height),
            "ratio": round(ratio, 3),
            "closest_classic": closest[0],
            "classic_value": closest[1],
            "deviation": round(abs(ratio - closest[1]), 3)
        }
    
    def generate_design_system(self, name: str, base_size: int = 16) -> str:
        """生成完整设计系统文档"""
        
        # 计算所有系统
        type_grid = TypographyGeometry(base_size).baseline_grid()
        swiss = SwissGrid(12).calculate(1440)
        golden_sizes = self.golden.typography_scale(base_size, 8)
        modular = self.systems.modular_scale(base_size, "golden", 8)
        
        doc = f"""# {name} - Design System

## 1. 黄金比例系统 (φ = 1.618)

### 斐波那契数列
`{' → '.join(map(str, self.golden.sequence(10)))}`

### 字体比例尺
| Level | Size |
|-------|------|
"""
        
        for i, size in enumerate(golden_sizes):
            doc += f"| {i} | {size}px |\n"
        
        doc += f"""
### 黄金螺旋
```
{self._draw_spiral_ascii()}
```

---

## 2. 瑞士网格系统

### 参数 (1440px容器)
| 参数 | 值 |
|------|-----|
| 列数 | {swiss['columns']} |
| 列宽 | {swiss['column_width']:.1f}px |
| 间距 | {swiss['gutter_width']:.1f}px |
| 边距 | {swiss['margin']:.1f}px |

---

## 3. 色彩数学

### 对比度检查 (WCAG)
使用 `contrast_ratio()` 计算任意两色的对比度

### 和谐色轮
基于主色HSL，自动生成：
- 互补色 (Complementary)
- 分裂互补 (Split)
- 三色 (Triadic)
- 类比色 (Analogous)
- 四色 (Tetradic)

---

## 4. 排版几何

### 基线网格
| 层级 | 字号 | 行高 | 占行数 |
|------|------|------|--------|
"""
        
        for item in type_grid:
            doc += f"| {item['level']} | {item['size']}px | {item['line_height']}px | {item['lines']} |\n"
        
        doc += f"""
### CSS变量
```css
{TypographyGeometry(base_size).css_variables()}
```

---

## 5. 间距系统

### 8pt网格
`{self.systems.EIGHT_POINT}`

### 斐波那契间距 (4×)
`{' → '.join(map(str, self.systems.fibonacci_spacing(4)))}`

---

## 6. 模块化比例

可用比例: {', '.join(self.systems.MODULAR_RATIOS.keys())}

---

*Generated by Design Scientist Pro*
*Mathematics is the language of beauty*
"""
        return doc
    
    def _draw_spiral_ascii(self) -> str:
        """ASCII艺术：黄金螺旋"""
        return """
    ┌─────────┐
    │         │
    │    ┌────┘
    │    │
    └────┤
         │    ┌──
         └────┘
        """
    
    def critique_design(self, width: float, height: float, elements: List[Dict]) -> str:
        """基于数学美学的设计批评"""
        comp = self.analyze_composition(width, height)
        
        critique = f"""
📊 构图分析报告
{'=' * 40}

画布比例: {comp['ratio']} ({width}×{height})
最接近经典: {comp['closest_classic']} ({comp['classic_value']})
偏离度: {comp['deviation']}

建议:
"""
        
        if comp['deviation'] > 0.1:
            critique += "- 画布比例偏离经典比例较远，考虑调整\n"
        else:
            critique += "- ✅ 画布比例接近经典美学比例\n"
        
        critique += f"""
黄金分割点:
- 水平: {width / self.golden.PHI:.0f}px
- 垂直: {height / self.golden.PHI:.0f}px

将关键元素放置在这些位置可创造视觉平衡。
"""
        return critique


def main():
    import sys
    
    scientist = DesignScientist()
    
    print("🔬 Design Scientist Pro - 设计科学家")
    print("=" * 50)
    print()
    
    # 1. 展示黄金比例
    print("📐 黄金比例 φ = 1.618...")
    print(f"   斐波那契前10项: {scientist.golden.sequence(10)}")
    print(f"   黄金字体比例尺: {scientist.golden.typography_scale(16, 6)}")
    print()
    
    # 2. 展示排版几何
    print(scientist.type.print_specimen())
    print()
    
    # 3. 展示网格系统
    print("📏 瑞士网格系统 (12列, 1440px容器)")
    swiss = SwissGrid(12).calculate(1440)
    for k, v in swiss.items():
        if isinstance(v, float):
            print(f"   {k}: {v:.1f}px")
        else:
            print(f"   {k}: {v}")
    print()
    
    # 4. 色彩数学示例
    print("🎨 色彩数学")
    white = (255, 255, 255)
    black = (0, 0, 0)
    contrast = scientist.color.contrast_ratio(white, black)
    print(f"   黑白对比度: {contrast}:1 (WCAG AAA)")
    
    # 5. 生成完整设计系统
    if len(sys.argv) > 1 and sys.argv[1] == "generate":
        name = sys.argv[2] if len(sys.argv) > 2 else "MyProject"
        doc = scientist.generate_design_system(name)
        
        output_path = f"/root/ai-empire-share/{name.lower().replace(' ', '_')}_design_system.md"
        with open(output_path, 'w') as f:
            f.write(doc)
        print(f"\n✅ 设计系统已生成: {output_path}")
    
    print("\n💡 使用方法:")
    print("   python design_scientist_pro.py generate [项目名称]")


if __name__ == "__main__":
    main()
