# AI Content Generator Pro
# 小七团队出品 - 顶尖质量版本
# 多模型AI内容生成系统

import os
import json
import sqlite3
from typing import List, Dict, Optional, Generator, AsyncGenerator
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from abc import ABC, abstractmethod
import asyncio
import logging
from contextlib import contextmanager
import hashlib
import secrets

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ContentType(Enum):
    """内容类型枚举"""
    BLOG_POST = "blog_post"
    PRODUCT_DESCRIPTION = "product_description"
    EMAIL = "email"
    SOCIAL_MEDIA = "social_media"
    AD_COPY = "ad_copy"
    SEO_META = "seo_meta"
    VIDEO_SCRIPT = "video_script"
    PRESS_RELEASE = "press_release"
    TECHNICAL_DOC = "technical_doc"
    CASE_STUDY = "case_study"

class ToneStyle(Enum):
    """语气风格枚举"""
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    PERSUASIVE = "persuasive"
    INFORMATIVE = "informative"
    ENTERTAINING = "entertaining"
    AUTHORITATIVE = "authoritative"
    EMPATHETIC = "empathetic"
    URGENT = "urgent"

class AIProvider(Enum):
    """AI提供商枚举"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"
    LOCAL = "local"

@dataclass
class GenerationConfig:
    """生成配置"""
    content_type: ContentType
    tone: ToneStyle = ToneStyle.PROFESSIONAL
    max_length: int = 1000
    temperature: float = 0.7
    language: str = "zh"
    keywords: List[str] = field(default_factory=list)
    target_audience: str = ""
    include_cta: bool = False
    seo_optimized: bool = False
    
    def validate(self) -> bool:
        """验证配置有效性"""
        if not isinstance(self.content_type, ContentType):
            raise ValueError(f"Invalid content_type: {self.content_type}")
        if not 0.0 <= self.temperature <= 2.0:
            raise ValueError(f"Temperature must be between 0 and 2, got {self.temperature}")
        if self.max_length < 100 or self.max_length > 8000:
            raise ValueError(f"max_length must be between 100 and 8000, got {self.max_length}")
        return True

@dataclass
class ContentTemplate:
    """内容模板"""
    id: str
    name: str
    content_type: ContentType
    prompt_template: str
    system_prompt: str = ""
    example_outputs: List[str] = field(default_factory=list)
    variables: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    usage_count: int = 0
    rating: float = 0.0

@dataclass
class GeneratedContent:
    """生成内容结果"""
    id: str
    content: str
    content_type: ContentType
    config: GenerationConfig
    provider: AIProvider
    model: str
    tokens_used: int
    generation_time_ms: int
    created_at: str
    quality_score: Optional[float] = None
    seo_score: Optional[float] = None
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            'id': self.id,
            'content': self.content,
            'content_type': self.content_type.value,
            'config': asdict(self.config),
            'provider': self.provider.value,
            'model': self.model,
            'tokens_used': self.tokens_used,
            'generation_time_ms': self.generation_time_ms,
            'created_at': self.created_at,
            'quality_score': self.quality_score,
            'seo_score': self.seo_score
        }

class AIProviderBase(ABC):
    """AI提供商基类"""
    
    @abstractmethod
    async def generate(self, prompt: str, config: GenerationConfig) -> GeneratedContent:
        """生成内容"""
        pass
    
    @abstractmethod
    async def stream_generate(self, prompt: str, config: GenerationConfig) -> AsyncGenerator[str, None]:
        """流式生成内容"""
        pass
    
    @abstractmethod
    def get_available_models(self) -> List[str]:
        """获取可用模型列表"""
        pass

class OpenAIProvider(AIProviderBase):
    """OpenAI提供商实现"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.base_url = "https://api.openai.com/v1"
        self.models = ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]
    
    async def generate(self, prompt: str, config: GenerationConfig) -> GeneratedContent:
        """生成内容实现"""
        import aiohttp
        
        start_time = datetime.now()
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4",
            "messages": [
                {"role": "system", "content": self._get_system_prompt(config)},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": config.max_length,
            "temperature": config.temperature
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"OpenAI API error: {error_text}")
                    
                    data = await response.json()
                    content = data['choices'][0]['message']['content']
                    tokens_used = data['usage']['total_tokens']
                    
                    generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
                    
                    return GeneratedContent(
                        id=self._generate_id(),
                        content=content,
                        content_type=config.content_type,
                        config=config,
                        provider=AIProvider.OPENAI,
                        model=data['model'],
                        tokens_used=tokens_used,
                        generation_time_ms=generation_time,
                        created_at=datetime.now().isoformat()
                    )
        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
            raise
    
    async def stream_generate(self, prompt: str, config: GenerationConfig) -> AsyncGenerator[str, None]:
        """流式生成"""
        # 实现流式生成逻辑
        yield "Streaming not implemented in this version"
    
    def get_available_models(self) -> List[str]:
        return self.models
    
    def _get_system_prompt(self, config: GenerationConfig) -> str:
        """获取系统提示词"""
        prompts = {
            ContentType.BLOG_POST: "You are an expert blog writer. Create engaging, SEO-optimized blog content.",
            ContentType.PRODUCT_DESCRIPTION: "You are a professional copywriter. Create compelling product descriptions.",
            ContentType.EMAIL: "You are an email marketing expert. Write persuasive, clear emails.",
            ContentType.SOCIAL_MEDIA: "You are a social media expert. Create viral, engaging content.",
        }
        return prompts.get(config.content_type, "You are a professional content writer.")
    
    def _generate_id(self) -> str:
        """生成唯一ID"""
        return f"gen_{secrets.token_hex(8)}_{int(datetime.now().timestamp())}"

