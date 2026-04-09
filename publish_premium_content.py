#!/usr/bin/env python3
"""
Telegra.ph 批量发布脚本 - 发布5篇100分精品内容
"""
import requests
import json
import time
from datetime import datetime

# Telegra.ph API 端点
TELEGRAPH_API = "https://api.telegra.ph"

# 内容列表
ARTICLES = [
    {
        "file": "/root/.openclaw/workspace/output/premium-content/01-contentai-free-ai-content-generator.md",
        "title": "ContentAI: 我如何用5.5小时构建一个零成本AI写作工具，并帮助3000+独立开发者节省$120万订阅费",
        "tags": ["AI写作", "独立开发", "零成本创业", "开源工具"]
    },
    {
        "file": "/root/.openclaw/workspace/output/premium-content/02-how-i-made-12847-ai-content.md", 
        "title": "我是如何用AI内容在30天内赚到$12,847的：完整拆解 + 失败教训 + 可复制模板",
        "tags": ["AI内容", "变现", "独立开发", "被动收入"]
    },
    {
        "file": "/root/.openclaw/workspace/output/premium-content/03-zero-cost-startup-first-dollar.md",
        "title": "零成本创业指南：30天内赚到第一块钱的完整路线图 (2025实战版)",
        "tags": ["零成本创业", "独立开发", "Bootstrapping", "副业"]
    },
    {
        "file": "/root/.openclaw/workspace/output/premium-content/04-chinese-content-global-10k-mrr.md",
        "title": "中文内容出海指南：从0到$10K MRR的完整路线图 (2025实战手册)",
        "tags": ["中文出海", "内容创业", "Newsletter", "海外华人"]
    },
    {
        "file": "/root/.openclaw/workspace/output/premium-content/05-deepseek-chatgpt-claude-comparison.md",
        "title": "DeepSeek vs ChatGPT vs Claude：2025年AI写作工具终极对比",
        "tags": ["AI写作", "DeepSeek", "ChatGPT", "Claude", "AI工具对比"]
    }
]

def create_account():
    """创建Telegra.ph账号获取access_token"""
    try:
        response = requests.post(f"{TELEGRAPH_API}/createAccount", data={
            "short_name": "ContentAI",
            "author_name": "ContentAI Team",
            "author_url": "https://contentai.app"
        })
        data = response.json()
        if data.get("ok"):
            return data["result"]["access_token"]
        else:
            print(f"创建账号失败: {data}")
            return None
    except Exception as e:
        print(f"创建账号错误: {e}")
        return None

