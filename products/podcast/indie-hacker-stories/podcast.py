# Podcast System - Indie Hacker Stories
# 小七团队开发
# 独立开发者访谈播客

import json
from datetime import datetime, timedelta
from typing import List, Dict
import os

class PodcastSystem:
    """播客制作系统"""
    
    def __init__(self):
        self.episodes_file = 'episodes.json'
        self.guests_file = 'guests.json'
        self.sponsors_file = 'sponsors.json'
        
    def create_episode_template(self, episode_number: int, guest_name: str, guest_project: str) -> Dict:
        """创建单集播客模板"""
        
        episode = {
            'number': episode_number,
            'title': f'#{episode_number} {guest_name} - {guest_project}',
            'guest': guest_name,
            'project': guest_project,
            'date': datetime.now().isoformat(),
            'duration': '45-60分钟',
            'sections': []
        }
        
        # 开场 (5分钟)
        episode['sections'].append({
            'title': '开场介绍',
            'duration': '5分钟',
            'content': f'''
大家好，欢迎收听Indie Hacker Stories第{episode_number}期。

本期嘉宾: {guest_name}
项目: {guest_project}

今天我们将会聊:
- 项目的起源故事
- 从0到1的创业历程  
- 收入数据和商业模式
- 遇到的挑战和解决方案
- 给新手创业者的建议

让我们开始吧！
'''
        })
        
        # 背景故事 (10分钟)
        episode['sections'].append({
            'title': '背景故事',
            'duration': '10分钟',
            'questions': [
                '请介绍一下你自己和背景',
                f'{guest_project}是怎么开始的？最初的灵感来自哪里？',
                '你是从什么时候开始这个项目的？',
                '项目初期的团队构成是什么样的？'
            ]
        })
        
        # 产品构建 (10分钟)
        episode['sections'].append({
            'title': '产品构建',
            'duration': '10分钟',
            'questions': [
                '技术栈是什么？为什么选择这些技术？',
                'MVP花了多长时间开发？',
                '第一个版本的功能有多简单？',
                '你是如何决定哪些功能要开发，哪些要舍弃的？'
            ]
        })
        
        # 增长策略 (10分钟)
        episode['sections'].append({
            'title': '增长策略',
            'duration': '10分钟',
            'questions': [
                '你是如何获得第一批用户的？',
                '哪些营销渠道最有效？',
                '有没有试过失败的增长策略？',
                'SEO、内容营销、付费广告，哪个对你最有效？'
            ]
        })
        
        # 商业模式 (10分钟)
        episode['sections'].append({
            'title': '商业模式与收入',
            'duration': '10分钟',
            'questions': [
                f'{guest_project}的商业模式是什么？',
                '可以分享一下收入数据吗？ARR是多少？',
                '客户获取成本(CAC)和客户终身价值(LTV)大概是多少？',
                '盈利模式有变化过吗？'
            ]
        })
        
        # 挑战与教训 (10分钟)
        episode['sections'].append({
            'title': '挑战与教训',
            'duration': '10分钟',
            'questions': [
                '创业过程中最大的挑战是什么？',
                '如果可以重来，你会做什么不同的事？',
                '有没有差点让项目死掉的时刻？',
                '你学到的最重要的教训是什么？'
            ]
        })
        
        # 未来展望 (5分钟)
        episode['sections'].append({
            'title': '未来展望',
            'duration': '5分钟',
            'questions': [
                f'{guest_project}接下来的计划是什么？',
                '你对项目未来的愿景是什么？',
                '会给想开始类似项目的人什么建议？'
            ]
        })
        
        # 结束语 (5分钟)
        episode['sections'].append({
            'title': '结束语',
            'duration': '5分钟',
            'content': f'''
感谢{guest_name}今天的分享！

如果你想要了解更多关于{guest_project}的信息，可以访问他们的网站。

听众朋友们，如果你喜欢这期节目，请:
- 在Apple Podcasts给我们评分
- 订阅我们的频道
- 分享给其他独立开发者朋友

下期再见！
'''
        })
        
        return episode
    
    def generate_shownotes(self, episode: Dict) -> str:
        """生成Shownotes"""
        shownotes = f"""# {episode['title']}

## 节目信息
- 集数: 第{episode['number']}期
- 嘉宾: {episode['guest']}
- 项目: {episode['project']}
- 时长: {episode['duration']}
- 发布日期: {episode['date'][:10]}

## 内容概要
"""
        
        for section in episode['sections']:
            if 'questions' in section:
                shownotes += f"\n### {section['title']} ({section['duration']})\n"
                for q in section['questions']:
                    shownotes += f"- {q}\n"
            else:
                shownotes += f"\n### {section['title']}\n{section.get('content', '')}\n"
        
        shownotes += """
## 相关链接
- [嘉宾网站]
- [项目链接]
- [Twitter]

## 赞助商
感谢本期赞助商的支持！

## 联系我们
- 邮箱: hello@indiehackerstories.com
- Twitter: @IndieHackerCast
"""
        
        return shownotes

