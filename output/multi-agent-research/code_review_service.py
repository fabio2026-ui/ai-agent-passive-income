"""
多智能体代码审查服务 (Multi-Agent Code Review Service)
基于 CrewAI 框架实现

架构:
- 1个 Coordinator Agent (协调员): 分配任务、汇总结果
- 3个 Reviewer Agent (安全/性能/风格审查员): 并行审查
- 1个 Report Agent (报告生成): 生成最终审查报告
"""

import os
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool


# ============================================================================
# 数据模型定义
# ============================================================================

class CodeIssue(BaseModel):
    """代码问题模型"""
    severity: str = Field(..., description="严重程度: critical/high/medium/low")
    category: str = Field(..., description="问题类别: security/performance/style")
    line_number: int = Field(..., description="行号")
    description: str = Field(..., description="问题描述")
    suggestion: str = Field(..., description="修复建议")


class ReviewResult(BaseModel):
    """单个审查员的结果"""
    reviewer_type: str = Field(..., description="审查类型")
    issues: List[CodeIssue] = Field(default_factory=list, description="发现的问题")
    summary: str = Field(..., description="审查总结")
    score: int = Field(..., description="评分 (0-100)")


class FinalReport(BaseModel):
    """最终审查报告"""
    code_snippet: str = Field(..., description="审查的代码")
    overall_score: int = Field(..., description="综合评分")
    security_review: ReviewResult = Field(..., description="安全审查结果")
    performance_review: ReviewResult = Field(..., description="性能审查结果")
    style_review: ReviewResult = Field(..., description="风格审查结果")
    recommendations: List[str] = Field(default_factory=list, description="优先修复建议")
    executive_summary: str = Field(..., description="执行摘要")


# ============================================================================
# 自定义工具
# ============================================================================

