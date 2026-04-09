# Multi-Agent Orchestration Frameworks: Comprehensive Research Report

**Prepared by:** AI Research Assistant  
**Date:** April 1, 2026  
**Objective:** Evaluate CrewAI, AutoGen, LangGraph, and LlamaIndex Agents for multi-agent code review/task automation use case

---

## Executive Summary

After extensive research across 4 major multi-agent orchestration frameworks, **LangGraph emerges as the recommended choice** for production-grade multi-agent code review systems, while **CrewAI** is optimal for rapid MVP development.

| Use Case | Recommended Framework |
|----------|----------------------|
| **MVP/Prototype** | CrewAI (fastest setup, lowest learning curve) |
| **Production System** | LangGraph (most reliable, best observability) |
| **Code Review Automation** | LangGraph + Hybrid approach (see Section 5) |

---

## 1. Framework Analysis

### 1.1 CrewAI

**Tagline:** "The Leading Multi-Agent Platform"  
**Founded:** January 2024  
**Scale:** 450M+ agentic workflows/month, 60% of Fortune 500 using it

#### Overview
CrewAI is a role-based multi-agent framework built on top of LangChain. It uses human-team metaphors (Researcher, Writer, Manager) to make multi-agent orchestration intuitive. Agents collaborate autonomously through role-based delegation.

#### Ease of Use
| Metric | Rating | Details |
|--------|--------|---------|
| Setup Time | ⭐⭐⭐⭐⭐ | 30-60 minutes |
| Learning Curve | Low | Role-based concepts are intuitive |
| First Prototype | 2-4 hours | Fastest among all frameworks |
| Documentation | Excellent | Comprehensive with examples |

**Code Example - Basic Crew:**
```python
from crewai import Agent, Task, Crew

# Define agents with roles
researcher = Agent(
    role='Code Researcher',
    goal='Analyze code patterns and best practices',
    backstory='Expert software engineer with 10+ years experience',
    verbose=True
)

reviewer = Agent(
    role='Code Reviewer', 
    goal='Identify bugs, security issues, and style violations',
    backstory='Senior security engineer specializing in code audits',
    verbose=True
)

# Define tasks
task = Task(
    description='Review the following Python code for bugs and security issues',
    agent=reviewer,
    expected_output='Detailed code review report with findings'
)

# Create crew
crew = Crew(
    agents=[researcher, reviewer],
    tasks=[task],
    process='sequential'
)

result = crew.kickoff()
```

#### Features Analysis
| Feature | Support | Notes |
|---------|---------|-------|
| Multi-Agent | ✅ Native | Role-based collaboration |
| Memory | ✅ Advanced | Short-term, long-term, entity memory |
| Tools | ✅ 700+ | Via LangChain integration |
| Human-in-the-Loop | ✅ | `human_input` flag on tasks |
| Caching | ✅ | Built-in tool caching |
| Replay | ✅ | Replay from latest kickoff |
| Code Execution | ✅ | Via custom tools |

#### Deployment Options
| Option | Details |
|--------|---------|
| Open Source (Self-hosted) | Free, unlimited usage, requires own infrastructure |
| CrewAI Cloud | Managed hosting with visual studio |
| CrewAI AMP | Enterprise platform with serverless containers |

#### Pricing
| Plan | Price | Executions/Month | Live Crews | Seats |
|------|-------|------------------|------------|-------|
| **Open Source** | Free | Unlimited | Unlimited | Unlimited |
| **Free Cloud** | $0 | 50 | 1 | 1 |
| **Basic** | $99/month | 100 | 2 | 5 |
| **Standard** | $6,000/year | 1,000 | 5 | Unlimited |
| **Pro** | $12,000/year | 2,000 | 10 | Unlimited |
| **Enterprise** | $60,000/year | 10,000 | 50 | Unlimited |
| **Ultra** | $120,000/year | 500,000 | 100 | Unlimited |

#### Community & Support
- **GitHub:** Active development, 20k+ stars
- **Discord:** Active community
- **Documentation:** Comprehensive with tutorials
- **Support:** Community (free) → Enterprise (paid tiers)

