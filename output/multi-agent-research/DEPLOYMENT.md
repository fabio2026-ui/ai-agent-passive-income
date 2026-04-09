# 多智能体代码审查服务 - 部署指南

## 系统要求

- Python 3.9+
- OpenAI API Key (或其他支持的LLM提供商)
- 内存: 最低 2GB RAM
- 磁盘: 100MB 可用空间

## 快速开始

### 1. 创建虚拟环境

```bash
# 创建项目目录
mkdir code-review-service
cd code-review-service

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 2. 安装依赖

```bash
pip install crewai>=0.28.0 pydantic>=2.0.0
```

requirements.txt:
```
crewai>=0.28.0
pydantic>=2.0.0
openai>=1.0.0
```

### 3. 配置环境变量

```bash
# 必需: OpenAI API Key
export OPENAI_API_KEY="sk-your-api-key-here"

# 可选: 使用其他模型
export OPENAI_MODEL_NAME="gpt-4"  # 或 gpt-3.5-turbo

# 可选: 使用 Azure OpenAI
export AZURE_OPENAI_API_KEY="your-azure-key"
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
export AZURE_OPENAI_DEPLOYMENT="your-deployment-name"
```

### 4. 运行示例

```bash
python code_review_service.py
```

## 部署方案

### 方案一: 本地开发/测试

直接运行即可，适合个人开发和小规模测试。

```bash
python code_review_service.py
```

### 方案二: Docker 容器化部署

#### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY code_review_service.py .

# 设置环境变量 (运行时传入)
ENV OPENAI_API_KEY=""

CMD ["python", "code_review_service.py"]
```

#### 构建和运行

```bash
# 构建镜像
docker build -t code-review-service .

# 运行容器
docker run -e OPENAI_API_KEY=$OPENAI_API_KEY code-review-service
```

### 方案三: API 服务部署 (FastAPI)

#### api_server.py

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from code_review_service import CodeReviewCrew
import os

app = FastAPI(title="多智能体代码审查服务")

class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"

class CodeReviewResponse(BaseModel):
    report: str
    status: str

@app.post("/review", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    try:
        service = CodeReviewCrew()
        result = service.review(request.code)
        return CodeReviewResponse(
            report=result,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### 运行 API 服务

```bash
# 安装 FastAPI
pip install fastapi uvicorn

# 启动服务
python api_server.py
```

#### 调用 API

```bash
curl -X POST "http://localhost:8000/review" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def hello():\\n    print(\\"Hello World\\")",
    "language": "python"
  }'
```

### 方案四: Serverless 部署 (AWS Lambda)

#### lambda_handler.py

```python
import json
from code_review_service import CodeReviewCrew

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        code = body.get('code', '')
        
        service = CodeReviewCrew()
        result = service.review(code)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'report': result,
                'status': 'success'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

## 集成到 CI/CD

### GitHub Actions 示例

```yaml
# .github/workflows/code-review.yml
name: AI Code Review

on:
  pull_request:
    paths:
      - '**.py'

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install crewai pydantic openai
      
      - name: Run AI Code Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          python -c "
          import os
          from code_review_service import CodeReviewCrew
          
          # 获取变更的文件
          files = os.popen('git diff --name-only HEAD^').read().split()
          
          for file in files:
              if file.endswith('.py'):
                  with open(file, 'r') as f:
                      code = f.read()
                  service = CodeReviewCrew()
                  result = service.review(code)
                  print(f'## Review for {file}')
                  print(result)
          "
```

### GitLab CI 示例

```yaml
# .gitlab-ci.yml
ai_code_review:
  stage: test
  image: python:3.11
  script:
    - pip install crewai pydantic openai
    - python code_review_service.py
  only:
    - merge_requests
```

## 成本估算

### Token 消耗估算

基于 GPT-4 模型 (2024年价格):

| 代码行数 | 单次审查成本 | 月审查100次 |
|---------|-------------|-------------|
| 50行    | ~$0.05      | ~$5         |
| 200行   | ~$0.15      | ~$15        |
| 500行   | ~$0.40      | ~$40        |
| 1000行  | ~$0.80      | ~$80        |

### 优化建议

1. **缓存结果**: 相同代码的审查结果缓存 24 小时
2. **增量审查**: 只审查变更的部分
3. **模型选择**: 使用 GPT-3.5-turbo 降低成本 (~1/10)
4. **批量处理**: 将多个小文件合并审查

## 扩展定制

### 添加自定义审查规则

```python
class CustomReviewAgents(CodeReviewAgents):
    def create_custom_reviewer(self) -> Agent:
        return Agent(
            role="自定义规则审查员",
            goal="检查项目特定的编码规范",
            backstory="""你熟悉本项目的特定规范...""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm_model
        )
```

### 集成其他 LLM 提供商

```python
# 使用 Anthropic Claude
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-opus-20240229")

# 使用本地模型 (Ollama)
from langchain_community.llms import Ollama

llm = Ollama(model="codellama")
```

## 监控和日志

### 添加日志记录

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 在代码中使用
logger.info("开始代码审查...")
logger.error("审查过程出错: %s", error)
```

### 使用 LangSmith 监控

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY="your-langsmith-key"
export LANGCHAIN_PROJECT="code-review-service"
```

## 故障排除

### 常见问题

1. **API Key 错误**
   - 确认 OPENAI_API_KEY 已正确设置
   - 检查 API Key 是否有足够额度

2. **内存不足**
   - 减少同时运行的 Agent 数量
   - 缩短待审查代码长度

3. **超时错误**
   - 增加超时时间设置
   - 检查网络连接

4. **模型不可用**
   - 确认模型名称正确
   - 检查 API 账户是否有该模型权限

## 安全注意事项

1. **API Key 管理**
   - 使用环境变量或密钥管理服务
   - 不要将 API Key 提交到代码仓库

2. **代码隐私**
   - 考虑代码脱敏处理
   - 使用私有部署的 LLM

3. **审查结果**
   - 不要在公共平台分享敏感代码的审查结果
   - 实施访问控制

## 支持和反馈

- CrewAI 官方文档: https://docs.crewai.com
- 问题反馈: https://github.com/joaomdmoura/crewai/issues
