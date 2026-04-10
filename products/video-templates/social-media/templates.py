# Video Templates - Social Media Pack
# 小七团队开发
# 50个社交媒体视频模板

TEMPLATES = {
    # Instagram/TikTok竖屏 (9:16)
    'vertical': [
        {
            'name': 'Product Showcase',
            'duration': '15s',
            'style': 'Modern/Minimal',
            'elements': ['产品图片', '标题动画', '价格标签', 'CTA按钮'],
            'colors': ['#000000', '#FFFFFF', '#FF6B6B'],
            'music': 'Upbeat Pop',
            'transitions': 'Smooth Slide'
        },
        {
            'name': 'Testimonial',
            'duration': '30s',
            'style': 'Clean/Professional',
            'elements': ['头像', '引号动画', '评价文字', '星级评分'],
            'colors': ['#F8F9FA', '#495057', '#40C057'],
            'music': 'Inspiring',
            'transitions': 'Fade'
        },
        {
            'name': 'Behind the Scenes',
            'duration': '60s',
            'style': 'Authentic/Casual',
            'elements': ['视频片段', '手写文字', 'Emoji', '背景音乐'],
            'colors': ['#FFE066', '#FF8787', '#74C0FC'],
            'music': 'Chill Lo-fi',
            'transitions': 'Jump Cut'
        },
        {
            'name': 'Tutorial/Tips',
            'duration': '45s',
            'style': 'Educational/Clean',
            'elements': ['步骤数字', '图标动画', '文字说明', '进度条'],
            'colors': ['#E7F5FF', '#228BE6', '#FAB005'],
            'music': 'Focus/Study',
            'transitions': 'Wipe'
        },
        {
            'name': 'Sale/Promotion',
            'duration': '15s',
            'style': 'Bold/Energetic',
            'elements': ['折扣标签', '倒计时', '闪光效果', '价格划掉'],
            'colors': ['#FF0000', '#FFD700', '#000000'],
            'music': 'Electronic Drop',
            'transitions': 'Flash'
        },
    ],
    
    # YouTube横屏 (16:9)
    'horizontal': [
        {
            'name': 'Intro/Outro',
            'duration': '5-10s',
            'style': 'Dynamic/Branded',
            'elements': ['Logo动画', '订阅提醒', '社交媒体链接'],
            'colors': ['品牌色'],
            'music': 'Logo Reveal',
            'transitions': 'Zoom'
        },
        {
            'name': 'Title Card',
            'duration': '5s',
            'style': 'Clean/Readable',
            'elements': ['大标题', '副标题', '背景模糊'],
            'colors': ['#000000', '#FFFFFF'],
            'music': 'None',
            'transitions': 'None'
        },
        {
            'name': 'Lower Third',
            'duration': 'N/A',
            'style': 'Professional',
            'elements': ['人名', '职位', 'Logo'],
            'colors': ['半透明白', '品牌色'],
            'music': 'None',
            'transitions': 'Slide Up'
        },
        {
            'name': 'Subscribe Animation',
            'duration': '5s',
            'style': 'Fun/Engaging',
            'elements': ['Subscribe按钮', '铃铛图标', '鼠标点击动画'],
            'colors': ['#FF0000', '#FFFFFF'],
            'music': 'Pop Sound',
            'transitions': 'Bounce'
        },
        {
            'name': 'Chapter Marker',
            'duration': '3s',
            'style': 'Minimal',
            'elements': ['章节标题', '进度条', '时间戳'],
            'colors': ['#808080', '#FFFFFF'],
            'music': 'None',
            'transitions': 'Fade'
        },
    ],
    
    # 方形 (1:1) - 通用
    'square': [
        {
            'name': 'Quote Card',
            'duration': '10s',
            'style': 'Elegant',
            'elements': ['引用文字', '作者名', '背景渐变'],
            'colors': ['渐变色'],
            'music': 'Ambient',
            'transitions': 'Slow Fade'
        },
        {
            'name': 'Before/After',
            'duration': '10s',
            'style': 'Clear/Comparative',
            'elements': ['分屏', '滑动条', '标签'],
            'colors': ['#000000', '#FFFFFF'],
            'music': 'None',
            'transitions': 'Wipe'
        },
        {
            'name': 'Countdown',
            'duration': '10s',
            'style': 'Exciting',
            'elements': ['大数字', '圆形进度', '背景动画'],
            'colors': ['#FF6B6B', '#FFE066', '#51CF66'],
            'music': 'Ticking + Beat',
            'transitions': 'Hard Cut'
        },
    ]
}