class ContentGeneratorPro:
    """
    专业级AI内容生成器
    
    特性:
    - 多AI提供商支持 (OpenAI, Anthropic, Cohere)
    - 丰富的内容模板库
    - SEO优化功能
    - 内容质量评分
    - 历史记录管理
    - 批量生成功能
    """
    
    def __init__(self, db_path: str = "content_generator.db"):
        self.db_path = db_path
        self.providers: Dict[AIProvider, AIProviderBase] = {}
        self.templates: Dict[str, ContentTemplate] = {}
        self._init_database()
        self._load_default_templates()
        logger.info("ContentGeneratorPro initialized")
    
    def _init_database(self):
        """初始化数据库"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            
            # 生成的内容表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS generated_contents (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    config TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    model TEXT NOT NULL,
                    tokens_used INTEGER,
                    generation_time_ms INTEGER,
                    created_at TEXT NOT NULL,
                    quality_score REAL,
                    seo_score REAL,
                    user_feedback INTEGER
                )
            ''')
            
            # 模板表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS templates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    prompt_template TEXT NOT NULL,
                    system_prompt TEXT,
                    example_outputs TEXT,
                    variables TEXT,
                    created_at TEXT,
                    usage_count INTEGER DEFAULT 0,
                    rating REAL DEFAULT 0
                )
            ''')
            
            # 使用统计表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS usage_stats (
                    date TEXT PRIMARY KEY,
                    total_generations INTEGER DEFAULT 0,
                    total_tokens INTEGER DEFAULT 0,
                    avg_generation_time_ms INTEGER DEFAULT 0
                )
            ''')
            
            conn.commit()
            logger.info("Database initialized")
    
    @contextmanager
    def _get_db(self):
        """数据库连接上下文管理器"""
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()
    
    def _load_default_templates(self):
        """加载默认模板"""
        default_templates = [
            ContentTemplate(
                id="blog_seo_001",
                name="SEO优化博客文章",
                content_type=ContentType.BLOG_POST,
                prompt_template="""写一篇关于{topic}的博客文章。

要求:
- 字数: {word_count}字
- 语气: {tone}
- 目标受众: {audience}
- 关键词: {keywords}
- 结构: 引言、正文(3-5段)、结论、行动号召

请确保内容原创、信息丰富、对读者有价值。""",
                system_prompt="You are an expert SEO content writer with 10 years of experience.",
                variables=["topic", "word_count", "tone", "audience", "keywords"]
            ),
            ContentTemplate(
                id="product_conv_001",
                name="高转化产品描述",
                content_type=ContentType.PRODUCT_DESCRIPTION,
                prompt_template="""为以下产品撰写转化型描述:

产品名称: {product_name}
产品特点: {features}
目标用户: {target_user}
独特卖点: {usp}

要求:
1. 开头用钩子吸引注意力
2. 突出主要优势(不是功能)
3. 包含社会证明元素
4. 以明确的CTA结尾
5. 使用{tone}语气""",
                variables=["product_name", "features", "target_user", "usp", "tone"]
            ),
            ContentTemplate(
                id="email_welcome_001",
                name="欢迎邮件序列",
                content_type=ContentType.EMAIL,
                prompt_template="""撰写一封欢迎邮件，邮件{email_number}/5。

用户注册来源: {source}
产品类型: {product_type}
目标: {goal}

