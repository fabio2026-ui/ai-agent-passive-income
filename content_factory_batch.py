#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
艾琳人设内容工厂 - 批量生成器
"""

import os
import random
from datetime import datetime

# 艾琳人设基础信息
AILEEN_PROFILE = {
    "name": "艾琳",
    "age": 26,
    "education": "浙江大学信息管理与信息系统",
    "job": "AI内容创作者 / 数字游民",
    "income": "月收入3-5万",
    "mbti": "ENTJ",
    "traits": ["执行力强", "学习快", "逻辑清晰", "不装X"],
    "catchphrases": [
        "别问，问就是干！",
        "先完成再完美，先发布再优化",
        "这个坑我踩过，你别踩了",
        "工具就是生产力，效率就是生命"
    ],
    "interests": ["瑜伽", "摄影", "科幻小说", "独立游戏", "咖啡馆探店"],
    "pet": "英短蓝猫'代码'",
    "location": "上海"
}

# 具体内容数据
AI_SIDELINE_TOPICS = [
    {"skill": "AI绘画", "tool": "Midjourney", "method1": "接头像定制单", "method2": "卖prompt模板", "method3": "教小白入门课", "income": "1.5-2万", "pitfall1": "别一上来就报高价", "pitfall2": "要学点审美基础", "target_audience": "有审美基础的设计爱好者", "advice": "先自己玩一个月，积累作品再变现"},
    {"skill": "AI写作", "tool": "ChatGPT", "method1": "写公众号爆款", "method2": "接商业文案", "method3": "做小红书代运营", "income": "2-3万", "pitfall1": "别直接用AI输出", "pitfall2": "要懂平台调性", "target_audience": "文字功底好的内容创作者", "advice": "先做自己账号练手"},
    {"skill": "AI视频", "tool": "Runway", "method1": "做短视频账号", "method2": "接品牌广告", "method3": "卖剪辑模板", "income": "2-4万", "pitfall1": "别追求完美", "pitfall2": "更新频率很重要", "target_audience": "会剪辑的创作者", "advice": "一周至少发3条"},
    {"skill": "AI咨询", "tool": "Claude", "method1": "企业AI培训", "method2": "个人咨询", "method3": "社群运营", "income": "3-5万", "pitfall1": "要有案例积累", "pitfall2": "别什么都接", "target_audience": "有行业经验的专业人士", "advice": "先免费帮朋友做几个案例"},
    {"skill": "AI配音", "tool": "ElevenLabs", "method1": "接有声书", "method2": "短视频配音", "method3": "广告配音", "income": "1-2万", "pitfall1": "设备要投入", "pitfall2": "版权问题要注意", "target_audience": "声音条件好的人", "advice": "先练气息和发声"},
    {"skill": "AI编程", "tool": "Cursor", "method1": "接外包项目", "method2": "做SaaS工具", "method3": "教编程课", "income": "3-6万", "pitfall1": "技术要扎实", "pitfall2": "沟通成本很高", "target_audience": "有编程基础的开发者", "advice": "从小项目开始"},
    {"skill": "AI设计", "tool": "Figma+AI", "method1": "接UI设计单", "method2": "卖设计模板", "method3": "做品牌设计", "income": "2-4万", "pitfall1": "审美比工具重要", "pitfall2": "客户沟通很耗时", "target_audience": "有设计基础的人", "advice": "作品积累是第一位的"},
    {"skill": "AI翻译", "tool": "DeepL", "method1": "接翻译单", "method2": "做字幕组", "method3": "出海内容本地化", "income": "1-3万", "pitfall1": "小语种更值钱", "pitfall2": "需要专业校对", "target_audience": "外语好的人", "advice": "专注一个细分领域"},
    {"skill": "AI数据分析", "tool": "ChatGPT Code", "method1": "接数据报告", "method2": "做商业分析", "method3": "培训企业", "income": "2-5万", "pitfall1": "统计学基础要扎实", "pitfall2": "解读比数据重要", "target_audience": "有数据分析经验的人", "advice": "多做几个行业报告练手"},
    {"skill": "AI教育", "tool": "Notion AI", "method1": "做知识付费", "method2": "一对一辅导", "method3": "做训练营", "income": "2-4万", "pitfall1": "内容要持续更新", "pitfall2": "学员维护很累", "target_audience": "有教学经验的老师", "advice": "先做一个免费社群测试"},
]

EFFICIENCY_TOOLS = [
    {"tool": "Notion", "use_case": "知识管理", "scenario1": "做周计划", "scenario2": "整理素材库", "scenario3": "项目管理", "time_saved": "每周省8小时", "cost_comparison": "免费版够用", "con1": "上手有门槛", "con2": "手机端略卡", "target": "需要知识管理的创作者", "advice": "先只用一个功能，别追求all in one"},
    {"tool": "Obsidian", "use_case": "笔记记录", "scenario1": "写每日复盘", "scenario2": "构建知识图谱", "scenario3": "本地存储", "time_saved": "找笔记省90%时间", "cost_comparison": "完全免费", "con1": "颜值一般", "con2": "插件多容易迷失", "target": "重度笔记用户", "advice": "从Daily Notes开始"},
    {"tool": "Raycast", "use_case": "效率启动", "scenario1": "快捷搜索", "scenario2": "窗口管理", "scenario3": "快捷指令", "time_saved": "每天省1小时", "cost_comparison": "免费版够用", "con1": "Mac only", "con2": "插件质量参差", "target": "Mac用户", "advice": "先学快捷键"},
    {"tool": "Arc浏览器", "use_case": "网页管理", "scenario1": "分标签管理", "scenario2": "画中画视频", "scenario3": "自动归档", "time_saved": "找网页省50%时间", "cost_comparison": "免费", "con1": "习惯养成期长", "con2": "部分网站兼容差", "target": "重度网页用户", "advice": "一周强迫自己只用Arc"},
    {"tool": "Linear", "use_case": "项目管理", "scenario1": "看板管理", "scenario2": "Issue追踪", "scenario3": "团队协作", "time_saved": "开会省50%时间", "cost_comparison": "小团队免费", "con1": "英文界面", "con2": "国内访问慢", "target": "技术团队", "advice": "从个人项目开始试"},
    {"tool": "CleanShot", "use_case": "截图录屏", "scenario1": "标注截图", "scenario2": "滚动截长图", "scenario3": "录屏带光标", "time_saved": "处理截图省70%时间", "cost_comparison": "买断29美元", "con1": "Mac only", "con2": "有点贵", "target": "常截图的人", "advice": "先用免费版试试"},
    {"tool": "Rectangle", "use_case": "窗口管理", "scenario1": "分屏", "scenario2": "快捷键", "scenario3": "多显示器", "time_saved": "每天省30分钟", "cost_comparison": "免费开源", "con1": "功能简单", "con2": "界面朴素", "target": "大屏用户", "advice": "记熟快捷键"},
    {"tool": "Grammarly", "use_case": "英文写作", "scenario1": "邮件检查", "scenario2": "文案润色", "scenario3": "语法纠错", "time_saved": "校对省90%时间", "cost_comparison": "免费版够用", "con1": "中文支持差", "con2": "有时会错改", "target": "常写英文的人", "advice": "别完全依赖，自己也要懂语法"},
    {"tool": "Canva", "use_case": "快速作图", "scenario1": "做封面", "scenario2": "做海报", "scenario3": "做PPT", "time_saved": "作图省80%时间", "cost_comparison": "免费版够用", "con1": "高级功能付费", "con2": "模板易撞车", "target": "非设计师", "advice": "收藏几个模板反复用"},
    {"tool": "Flomo", "use_case": "灵感记录", "scenario1": "碎片记录", "scenario2": "微信输入", "scenario3": "标签管理", "time_saved": "记录灵感0 friction", "cost_comparison": "免费版够用", "con1": "功能简单", "con2": "导出麻烦", "target": "灵感多的人", "advice": "配合微信随时记"},
    {"tool": "Anki", "use_case": "记忆学习", "scenario1": "背单词", "scenario2": "记概念", "scenario3": "复习专业知识", "time_saved": "记忆效率提升3倍", "cost_comparison": "免费", "con1": "界面丑", "con2": "坚持难", "target": "需要记忆大量内容的人", "advice": "每天10分钟，别贪多"},
    {"tool": "Zapier", "use_case": "自动化", "scenario1": "自动同步", "scenario2": "触发工作流", "scenario3": "跨应用联动", "time_saved": "每月省20小时", "cost_comparison": "免费版100 task/月", "con1": "复杂流程难搭建", "con2": "高级功能贵", "target": "重复任务多的人", "advice": "从最简单的自动化开始"},
    {"tool": "Readwise", "use_case": "阅读管理", "scenario1": "高亮同步", "scenario2": "每日回顾", "scenario3": "笔记整合", "time_saved": "复习省80%时间", "cost_comparison": "8美元/月", "con1": "国内书源支持差", "con2": "有点贵", "target": "阅读量大的人", "advice": "先连Kindle试试"},
    {"tool": "Timing", "use_case": "时间追踪", "scenario1": "自动记录", "scenario2": "产出分析", "scenario3": "专注统计", "time_saved": "了解时间去向", "cost_comparison": "买断制", "con1": "Mac only", "con2": "隐私顾虑", "target": "想管理时间的人", "advice": "先看一周数据再优化"},
    {"tool": "Cold Turkey", "use_case": "专注阻断", "scenario1": "屏蔽网站", "scenario2": "定时锁机", "scenario3": "应用限制", "time_saved": "专注时间翻倍", "cost_comparison": "一次买断", "con1": "容易破解", "con2": "极端了点", "target": "容易分心的人", "advice": "别设置太严格，循序渐进"},
]

DIGITAL_NOMAD_TOPICS = [
    {"location": "大理", "income": "月入3万", "num": 12, "before": "996大厂", "after": "数字游民", "life1": "每天自然醒", "life2": "下午去咖啡馆工作", "life3": "周末环洱海", "schedule": "深度工作4小时/天", "income_structure": "AI咨询60%+内容创作30%+被动收入10%", "negative1": "收入不稳定", "negative2": "社交圈变小", "advice": "先存够6个月生活费再辞职"},
    {"location": "清迈", "income": "月入2.5万", "num": 8, "before": "深圳互联网", "after": "旅居生活", "life1": "租别墅只要3000/月", "life2": "每天按摩", "life3": "吃遍夜市", "schedule": "上午工作，下午玩", "income_structure": "远程工作50%+自由职业50%", "negative1": "网络不稳定", "negative2": "语言不通", "advice": "先办旅游签试住一个月"},
    {"location": "巴厘岛", "income": "月入4万", "num": 15, "before": "上海咨询", "after": "海边办公", "life1": "别墅带泳池", "life2": "潜水冲浪", "life3": "数字游民社区", "schedule": "早6-10工作，避开热天", "income_structure": "咨询服务70%+课程30%", "negative1": "雨季很长", "negative2": "医疗条件差", "advice": "买好国际医疗保险"},
    {"location": "杭州", "income": "月入3.5万", "num": 6, "before": "北京大厂", "after": "半退休", "life1": "西湖边喝茶", "life2": "随时见朋友", "life3": "自己做饭", "schedule": "上午10点开工", "income_structure": "AI工具50%+投资30%+咨询20%", "negative1": "没有同事", "negative2": "容易躺平", "advice": "加入共创空间保持社交"},
    {"location": "成都", "income": "月入2.8万", "num": 10, "before": "广州广告", "after": "慢生活", "life1": "茶馆工作", "life2": "火锅自由", "life3": "看大熊猫", "schedule": "弹性时间", "income_structure": "内容创作60%+代运营40%", "negative1": "节奏太慢", "negative2": "项目机会少", "advice": "保持一线信息敏感度"},
    {"location": "东京", "income": "月入5万", "num": 18, "before": "国内996", "after": "海外远程", "life1": "咖啡文化", "life2": "周末短途", "life3": "高效工作", "schedule": "严格9-5", "income_structure": "日本客户80%+国内20%", "negative1": "生活成本高", "negative2": "租房麻烦", "advice": "学好日语再长住"},
    {"location": "Lisbon", "income": "月入3.2万", "num": 20, "before": "金融民工", "after": "欧洲旅居", "life1": "阳光海滩", "life2": "历史老城", "life3": "数字游民天堂", "schedule": "分早晚两段工作", "income_structure": "投资收入50%+自由职业50%", "negative1": "时差痛苦", "negative2": "bureaucracy", "advice": "先申请D7签证"},
    {"location": "厦门", "income": "月入2.6万", "num": 5, "before": "福州国企", "after": "海边办公", "life1": "鼓浪屿散步", "life2": "海鲜自由", "life3": "气候宜人", "schedule": "上午深工作", "income_structure": "AI副业70%+投资30%", "negative1": "房价高", "negative2": "夏天台风", "advice": "淡季来租更便宜"},
]

HASHTAGS_POOL = {
    "AI副业": ["#AI副业", "#搞钱", "#副业", "#数字游民", "#自由职业", "#创业", "#赚钱", "#ChatGPT", "#AI工具", "#效率提升", "#职场", "#辞职", "#不想上班"],
    "效率工具": ["#效率工具", "#生产力", "#时间管理", "#数字游民", "#打工人必备", "#效率提升", "#工具推荐", "#App推荐", "#Mac软件", "#工作流", "#自动化", "#自律"],
    "数字游民生活": ["#数字游民", "#旅居生活", "#自由职业", "#远程工作", "#生活方式", "#旅居", "#大厂裸辞", "#不上班", "#慢生活", "#地理套利", "#FIRE", "#极简生活"]
}

def get_random_catchphrase():
    return random.choice(AILEEN_PROFILE["catchphrases"])

def generate_xiaohongshu_ai_sidelong(topic, hashtags):
    """生成AI副业类小红书帖子"""
    title_formats = [
        "AI副业月入3万｜{skill}保姆级教程",
        "下班2小时｜用{tool}搞钱详细攻略",
        "{income}坦白局｜我的AI副业收入结构",
        "搞钱必看｜{skill}从0到1变现路径",
        "不想上班？试试{skill}月入过万"
    ]
    title = random.choice(title_formats).format(**topic)
    
    content = f"""姐妹们，今天坦白局

