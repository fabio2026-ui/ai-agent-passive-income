#!/usr/bin/env python3
"""
内容工厂 - 批量生成所有项目的内容资产
为10个垂直品类生成视频脚本、小红书帖子、产品图Prompt
"""

import sys
sys.path.insert(0, '/root/.openclaw/workspace/shared_intel')

from intel_hub import get_intel, set_intel
from datetime import datetime
import json

class ContentFactory:
    """内容工厂 - 批量生产"""
    
    PROJECTS = {
        "yoga_socks": {"name": "瑜伽袜", "emoji": "🧘", "hook": "不再滑倒", "benefit": "稳定抓地，保护关节"},
        "pet_grooming": {"name": "宠物美容手套", "emoji": "🐕", "hook": "撸狗顺便除毛", "benefit": "宠物享受，地板干净"},
        "sleep_mask": {"name": "真丝眼罩", "emoji": "😴", "hook": "秒入睡神器", "benefit": "深度睡眠，告别黑眼圈"},
        "kitchen_chopper": {"name": "多功能切菜器", "emoji": "🥒", "hook": "5秒切一盘", "benefit": "告别切手，效率翻倍"},
        "face_roller": {"name": "玉石滚轮", "emoji": "✨", "hook": "早起不水肿", "benefit": "V脸提拉，促进吸收"},
        "desk_organizer": {"name": "桌面收纳架", "emoji": "🖥️", "hook": "桌面瞬间干净", "benefit": "效率提升，心情变好"},
        "resistance_bands": {"name": "阻力带套装", "emoji": "💪", "hook": "随时随地健身", "benefit": "练遍全身，便携便宜"},
        "baby_bibs": {"name": "防水围兜", "emoji": "👶", "hook": "吃饭不再脏", "benefit": "一擦就净，妈妈省心"},
        "car_organizer": {"name": "车载收纳盒", "emoji": "🚗", "hook": "车内不再乱", "benefit": "随手可取，安全第一"},
        "plant_tools": {"name": "园艺工具套装", "emoji": "🌱", "hook": "绿植不再死", "benefit": "科学养护，满屋生机"},
    }
    
    def generate_tiktok_script(self, project_id: str) -> dict:
        """生成TikTok视频脚本"""
        p = self.PROJECTS[project_id]
        
        return {
            "hook_3s": f"{p['emoji']} {p['hook']}！后悔没早买！",
            "problem": "之前总是[具体痛点]，太烦了",
            "solution": f"直到我发现这个{p['name']}，{p['benefit']}",
            "demo": "看，就这样用，超简单",
            "cta": "链接在bio，现在下单有优惠！",
            "hashtags": ["#TikTokMadeMeBuyIt", "#AmazonFinds", "#MustHave", f"#{project_id}", "#LifeHack"],
            "duration": "30-45秒",
            "music": "trending sound - upbeat"
        }
    
    def generate_xiaohongshu_post(self, project_id: str) -> dict:
        """生成小红书帖子"""
        p = self.PROJECTS[project_id]
        
        titles = [
            f"{p['emoji']} 挖到宝了！这个{p['name']}真的{p['hook']}",
            f"姐妹们！{p['benefit']}的秘密武器找到了",
            f"用了{p['name']}一个月，来交作业了",
            f"{p['emoji']} 被问爆的{p['name']}，链接来了！",
        ]
        
        content = f"""
{p['emoji']} {p['hook']}！{p['benefit']}

之前[具体痛点场景]，试过很多方法都不行
直到朋友推荐了这个{p['name']}

✨ 使用感受：
• [具体优点1]
• [具体优点2]  
• [具体优点3]

💰 价格：XX元（性价比超高）
🔗 购买方式：评论区/私信

{p['emoji']} 小贴士：
[使用技巧]

#好物分享 #{project_id} #生活好物 #种草 #实用好物
"""
        
        return {
            "titles": titles,
            "content": content.strip(),
            "images_needed": 6,
            "image_types": ["产品全景", "使用场景", "细节特写", "前后对比", "包装展示", "价格截图"]
        }
    
    def generate_midjourney_prompt(self, project_id: str) -> str:
        """生成Midjourney产品图Prompt"""
        prompts = {
            "yoga_socks": "professional product photography, yoga grip socks on wooden floor, soft natural lighting, minimalist background, cream and sage green color palette, lifestyle aesthetic, high-end feel, 8k --ar 3:4 --style raw",
            "pet_grooming": "product photography, silicone pet grooming glove with soft bristles, held in hand with golden retriever fur, warm lighting, cozy home background, pet lover aesthetic, professional --ar 3:4 --style raw",
            "sleep_mask": "luxury product shot, silk sleep mask on white bedding with lavender flowers, soft morning light, spa-like atmosphere, blush pink and white tones, premium feel --ar 3:4 --style raw",
            "kitchen_chopper": "modern kitchen product photo, vegetable chopper with fresh vegetables, clean white marble countertop, bright natural light, organized aesthetic, food photography style --ar 3:4 --style raw",
            "face_roller": "beauty product photography, jade face roller on vanity with skincare products, soft diffused lighting, rose gold accents, luxury spa aesthetic, instagram worthy --ar 3:4 --style raw",
            "desk_organizer": "minimalist office setup, bamboo desk organizer with notebooks and plants, clean aesthetic, natural lighting, productivity vibe, organized workspace --ar 3:4 --style raw",
            "resistance_bands": "fitness product shot, colorful resistance bands set on yoga mat, gym background, energetic lighting, active lifestyle aesthetic, workout motivation --ar 3:4 --style raw",
            "baby_bibs": "cute baby product photography, waterproof silicone bib with food pattern, on high chair tray, soft pastel colors, parenting aesthetic, clean and modern --ar 3:4 --style raw",
            "car_organizer": "car interior product shot, seat back organizer with items in pockets, clean car interior, natural daylight, organized travel aesthetic, practical design --ar 3:4 --style raw",
            "plant_tools": "botanical product photography, gardening tool set with potted plants, terracotta pots, natural sunlight, indoor jungle aesthetic, plant parent vibe --ar 3:4 --style raw",
        }
        return prompts.get(project_id, "product photography, professional lighting, minimalist background --ar 3:4")
    
    def generate_amazon_listing(self, project_id: str) -> dict:
        """生成Amazon产品文案"""
        p = self.PROJECTS[project_id]
        
        return {
            "title_template": f"[Brand] {p['name']} - {p['benefit']} | Premium Quality | [Key Feature] | Perfect for [Target User]",
            "bullet_points": [
                f"✅ {p['benefit']} - Experience the difference with our premium {p['name'].lower()}",
                f"✅ Premium Quality Materials - Built to last with high-grade, durable construction",
                f"✅ Easy to Use - Intuitive design, no learning curve required",
                f"✅ Perfect Gift Idea - Loved by [target users], comes in beautiful packaging",
                f"✅ Risk-Free Purchase - 30-day money back guarantee, your satisfaction is our priority"
            ],
            "description": f"""
<h2>Transform Your Daily Routine with {p['name']}</h2>
<p>Tired of [pain point]? Our {p['name']} is designed to {p['benefit'].lower()}, making your life easier and more enjoyable.</p>

<h3>Why Choose Our {p['name']}?</h3>
<ul>
<li>Premium quality that lasts</li>
<li>Thoughtfully designed for maximum convenience</li>
<li>Trusted by thousands of happy customers</li>
</ul>

<h3>Perfect For:</h3>
<p>[Target audience description]</p>
""",
            "search_terms": p['name'].lower().split() + ["premium", "quality", "best", "2026"]
        }
    
    def generate_all_content(self) -> dict:
        """为所有项目生成全套内容"""
        all_content = {}
        
        for project_id in self.PROJECTS.keys():
            all_content[project_id] = {
                "tiktok_script": self.generate_tiktok_script(project_id),
                "xiaohongshu_post": self.generate_xiaohongshu_post(project_id),
                "midjourney_prompt": self.generate_midjourney_prompt(project_id),
                "amazon_listing": self.generate_amazon_listing(project_id),
                "generated_at": datetime.now().isoformat()
            }
        
        # 保存到共享库
        set_intel("creative", "content_library", all_content)
        
        return all_content
    
    def print_content_summary(self):
        """打印内容摘要"""
        content = get_intel("creative", "content_library")
        
        if not content:
            print("⚠️ 内容库为空，先生成内容")
            return
        
        print("📚 内容库资产清单")
        print("=" * 60)
        
        for project_id, assets in content.items():
            p = self.PROJECTS.get(project_id, {})
            print(f"\n{p.get('emoji', '📦')} {p.get('name', project_id)}")
            print(f"   ✅ TikTok脚本: {assets['tiktok_script']['hook_3s'][:30]}...")
            print(f"   ✅ 小红书标题: {assets['xiaohongshu_post']['titles'][0][:30]}...")
            print(f"   ✅ Midjourney: {assets['midjourney_prompt'][:40]}...")
            print(f"   ✅ Amazon文案: {assets['amazon_listing']['title_template'][:40]}...")
        
        print(f"\n{'=' * 60}")
        print(f"📊 总计: {len(content)} 个项目 × 4 种内容 = {len(content) * 4} 套资产")
        print("💾 已保存到: creative/content_library")


def main():
    factory = ContentFactory()
    
    print("🏭 内容工厂启动")
    print("=" * 60)
    
    # 生成所有内容
    all_content = factory.generate_all_content()
    
    print(f"✅ 已生成 {len(all_content)} 个项目的全套内容")
    print("\n📦 包含:")
    print("   • TikTok视频脚本（Hook+脚本+标签）")
    print("   • 小红书帖子（4个标题+正文+图片需求）")
    print("   • Midjourney产品图Prompt")
    print("   • Amazon产品Listing（标题+五点+描述）")
    
    # 打印摘要
    print()
    factory.print_content_summary()
    
    print("\n✅ 内容资产已就绪！随时可以取用。")


if __name__ == "__main__":
    main()
