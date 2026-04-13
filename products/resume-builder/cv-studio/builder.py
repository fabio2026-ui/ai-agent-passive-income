# Resume Builder - CV Studio
# 小七团队开发
# 简历构建器

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum
import json
from datetime import datetime

class ResumeTemplate(Enum):
    MODERN = "modern"
    CLASSIC = "classic"
    MINIMAL = "minimal"
    CREATIVE = "creative"
    TECHNICAL = "technical"
    EXECUTIVE = "executive"

@dataclass
class Experience:
    company: str
    title: str
    start_date: str
    end_date: str = "Present"
    description: List[str] = field(default_factory=list)
    location: str = ""

@dataclass
class Education:
    institution: str
    degree: str
    field: str
    start_date: str
    end_date: str = ""
    gpa: str = ""

@dataclass
class Skill:
    name: str
    level: int = 3  # 1-5
    category: str = ""

@dataclass
class Project:
    name: str
    description: str
    technologies: List[str] = field(default_factory=list)
    link: str = ""

@dataclass
class Resume:
    name: str
    title: str
    email: str
    phone: str
    location: str
    summary: str = ""
    experiences: List[Experience] = field(default_factory=list)
    educations: List[Education] = field(default_factory=list)
    skills: List[Skill] = field(default_factory=list)
    projects: List[Project] = field(default_factory=list)
    certifications: List[str] = field(default_factory=list)
    languages: List[Dict] = field(default_factory=list)
    links: Dict[str, str] = field(default_factory=dict)

