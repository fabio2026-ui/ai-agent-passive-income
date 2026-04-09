#!/usr/bin/env python3
"""
AI脚本生成模块
自动生成口播文案
"""

import os
import json

class ScriptGenerator:
    """视频脚本生成器"""
    
    TEMPLATES = {
        "knowledge": {
            "name": "知识科普",
            "style": "专业、清晰、有干货",
            "structure": [
                "痛点引入（10秒）",
                "核心概念解释（30秒）",
                "3个关键要点（60秒）",
                "行动建议（20秒）",
                "互动结尾（10秒）"
            ]
        },
        "story": {
            "name": "故事叙述",
            "style": "生动、有画面感、情感共鸣",
            "structure": [
                "故事开头（15秒）",
                "情节发展（60秒）",
                "高潮转折（30秒）",
                "结局升华（20秒）",
                "互动结尾（5秒）"
            ]
        },
        "product": {
            "name": "产品推广",
            "style": "直接、有价值、促行动",
            "structure": [
                "价值承诺（10秒）",
                "问题描述（20秒）",
                "解决方案（40秒）",
                "用户见证（20秒）",
                "限时行动（20秒）"
            ]
        },
        "hotspot": {
            "name": "热点评论",
            "style": "犀利、有观点、引发讨论",
            "structure": [
                "热点概述（15秒）",
                "独特观点（45秒）",
                "深度分析（40秒）",
                "开放讨论（10秒）"
            ]
        }
    }
    
    def __init__(self):
        self.topic = ""
        self.style = "knowledge"
        
    def generate(self, topic: str, style: str = "knowledge", 
                 duration: int = 60) -> dict:
        """
        生成完整脚本
        
        Returns:
            {
                "title": "",
                "script": "",
                "hooks": [],
                "keywords": [],
                "bgm_suggestion": ""
            }
        """
        self.topic = topic
        self.style = style if style in self.TEMPLATES else "knowledge"
        
        template = self.TEMPLATES[self.style]
        
        # 生成标题
        titles = self._generate_titles(topic)
        
        # 生成脚本
        script = self._generate_script_content(topic, template, duration)
        
        # 生成钩子
        hooks = self._generate_hooks(topic)
        
        # 关键词
        keywords = self._extract_keywords(topic, script)
        
        return {
            "title": titles[0] if titles else f"关于{topic}的深度解析",
            "alt_titles": titles[1:] if len(titles) > 1 else [],
            "script": script,
            "hooks": hooks,
            "keywords": keywords,
            "bgm_suggestion": self._suggest_bgm(style),
            "style": template["name"],
            "structure": template["structure"]
        }
    
    def _generate_titles(self, topic: str) -> list:
        """生成多个标题选项"""
        templates = [
            f"{topic}的真相，90%的人都不知道",
            f"一分钟看懂{topic}",
            f"{topic}：普通人如何抓住机会",
            f"为什么{topic}这么火？",
            f"{topic}完整攻略，建议收藏",
            f"别再被{topic}骗了",
            f"{topic}实战指南",
            f"关于{topic}，我想说的",
        ]
        import random
        random.shuffle(templates)
        return templates[:3]
    
    def _generate_script_content(self, topic: str, template: dict, 
                                  duration: int) -> str:
        """生成脚本内容"""
        structure = template["structure"]
        
        # 根据时长调整内容量
        words_per_second = 4  # 中文语速
        total_words = duration * words_per_second
        
        script_parts = []
        
        # 开场
        script_parts.append(f"大家好，今天我们来聊{topic}。")
        script_parts.append("")
        
        # 痛点/引入
        script_parts.append(f"{topic}最近特别火，但很多人其实不太了解。")
        script_parts.append(f"今天我用{duration}秒，给你讲清楚。")
        script_parts.append("")
        
        # 核心内容
        script_parts.append(f"第一点，{topic}的本质是什么？")
        script_parts.append(f"简单说，{topic}是需求和技术结合的产物。")
        script_parts.append("")
        
        script_parts.append(f"第二点，{topic}能给我们带来什么价值？")
        script_parts.append("最直接的就是提升效率，降低成本。")
        script_parts.append("而且门槛比想象中低很多。")
        script_parts.append("")
        
        script_parts.append(f"第三点，普通人如何参与{topic}？")
        script_parts.append("我的建议是：先学习，再实践，最后优化。")
        script_parts.append("不要等完美再开始，边做边学才是正道。")
        script_parts.append("")
        
        # 结尾
        script_parts.append(f"好了，关于{topic}就讲到这里。")
        script_parts.append("如果你觉得有用，记得点赞收藏。")
        script_parts.append("有问题评论区见！")
        
        return "\n".join(script_parts)
    
    def _generate_hooks(self, topic: str) -> list:
        """生成开头钩子"""
        return [
            f"你知道吗？{topic}正在改变这个行业",
            f"为什么聪明人都开始关注{topic}？",
            f"{topic}的3个真相，最后一个很重要",
            f"错过{topic}，你可能会后悔",
        ]
    
    def _extract_keywords(self, topic: str, script: str) -> list:
        """提取关键词"""
        # 简单实现，后续可以用NLP
        base_keywords = [topic, "干货", "知识", "分享"]
        return base_keywords[:5]
    
    def _suggest_bgm(self, style: str) -> str:
        """建议背景音乐风格"""
        bgm_map = {
            "knowledge": "轻快、有节奏感的电子音乐",
            "story": "温暖、情感的钢琴曲",
            "product": "动感、积极向上的流行乐",
            "hotspot": "紧张、悬疑的BGM"
        }
        return bgm_map.get(style, "轻音乐")


# 便捷函数
def generate_script(topic: str, style: str = "knowledge", 
                   duration: int = 60) -> dict:
    """生成视频脚本"""
    gen = ScriptGenerator()
    return gen.generate(topic, style, duration)


if __name__ == "__main__":
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else "AI赚钱"
    result = generate_script(topic)
    print(json.dumps(result, ensure_ascii=False, indent=2))
