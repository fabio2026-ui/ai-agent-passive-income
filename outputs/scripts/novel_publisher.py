#!/usr/bin/env python3
"""
小说发布助手
功能：自动生成各平台发布格式
作者：小七
"""

import os
from pathlib import Path


def format_for_fanqie(title, content):
    """番茄小说格式"""
    # 添加章节标题
    formatted = f"第X章 {title}\n\n"
    
    # 分段处理（每段1-2行，移动端友好）
    paragraphs = content.split('\n\n')
    for p in paragraphs:
        if p.strip():
            formatted += p.strip() + '\n\n'
    
    # 添加结尾钩子提示
    formatted += '\n（本章完）'
    
    return formatted


def format_for_qidian(title, content):
    """起点格式（纯净文本）"""
    formatted = f"第X章 {title}\n\n"
    
    # 去除emoji，纯文本
    paragraphs = content.split('\n\n')
    for p in paragraphs:
        if p.strip():
            formatted += p.strip() + '\n\n'
    
    return formatted


def format_for_wattpad(title, content):
    """Wattpad英文格式"""
    # 英文段落处理
    formatted = f"Chapter X: {title}\n\n"
    
    paragraphs = content.split('\n\n')
    for p in paragraphs:
        if p.strip():
            formatted += p.strip() + '\n\n'
    
    return formatted


def generate_upload_checklist(chapter_num, title, word_count):
    """生成发布清单"""
    checklist = f"""
📋 第{chapter_num}章发布清单

章节信息：
- 标题: {title}
- 字数: {word_count}
- 发布时间: {os.popen('date').read().strip()}

番茄小说：
□ 登录 writer.m.fanqienovel.com
□ 复制格式化内容
□ 设置章节标题: 第{chapter_num}章 {title}
□ 检查段落格式（1-2行/段）
□ 预览并发布
□ 记录发布时间

起点：
□ 登录 author.qidian.com
□ 进入作品管理
□ 发布新章节
□ 粘贴纯净文本
□ 检查字数统计
□ 确认发布

小红书/微博（引流）：
□ 截取精彩段落（200字）
□ 制作封面图
□ 添加话题: #小说推荐 #网文 #创业
□ 发布并@主账号

数据记录：
□ 记录发布后的阅读量
□ 记录评论数
□ 记录书架比
□ 截图保存
"""
    return checklist


def analyze_chapter(content):
    """分析章节数据"""
    chinese_chars = len([c for c in content if '\u4e00' <= c <= '\u9fff'])
    total_chars = len(content)
    paragraphs = len([p for p in content.split('\n\n') if p.strip()])
    
    return {
        "中文字数": chinese_chars,
        "总字符数": total_chars,
        "段落数": paragraphs,
        "平均段落长度": chinese_chars // paragraphs if paragraphs else 0,
    }


def main():
    # 读取章节文件
    chapter_dir = Path("outputs/novel")
    
    if not chapter_dir.exists():
        print("❌ 找不到章节文件目录")
        return
    
    chapters = sorted(chapter_dir.glob("chapter*.md"))
    
    print("=" * 50)
    print("小说发布助手")
    print("=" * 50)
    print()
    
    for i, chapter_file in enumerate(chapters, 1):
        content = chapter_file.read_text(encoding='utf-8')
        
        # 提取标题
        lines = content.split('\n')
        title = ""
        for line in lines:
            if line.startswith('# ') or line.startswith('## '):
                title = line.replace('# ', '').replace('## ', '').strip()
                break
        
        # 分析数据
        stats = analyze_chapter(content)
        
        print(f"📖 第{i}章: {title}")
        print(f"   中文字数: {stats['中文字数']}")
        print(f"   段落数: {stats['段落数']}")
        print()
        
        # 生成各平台格式
        fanqie = format_for_fanqie(title, content)
        qidian = format_for_qidian(title, content)
        checklist = generate_upload_checklist(i, title, stats['中文字数'])
        
        # 保存
        output_dir = Path("outputs/novel/formatted")
        output_dir.mkdir(exist_ok=True)
        
        (output_dir / f"chapter{i}_fanqie.txt").write_text(fanqie, encoding='utf-8')
        (output_dir / f"chapter{i}_qidian.txt").write_text(qidian, encoding='utf-8')
        (output_dir / f"chapter{i}_checklist.txt").write_text(checklist, encoding='utf-8')
        
        print(f"   ✅ 已生成: chapter{i}_fanqie.txt")
        print(f"   ✅ 已生成: chapter{i}_qidian.txt")
        print(f"   ✅ 已生成: chapter{i}_checklist.txt")
        print()
    
    print("=" * 50)
    print("完成!")
    print("=" * 50)
    print()
    print("下一步:")
    print("1. 打开 outputs/novel/formatted/ 目录")
    print("2. 复制对应平台的内容")
    print("3. 按照checklist发布")


if __name__ == "__main__":
    main()