#### Strengths
- ✅ Fastest time to prototype
- ✅ Intuitive role-based design
- ✅ Excellent documentation
- ✅ Strong memory system
- ✅ 60% of Fortune 500 trust it

#### Weaknesses
- ❌ Can hit "complexity wall" in production
- ❌ Unpredictable loops in complex workflows
- ❌ Expensive hosted pricing for scale
- ❌ Less control over execution flow

---

### 1.2 AutoGen (Microsoft)

**Tagline:** "A framework for creating multi-agent AI applications"  
**Maintainer:** Microsoft  
**Status:** Being transitioned to Microsoft Agent Framework

#### Overview
AutoGen is Microsoft's framework for building conversational multi-agent systems. It treats workflows as conversations between agents, making it intuitive for dialogue-heavy applications.

#### Ease of Use
| Metric | Rating | Details |
|--------|--------|---------|
| Setup Time | ⭐⭐⭐⭐ | 15-30 minutes |
| Learning Curve | Low-Medium | Conversational paradigm is intuitive |
| First Prototype | 30-60 minutes | Very fast for simple use cases |
| Documentation | Good | Microsoft quality, but evolving |

**Code Example - Multi-Agent Chat:**
```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

async def main():
    model_client = OpenAIChatCompletionClient(model="gpt-4.1")
    
    # Create agents
    code_reviewer = AssistantAgent(
        name="code_reviewer",
        system_message="You are an expert code reviewer. Focus on security, performance, and best practices.",
        model_client=model_client,
    )
    
    security_expert = AssistantAgent(
        name="security_expert", 
        system_message="You are a security specialist. Identify vulnerabilities and security anti-patterns.",
        model_client=model_client,
    )
    
    # Create team with round-robin chat
    team = RoundRobinGroupChat(
        [code_reviewer, security_expert],
        max_turns=4
    )
    
    # Run the conversation
    await Console(team.run_stream(task="Review this Python function for security issues..."))

asyncio.run(main())
```

#### Features Analysis
| Feature | Support | Notes |
|---------|---------|-------|
| Multi-Agent | ✅ Native | Conversational collaboration |
| Memory | ✅ | Conversation-based context |
| Tools | ✅ Good | Code executors, function calling |
| Human-in-the-Loop | ✅ Advanced | NEVER, TERMINATE, ALWAYS modes |
| Caching | ✅ | API request caching |
| Replay | ⚠️ Limited | Manual state updates |
| Code Execution | ✅ Excellent | Built-in code executors |

#### Deployment Options
| Option | Details |
|--------|---------|
| Open Source | Free, self-hosted |
| AutoGen Studio | No-code GUI for prototyping |
| Azure Integration | Via Microsoft ecosystem |

#### Pricing
- **Open Source:** Free (MIT License)
- **Azure Integration:** Standard Azure pricing
- **No enterprise pricing tier** (framework only)

#### Community & Support
- **GitHub:** Microsoft-backed, active development
- **Discord:** Active community
- **Documentation:** Good, but rapidly evolving
- **Important Note:** Microsoft is transitioning to new "Microsoft Agent Framework"

#### Strengths
- ✅ Excellent for conversational workflows
- ✅ Built-in code execution capabilities
- ✅ Minimal coding for basic tasks
- ✅ Microsoft backing and ecosystem
- ✅ Flexible dialogue structure

#### Weaknesses
- ❌ Limited support for structured workflows
- ❌ Being transitioned to new framework
- ❌ Less suitable for non-conversational processes
- ❌ Documentation sometimes lags updates

---

### 1.3 LangGraph (LangChain)

**Tagline:** "Build resilient language agents as graphs"  
**Maintainer:** LangChain AI  
**Architecture:** Graph-based state machines

#### Overview
LangGraph is a framework for building stateful, multi-agent applications using graph theory. It represents workflows as directed graphs where nodes are agents/functions and edges are transitions.