去年我还是996大厂产品经理，现在月入3万+，时间自由

很多人问我怎么做的，今天就分享我的{topic['skill']}变现之路

✅ 我的变现路径：
• {topic['method1']}
• {topic['method2']}
• {topic['method3']}

⏱️ 投入产出：
每天2小时，月入{topic['income']}

⚠️ 踩过的坑：
• {topic['pitfall1']}
• {topic['pitfall2']}

🎯 适合人群：
{topic['target_audience']}

📌 起步建议：
{topic['advice']}

{get_random_catchphrase()}

{hashtags}"""
    return title, content

def generate_xiaohongshu_efficiency(topic, hashtags):
    """生成效率工具类小红书帖子"""
    num = random.randint(3, 10)
    title_formats = [
        f"被问爆了的{topic['tool']}｜效率提升10倍",
        f"{topic['tool']}深度测评｜这{num}个功能90%的人不知道",
        f"省{num}小时/月｜{topic['tool']}自动化工作流",
        f"大厂离职后才敢说的{topic['tool']}真相",
        f"为什么高手都在用{topic['tool']}?"
    ]
    title = random.choice(title_formats)
    
    content = f"""被问爆了的工具，今天摊牌了

最近一直在用{topic['tool']}做{topic['use_case']}，不得不说真的香！