邮件结构:
1. 个性化问候
2. 感谢注册
3. 设置期望
4. 第一个行动号召
5. P.S. 部分""",
                variables=["email_number", "source", "product_type", "goal"]
            )
        ]
        
        for template in default_templates:
            self.templates[template.id] = template
            self._save_template_to_db(template)
        
        logger.info(f"Loaded {len(default_templates)} default templates")
    
    def _save_template_to_db(self, template: ContentTemplate):
        """保存模板到数据库"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO templates 
                (id, name, content_type, prompt_template, system_prompt, example_outputs, variables, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                template.id,
                template.name,
                template.content_type.value,
                template.prompt_template,
                template.system_prompt,
                json.dumps(template.example_outputs),
                json.dumps(template.variables),
                template.created_at
            ))
            conn.commit()
    
    def register_provider(self, provider: AIProvider, provider_instance: AIProviderBase):
        """注册AI提供商"""
        self.providers[provider] = provider_instance
        logger.info(f"Registered provider: {provider.value}")
    
    def build_prompt(self, template_id: str, variables: Dict[str, str]) -> str:
        """构建提示词"""
        if template_id not in self.templates:
            raise ValueError(f"Template not found: {template_id}")
        
        template = self.templates[template_id]
        prompt = template.prompt_template
        
        for key, value in variables.items():
            prompt = prompt.replace(f"{{{key}}}", value)
        
        return prompt
    
    async def generate(
        self,
        prompt: str,
        config: GenerationConfig,
        provider: AIProvider = AIProvider.OPENAI
    ) -> GeneratedContent:
        """生成内容"""
        # 验证配置
        config.validate()
        
        # 检查提供商
        if provider not in self.providers:
            raise ValueError(f"Provider not registered: {provider.value}")
        
        provider_instance = self.providers[provider]
        
        try:
            # 生成内容
            result = await provider_instance.generate(prompt, config)
            
            # 质量评分
            result.quality_score = self._calculate_quality_score(result)
            
            # SEO评分
            if config.seo_optimized:
                result.seo_score = self._calculate_seo_score(result, config)
            
            # 保存到数据库
            self._save_content(result)
            
            # 更新统计
            self._update_usage_stats(result)
            
            logger.info(f"Generated content: {result.id}, tokens: {result.tokens_used}")
            return result
            
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise
    
    def _calculate_quality_score(self, content: GeneratedContent) -> float:
        """计算内容质量分 (0-100)"""
        score = 50.0  # 基础分
        
        # 长度检查
        text_length = len(content.content)
        expected_length = content.config.max_length
        if 0.8 <= text_length / expected_length <= 1.2:
            score += 15
        
        # 可读性检查 (句子长度)
        sentences = content.content.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        if 10 <= avg_sentence_length <= 25:
            score += 15
        
        # 关键词密度
        if content.config.keywords:
            keyword_count = sum(content.content.lower().count(k.lower()) for k in content.config.keywords)
            density = keyword_count / len(content.content.split()) * 100
            if 1 <= density <= 3:
                score += 20
        
        return min(100.0, score)
    
    def _calculate_seo_score(self, content: GeneratedContent, config: GenerationConfig) -> float:
        """计算SEO分数"""
        score = 30.0
        text = content.content.lower()
        
        # 关键词检查
        for keyword in config.keywords:
            if keyword.lower() in text:
                score += 10
        
        # 标题检查 (H1, H2)
        if '# ' in content.content or '## ' in content.content:
            score += 15
        
        # 段落长度
        paragraphs = content.content.split('\n\n')
        good_paragraphs = sum(1 for p in paragraphs if 50 <= len(p) <= 300)
        score += good_paragraphs * 2
        
        return min(100.0, score)
    
    def _save_content(self, content: GeneratedContent):
        """保存生成的内容"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO generated_contents 
                (id, content, content_type, config, provider, model, tokens_used, generation_time_ms, 
                 created_at, quality_score, seo_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                content.id,
                content.content,
                content.content_type.value,
                json.dumps(asdict(content.config)),
                content.provider.value,
                content.model,
                content.tokens_used,
                content.generation_time_ms,
                content.created_at,
                content.quality_score,
                content.seo_score
            ))
            conn.commit()
    
    def _update_usage_stats(self, content: GeneratedContent):
        """更新使用统计"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        with self._get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO usage_stats (date, total_generations, total_tokens)
                VALUES (?, 1, ?)
                ON CONFLICT(date) DO UPDATE SET
                total_generations = total_generations + 1,
                total_tokens = total_tokens + excluded.total_tokens
            ''', (today, content.tokens_used))
            
            conn.commit()
    
    def get_content_history(self, limit: int = 50) -> List[GeneratedContent]:
        """获取生成历史"""
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM generated_contents 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            
            results = []
            for row in cursor.fetchall():
                config_dict = json.loads(row[3])
                results.append(GeneratedContent(
                    id=row[0],
                    content=row[1],
                    content_type=ContentType(row[2]),
                    config=GenerationConfig(**config_dict),
                    provider=AIProvider(row[4]),
                    model=row[5],
                    tokens_used=row[6],
                    generation_time_ms=row[7],
                    created_at=row[8],
                    quality_score=row[9],
                    seo_score=row[10]
                ))
            
            return results
    
    def get_templates_by_type(self, content_type: ContentType) -> List[ContentTemplate]:
        """按类型获取模板"""
        return [t for t in self.templates.values() if t.content_type == content_type]
    
    def get_usage_statistics(self, days: int = 30) -> Dict:
        """获取使用统计"""
        start_date = (datetime.now() - __import__('datetime').timedelta(days=days)).strftime('%Y-%m-%d')
        
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    SUM(total_generations),
                    SUM(total_tokens),
                    AVG(total_tokens / total_generations)
                FROM usage_stats 
                WHERE date >= ?
            ''', (start_date,))
            
            row = cursor.fetchone()
            
            return {
                'total_generations': row[0] or 0,
                'total_tokens': row[1] or 0,
                'avg_tokens_per_generation': round(row[2], 2) if row[2] else 0,
                'period_days': days
            }

