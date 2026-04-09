"""
子Agent操作包装器
封装对subagents工具的调用
"""
import asyncio
import json
from typing import List, Dict, Optional

# 模拟数据用于演示
MOCK_AGENTS = [
    {
        "sessionKey": "agent:main:subagent:example1",
        "label": "opportunity-bot-agent",
        "status": "running",
        "task": "创建自动化商机发现机器人",
        "runtime": "10m",
        "runtimeMs": 600000,
        "model": "kimi-coding/k2p5",
        "startedAt": 1774090554245
    },
    {
        "sessionKey": "agent:main:subagent:example2",
        "label": "api-aggregator-agent",
        "status": "running",
        "task": "开发API聚合器订阅服务",
        "runtime": "8m",
        "runtimeMs": 480000,
        "model": "kimi-coding/k2p5",
        "startedAt": 1774090553838
    }
]


async def list_agents() -> List[Dict]:
    """获取所有子Agent列表"""
    # 尝试使用实际的subagents工具
    try:
        # 这里将来会调用实际的subagents工具
        # 目前返回模拟数据
        return MOCK_AGENTS
    except Exception as e:
        print(f"[SubagentWrapper] Error listing agents: {e}")
        return MOCK_AGENTS


async def spawn_agent(task: str, label: str = None, timeout: int = 3600) -> Dict:
    """启动新Agent
    
    Args:
        task: 任务描述
        label: Agent标签
        timeout: 超时时间(秒)
    """
    # 添加新Agent到模拟列表
    import time
    new_agent = {
        "sessionKey": f"agent:main:subagent:{label or 'new'}_{int(time.time())}",
        "label": label or f"agent-{int(time.time())}",
        "status": "running",
        "task": task[:100],
        "runtime": "0m",
        "runtimeMs": 0,
        "model": "kimi-coding/k2p5",
        "startedAt": int(time.time() * 1000)
    }
    MOCK_AGENTS.append(new_agent)
    
    return {
        "success": True,
        "session_key": new_agent["sessionKey"],
        "message": f"Agent '{label}' spawned successfully"
    }


async def kill_agent(session_key: str, force: bool = False) -> Dict:
    """终止Agent
    
    Args:
        session_key: Agent会话标识
        force: 是否强制终止
    """
    # 从模拟列表中移除
    global MOCK_AGENTS
    MOCK_AGENTS = [a for a in MOCK_AGENTS if a["sessionKey"] != session_key]
    
    return {
        "success": True,
        "session_key": session_key,
        "message": f"Agent {session_key} terminated"
    }


async def steer_agent(session_key: str, message: str) -> Dict:
    """向Agent发送指令
    
    Args:
        session_key: Agent会话标识
        message: 指令内容
    """
    return {
        "success": True,
        "session_key": session_key,
        "message": "Message sent"
    }


async def get_agent_logs(session_key: str, limit: int = 50) -> List[str]:
    """获取Agent日志"""
    return [
        "[INFO] Agent started",
        "[INFO] Processing task...",
        "[INFO] Progress: 50%"
    ]