✅ 我的使用场景：
• {topic['scenario1']}
• {topic['scenario2']}
• {topic['scenario3']}

⏱️ 省时效果：
{topic['time_saved']}

💰 成本对比：
{topic['cost_comparison']}

⚠️ 缺点也要说：
• {topic['con1']}
• {topic['con2']}

🎯 适合谁用：
{topic['target']}

📌 上手建议：
{topic['advice']}

记得收藏，下次找不到别怪我没提醒

{hashtags}"""
    return title, content

def generate_xiaohongshu_nomadic(topic, hashtags):
    """生成数字游民生活类小红书帖子"""
    title_formats = [
        "{location}数字游民｜{income}的生活成本",
        "不上班第{num}天｜我的真实状态",
        "大厂裸辞｜我后悔了吗？",
        "数字游民{num}年｜{topic}经验分享",
        "旅居{location}｜边工作边生活太爽了"
    ]
    title = random.choice(title_formats).format(
        location=topic['location'], 
        income=topic['income'], 
        num=topic['num'],
        topic="旅居" if random.random() > 0.5 else "远程工作"
    )
    
    content = f"""不上班第{topic['num']}个月，来说点真心话

从{topic['before']}到{topic['after']}，我的生活发生了翻天覆地的变化

✅ 现在的生活：
• {topic['life1']}
• {topic['life2']}
• {topic['life3']}