#### Ease of Use
| Metric | Rating | Details |
|--------|--------|---------|
| Setup Time | ⭐⭐⭐ | 1-2 hours |
| Learning Curve | Medium-High | Graph concepts require understanding |
| First Prototype | 4-8 hours | Longer setup, but more robust |
| Documentation | Excellent | Comprehensive, well-structured |

**Code Example - Code Review Graph:**
```python
from typing import TypedDict, List, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Define state
class CodeReviewState(TypedDict):
    code: str
    language: str
    syntax_issues: List[str]
    security_issues: List[str]
    performance_issues: List[str]
    final_report: str
    current_step: str

# Initialize LLM
llm = ChatOpenAI(model="gpt-4.1")

# Node: Syntax Review
def syntax_review(state: CodeReviewState):
    """Review code for syntax and style issues."""
    messages = [
        SystemMessage(content="You are a code syntax expert. Identify syntax errors and style violations."),
        HumanMessage(content=f"Review this {state['language']} code:\n\n{state['code']}")
    ]
    response = llm.invoke(messages)
    return {
        "syntax_issues": response.content.split("\n"),
        "current_step": "syntax_complete"
    }

# Node: Security Review
def security_review(state: CodeReviewState):
    """Review code for security vulnerabilities."""
    messages = [
        SystemMessage(content="You are a security expert. Identify security vulnerabilities."),
        HumanMessage(content=f"Review this {state['language']} code:\n\n{state['code']}")
    ]
    response = llm.invoke(messages)
    return {
        "security_issues": response.content.split("\n"),
        "current_step": "security_complete"
    }

# Node: Performance Review
def performance_review(state: CodeReviewState):
    """Review code for performance issues."""
    messages = [
        SystemMessage(content="You are a performance expert. Identify performance bottlenecks."),
        HumanMessage(content=f"Review this {state['language']} code:\n\n{state['code']}")
    ]
    response = llm.invoke(messages)
    return {
        "performance_issues": response.content.split("\n"),
        "current_step": "performance_complete"
    }

# Node: Generate Final Report
def generate_report(state: CodeReviewState):
    """Compile final review report."""
    report = f"""
# Code Review Report

## Syntax & Style Issues
{chr(10).join(state['syntax_issues'])}

## Security Issues
{chr(10).join(state['security_issues'])}

## Performance Issues
{chr(10).join(state['performance_issues'])}
"""
    return {"final_report": report, "current_step": "complete"}

# Build graph
workflow = StateGraph(CodeReviewState)

# Add nodes
workflow.add_node("syntax", syntax_review)
workflow.add_node("security", security_review)
workflow.add_node("performance", performance_review)
workflow.add_node("report", generate_report)

# Add edges
workflow.set_entry_point("syntax")
workflow.add_edge("syntax", "security")
workflow.add_edge("security", "performance")
workflow.add_edge("performance", "report")
workflow.add_edge("report", END)

# Compile
app = workflow.compile()

# Execute
result = app.invoke({
    "code": "def get_user_data(user_id):\n    query = f'SELECT * FROM users WHERE id = {user_id}'\n    return db.execute(query)",
    "language": "python",
    "syntax_issues": [],
    "security_issues": [],
    "performance_issues": [],
    "final_report": "",
    "current_step": ""
})

print(result["final_report"])
```

#### Features Analysis
| Feature | Support | Notes |
|---------|---------|-------|
| Multi-Agent | ✅ Excellent | Graph-based orchestration |
| Memory | ✅ Advanced | Short-term, long-term, entity, persistent checkpoints |
| Tools | ✅ 600+ | LangChain ecosystem |
| Human-in-the-Loop | ✅ Advanced | Interrupt/resume at any node |
| Caching | ✅ | Persistence layer with replay |
| Replay | ✅ Excellent | Time travel debugging |
| Code Execution | ✅ | Via LangChain tools |

#### Deployment Options
| Option | Details |
|--------|---------|
| Open Source | Free, self-hosted |
| LangGraph Cloud | Managed hosting (pay-per-use) |
| LangServe | Production API deployment |
| Self-hosted | Full control over infrastructure |

