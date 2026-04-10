# Code Snippet Manager - DevTools
# 小七团队开发
# 代码片段管理工具

import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class Language(Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    HTML = "html"
    CSS = "css"
    SQL = "sql"
    BASH = "bash"
    JAVA = "java"
    GO = "go"
    RUST = "rust"

@dataclass
class CodeSnippet:
    id: Optional[int]
    title: str
    code: str
    language: Language
    description: str = ""
    tags: List[str] = None
    created_at: str = None
    updated_at: str = None
    usage_count: int = 0
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = self.created_at

class SnippetManager:
    """代码片段管理器"""
    
    def __init__(self, db_path: str = "snippets.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS snippets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                code TEXT NOT NULL,
                language TEXT NOT NULL,
                description TEXT,
                tags TEXT,
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                usage_count INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_snippet(self, snippet: CodeSnippet) -> int:
        """添加代码片段"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO snippets (title, code, language, description, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            snippet.title,
            snippet.code,
            snippet.language.value,
            snippet.description,
            json.dumps(snippet.tags),
            snippet.created_at,
            snippet.updated_at
        ))
        
        snippet_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return snippet_id
    
    def search_snippets(self, query: str = "", language: Language = None, tags: List[str] = None) -> List[CodeSnippet]:
        """搜索代码片段"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        sql = "SELECT * FROM snippets WHERE 1=1"
        params = []
        
        if query:
            sql += " AND (title LIKE ? OR description LIKE ? OR code LIKE ?)"
            params.extend([f"%{query}%"] * 3)
        
        if language:
            sql += " AND language = ?"
            params.append(language.value)
        
        sql += " ORDER BY usage_count DESC, updated_at DESC"
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()
        
        snippets = []
        for row in rows:
            snippet = CodeSnippet(
                id=row[0],
                title=row[1],
                code=row[2],
                language=Language(row[3]),
                description=row[4],
                tags=json.loads(row[5]) if row[5] else [],
                created_at=row[6],
                updated_at=row[7],
                usage_count=row[8]
            )
            
            # 标签过滤
            if tags and not any(tag in snippet.tags for tag in tags):
                continue
                
            snippets.append(snippet)
        
        return snippets
    
    def get_snippet(self, snippet_id: int) -> Optional[CodeSnippet]:
        """获取单个代码片段"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM snippets WHERE id = ?", (snippet_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        # 更新使用次数
        self.increment_usage(snippet_id)
        
        return CodeSnippet(
            id=row[0],
            title=row[1],
            code=row[2],
            language=Language(row[3]),
            description=row[4],
            tags=json.loads(row[5]) if row[5] else [],
            created_at=row[6],
            updated_at=row[7],
            usage_count=row[8] + 1
        )
    
    def increment_usage(self, snippet_id: int):
        """增加使用计数"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE snippets SET usage_count = usage_count + 1 WHERE id = ?
        ''', (snippet_id,))
        
        conn.commit()
        conn.close()
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 总片段数
        cursor.execute("SELECT COUNT(*) FROM snippets")
        total_snippets = cursor.fetchone()[0]
        
        # 按语言统计
        cursor.execute("SELECT language, COUNT(*) FROM snippets GROUP BY language")
        by_language = {row[0]: row[1] for row in cursor.fetchall()}
        
        # 最常用的片段
        cursor.execute('''
            SELECT title, usage_count FROM snippets 
            ORDER BY usage_count DESC LIMIT 10
        ''')
        most_used = [{'title': row[0], 'count': row[1]} for row in cursor.fetchall()]
        
        # 最近添加
        cursor.execute('''
            SELECT title, created_at FROM snippets 
            ORDER BY created_at DESC LIMIT 5
        ''')
        recent = [{'title': row[0], 'date': row[1]} for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'total_snippets': total_snippets,
            'by_language': by_language,
            'most_used': most_used,
            'recent': recent
        }
    
    def export_to_file(self, filename: str, format: str = "json"):
        """导出代码片段"""
        snippets = self.search_snippets()
        
        if format == "json":
            data = [asdict(s) for s in snippets]
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
        
        elif format == "markdown":
            with open(filename, 'w') as f:
                for s in snippets:
                    f.write(f"## {s.title}\n\n")
                    f.write(f"**Language:** {s.language.value}\n\n")
                    f.write(f"**Tags:** {', '.join(s.tags)}\n\n")
                    f.write(f"{s.description}\n\n")
                    f.write(f"``` {s.language.value}\n")
                    f.write(f"{s.code}\n")
                    f.write(f"```\n\n---\n\n")

# 预设代码片段库
PRESET_SNIPPETS = {
    'python': [
        {
            'title': 'Read File Lines',
            'code': 'with open("file.txt", "r") as f:\n    lines = f.readlines()',
            'tags': ['file', 'io']
        },
        {
            'title': 'HTTP Request',
            'code': 'import requests\nresponse = requests.get("https://api.example.com")\ndata = response.json()',
            'tags': ['http', 'api']
        }
    ],
    'javascript': [
        {
            'title': 'Fetch API',
            'code': 'fetch("/api/data")\n  .then(res => res.json())\n  .then(data => console.log(data));',
            'tags': ['fetch', 'api']
        },
        {
            'title': 'Async/Await',
            'code': 'async function getData() {\n  const res = await fetch("/api");\n  return await res.json();\n}',
            'tags': ['async', 'promise']
        }
    ],
    'sql': [
        {
            'title': 'Select with Join',
            'code': '''SELECT u.name, o.total 
FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE o.status = 'completed';''',
            'tags': ['join', 'query']
        }
    ]
}

# 定价
PRICING = {
    'free': {
        'snippets': 50,
        'features': ['基础搜索', '本地存储']
    },
    'pro': {
        'price': 5,
        'snippets': 500,
        'features': ['云同步', '分享', '导出', '团队协作']
    },
    'team': {
        'price': 15,
        'snippets_per_user': 1000,
        'features': ['团队库', '权限管理', '审计日志']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'pro': 60,
        'team': 10
    }
    
    revenue = (
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['team'] * PRICING['team']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    manager = SnippetManager()
    
    # 添加预设
    for lang, snippets in PRESET_SNIPPETS.items():
        for s in snippets:
            snippet = CodeSnippet(
                id=None,
                title=s['title'],
                code=s['code'],
                language=Language(lang),
                tags=s['tags']
            )
            manager.add_snippet(snippet)
    
    print("💻 代码片段管理器已启动")
    print(f"预设片段: {sum(len(s) for s in PRESET_SNIPPETS.values())}个")
    
    # 统计
    stats = manager.get_statistics()
    print(f"\n总片段数: {stats['total_snippets']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