⏱️ 时间管理：
{topic['schedule']}

💰 收入结构：
{topic['income_structure']}

⚠️ 不好的地方：
• {topic['negative1']}
• {topic['negative2']}

🎯 给想尝试的人：
{topic['advice']}

{get_random_catchphrase()}

{hashtags}"""
    return title, content

def generate_xiaohongshu_post(category, topic, index):
    """生成一篇小红书帖子"""
    hashtags_list = HASHTAGS_POOL[category]
    selected_hashtags = random.sample(hashtags_list, min(8, len(hashtags_list)))
    hashtags = " ".join(selected_hashtags)
    
    if category == "AI副业":
        title, content = generate_xiaohongshu_ai_sidelong(topic, hashtags)
    elif category == "效率工具":
        title, content = generate_xiaohongshu_efficiency(topic, hashtags)
    else:
        title, content = generate_xiaohongshu_nomadic(topic, hashtags)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"post_{timestamp}_{index:03d}.md"
    
    full_content = f"""# {title}

**发布时间**: {datetime.now().isoformat()}
**类别**: {category}
**状态**: ready

---

{content}

---

*由艾琳小红书机器人生成*
"""
    return filename, full_content

def generate_douyin_script(category, topic, index):
    """生成抖音视频脚本"""
    hooks = [
        "别滑走！这个AI工具让我月入3万",
        "大厂裸辞第X个月，来说点实话",
        "被问爆了的效率工具，今天摊牌",
        "这才是AI的正确打开方式",
        "离职后才敢说的真相",
        "普通人如何用AI搞钱",
        "这个工具让我每天省2小时",
        "不想上班？试试这个",
    ]
    
    bgms = ["轻快的电子乐", "治愈系纯音乐", "节奏感强的BGM", "轻松的vlog音乐", "励志向音乐"]
    
    script = f"""# 抖音脚本 - {category} #{index+1}