# 定价与变现
MONETIZATION = {
    'free_content': {
        'description': '免费收听所有节目',
        'revenue': '广告收入'
    },
    'premium': {
        'price': 9,  # EUR/月
        'features': [
            '无广告收听',
            '提前一周收听新节目',
            '完整Shownotes和链接',
            '嘉宾联系方式',
            '专属Discord社群',
            '月度AMA活动'
        ]
    },
    'sponsorship': {
        'rates': {
            'pre_roll': 500,    # 开场广告 EUR
            'mid_roll': 750,    # 中场广告 EUR
            'post_roll': 300    # 结束广告 EUR
        }
    }
}

# 收入预测
def calculate_revenue(subscribers: Dict, monthly_downloads: int) -> Dict:
    """计算收入预测"""
    
    # 订阅收入
    subscription_revenue = subscribers.get('premium', 0) * MONETIZATION['premium']['price']
    
    # 广告收入 (假设每千次下载 €20)
    ad_revenue = (monthly_downloads / 1000) * 20
    
    # 赞助收入 (假设每月2个赞助商)
    sponsorship_revenue = 2 * (MONETIZATION['sponsorship']['pre_roll'] + 
                               MONETIZATION['sponsorship']['mid_roll'])
    
    return {
        'monthly': {
            'subscription': subscription_revenue,
            'ads': ad_revenue,
            'sponsorship': sponsorship_revenue,
            'total': subscription_revenue + ad_revenue + sponsorship_revenue
        },
        'yearly': (subscription_revenue + ad_revenue + sponsorship_revenue) * 12
    }

# 目标嘉宾列表 (50个)
TARGET_GUESTS = [
    {'name': 'Pieter Levels', 'project': 'Nomad List', 'status': 'dream'},
    {'name': 'Danny Postma', 'project': 'HeadshotPro', 'status': 'dream'},
    {'name': 'Marc Lou', 'project': 'ShipFast', 'status': 'target'},
    {'name': 'Jon Yongfook', 'project': 'Bannerbear', 'status': 'target'},
    {'name': 'Arvid Kahl', 'project': 'FeedbackPanda', 'status': 'target'},
    {'name': 'Justin Welsh', 'project': 'Personal Brand', 'status': 'target'},
    {'name': 'Sahil Lavingia', 'project': 'Gumroad', 'status': 'dream'},
    {'name': 'Joel Gascoigne', 'project': 'Buffer', 'status': 'target'},
    {'name': 'Rob Walling', 'project': 'Drip', 'status': 'target'},
    {'name': 'Tyler Tringas', 'project': 'Storemapper', 'status': 'target'},
]

if __name__ == '__main__':
    # 生成示例播客
    podcast = PodcastSystem()
    episode = podcast.create_episode_template(1, 'Marc Lou', 'ShipFast')
    shownotes = podcast.generate_shownotes(episode)
    
    print(f"播客 #{episode['number']} 模板生成完成")
    print(f"标题: {episode['title']}")
    print(f"章节数: {len(episode['sections'])}")
    
    # 收入预测
    revenue = calculate_revenue(
        subscribers={'premium': 100},
        monthly_downloads=10000
    )
    print(f"\n💰 收入预测 (100付费订阅 + 10000月下载):")
    print(f"月度: €{revenue['monthly']['total']:.0f}")
    print(f"年度: €{revenue['yearly']:.0f}")