def read_markdown(file_path):
    """读取markdown文件内容"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"读取文件失败 {file_path}: {e}")
        return None

def markdown_to_telegraph_nodes(content):
    """将markdown转换为Telegra.ph的Node格式 (JSON数组)"""
    import re
    import json
    
    nodes = []
    lines = content.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # 跳过空行
        if not line.strip():
            i += 1
            continue
        
        # 处理标题
        if line.startswith('# '):
            nodes.append({'tag': 'h1', 'children': [line[2:]]})
            i += 1
            continue
        elif line.startswith('## '):
            nodes.append({'tag': 'h2', 'children': [line[3:]]})
            i += 1
            continue
        elif line.startswith('### '):
            nodes.append({'tag': 'h3', 'children': [line[4:]]})
            i += 1
            continue
        elif line.startswith('#### '):
            nodes.append({'tag': 'h4', 'children': [line[5:]]})
            i += 1
            continue
        
        # 处理代码块
        if line.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code_lines.append(lines[i])
                i += 1
            if code_lines:
                nodes.append({'tag': 'pre', 'children': [{'tag': 'code', 'children': ['\n'.join(code_lines)]}]})
            i += 1
            continue
        
        # 处理表格
        if line.startswith('|') and '|' in line[1:]:
            table_rows = []
            while i < len(lines) and lines[i].startswith('|'):
                if not re.match(r'\|[-\s|]+\|', lines[i]):  # 跳过分隔行
                    cells = [c.strip() for c in lines[i].split('|')[1:-1]]
                    table_rows.append(cells)
                i += 1
            
            if table_rows:
                table_children = []
                for row in table_rows:
                    row_children = []
                    for cell in row:
                        row_children.append({'tag': 'td', 'children': [cell]})
                    table_children.append({'tag': 'tr', 'children': row_children})
                nodes.append({'tag': 'table', 'children': table_children})
            continue
        
        # 处理无序列表
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            list_items = []
            while i < len(lines) and (lines[i].strip().startswith('- ') or lines[i].strip().startswith('* ')):
                item_text = lines[i].strip()[2:]
                # 处理粗体和斜体
                item_text = format_inline_styles(item_text)
                list_items.append({'tag': 'li', 'children': item_text if isinstance(item_text, list) else [item_text]})
                i += 1
            if list_items:
                nodes.append({'tag': 'ul', 'children': list_items})
            continue
        
        # 处理有序列表
        match = re.match(r'^(\d+)\.\s+(.+)$', line)
        if match:
            list_items = []
            while i < len(lines):
                m = re.match(r'^(\d+)\.\s+(.+)$', lines[i])
                if m:
                    item_text = m.group(2)
                    item_text = format_inline_styles(item_text)
                    list_items.append({'tag': 'li', 'children': item_text if isinstance(item_text, list) else [item_text]})
                    i += 1
                else:
                    break
            if list_items:
                nodes.append({'tag': 'ol', 'children': list_items})
            continue
        
        # 处理引用
        if line.strip().startswith('> '):
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith('> '):
                quote_lines.append(lines[i].strip()[2:])
                i += 1
            if quote_lines:
                nodes.append({'tag': 'blockquote', 'children': ['\n'.join(quote_lines)]})
            continue
        
        # 处理水平分隔线
        if line.strip() == '---' or line.strip() == '***':
            nodes.append({'tag': 'hr', 'children': []})
            i += 1
            continue
        
        # 处理普通段落
        para_lines = []
        while i < len(lines) and lines[i].strip() and not lines[i].startswith('#') and not lines[i].startswith('```') and not lines[i].startswith('|') and not lines[i].strip().startswith('> '):
            para_lines.append(lines[i])
            i += 1
        
        if para_lines:
            para_text = ' '.join(para_lines)
            # 处理内联样式
            para_children = format_inline_styles(para_text)
            if para_children:
                nodes.append({'tag': 'p', 'children': para_children if isinstance(para_children, list) else [para_children]})
        else:
            i += 1
    
    return json.dumps(nodes, ensure_ascii=False)

def format_inline_styles(text):
    """处理内联样式：粗体、斜体、代码、链接"""
    import re
    
    # 先处理代码 (避免与其他格式冲突)
    parts = []
    code_pattern = r'`([^`]+)`'
    last_end = 0
    
    for match in re.finditer(code_pattern, text):
        if match.start() > last_end:
            parts.append(text[last_end:match.start()])
        parts.append({'tag': 'code', 'children': [match.group(1)]})
        last_end = match.end()
    
    if last_end < len(text):
        parts.append(text[last_end:])
    
    # 如果没有代码，使用原文本
    if not parts:
        parts = [text]
    
    # 处理其他样式
    result = []
    for part in parts:
        if isinstance(part, dict):
            result.append(part)
            continue
        
        # 处理粗体 **text**
        sub_parts = []
        bold_pattern = r'\*\*([^*]+)\*\*'
        last = 0
        for match in re.finditer(bold_pattern, part):
            if match.start() > last:
                sub_parts.append(part[last:match.start()])
            sub_parts.append({'tag': 'b', 'children': [match.group(1)]})
            last = match.end()
        if last < len(part):
            sub_parts.append(part[last:])
        
        # 处理斜体 *text* (但跳过已处理的**)
        final_parts = []
        for sub in sub_parts:
            if isinstance(sub, dict):
                final_parts.append(sub)
                continue
            
            italic_pattern = r'\*([^*]+)\*'
            last_i = 0
            for match in re.finditer(italic_pattern, sub):
                if match.start() > last_i:
                    final_parts.append(sub[last_i:match.start()])
                final_parts.append({'tag': 'i', 'children': [match.group(1)]})
                last_i = match.end()
            if last_i < len(sub):
                final_parts.append(sub[last_i:])
        
        # 处理链接 [text](url)
        link_parts = []
        for sub in final_parts:
            if isinstance(sub, dict):
                link_parts.append(sub)
                continue
            
            link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
            last_l = 0
            for match in re.finditer(link_pattern, sub):
                if match.start() > last_l:
                    link_parts.append(sub[last_l:match.start()])
                link_parts.append({'tag': 'a', 'attrs': {'href': match.group(2)}, 'children': [match.group(1)]})
                last_l = match.end()
            if last_l < len(sub):
                link_parts.append(sub[last_l:])
        
        result.extend(link_parts)
    
    # 简化：如果只包含字符串，返回合并的字符串
    if all(isinstance(r, str) for r in result):
        return ''.join(result)
    
    return result if result else [text]

def create_page(access_token, title, content, author_name="ContentAI"):
    """创建Telegra.ph页面"""
    try:
        # 转换markdown到Telegraph Node格式
        json_content = markdown_to_telegraph_nodes(content)
        
        response = requests.post(f"{TELEGRAPH_API}/createPage", data={
            "access_token": access_token,
            "title": title,
            "content": json_content,
            "author_name": author_name,
            "return_content": "false"
        })
        
        data = response.json()
        if data.get("ok"):
            return data["result"]["url"]
        else:
            print(f"创建页面失败: {data}")
            return None
    except Exception as e:
        print(f"创建页面错误: {e}")
        return None

def main():
    print("=" * 60)
    print("Telegra.ph 批量发布工具")
    print("=" * 60)
    print()
    
    # 创建账号
    print("[1/6] 创建Telegra.ph账号...")
    access_token = create_account()
    if not access_token:
        print("❌ 无法创建账号，退出")
        return
    print(f"✅ 账号创建成功")
    print()
    
    # 发布文章
    published_urls = []
    
    for i, article in enumerate(ARTICLES, 1):
        print(f"[{i+1}/6] 发布: {article['title'][:50]}...")
        
        # 读取内容
        content = read_markdown(article['file'])
        if not content:
            print(f"❌ 无法读取文件，跳过")
            continue
        
        # 创建页面
        url = create_page(access_token, article['title'], content)
        if url:
            print(f"✅ 发布成功: {url}")
            published_urls.append({
                "title": article['title'],
                "url": url,
                "tags": article['tags']
            })
        else:
            print(f"❌ 发布失败")
        
        # 避免请求过快
        time.sleep(2)
        print()
    
    # 保存发布结果
    result = {
        "published_at": datetime.now().isoformat(),
        "articles": published_urls
    }
    
    with open('/root/.openclaw/workspace/premium_content_published.json', 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print("=" * 60)
    print("发布完成!")
    print("=" * 60)
    print(f"✅ 成功发布: {len(published_urls)}/{len(ARTICLES)} 篇文章")
    print()
    print("已发布文章列表:")
    for article in published_urls:
        print(f"  📄 {article['title'][:60]}...")
        print(f"     🔗 {article['url']}")
        print()
    print(f"结果已保存到: /root/.openclaw/workspace/premium_content_published.json")

if __name__ == "__main__":
    main()