# 完整模板清单 (50个)
FULL_TEMPLATE_LIST = [
    # 电商类 (15个)
    'Product Showcase', 'Product Demo', 'Unboxing', 'Comparison', 
    'Review/Testimonial', 'Flash Sale', 'New Arrival', 'Best Seller',
    'Limited Edition', 'Bundle Deal', 'Seasonal Promo', 'Gift Guide',
    'User Generated Content', 'Influencer Collab', 'FAQ/How-to',
    
    # 品牌类 (10个)
    'Brand Story', 'Mission/Values', 'Behind the Scenes', 'Team Intro',
    'Office Tour', 'Making Of', 'Customer Story', 'Anniversary',
    'Milestone Celebration', 'Thank You Message',
    
    # 教育类 (10个)
    'Quick Tips', 'Tutorial/How-to', 'Did You Know', 'Myth Busting',
    'Industry News', 'Trend Forecast', 'Best Practices', 'Common Mistakes',
    'Step-by-Step Guide', 'Expert Interview',
    
    # 互动类 (10个)
    'Question/Poll', 'This or That', 'Guess the Answer', 'Challenge',
    'UGC Feature', 'Customer Spotlight', 'Q&A Session', 'Live Replay',
    'Announcement/Update', 'Teaser/Preview',
    
    # 娱乐类 (5个)
    'Meme/Trend', 'Fun Fact', 'Day in Life', 'Process/Timelapse',
    'Transformation'
]

# 技术规格
TECH_SPECS = {
    'formats': ['.aep (After Effects)', '.prproj (Premiere)', '.mov', '.mp4'],
    'resolutions': {
        'vertical': '1080x1920',
        'horizontal': '1920x1080',
        'square': '1080x1080'
    },
    'frame_rate': '30fps',
    'color_space': 'Rec. 709'
}

# 定价
PRICING = {
    'basic_pack': {
        'templates': 10,
        'price': 29,
        'features': ['基础模板', '1080p分辨率', 'After Effects项目文件']
    },
    'pro_pack': {
        'templates': 25,
        'price': 59,
        'features': ['精选模板', '所有分辨率', 'AE + Premiere', '字体文件', '使用教程']
    },
    'complete_pack': {
        'templates': 50,
        'price': 99,
        'features': ['全部模板', '终身更新', '商业授权', '优先支持', '定制服务9折']
    },
    'custom': {
        'price_per_template': 150,
        'min_order': 3
    }
}

# 收入预测
def calculate_revenue():
    """计算收入预测"""
    monthly_sales = {
        'basic': 20,
        'pro': 15,
        'complete': 5,
        'custom': 2
    }
    
    revenue = {
        'basic': monthly_sales['basic'] * PRICING['basic_pack']['price'],
        'pro': monthly_sales['pro'] * PRICING['pro_pack']['price'],
        'complete': monthly_sales['complete'] * PRICING['complete_pack']['price'],
        'custom': monthly_sales['custom'] * 3 * PRICING['custom']['price_per_template']
    }
    
    total_monthly = sum(revenue.values())
    
    return {
        'monthly': total_monthly,
        'yearly': total_monthly * 12,
        'breakdown': revenue
    }

# 销售平台
PLATFORMS = [
    'VideoHive (Envato)',
    'Motion Array',
    'Artlist',
    'Gumroad',
    'Creative Market',
    'Etsy'
]

# 营销推广策略
MARKETING = {
    'content_marketing': {
        'youtube': '发布模板预览视频',
        'instagram': '展示模板效果',
        'tiktok': '快速制作教程',
        'behance': '完整项目展示'
    },
    'paid_ads': {
        'facebook': '目标: 视频创作者',
        'instagram': '目标: 社媒运营',
        'youtube': '目标: 内容创作者'
    },
    'partnerships': {
        'influencers': '赠送模板换取推广',
        'agencies': '批量采购折扣'
    }
}

if __name__ == '__main__':
    print("🎬 Social Media Video Templates Pack")
    print(f"模板总数: {len(FULL_TEMPLATE_LIST)}")
    print(f"类别: 电商({15}) + 品牌({10}) + 教育({10}) + 互动({10}) + 娱乐({5})")
    
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
    print(f"\n收入构成:")
    for key, value in revenue['breakdown'].items():
        print(f"  {key}: €{value}")
