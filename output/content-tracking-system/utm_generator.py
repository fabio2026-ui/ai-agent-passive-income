#!/usr/bin/env python3
"""
UTM参数生成器
用于为不同渠道、内容类型生成标准化的UTM参数
"""

from dataclasses import dataclass
from urllib.parse import urlencode, parse_qs, urlparse, urlunparse
from typing import Optional
import json

@dataclass
class UTMParams:
    """UTM参数数据结构"""
    source: str          # 流量来源 (tg, wechat, twitter, email, etc.)
    medium: str          # 媒介类型 (post, story, bio, ad, email, etc.)
    campaign: str        # 活动名称 (ai-tools-series, product-launch, etc.)
    content: Optional[str] = None  # 内容标识 (用于A/B测试)
    term: Optional[str] = None     # 关键词 (用于付费搜索)

class UTMGenerator:
    """UTM参数生成器"""
    
    # 预定义的渠道配置
    CHANNELS = {
        'telegram': {'source': 'tg', 'medium': 'post'},
        'telegram_story': {'source': 'tg', 'medium': 'story'},
        'telegram_bio': {'source': 'tg', 'medium': 'bio'},
        'wechat': {'source': 'wechat', 'medium': 'post'},
        'wechat_moments': {'source': 'wechat', 'medium': 'moments'},
        'twitter': {'source': 'twitter', 'medium': 'tweet'},
        'twitter_bio': {'source': 'twitter', 'medium': 'bio'},
        'email': {'source': 'email', 'medium': 'newsletter'},
        'email_drip': {'source': 'email', 'medium': 'drip'},
        'youtube': {'source': 'youtube', 'medium': 'video'},
        'youtube_desc': {'source': 'youtube', 'medium': 'description'},
        'reddit': {'source': 'reddit', 'medium': 'post'},
        'hacker_news': {'source': 'hackernews', 'medium': 'post'},
        'linkedin': {'source': 'linkedin', 'medium': 'post'},
        'facebook': {'source': 'facebook', 'medium': 'post'},
        'instagram': {'source': 'instagram', 'medium': 'bio'},
        'organic_search': {'source': 'google', 'medium': 'organic'},
        'paid_search': {'source': 'google', 'medium': 'cpc'},
        'display_ad': {'source': 'display', 'medium': 'banner'},
    }
    
    # 内容系列配置
    CAMPAIGNS = {
        'ai_tools_series': 'ai-tools-series',
        'case_studies': 'ai-case-studies',
        'tools_review': 'ai-tools-review',
        'governance': 'ai-governance',
        'implementation': 'ai-implementation',
        'support': 'ai-support',
        'advanced': 'ai-advanced',
        'strategy': 'ai-strategy',
        'product_launch': 'product-launch',
        'promotion': 'promotion',
    }
    
    def __init__(self, base_url: str = "https://telegra.ph"):
        self.base_url = base_url
    
    def generate(self, url: str, channel: str, campaign: str, 
                 content: Optional[str] = None,
                 term: Optional[str] = None) -> str:
        """
        为URL生成UTM参数
        
        Args:
            url: 目标URL
            channel: 渠道标识
            campaign: 活动名称
            content: A/B测试内容标识
            term: 关键词
        
        Returns:
            带UTM参数的完整URL
        """
        if channel not in self.CHANNELS:
            raise ValueError(f"未知渠道: {channel}. 可用渠道: {list(self.CHANNELS.keys())}")
        
        if campaign not in self.CAMPAIGNS:
            raise ValueError(f"未知活动: {campaign}. 可用活动: {list(self.CAMPAIGNS.keys())}")
        
        channel_config = self.CHANNELS[channel]
        campaign_value = self.CAMPAIGNS[campaign]
        
        utm_params = {
            'utm_source': channel_config['source'],
            'utm_medium': channel_config['medium'],
            'utm_campaign': campaign_value,
        }
        
        if content:
            utm_params['utm_content'] = content
        if term:
            utm_params['utm_term'] = term
        
        # 解析URL并添加UTM参数
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        query.update(utm_params)
        
        # 重建URL
        new_query = urlencode(query, doseq=True)
        return urlunparse(parsed._replace(query=new_query))
    
    def generate_ab_test_urls(self, url: str, channel: str, campaign: str,
                              variants: list[str]) -> dict[str, str]:
        """
        为A/B测试生成多个变体URL
        
        Args:
            url: 基础URL
            channel: 渠道
            campaign: 活动
            variants: 变体标识列表 (如 ['v1-control', 'v2-headline-a'])
        
        Returns:
            变体标识到URL的映射
        """
        return {
            variant: self.generate(url, channel, campaign, content=variant)
            for variant in variants
        }
    
    def batch_generate(self, urls: list[str], channel: str, campaign: str) -> list[str]:
        """批量生成UTM URL"""
        return [self.generate(url, channel, campaign) for url in urls]
    
    def get_tracking_summary(self) -> dict:
        """获取UTM系统配置摘要"""
        return {
            'channels': len(self.CHANNELS),
            'campaigns': len(self.CAMPAIGNS),
            'channel_list': list(self.CHANNELS.keys()),
            'campaign_list': list(self.CAMPAIGNS.keys()),
        }


def main():
    """CLI入口"""
    import sys
    
    generator = UTMGenerator()
    
    if len(sys.argv) < 4:
        print("用法: python utm_generator.py <url> <channel> <campaign> [content]")
        print("\n可用渠道:")
        for ch in generator.CHANNELS:
            print(f"  - {ch}")
        print("\n可用活动:")
        for camp in generator.CAMPAIGNS:
            print(f"  - {camp}")
        sys.exit(1)
    
    url = sys.argv[1]
    channel = sys.argv[2]
    campaign = sys.argv[3]
    content = sys.argv[4] if len(sys.argv) > 4 else None
    
    try:
        result = generator.generate(url, channel, campaign, content)
        print(result)
    except ValueError as e:
        print(f"错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