**主题**: {topic.get('skill', topic.get('tool', topic.get('location', '分享')))}
**时长**: 15-60秒
**风格**: 艾琳人设 - 直接、实用、不装

---

【开头-3秒】
{random.choice(hooks)}

【正文-30秒】
（根据具体内容填充）

【转折-10秒】
很多人不知道的是...

【结尾-5秒】
点关注，别错过更多干货

【字幕/文案】
#AI副业 #效率工具 #数字游民

【BGM建议】
{random.choice(bgms)}

【拍摄提示】
建议实拍+录屏结合

---

*由艾琳抖音机器人生成*
"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"script_{timestamp}_{index:03d}.md"
    return filename, script

def generate_tweet(category, topic, index):
    """生成Twitter内容"""
    tweet_templates = [
        "去年这时候我还在996，现在月入3万时间自由。\n\n秘诀就是：{secret}\n\n别问，问就是干！\n\n{hashtags}",
        "刚用{tool}完成一个项目，省了整整两天。\n\n工具就是生产力，效率就是生命。\n\n你用什么工具？\n\n{hashtags}",
        "很多人问我{question}\n\n直接说答案：{answer}\n\n这个坑我踩过，你别踩了。\n\n{hashtags}",
        "数字游民第{num}个月复盘：\n\n✅ {good}\n❌ {bad}\n💡 {lesson}\n\n{hashtags}",
        "先完成再完美，先发布再优化。\n\n这是我做{thing}的核心心法。\n\n太多人卡在第一步。\n\n{hashtags}",
    ]
    
    secrets = ["选对赛道 + 持续输出", "用好AI工具", "把时间花在刀刃上", "建立被动收入", "专注一个领域"]
    answers = ["可以", "值得", "不难", "有方法", "选A"]
    goods = ["收入翻2倍", "时间自由", "身体变好了", "认识了很多有趣的人"]
    bads = ["社交变少了", "收入不稳定", "容易焦虑", "需要很强的自律"]
    lessons = ["存钱很重要", "健康第一", "保持学习", "别追求完美"]
    things = ["内容创作", "副业", "远程工作", "AI应用", "自由职业"]
    hashtags_pool = ["#DigitalNomad", "#AI", "#SideHustle", "#Productivity", "#RemoteWork", "#Entrepreneur", "#AI工具", "#效率"]
    
    template = random.choice(tweet_templates)
    
    content = template.format(
        secret=random.choice(secrets),
        tool=topic.get('tool', 'AI'),
        question="XX值不值得做？",
        answer=random.choice(answers),
        num=random.randint(3, 20),
        good=random.choice(goods),
        bad=random.choice(bads),
        lesson=random.choice(lessons),
        thing=random.choice(things),
        hashtags=" ".join(random.sample(hashtags_pool, 4))
    )
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"tweet_{timestamp}_{index:03d}.md"
    
    tweet = f"""# Twitter - {category} #{index+1}

**发布时间**: {datetime.now().isoformat()}
**类别**: {category}

---

{content}

---

*由艾琳Twitter机器人生成*
"""
    return filename, tweet