#### Pricing
- **Open Source:** Free (MIT License)
- **LangGraph Cloud:** Usage-based pricing (estimated ~$0.001-0.01 per node execution)
- **LangServe:** Self-hosted, infrastructure costs only
- **Enterprise:** Custom pricing through LangChain

#### Community & Support
- **GitHub:** Very active, 90k+ stars (LangChain ecosystem)
- **Discord:** Large, active community
- **Documentation:** Excellent, regularly updated
- **Enterprise:** Commercial support available

#### Strengths
- ✅ Production-ready from day one
- ✅ Fine-grained control over execution flow
- ✅ Built-in persistence and checkpointing
- ✅ Time travel debugging
- ✅ Excellent for complex, stateful workflows
- ✅ Most reliable for enterprise use

#### Weaknesses
- ❌ Steeper learning curve
- ❌ More boilerplate code required
- ❌ Documentation can lag behind rapid updates
- ❌ Breaking changes in frequent updates

---

### 1.4 LlamaIndex Agents

**Tagline:** "The framework for Context-Augmented LLM Applications"  
**Focus:** RAG + Agents over your data

#### Overview
LlamaIndex specializes in building agents that work with your data through context augmentation. While not primarily a multi-agent framework, it provides agent capabilities built on top of its data ingestion and indexing infrastructure.

#### Ease of Use
| Metric | Rating | Details |
|--------|--------|---------|
| Setup Time | ⭐⭐⭐⭐ | 30-60 minutes |
| Learning Curve | Low-Medium | Data-first approach is intuitive |
| First Prototype | 2-4 hours | Quick for RAG + agent use cases |
| Documentation | Excellent | Comprehensive |

**Code Example - RAG-Based Code Review Agent:**
```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI
from llama_index.core.tools import FunctionTool

# Load code documentation and best practices
documents = SimpleDirectoryReader("./code_standards").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

# Create tools
def review_code(code: str) -> str:
    """Review code against best practices."""
    # Query knowledge base for relevant patterns
    context = query_engine.query(f"Best practices for: {code}")
    return str(context)

code_review_tool = FunctionTool.from_defaults(fn=review_code)

# Create agent
llm = OpenAI(model="gpt-4")
agent = ReActAgent.from_tools(
    tools=[code_review_tool],
    llm=llm,
    verbose=True,
    system_prompt="""You are a code review expert. Use the review_code tool to check 
    code against best practices from the knowledge base."""
)

# Run agent
response = agent.chat("Review this Python function: def get_data(): pass")
print(response)
```

#### Features Analysis
| Feature | Support | Notes |
|---------|---------|-------|
| Multi-Agent | ⚠️ Limited | Not primary focus |
| Memory | ✅ Good | Conversation memory |
| Tools | ✅ Excellent | LlamaHub: 1000+ integrations |
| Human-in-the-Loop | ✅ | Supported |
| RAG | ✅ Best-in-class | Core strength |
| Data Connectors | ✅ Excellent | 100+ data sources |

#### Deployment Options
| Option | Details |
|--------|---------|
| Open Source | Free, self-hosted |
| LlamaCloud | Managed service with LlamaParse |
| llama_deploy | Deploy workflows as microservices |

#### Pricing
- **Open Source:** Free
- **LlamaCloud:** 
  - Free: 10,000 credits/month
  - Paid: Custom pricing
- **LlamaParse:** Usage-based

#### Community & Support
- **GitHub:** Very active
- **Discord:** Active community
- **Documentation:** Excellent

#### Strengths
- ✅ Best-in-class RAG capabilities
- ✅ Excellent data connectors
- ✅ Strong for data-heavy use cases
- ✅ LlamaHub has 1000+ integrations

#### Weaknesses
- ❌ Not primarily a multi-agent framework
- ❌ Limited native multi-agent orchestration
- ❌ Better suited for single-agent RAG workflows

---

## 2. Framework Comparison Matrix

