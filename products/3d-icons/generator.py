# 3D Icon Pack Generator
# 小七团队开发
# 生成可自定义颜色的3D图标

BLENDER_SCRIPT = '''
import bpy
import os

# 清除场景
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# 图标形状定义
ICONS = {
    'home': {
        'type': 'MESH',
        'objects': [
            {'type': 'CUBE', 'size': 2, 'location': (0, 0, 0)},  # 主体
            {'type': 'CONE', 'radius1': 1.5, 'radius2': 0, 'depth': 1, 'location': (0, 0, 1.5)},  # 屋顶
        ]
    },
    'search': {
        'type': 'MESH',
        'objects': [
            {'type': 'SPHERE', 'radius': 1, 'location': (0, 0, 0)},  # 镜头
            {'type': 'CYLINDER', 'radius': 0.2, 'depth': 2, 'location': (1, -1, -0.5), 'rotation': (0.785, 0, 0.785)},  # 手柄
        ]
    },
    'user': {
        'type': 'MESH',
        'objects': [
            {'type': 'SPHERE', 'radius': 0.8, 'location': (0, 0, 1)},  # 头
            {'type': 'CAPSULE', 'radius': 1, 'depth': 2, 'location': (0, 0, -0.5)},  # 身体
        ]
    },
    'heart': {
        'type': 'CURVE',
        'formula': 'heart_curve'  # 心形曲线
    },
    'star': {
        'type': 'MESH',
        'objects': [
            {'type': 'CONE', 'radius1': 1, 'radius2': 0, 'depth': 0.5, 'location': (0, 0, 0)},
        ]
    },
    'bell': {
        'type': 'MESH',
        'objects': [
            {'type': 'CONE', 'radius1': 1, 'radius2': 0.3, 'depth': 2, 'location': (0, 0, 0)},
            {'type': 'SPHERE', 'radius': 0.3, 'location': (0, 0, -1.2)},
        ]
    },
    'cart': {
        'type': 'MESH',
        'objects': [
            {'type': 'CUBE', 'size': 2, 'location': (0, 0, 0)},
            {'type': 'CYLINDER', 'radius': 0.3, 'depth': 0.2, 'location': (-1, -1, -1)},
            {'type': 'CYLINDER', 'radius': 0.3, 'depth': 0.2, 'location': (1, -1, -1)},
        ]
    },
    'settings': {
        'type': 'MESH',
        'objects': [
            {'type': 'CYLINDER', 'radius': 1.2, 'depth': 0.5, 'location': (0, 0, 0)},
            {'type': 'CYLINDER', 'radius': 0.8, 'depth': 0.7, 'location': (0, 0, 0)},
        ]
    },
    'message': {
        'type': 'MESH',
        'objects': [
            {'type': 'CUBE', 'size': 2, 'location': (0, 0, 0)},
        ]
    },
    'calendar': {
        'type': 'MESH',
        'objects': [
            {'type': 'CUBE', 'size': 2, 'location': (0, 0, 0)},
            {'type': 'CYLINDER', 'radius': 0.1, 'depth': 0.5, 'location': (-0.5, 1, 0.5)},
            {'type': 'CYLINDER', 'radius': 0.1, 'depth': 0.5, 'location': (0.5, 1, 0.5)},
        ]
    },
}

def create_icon(icon_name, color=(0.3, 0.6, 1.0)):
    """创建单个图标"""
    icon_data = ICONS.get(icon_name)
    if not icon_data:
        return
    
    # 创建材质
    mat = bpy.data.materials.new(name=f"{icon_name}_material")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs[0].default_value = (*color, 1)  # Base Color
    bsdf.inputs[6].default_value = 0.9  # Metallic
    bsdf.inputs[9].default_value = 0.1  # Roughness
    
    objects_to_join = []
    
    for obj_data in icon_data.get('objects', []):
        if obj_data['type'] == 'CUBE':
            bpy.ops.mesh.primitive_cube_add(size=obj_data.get('size', 2), location=obj_data['location'])
        elif obj_data['type'] == 'SPHERE':
            bpy.ops.mesh.primitive_uv_sphere_add(radius=obj_data.get('radius', 1), location=obj_data['location'])
        elif obj_data['type'] == 'CYLINDER':
            bpy.ops.mesh.primitive_cylinder_add(radius=obj_data.get('radius', 1), depth=obj_data.get('depth', 2), location=obj_data['location'])
        elif obj_data['type'] == 'CONE':
            bpy.ops.mesh.primitive_cone_add(radius1=obj_data.get('radius1', 1), radius2=obj_data.get('radius2', 0), depth=obj_data.get('depth', 2), location=obj_data['location'])
        elif obj_data['type'] == 'CAPSULE':
            bpy.ops.mesh.primitive_cylinder_add(radius=obj_data.get('radius', 1), depth=obj_data.get('depth', 2), location=obj_data['location'])
        
        obj = bpy.context.active_object
        if 'rotation' in obj_data:
            obj.rotation_euler = obj_data['rotation']
        
        # 应用材质
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
        
        objects_to_join.append(obj)
    
    # 合并对象
    if len(objects_to_join) > 1:
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects_to_join:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects_to_join[0]
        bpy.ops.object.join()
    
    # 添加倒角修饰器
    active_obj = bpy.context.active_object
    bevel = active_obj.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = 0.1
    bevel.segments = 4
    
    # 平滑着色
    bpy.ops.object.shade_smooth()
    
    return active_obj

def render_icon(icon_name, output_dir, angles=[0, 45, 90]):
    """渲染图标多角度视图"""
    obj = create_icon(icon_name)
    if not obj:
        return
    
    # 设置相机
    bpy.ops.object.camera_add(location=(5, -5, 3), rotation=(1.1, 0, 0.785))
    camera = bpy.context.active_object
    bpy.context.scene.camera = camera
    
    # 设置灯光
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
    light = bpy.context.active_object
    light.data.energy = 3
    
    # 渲染设置
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = True
    
    for angle in angles:
        # 旋转物体
        obj.rotation_euler = (0, 0, angle * 3.14159 / 180)
        
        # 渲染
        scene.render.filepath = os.path.join(output_dir, f"{icon_name}_angle_{angle}.png")
        bpy.ops.render.render(write_still=True)

def export_all_icons(output_dir):
    """导出所有图标"""
    os.makedirs(output_dir, exist_ok=True)
    
    for icon_name in ICONS.keys():
        print(f"Processing {icon_name}...")
        
        # 清除场景
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
        
        # 创建并渲染
        render_icon(icon_name, output_dir)

# 执行
export_all_icons("//output/")
'''

