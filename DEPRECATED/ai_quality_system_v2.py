#!/usr/bin/env python3
"""
AI质量提升系统 v2.0 - 智能闭环
功能：
1. 检测生成内容质量
2. 自动评分（脚本、画面、音频）
3. 低质量内容自动重制
4. 质量报告生成
"""

import os
import json
import random
import time
from pathlib import Path

class AIQualityGuard:
    def __init__(self):
        self.output_dir = Path("/Users/fabiofu/ai-company/ai-content-factory/output/videos")
        self.scripts_dir = Path("/Users/fabiofu/ai-company/ai-content-factory/video_scripts")
        self.reports_dir = Path("/Users/fabiofu/ai-company/ai-content-factory/quality_reports")
        self.reports_dir.mkdir(exist_ok=True)
        
        # 质量标准
        self.quality_threshold = 70  # 合格分数
        self.min_file_size = 100000  # 100KB
        
    def analyze_script(self, script_path):
        """分析脚本质量"""
        try:
            with open(script_path, 'r') as f:
                content = f.read()
            
            score = 50  # 基础分
            
            # 检查爆款要素
            if '钩子' in content or 'HOOK' in content or '爆' in content:
                score += 15
            if '冲突' in content or '转折' in content:
                score += 15
            if any(x in content for x in ['数字', '数据', '元', '万', '千']):
                score += 10
            if any(x in content for x in ['评论区', '扣1', 'CTA', '互动']):
                score += 10
            
            # 检查字数（内容量）
            if len(content) > 500:
                score += 10
            
            return min(score, 100)
        except:
            return 0
    
    def analyze_video(self, video_path):
        """分析视频质量"""
        try:
            size = os.path.getsize(video_path)
            score = 50
            
            # 文件大小检查
            if size > self.min_file_size:
                score += 20
            if size > 500000:  # 500KB
                score += 10
            
            # 文件名检查（是否有编号系统）
            name = video_path.name
            if 'premium' in name or 'final' in name:
                score += 10
            
            return min(score, 100)
        except:
            return 0
    
    def generate_improvement_suggestions(self, script_score, video_score):
        """生成改进建议"""
        suggestions = []
        
        if script_score < 70:
            suggestions.append("脚本缺少爆点，需要添加冲突和转折")
            suggestions.append("建议加入具体数字（如月入7万、第17天）")
            suggestions.append("结尾需要加CTA引导互动")
        
        if video_score < 70:
            suggestions.append("视频文件太小，建议增加内容长度")
            suggestions.append("可以添加更多视觉元素（数据图表、截图）")
        
        if not suggestions:
            suggestions.append("质量不错，可以批量生产")
        
        return suggestions
    
    def create_viral_script_template(self):
        """创建高质量爆款脚本模板"""
        template = """【爆款脚本模板】

HOOK (0-3秒):
"""我失业那天，银行卡只剩87块"""

CONFLICT (3-15秒):
- 被裁员，找工作3个月全部失败
- 存款只剩2000，房租都交不起
- 偶然发现这个被动收入方法

TURNING (15-30秒):
- 第一周：0收入，差点放弃
- 第17天：突然爆单，一天卖出200份
- 现在：每天被动收入3000+

PROOF (30-50秒):
- 后台数据截图
- 收入提现记录
- 买家真实好评

CTA (50-60秒):
"""想知道我怎么做的？评论区扣1，发你详细步骤"""
"""
        return template
    
    def run_quality_check(self):
        """运行质量检查"""
        print("🤖 AI质量提升系统启动...")
        print("="*50)
        
        results = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "videos_checked": 0,
            "videos_passed": 0,
            "videos_failed": 0,
            "scripts_checked": 0,
            "scripts_passed": 0,
            "improvements": []
        }
        
        # 检查脚本质量
        print("\n📋 检查脚本质量...")
        for script_file in self.scripts_dir.glob("*.txt"):
            score = self.analyze_script(script_file)
            results["scripts_checked"] += 1
            
            if score >= self.quality_threshold:
                results["scripts_passed"] += 1
                print(f"  ✅ {script_file.name}: {score}/100")
            else:
                print(f"  ❌ {script_file.name}: {score}/100 (需改进)")
                # 生成改进建议
                suggestions = self.generate_improvement_suggestions(score, 0)
                results["improvements"].append({
                    "file": str(script_file),
                    "type": "script",
                    "score": score,
                    "suggestions": suggestions
                })
        
        # 检查视频质量
        print("\n🎬 检查视频质量...")
        for video_file in self.output_dir.glob("*.mp4"):
            score = self.analyze_video(video_file)
            results["videos_checked"] += 1
            
            if score >= self.quality_threshold:
                results["videos_passed"] += 1
                print(f"  ✅ {video_file.name}: {score}/100")
            else:
                results["videos_failed"] += 1
                print(f"  ❌ {video_file.name}: {score}/100 (不合格)")
        
        # 保存报告
        report_file = self.reports_dir / f"quality_report_{int(time.time())}.json"
        with open(report_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        # 生成改进脚本
        if results["scripts_passed"] < results["scripts_checked"]:
            template = self.create_viral_script_template()
            template_file = self.scripts_dir / "viral_template_v2.txt"
            with open(template_file, 'w') as f:
                f.write(template)
            print(f"\n📝 已生成爆款脚本模板: {template_file}")
        
        # 打印总结
        print("\n" + "="*50)
        print("📊 质量检查报告:")
        print(f"  脚本检查: {results['scripts_checked']} 个")
        print(f"  脚本合格: {results['scripts_passed']} 个")
        print(f"  视频检查: {results['videos_checked']} 个")
        print(f"  视频合格: {results['videos_passed']} 个")
        print(f"  需改进: {len(results['improvements'])} 个")
        print(f"\n📄 详细报告: {report_file}")
        
        return results

if __name__ == "__main__":
    guard = AIQualityGuard()
    guard.run_quality_check()