| Criteria | CrewAI | AutoGen | LangGraph | LlamaIndex |
|----------|--------|---------|-----------|------------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Setup Time** | 30-60 min | 15-30 min | 1-2 hours | 30-60 min |
| **Learning Curve** | Low | Low-Med | Med-High | Low-Med |
| **First Prototype** | 2-4 hours | 30-60 min | 4-8 hours | 2-4 hours |
| **Production Readiness** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Multi-Agent** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Memory** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Tools** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Human-in-Loop** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Observability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Community** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Pricing (OSS)** | Free | Free | Free | Free |
| **Pricing (Hosted)** | Expensive | N/A | Moderate | Moderate |

---

## 3. Recommendations by Use Case

### 3.1 MVP/Prototype (Fastest to Market)

**Winner: CrewAI**

**Rationale:**
- 30-60 minute setup time
- Intuitive role-based design
- First prototype in 2-4 hours
- Excellent documentation
- Fastest path to demonstrating value

**When to choose:**
- Need to validate concept quickly
- Building demo for stakeholders
- Limited engineering resources
- Rapid iteration required

---

### 3.2 Production (Most Reliable)

**Winner: LangGraph**

**Rationale:**
- Built for production from day one
- Graph-based state machines provide predictability
- Built-in persistence and checkpointing
- Time travel debugging
- Fine-grained control over execution
- Easier to maintain and debug at scale

**When to choose:**
- Deploying to production
- Need strict SLAs
- Complex workflow requirements
- Team has engineering bandwidth
- Long-term maintainability is priority

---

### 3.3 Our Specific Use Case: Multi-Agent Code Review/Task Automation

**Winner: LangGraph with Hybrid Approach**

**Rationale:**
Code review systems require:
1. **Reliability** - Can't miss critical security issues
2. **Observability** - Need to trace decisions
3. **Structured Output** - Consistent report format
4. **Scalability** - Handle large codebases
5. **Integration** - Work with GitHub/GitLab

LangGraph provides all of these, while CrewAI may hit complexity walls.

**Alternative: Hybrid Approach (CrewAI within LangGraph)**
- Use LangGraph as the "skeleton" for reliability
- Use CrewAI within specific nodes for creative tasks (brainstorming, complex analysis)
- Best of both worlds

---

## 4. Sample Implementation: Multi-Agent Code Review Service

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Code Review Service                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌───────────┐       ┌───────────┐
            │  GitHub   │       │   GitLab  │
            │ Webhook   │       │ Webhook   │
            └─────┬─────┘       └─────┬─────┘
                  └──────────┬──────────┘
                             ▼
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (FastAPI)     │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │  LangGraph      │
                    │  Orchestrator   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │ Syntax Agent │   │Security Agent│   │Performance   │
 │   (Node)     │   │   (Node)     │   │   Agent      │
 └──────────────┘   └──────────────┘   └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Report Generator│
                    │    (Node)       │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │  Notification   │
                    │  (Slack/Email)  │
                    └─────────────────┘
```

### 4.2 Complete Implementation

```python
# requirements.txt
"""
langgraph==0.0.50
langchain-openai==0.1.0
langchain-core==0.1.0
fastapi==0.109.0
uvicorn==0.27.0
redis==5.0.0
pydantic==2.5.0
python-dotenv==1.0.0
PyGithub==2.1.0
"""

# models.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class Issue(BaseModel):
    severity: Severity
    category: str
    line_number: Optional[int]
    message: str
    suggestion: str

class ReviewState(BaseModel):
    repository: str
    pr_number: int
    files: List[Dict[str, Any]]
    syntax_issues: List[Issue] = []
    security_issues: List[Issue] = []
    performance_issues: List[Issue] = []
    final_report: Optional[str] = None
    status: str = "pending"

# agents.py
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from models import Issue, Severity
import json
import re

llm = ChatOpenAI(model="gpt-4o", temperature=0)