# Python包装器
import subprocess
import os

def generate_3d_icons(output_dir: str, icon_list: list = None):
    """生成3D图标"""
    
    # 保存Blender脚本
    script_path = os.path.join(output_dir, 'generate_icons.py')
    with open(script_path, 'w') as f:
        f.write(BLENDER_SCRIPT)
    
    # 运行Blender
    try:
        subprocess.run([
            'blender',
            '--background',
            '--python', script_path
        ], check=True)
        print(f"✅ 3D图标已生成到: {output_dir}")
    except subprocess.CalledProcessError as e:
        print(f"❌ 生成失败: {e}")
    except FileNotFoundError:
        print("⚠️ 未找到Blender，请安装Blender后重试")

# 图标清单
ICON_LIST = [
    'home', 'search', 'user', 'heart', 'star', 
    'bell', 'cart', 'settings', 'message', 'calendar',
    'camera', 'music', 'video', 'email', 'phone',
    'location', 'bookmark', 'share', 'download', 'upload',
    'edit', 'delete', 'add', 'remove', 'check',
    'close', 'menu', 'back', 'forward', 'refresh',
    'wifi', 'battery', 'bluetooth', 'airplane', 'moon',
    'sun', 'cloud', 'rain', 'snow', 'wind',
    'fire', 'water', 'earth', 'lightning', 'flag',
    'tag', 'folder', 'file', 'image', 'link',
    'lock', 'unlock', 'eye', 'eye-off', 'filter',
    'sort', 'grid', 'list', 'map', 'chart',
    'trending-up', 'trending-down', 'activity', 'pie-chart', 'bar-chart',
    'dollar', 'euro', 'pound', 'yen', 'bitcoin',
    'credit-card', 'wallet', 'bank', 'receipt', 'invoice',
    'truck', 'package', 'gift', 'coupon', 'discount',
    'support', 'help', 'info', 'warning', 'error',
    'success', 'pending', 'processing', 'shipped', 'delivered'
]

# 定价
PRICING = {
    'basic': {
        'icons': 20,
        'price': 19,
        'features': ['PNG格式', '1024x1024分辨率']
    },
    'pro': {
        'icons': 100,
        'price': 39,
        'features': ['PNG + OBJ格式', '可编辑颜色', '多角度视图', '源文件']
    },
    'enterprise': {
        'icons': 100,
        'price': 99,
        'features': ['所有格式', '定制图标', '商业授权', '优先支持']
    }
}

# 收入预测
def calculate_revenue():
    """计算收入预测"""
    sales = {
        'basic': 50,  # 月销售
        'pro': 30,
        'enterprise': 5
    }
    
    monthly = sum(sales[tier] * PRICING[tier]['price'] for tier in sales)
    return {
        'monthly': monthly,
        'yearly': monthly * 12
    }

if __name__ == '__main__':
    print("🎨 3D Icon Pack Generator")
    print(f"图标总数: {len(ICON_LIST)}")
    
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