class CodeAnalysisTool(BaseTool):
    """代码分析工具 - 模拟静态分析"""
    name: str = "code_analyzer"
    description: str = "分析代码结构和复杂度"
    
    def _run(self, code: str) -> Dict[str, Any]:
        lines = code.split('\n')
        return {
            "total_lines": len(lines),
            "complexity_score": min(len(lines) // 10, 10),
            "has_functions": "def " in code,
            "has_classes": "class " in code,
            "imports": [line for line in lines if line.strip().startswith('import') or line.strip().startswith('from')]
        }


# ============================================================================
# Agent 定义
# ============================================================================

class CodeReviewAgents:
    """代码审查Agent工厂"""
    
    def __init__(self, llm_model: str = "gpt-4"):
        self.llm_model = llm_model
        self.code_tool = CodeAnalysisTool()
    
    def create_coordinator(self) -> Agent:
        """创建协调员 Agent"""
        return Agent(
            role="代码审查协调员",
            goal="协调多智能体代码审查流程，确保高效完成代码质量评估",
            backstory="""你是一位经验丰富的技术主管，拥有10年以上代码审查经验。
            你擅长协调多个专家并行工作，并能够将他们的发现整合成统一的审查报告。
            你的职责是分配任务给各个专业审查员，并确保最终报告的质量和一致性。""",
            verbose=True,
            allow_delegation=True,
            llm=self.llm_model,
            tools=[self.code_tool]
        )
    
    def create_security_reviewer(self) -> Agent:
        """创建安全审查员 Agent"""
        return Agent(
            role="安全审查专家",
            goal="识别代码中的安全漏洞和潜在风险",
            backstory="""你是一位资深安全工程师，专注于代码安全审计。
            你精通OWASP Top 10、SQL注入、XSS、CSRF、不安全的反序列化等常见安全漏洞。
            你能够识别硬编码密钥、不安全的随机数生成、路径遍历等问题。
            你的审查风格严谨，不放过任何潜在的安全隐患。""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm_model
        )
    
    def create_performance_reviewer(self) -> Agent:
        """创建性能审查员 Agent"""
        return Agent(
            role="性能优化专家",
            goal="发现代码性能瓶颈和优化机会",
            backstory="""你是一位性能优化专家，擅长识别代码中的性能问题。
            你能够发现N+1查询、内存泄漏、不必要的循环、低效的算法实现等问题。
            你熟悉Python的性能特性，包括生成器、列表推导、缓存策略等。
            你的目标是帮助团队构建高性能的应用程序。""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm_model
        )
    
    def create_style_reviewer(self) -> Agent:
        """创建风格审查员 Agent"""
        return Agent(
            role="代码风格专家",
            goal="确保代码符合最佳实践和编码规范",
            backstory="""你是一位代码质量倡导者，专注于代码可读性和可维护性。
            你熟悉PEP 8、Google Python Style Guide等编码规范。
            你能够识别命名不规范、函数过长、缺少文档字符串、重复代码等问题。
            你相信好的代码应该像散文一样优雅易读。""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm_model
        )
    
    def create_report_generator(self) -> Agent:
        """创建报告生成 Agent"""
        return Agent(
            role="技术报告撰写专家",
            goal="整合各审查员的结果，生成专业的代码审查报告",
            backstory="""你是一位技术文档专家，擅长将技术发现转化为清晰、可执行的报告。
            你能够识别问题的优先级，提供具体的修复建议，并以结构化的方式呈现结果。
            你的报告既适合开发人员执行修复，也适合管理层了解代码质量状况。""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm_model
        )


# ============================================================================
# Task 定义
# ============================================================================

class CodeReviewTasks:
    """代码审查任务工厂"""
    
    @staticmethod
    def create_coordination_task(coordinator: Agent, code: str) -> Task:
        """创建协调任务"""
        return Task(
            description=f"""协调代码审查流程。
            
            待审查代码:
            ```python
            {code}
            ```
            
            你的职责:
            1. 分析代码的整体结构和复杂度
            2. 将审查任务分配给安全、性能、风格三个专家
            3. 收集他们的审查结果
            4. 传递给报告生成专家整合最终结果
            
            输出要求:
            - 提供代码复杂度分析
            - 协调各专家并行工作
            - 确保所有关键问题都被覆盖
            """,
            expected_output="协调完成的代码审查工作流和初步分析结果",
            agent=coordinator
        )
    
    @staticmethod
    def create_security_review_task(reviewer: Agent, code: str) -> Task:
        """创建安全审查任务"""
        return Task(
            description=f"""对以下代码进行全面的安全审查：
            
            ```python
            {code}
            ```
            
            检查重点:
            1. 注入漏洞 (SQL注入、命令注入、代码注入)
            2. 敏感数据处理 (硬编码密钥、明文存储)
            3. 输入验证 (缺乏边界检查、类型验证)
            4. 认证授权问题
            5. 不安全的反序列化
            6. 路径遍历
            7. 不安全的随机数生成
            
            输出格式:
            以JSON格式返回 ReviewResult，包含:
            - reviewer_type: "security"
            - issues: 发现的每个问题（severity, line_number, description, suggestion）
            - summary: 安全审查总结
            - score: 安全评分 (0-100)
            """,
            expected_output="安全审查结果，包含发现的漏洞和修复建议",
            agent=reviewer
        )
    
    @staticmethod
    def create_performance_review_task(reviewer: Agent, code: str) -> Task:
        """创建性能审查任务"""
        return Task(
            description=f"""对以下代码进行性能分析：
            
            ```python
            {code}
            ```
            
            检查重点:
            1. 算法复杂度 (时间/空间复杂度)
            2. 数据库查询优化 (N+1查询、缺少索引)
            3. 内存使用 (内存泄漏、大对象滞留)
            4. I/O操作效率
            5. 循环优化
            6. 缓存策略
            7. 不必要的对象创建
            
            输出格式:
            以JSON格式返回 ReviewResult，包含:
            - reviewer_type: "performance"
            - issues: 发现的每个性能问题
            - summary: 性能分析总结
            - score: 性能评分 (0-100)
            """,
            expected_output="性能审查结果，包含性能瓶颈和优化建议",
            agent=reviewer
        )
    
    @staticmethod
    def create_style_review_task(reviewer: Agent, code: str) -> Task:
        """创建风格审查任务"""
        return Task(
            description=f"""对以下代码进行代码风格和规范审查：
            
            ```python
            {code}
            ```
            
            检查重点:
            1. PEP 8 规范遵循情况
            2. 命名规范 (变量、函数、类)
            3. 代码文档 (docstring、注释)
            4. 函数长度和复杂度
            5. 代码重复
            6. 导入排序和未使用导入
            7. 类型注解
            8. 异常处理规范
            
            输出格式:
            以JSON格式返回 ReviewResult，包含:
            - reviewer_type: "style"
            - issues: 发现的每个风格问题
            - summary: 风格审查总结
            - score: 代码风格评分 (0-100)
            """,
            expected_output="代码风格审查结果，包含规范问题和改进建议",
            agent=reviewer
        )
    
    @staticmethod
    def create_report_task(generator: Agent, code: str, context: str = "") -> Task:
        """创建报告生成任务"""
        return Task(
            description=f"""基于各审查专家的发现，生成最终的代码审查报告。
            
            原始代码:
            ```python
            {code}
            ```
            
            上下文信息:
            {context}
            
            整合要求:
            1. 汇总所有审查员的发现
            2. 计算综合评分
            3. 按优先级排序修复建议
            4. 生成执行摘要
            
            输出格式 (JSON):
            {{
                "code_snippet": "代码片段",
                "overall_score": 综合评分,
                "security_review": {{...}},
                "performance_review": {{...}},
                "style_review": {{...}},
                "recommendations": ["优先修复建议1", "建议2", ...],
                "executive_summary": "执行摘要"
            }}
            """,
            expected_output="完整的代码审查报告，包含所有维度的评估和修复建议",
            agent=generator,
            context=True  # 允许访问其他任务的输出
        )


# ============================================================================
# Crew 编排
# ============================================================================

class CodeReviewCrew:
    """代码审查 Crew 编排器"""
    
    def __init__(self, llm_model: str = "gpt-4"):
        self.agents = CodeReviewAgents(llm_model)
        self.tasks = CodeReviewTasks()
    
    def create_crew(self, code: str) -> Crew:
        """创建并配置 Crew"""
        # 创建 Agents
        coordinator = self.agents.create_coordinator()
        security_reviewer = self.agents.create_security_reviewer()
        performance_reviewer = self.agents.create_performance_reviewer()
        style_reviewer = self.agents.create_style_reviewer()
        report_generator = self.agents.create_report_generator()
        
        # 创建 Tasks
        security_task = self.tasks.create_security_review_task(security_reviewer, code)
        performance_task = self.tasks.create_performance_review_task(performance_reviewer, code)
        style_task = self.tasks.create_style_review_task(style_reviewer, code)
        
        # 报告生成任务依赖于前面三个任务
        report_task = self.tasks.create_report_task(report_generator, code)
        report_task.context = [security_task, performance_task, style_task]
        
        # 创建 Crew - 使用分层处理实现并行审查
        crew = Crew(
            agents=[
                coordinator,
                security_reviewer,
                performance_reviewer,
                style_reviewer,
                report_generator
            ],
            tasks=[
                security_task,
                performance_task,
                style_task,
                report_task
            ],
            process=Process.parallel,  # 并行执行审查任务
            verbose=True,
            memory=True,  # 启用记忆功能
            cache=True    # 启用缓存
        )
        
        return crew
    
    def review(self, code: str) -> str:
        """执行代码审查"""
        crew = self.create_crew(code)
        result = crew.kickoff()
        return result


# ============================================================================
# 示例使用
# ============================================================================

def main():
    """主函数 - 示例代码审查"""
    
    # 示例代码 - 包含多种问题
    sample_code = '''
import os
import hashlib

def process_user_data(user_input, db_conn):
    # 安全问题: SQL注入
    query = f"SELECT * FROM users WHERE name = '{user_input}'"
    result = db_conn.execute(query)
    
    # 安全问题: 硬编码密钥
    SECRET_KEY = "my_secret_key_12345"
    
    # 性能问题: 低效的循环
    data = []
    for i in range(1000):
        for j in range(1000):
            data.append(i * j)
    
    # 风格问题: 命名不规范、缺少文档
    def calc(x, y):
        return x + y
    
    # 安全问题: 不安全的哈希
    password_hash = hashlib.md5(user_input.encode()).hexdigest()
    
    return result

def anotherFunction():
    x=1
    y=2
    z=x+y  # 风格问题: 空格不规范
    print(z)
'''
    
    # 设置 OpenAI API Key
    if "OPENAI_API_KEY" not in os.environ:
        print("⚠️  请设置 OPENAI_API_KEY 环境变量")
        print("export OPENAI_API_KEY='your-api-key'")
        return
    
    # 创建审查服务
    print("🔍 启动多智能体代码审查服务...")
    print("=" * 60)
    
    review_service = CodeReviewCrew(llm_model="gpt-4")
    
    # 执行审查
    print("\n📝 待审查代码:\n")
    print(sample_code)
    print("\n" + "=" * 60)
    print("\n🤖 开始多智能体协同审查...\n")
    
    result = review_service.review(sample_code)
    
    print("\n" + "=" * 60)
    print("📊 审查报告:\n")
    print(result)
    
    return result


if __name__ == "__main__":
    main()