class CodeReviewAgents:
    """Collection of specialized code review agents."""
    
    @staticmethod
    def syntax_agent(file_content: str, filename: str, language: str) -> List[Issue]:
        """Agent specialized in syntax and style review."""
        system_prompt = """You are a code syntax and style expert. Review code for:
        - Syntax errors
        - Style violations (PEP8 for Python, etc.)
        - Type hint issues
        - Documentation completeness
        
        Return findings as JSON array with fields: severity, category, line_number, message, suggestion"""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Review this {language} file ({filename}):\n\n{file_content}")
        ]
        
        response = llm.invoke(messages)
        return CodeReviewAgents._parse_issues(response.content)
    
    @staticmethod
    def security_agent(file_content: str, filename: str, language: str) -> List[Issue]:
        """Agent specialized in security review."""
        system_prompt = """You are a security expert. Identify:
        - SQL injection vulnerabilities
        - XSS vulnerabilities  
        - Hardcoded secrets
        - Insecure deserialization
        - Path traversal issues
        - Unsafe eval/exec usage
        
        Return findings as JSON array."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Security review for {filename}:\n\n{file_content}")
        ]
        
        response = llm.invoke(messages)
        return CodeReviewAgents._parse_issues(response.content)
    
    @staticmethod
    def performance_agent(file_content: str, filename: str, language: str) -> List[Issue]:
        """Agent specialized in performance review."""
        system_prompt = """You are a performance optimization expert. Identify:
        - O(n²) or worse algorithms
        - Unnecessary database queries
        - Memory leaks
        - Blocking operations
        - Inefficient data structures
        - N+1 query problems
        
        Return findings as JSON array."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Performance review for {filename}:\n\n{file_content}")
        ]
        
        response = llm.invoke(messages)
        return CodeReviewAgents._parse_issues(response.content)
    
    @staticmethod
    def _parse_issues(content: str) -> List[Issue]:
        """Parse LLM response into Issue objects."""
        try:
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                issues_data = json.loads(json_match.group())
                return [Issue(**issue) for issue in issues_data]
        except Exception as e:
            print(f"Error parsing issues: {e}")
        return []

# workflow.py
from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import operator
from agents import CodeReviewAgents
from models import Issue, ReviewState

# Define state type
class GraphState(TypedDict):
    repository: str
    pr_number: int
    files: List[Dict[str, Any]]
    current_file_index: int
    syntax_issues: Annotated[List[Issue], operator.add]
    security_issues: Annotated[List[Issue], operator.add]
    performance_issues: Annotated[List[Issue], operator.add]
    final_report: str
    status: str

# Node functions
def initialize_review(state: GraphState) -> Dict:
    """Initialize the review process."""
    return {"current_file_index": 0, "status": "in_progress"}

def has_more_files(state: GraphState) -> str:
    """Check if there are more files to process."""
    if state["current_file_index"] >= len(state["files"]):
        return "generate_report"
    return "process_file"

def process_file(state: GraphState) -> Dict:
    """Process current file with all agents."""
    file = state["files"][state["current_file_index"]]
    content = file["content"]
    filename = file["filename"]
    language = file.get("language", "python")
    
    # Run all agents
    syntax = CodeReviewAgents.syntax_agent(content, filename, language)
    security = CodeReviewAgents.security_agent(content, filename, language)
    performance = CodeReviewAgents.performance_agent(content, filename, language)
    
    return {
        "syntax_issues": syntax,
        "security_issues": security,
        "performance_issues": performance,
        "current_file_index": state["current_file_index"] + 1
    }

def generate_report(state: GraphState) -> Dict:
    """Generate final review report."""
    all_issues = (
        state["syntax_issues"] + 
        state["security_issues"] + 
        state["performance_issues"]
    )
    
    # Group by severity
    critical = [i for i in all_issues if i.severity == Severity.CRITICAL]
    high = [i for i in all_issues if i.severity == Severity.HIGH]
    medium = [i for i in all_issues if i.severity == Severity.MEDIUM]
    low = [i for i in all_issues if i.severity == Severity.LOW]
    
    report = f"""
# Code Review Report

**Repository:** {state['repository']}  
**PR:** #{state['pr_number']}

## Summary
- 🔴 Critical: {len(critical)}
- 🟠 High: {len(high)}
- 🟡 Medium: {len(medium)}
- 🔵 Low: {len(low)}

## Critical Issues (Must Fix)
{CodeReviewAgents._format_issues(critical)}

## High Priority Issues
{CodeReviewAgents._format_issues(high)}

## Medium Priority Issues
{CodeReviewAgents._format_issues(medium)}

## Low Priority Issues
{CodeReviewAgents._format_issues(low)}

---
*Generated by AI Code Review Service*
"""
    return {"final_report": report, "status": "completed"}