class ResumeBuilder:
    """简历构建器"""
    
    def __init__(self):
        self.templates = self._load_templates()
        self.resumes = {}
    
    def _load_templates(self) -> Dict:
        """加载简历模板"""
        return {
            ResumeTemplate.MODERN: {
                'name': '现代',
                'colors': {'primary': '#2563EB', 'secondary': '#64748B', 'background': '#FFFFFF'},
                'layout': 'two-column'
            },
            ResumeTemplate.CLASSIC: {
                'name': '经典',
                'colors': {'primary': '#1F2937', 'secondary': '#4B5563', 'background': '#FFFFFF'},
                'layout': 'single-column'
            },
            ResumeTemplate.MINIMAL: {
                'name': '极简',
                'colors': {'primary': '#000000', 'secondary': '#6B7280', 'background': '#FAFAFA'},
                'layout': 'single-column'
            },
            ResumeTemplate.CREATIVE: {
                'name': '创意',
                'colors': {'primary': '#7C3AED', 'secondary': '#EC4899', 'background': '#FFFFFF'},
                'layout': 'creative'
            },
            ResumeTemplate.TECHNICAL: {
                'name': '技术',
                'colors': {'primary': '#059669', 'secondary': '#10B981', 'background': '#F0FDF4'},
                'layout': 'technical'
            },
            ResumeTemplate.EXECUTIVE: {
                'name': '高管',
                'colors': {'primary': '#1E3A5F', 'secondary': '#475569', 'background': '#FFFFFF'},
                'layout': 'executive'
            }
        }
    
    def create_resume(self, resume_id: str, resume: Resume, template: ResumeTemplate = ResumeTemplate.MODERN) -> str:
        """创建简历"""
        self.resumes[resume_id] = {
            'data': resume,
            'template': template,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        return resume_id
    
    def update_resume(self, resume_id: str, **kwargs):
        """更新简历信息"""
        if resume_id in self.resumes:
            resume = self.resumes[resume_id]['data']
            for key, value in kwargs.items():
                if hasattr(resume, key):
                    setattr(resume, key, value)
            self.resumes[resume_id]['updated_at'] = datetime.now().isoformat()
    
    def add_experience(self, resume_id: str, experience: Experience):
        """添加工作经历"""
        if resume_id in self.resumes:
            self.resumes[resume_id]['data'].experiences.append(experience)
    
    def add_education(self, resume_id: str, education: Education):
        """添加教育背景"""
        if resume_id in self.resumes:
            self.resumes[resume_id]['data'].educations.append(education)
    
    def add_skill(self, resume_id: str, skill: Skill):
        """添加技能"""
        if resume_id in self.resumes:
            self.resumes[resume_id]['data'].skills.append(skill)
    
    def add_project(self, resume_id: str, project: Project):
        """添加项目"""
        if resume_id in self.resumes:
            self.resumes[resume_id]['data'].projects.append(project)
    
    def generate_html(self, resume_id: str) -> str:
        """生成HTML简历"""
        if resume_id not in self.resumes:
            return ""
        
        resume = self.resumes[resume_id]['data']
        template = self.resumes[resume_id]['template']
        colors = self.templates[template]['colors']
        
        html = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{resume.name} - {resume.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Inter', system-ui, sans-serif; 
            background: #f5f5f5; 
            line-height: 1.6;
            color: #333;
        }}
        .resume {{
            max-width: 800px;
            margin: 40px auto;
            background: white;
            padding: 50px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .header {{
            border-bottom: 3px solid {colors['primary']};
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .name {{ font-size: 36px; font-weight: 700; color: {colors['primary']}; }}
        .title {{ font-size: 18px; color: {colors['secondary']}; margin-top: 5px; }}
        .contact {{
            display: flex;
            gap: 20px;
            margin-top: 15px;
            font-size: 14px;
            color: #666;
        }}
        .section {{ margin-bottom: 25px; }}
        .section-title {{
            font-size: 14px;
            font-weight: 700;
            color: {colors['primary']};
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid {colors['primary']};
            padding-bottom: 5px;
            margin-bottom: 15px;
        }}
        .experience-item, .education-item {{ margin-bottom: 20px; }}
        .item-header {{
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }}
        .company {{
            font-weight: 600;
            font-size: 16px;
            color: #1f2937;
        }}
        .date {{ font-size: 14px; color: #6b7280; }}
        .role {{ color: {colors['secondary']}; font-size: 15px; }}
        .description {{
            margin-top: 8px;
            font-size: 14px;
            color: #4b5563;
        }}
        .description li {{ margin-left: 20px; margin-bottom: 4px; }}
        .skills-grid {{
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }}
        .skill-tag {{
            background: {colors['primary']}15;
            color: {colors['primary']};
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 13px;
        }}
        .summary {{
            font-size: 14px;
            color: #4b5563;
            line-height: 1.7;
        }}
    </style>
</head>
<body>
    <div class="resume">
        <div class="header">
            <div class="name">{resume.name}</div>
            <div class="title">{resume.title}</div>
            <div class="contact">
                <span>📧 {resume.email}</span>
                <span>📱 {resume.phone}</span>
                <span>📍 {resume.location}</span>
            </div>
        </div>
        
        {f'<div class="section"><div class="section-title">个人简介</div><div class="summary">{resume.summary}</div></div>' if resume.summary else ''}
        
        {self._render_experiences(resume.experiences)}
        {self._render_educations(resume.educations)}
        {self._render_skills(resume.skills)}
        {self._render_projects(resume.projects)}
    </div>
</body>
</html>
"""
        return html
    
    def _render_experiences(self, experiences: List[Experience]) -> str:
        if not experiences:
            return ""
        
        html = '<div class="section"><div class="section-title">工作经历</div>'
        for exp in experiences:
            desc_items = ''.join([f'<li>{d}</li>' for d in exp.description])
            html += f"""
            <div class="experience-item">
                <div class="item-header">
                    <span class="company">{exp.company}</span>
                    <span class="date">{exp.start_date} - {exp.end_date}</span>
                </div>
                <div class="role">{exp.title}</div>
                <ul class="description">{desc_items}</ul>
            </div>
            """
        html += '</div>'
        return html
    
    def _render_educations(self, educations: List[Education]) -> str:
        if not educations:
            return ""
        
        html = '<div class="section"><div class="section-title">教育背景</div>'
        for edu in educations:
            html += f"""
            <div class="education-item">
                <div class="item-header">
                    <span class="company">{edu.institution}</span>
                    <span class="date">{edu.start_date} - {edu.end_date or 'Present'}</span>
                </div>
                <div class="role">{edu.degree} in {edu.field}</div>
                {f'<div class="description">GPA: {edu.gpa}</div>' if edu.gpa else ''}
            </div>
            """
        html += '</div>'
        return html
    
    def _render_skills(self, skills: List[Skill]) -> str:
        if not skills:
            return ""
        
        skill_tags = ''.join([f'<span class="skill-tag">{s.name}</span>' for s in skills])
        return f'<div class="section"><div class="section-title">技能</div><div class="skills-grid">{skill_tags}</div></div>'
    
    def _render_projects(self, projects: List[Project]) -> str:
        if not projects:
            return ""
        
        html = '<div class="section"><div class="section-title">项目</div>'
        for proj in projects:
            tech_tags = ', '.join(proj.technologies)
            html += f"""
            <div class="experience-item">
                <div class="company">{proj.name}</div>
                <div class="description">{proj.description}</div>
                <div class="description" style="margin-top: 5px;"><strong>技术:</strong> {tech_tags}</div>
            </div>
            """
        html += '</div>'
        return html
    
    def export_pdf(self, resume_id: str) -> str:
        """导出PDF（返回HTML，可由其他工具转换为PDF）"""
        return self.generate_html(resume_id)
    
    def get_score(self, resume_id: str) -> Dict:
        """简历评分"""
        if resume_id not in self.resumes:
            return {}
        
        resume = self.resumes[resume_id]['data']
        score = 0
        feedback = []
        
        # 基础信息检查
        if len(resume.name) > 0: score += 5
        if len(resume.title) > 0: score += 5
        if '@' in resume.email: score += 5
        if len(resume.phone) > 5: score += 5
        
        # 内容丰富度
        if resume.summary and len(resume.summary) > 50: 
            score += 10
        else:
            feedback.append("添加更详细的个人简介")
        
        if len(resume.experiences) >= 2: 
            score += 15
        else:
            feedback.append("至少添加2段工作经历")
        
        if len(resume.educations) > 0: score += 10
        if len(resume.skills) >= 5: 
            score += 10
        else:
            feedback.append("添加至少5个技能")
        
        return {
            'score': score,
            'max_score': 65,
            'percentage': round(score / 65 * 100),
            'feedback': feedback
        }

# 定价
PRICING = {
    'free': {
        'resumes': 1,
        'templates': [ResumeTemplate.MODERN, ResumeTemplate.CLASSIC],
        'features': ['基础编辑器', 'PDF导出']
    },
    'premium': {
        'price': 6,
        'resumes': 5,
        'templates': 'all',
        'features': ['所有模板', 'AI优化建议', '求职信生成', '跟踪链接']
    },
    'pro': {
        'price': 15,
        'resumes': 999,
        'features': ['无限简历', 'ATS优化', 'LinkedIn导入', '优先支持']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'premium': 80,
        'pro': 20
    }
    
    revenue = (
        monthly_users['premium'] * PRICING['premium']['price'] +
        monthly_users['pro'] * PRICING['pro']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    builder = ResumeBuilder()
    
    # 创建示例简历
    resume = Resume(
        name="张三",
        title="高级软件工程师",
        email="zhangsan@email.com",
        phone="+86 138-0000-0000",
        location="北京",
        summary="5年全栈开发经验，专注于Python和JavaScript技术栈。具有丰富的微服务架构设计和DevOps实践经验。"
    )
    
    # 添加工作经历
    builder.add_experience("resume_1", Experience(
        company="科技有限公司",
        title="高级软件工程师",
        start_date="2021-03",
        description=[
            "负责核心产品后端架构设计",
            "带领5人团队完成多个项目交付",
            "优化系统性能，提升响应速度50%"
        ]
    ))
    
    # 添加技能
    skills = ['Python', 'JavaScript', 'React', 'Docker', 'AWS', 'PostgreSQL']
    for skill in skills:
        builder.add_skill("resume_1", Skill(name=skill, level=4))
    
    # 创建并生成
    builder.create_resume("resume_1", resume)
    html = builder.generate_html("resume_1")
    
    print(f"✅ 简历生成完成")
    print(f"HTML长度: {len(html)} 字符")
    
    # 评分
    score = builder.get_score("resume_1")
    print(f"\n简历评分: {score['score']}/{score['max_score']} ({score['percentage']}%)")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