# 定价配置
PRICING = {
    'free': {
        'generations_per_month': 10,
        'max_length': 1000,
        'providers': [AIProvider.LOCAL],
        'features': ['基础生成', '3个模板']
    },
    'starter': {
        'price': 19,
        'generations_per_month': 100,
        'max_length': 2000,
        'providers': [AIProvider.OPENAI],
        'features': ['GPT-3.5', '20个模板', 'SEO优化', '历史记录']
    },
    'professional': {
        'price': 49,
        'generations_per_month': 500,
        'max_length': 4000,
        'providers': [AIProvider.OPENAI, AIProvider.ANTHROPIC],
        'features': ['GPT-4', 'Claude', '全部模板', 'API访问', '团队协作']
    },
    'enterprise': {
        'price': 199,
        'generations_per_month': 9999,
        'max_length': 8000,
        'providers': 'all',
        'features': ['所有模型', '自定义模板', '优先支持', 'SSO', 'SLA']
    }
}

# 收入预测
def calculate_revenue():
    """计算收入预测"""
    monthly_users = {
        'starter': 50,
        'professional': 25,
        'enterprise': 5
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['professional'] * PRICING['professional']['price'] +
        monthly_users['enterprise'] * PRICING['enterprise']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

# 使用示例
async def main():
    """主函数示例"""
    # 初始化生成器
    generator = ContentGeneratorPro()
    
    # 注册OpenAI提供商
    openai_provider = OpenAIProvider()
    generator.register_provider(AIProvider.OPENAI, openai_provider)
    
    # 创建配置
    config = GenerationConfig(
        content_type=ContentType.BLOG_POST,
        tone=ToneStyle.PROFESSIONAL,
        max_length=1500,
        temperature=0.7,
        language="zh",
        keywords=["AI", "内容生成", "自动化"],
        seo_optimized=True
    )
    
    # 构建提示词
    prompt = generator.build_prompt("blog_seo_001", {
        "topic": "AI内容生成的未来趋势",
        "word_count": "1500",
        "tone": "专业",
        "audience": "内容创作者和营销人员",
        "keywords": "AI内容生成, 自动化写作, 内容营销"
    })
    
    try:
        # 生成内容
        result = await generator.generate(prompt, config)
        
        print(f"✅ 内容生成成功!")
        print(f"ID: {result.id}")
        print(f"质量分: {result.quality_score:.1f}/100")
        print(f"SEO分: {result.seo_score:.1f}/100")
        print(f"Token使用: {result.tokens_used}")
        print(f"生成时间: {result.generation_time_ms}ms")
        print(f"\n预览:\n{result.content[:300]}...")
        
    except Exception as e:
        print(f"❌ 生成失败: {e}")
    
    # 统计
    stats = generator.get_usage_statistics()
    print(f"\n📊 使用统计:")
    print(f"总生成数: {stats['total_generations']}")
    print(f"总Token: {stats['total_tokens']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")

if __name__ == "__main__":
    asyncio.run(main())