# Build workflow
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("initialize", initialize_review)
workflow.add_node("process_file", process_file)
workflow.add_node("generate_report", generate_report)

# Add edges
workflow.set_entry_point("initialize")
workflow.add_conditional_edges(
    "initialize",
    has_more_files,
    {"process_file": "process_file", "generate_report": "generate_report"}
)
workflow.add_conditional_edges(
    "process_file",
    has_more_files,
    {"process_file": "process_file", "generate_report": "generate_report"}
)
workflow.add_edge("generate_report", END)

# Compile with persistence
memory = MemorySaver()
code_review_app = workflow.compile(checkpointer=memory)

# api.py
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import JSONResponse
from workflow import code_review_app
from models import ReviewState
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Code Review Service")

@app.post("/webhook/github")
async def github_webhook(payload: dict, background_tasks: BackgroundTasks):
    """Handle GitHub PR webhook."""
    if payload.get("action") in ["opened", "synchronize"]:
        background_tasks.add_task(
            process_pr,
            repository=payload["repository"]["full_name"],
            pr_number=payload["pull_request"]["number"],
            files=await fetch_pr_files(payload)
        )
    return {"status": "accepted"}

async def fetch_pr_files(payload: dict) -> list:
    """Fetch PR files from GitHub API."""
    # Implementation details...
    return []

async def process_pr(repository: str, pr_number: int, files: list):
    """Process PR through LangGraph workflow."""
    config = {"configurable": {"thread_id": f"{repository}-{pr_number}"}}
    
    result = await code_review_app.ainvoke({
        "repository": repository,
        "pr_number": pr_number,
        "files": files,
        "syntax_issues": [],
        "security_issues": [],
        "performance_issues": [],
        "final_report": "",
        "status": "pending"
    }, config)
    
    # Post comment to PR
    await post_pr_comment(repository, pr_number, result["final_report"])

async def post_pr_comment(repository: str, pr_number: int, report: str):
    """Post review comment to PR."""
    # Implementation using GitHub API...
    pass

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 4.3 Deployment Options

#### Option 1: Self-Hosted (Docker)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  code-review:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
```

#### Option 2: Kubernetes
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-review-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: code-review
  template:
    metadata:
      labels:
        app: code-review
    spec:
      containers:
      - name: api
        image: code-review:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: openai
```

#### Option 3: Serverless (LangGraph Cloud)
```python
# Deploy to LangGraph Cloud
# langgraph.json
{
  "dependencies": ["./requirements.txt"],
  "graphs": {
    "code_review": "./workflow.py:code_review_app"
  },
  "env": {
    "OPENAI_API_KEY": "${OPENAI_API_KEY}"
  }
}
```

---

## 5. Implementation Roadmap

### Phase 1: MVP (Weeks 1-2)
**Goal:** Demonstrate basic functionality

| Task | Duration | Framework |
|------|----------|-----------|
| Set up development environment | 1 day | Any |
| Implement basic CrewAI prototype | 2 days | CrewAI |
| Create simple PR webhook handler | 2 days | FastAPI |
| Basic reporting to PR comments | 2 days | GitHub API |
| Testing with sample repos | 3 days | - |

**Deliverable:** Working demo that can review simple Python files

---

### Phase 2: Production Foundation (Weeks 3-4)
**Goal:** Transition to production-ready architecture

| Task | Duration | Framework |
|------|----------|-----------|
| Migrate to LangGraph | 3 days | LangGraph |
| Implement state persistence | 2 days | Redis |
| Add parallel file processing | 2 days | LangGraph |
| Implement retry logic | 1 day | LangGraph |
| Add comprehensive logging | 1 day | Structured logging |