def main():
    print("🚀 艾琳内容工厂启动！")
    
    # 生成50篇小红书帖子
    print("\n📕 正在生成50篇小红书帖子...")
    xhs_count = 0
    for i in range(50):
        category = random.choice(["AI副业", "效率工具", "数字游民生活"])
        if category == "AI副业":
            topic = AI_SIDELINE_TOPICS[i % len(AI_SIDELINE_TOPICS)]
        elif category == "效率工具":
            topic = EFFICIENCY_TOOLS[i % len(EFFICIENCY_TOOLS)]
        else:
            topic = DIGITAL_NOMAD_TOPICS[i % len(DIGITAL_NOMAD_TOPICS)]
        
        filename, content = generate_xiaohongshu_post(category, topic, i)
        filepath = os.path.join("/root/ai-empire/xiaohongshu/batch_50", filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        xhs_count += 1
        if (i + 1) % 10 == 0:
            print(f"  ✓ 已生成 {i+1}/50 篇")
    
    # 生成20个抖音脚本
    print("\n📱 正在生成20个抖音视频脚本...")
    dy_count = 0
    for i in range(20):
        category = random.choice(["AI副业", "效率工具", "数字游民生活"])
        if category == "AI副业":
            topic = AI_SIDELINE_TOPICS[i % len(AI_SIDELINE_TOPICS)]
        elif category == "效率工具":
            topic = EFFICIENCY_TOOLS[i % len(EFFICIENCY_TOOLS)]
        else:
            topic = DIGITAL_NOMAD_TOPICS[i % len(DIGITAL_NOMAD_TOPICS)]
        
        filename, content = generate_douyin_script(category, topic, i)
        filepath = os.path.join("/root/ai-empire/douyin/batch_20", filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        dy_count += 1
        if (i + 1) % 5 == 0:
            print(f"  ✓ 已生成 {i+1}/20 个")
    
    # 生成20条Twitter
    print("\n🐦 正在生成20条Twitter内容...")
    tw_count = 0
    for i in range(20):
        category = random.choice(["AI副业", "效率工具", "数字游民生活"])
        if category == "AI副业":
            topic = AI_SIDELINE_TOPICS[i % len(AI_SIDELINE_TOPICS)]
        elif category == "效率工具":
            topic = EFFICIENCY_TOOLS[i % len(EFFICIENCY_TOOLS)]
        else:
            topic = DIGITAL_NOMAD_TOPICS[i % len(DIGITAL_NOMAD_TOPICS)]
        
        filename, content = generate_tweet(category, topic, i)
        filepath = os.path.join("/root/ai-empire/twitter/batch_20", filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        tw_count += 1
        if (i + 1) % 5 == 0:
            print(f"  ✓ 已生成 {i+1}/20 条")
    
    print("\n" + "="*50)
    print("✅ 内容工厂批量生成完成！")
    print(f"📕 小红书帖子: {xhs_count} 篇")
    print(f"📱 抖音脚本: {dy_count} 个")
    print(f"🐦 Twitter内容: {tw_count} 条")
    print(f"📊 总计: {xhs_count + dy_count + tw_count} 条")
    print("="*50)

if __name__ == "__main__":
    main()