**Deliverable:** Reliable service with checkpointing and observability

---

### Phase 3: Feature Expansion (Weeks 5-6)
**Goal:** Support multiple languages and advanced features

| Task | Duration | Details |
|------|----------|---------|
| Add JavaScript/TypeScript support | 2 days | Language detection |
| Add Go support | 2 days | Go-specific rules |
| Implement custom rule engine | 3 days | User-defined rules |
| Add batch processing | 2 days | Large PRs |
| Human-in-the-loop review | 1 day | For critical issues |

**Deliverable:** Multi-language support with custom rules

---

### Phase 4: Scale & Optimize (Weeks 7-8)
**Goal:** Handle production load

| Task | Duration | Details |
|------|----------|---------|
| Implement caching | 2 days | LLM response caching |
| Add rate limiting | 1 day | GitHub API limits |
| Optimize token usage | 2 days | Smart chunking |
| Add metrics and monitoring | 2 days | Prometheus/Grafana |
| Load testing | 1 day | k6 or similar |

**Deliverable:** Production-ready with monitoring

---

## 6. Cost Estimates

### Development Costs (2 months, 2 engineers)
| Item | Cost |
|------|------|
| Engineering (2 FTE x 2 months) | $40,000 |
| OpenAI API (development) | $500 |
| Infrastructure (development) | $200 |
| **Total Development** | **$40,700** |

### Monthly Operating Costs (10,000 PRs/month)
| Item | Self-Hosted | LangGraph Cloud |
|------|-------------|-----------------|
| OpenAI API | $300-600 | $300-600 |
| Infrastructure | $200-500 | Included |
| Monitoring | $50-100 | Included |
| **Total Monthly** | **$550-1,200** | **$300-600** |

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM rate limits | Medium | High | Implement caching, retry logic |
| False positives | High | Medium | Human-in-the-loop for critical issues |
| Framework breaking changes | Medium | Medium | Pin versions, test before upgrade |
| GitHub API limits | Medium | Medium | Implement rate limiting, backoff |
| Cost overruns | Low | Medium | Set up billing alerts, optimize token usage |
| Security of code access | Low | High | Use minimal permissions, audit logs |

---

## 8. Conclusion

### Final Recommendations

1. **For Immediate MVP:** Use CrewAI to build a demo within 2 weeks
2. **For Production:** Migrate to LangGraph for reliability and maintainability
3. **For Hybrid Approach:** Use LangGraph as orchestrator, CrewAI for creative tasks

### Key Takeaways

| Framework | Best For | Avoid When |
|-----------|----------|------------|
| **CrewAI** | Rapid prototyping, demos | Complex production workflows |
| **LangGraph** | Production systems, reliability | Quick one-off prototypes |
| **AutoGen** | Conversational agents | Structured, non-chat workflows |
| **LlamaIndex** | Data-heavy RAG workflows | Pure multi-agent orchestration |

### Next Steps

1. ✅ Start with CrewAI MVP (Week 1-2)
2. ✅ Validate with internal repos
3. ✅ Gather feedback and iterate
4. ✅ Plan LangGraph migration for production
5. ✅ Set up monitoring and observability
6. ✅ Scale to team-wide deployment

---

## Appendix: Additional Resources

### Documentation Links
- CrewAI: https://docs.crewai.com
- LangGraph: https://langchain-ai.github.io/langgraph/
- AutoGen: https://microsoft.github.io/autogen/
- LlamaIndex: https://docs.llamaindex.ai

### Community
- CrewAI Discord: https://discord.gg/crewai
- LangChain Discord: https://discord.gg/langchain
- AutoGen Discord: https://discord.gg/autogen

### GitHub Repositories
- CrewAI: https://github.com/crewAIInc/crewAI
- LangGraph: https://github.com/langchain-ai/langgraph
- AutoGen: https://github.com/microsoft/autogen
- LlamaIndex: https://github.com/run-llama/llama_index

---

*Report generated: April 1, 2026*
*Version: 1.0*
