#!/usr/bin/env python3
"""
Agent协调器 - 命令行管理工具
"""
import asyncio
import json
import sys
from datetime import datetime
from agent_coordinator import get_coordinator, AgentState, TaskPriority
from agent_coordinator.subagent_wrapper import list_agents, spawn_agent, kill_agent, steer_agent


class CoordinatorCLI:
    """命令行界面"""
    
    def __init__(self):
        self.coordinator = get_coordinator()
        
    async def status(self):
        """显示系统状态"""
        status = self.coordinator.get_system_status()
        
        print("\n" + "=" * 60)
        print("🤖 Agent协调器状态")
        print("=" * 60)
        print(f"运行状态: {'🟢 运行中' if status['status'] == 'running' else '🔴 已停止'}")
        print(f"启动时间: {status['started_at']}")
        print(f"运行时长: {status['uptime']}")
        print()
        print("📊 Agent统计:")
        print(f"  总数:    {status['agents']['total']}")
        print(f"  运行中:  {status['agents']['running']} 🟢")
        print(f"  已完成:  {status['agents']['completed']} ✅")
        print(f"  失败:    {status['agents']['failed']} ❌")
        print()
        print("📋 任务统计:")
        print(f"  总数:    {status['tasks']['total']}")
        print(f"  待处理:  {status['tasks']['pending']} ⏳")
        print(f"  运行中:  {status['tasks']['running']} 🔄")
        print(f"  已完成:  {status['tasks']['completed']} ✅")
        print(f"  失败:    {status['tasks']['failed']} ❌")
        print()
        
    async def agents(self):
        """列出所有Agent"""
        agents_data = await list_agents()
        
        print("\n" + "=" * 60)
        print("🤖 Agent列表")
        print("=" * 60)
        
        if not agents_data:
            print("暂无Agent运行")
            return
            
        for i, agent in enumerate(agents_data, 1):
            status_icon = {
                "running": "🟢",
                "completed": "✅",
                "failed": "❌",
                "pending": "⏳"
            }.get(agent.get("status"), "⚪")
            
            print(f"\n{i}. {status_icon} {agent.get('label', 'unknown')}")
            print(f"   状态: {agent.get('status', 'unknown')}")
            print(f"   任务: {agent.get('task', 'N/A')[:60]}...")
            print(f"   运行时间: {agent.get('runtime', '0m')}")
            print(f"   模型: {agent.get('model', 'unknown')}")
            
    async def spawn(self, task: str, label: str = None):
        """启动新Agent"""
        print(f"\n🚀 启动新Agent...")
        print(f"任务: {task}")
        if label:
            print(f"标签: {label}")
            
        result = await spawn_agent(task, label)
        
        if result.get("success"):
            print(f"✅ Agent已启动")
            print(f"会话ID: {result.get('session_key')}")
        else:
            print(f"❌ 启动失败: {result.get('message')}")
            
    async def kill(self, session_key: str):
        """终止Agent"""
        print(f"\n🛑 终止Agent: {session_key}")
        
        confirm = input("确认终止? (y/N): ")
        if confirm.lower() != 'y':
            print("已取消")
            return
            
        result = await kill_agent(session_key)
        
        if result.get("success"):
            print(f"✅ Agent已终止")
        else:
            print(f"❌ 终止失败: {result.get('message')}")
            
    async def steer(self, session_key: str, message: str):
        """向Agent发送指令"""
        print(f"\n📨 发送指令到 {session_key}")
        print(f"消息: {message}")
        
        result = await steer_agent(session_key, message)
        
        if result.get("success"):
            print(f"✅ 消息已发送")
        else:
            print(f"❌ 发送失败: {result.get('message')}")
            
    async def submit(self, title: str, description: str = "", priority: int = 3):
        """提交任务"""
        print(f"\n📋 提交新任务")
        print(f"标题: {title}")
        print(f"优先级: {priority}")
        
        task_id = await self.coordinator.submit_task(title, description, priority)
        print(f"✅ 任务已提交 (ID: {task_id})")
        
    async def tasks(self):
        """显示任务列表"""
        all_tasks = self.coordinator.get_all_tasks()
        
        print("\n" + "=" * 60)
        print("📋 任务队列")
        print("=" * 60)
        
        print(f"\n🔄 运行中 ({len(all_tasks['running'])}):")
        for task in all_tasks['running']:
            print(f"  • [{task['id']}] {task['title']} ({task['progress']:.0f}%)")
            
        print(f"\n⏳ 待处理 ({len(all_tasks['pending'])}):")
        for task in all_tasks['pending']:
            print(f"  • [{task['id']}] {task['title']} (P{task['priority']})")
            
        print(f"\n✅ 已完成 ({len(all_tasks['completed'])}):")
        for task in all_tasks['completed'][-5:]:
            status = "✅" if not task.get('error') else "❌"
            print(f"  • [{task['id']}] {status} {task['title']}")
            
    async def monitor(self):
        """实时监控模式"""
        print("\n📊 实时监控模式 (按 Ctrl+C 退出)")
        print("=" * 60)
        
        try:
            while True:
                # 清屏
                print("\033[2J\033[H")
                
                # 获取状态
                status = self.coordinator.get_system_status()
                agents = self.coordinator.get_all_agents()
                tasks = self.coordinator.get_all_tasks()
                
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"🤖 Agent协调器 - {now}")
                print("-" * 60)
                print(f"Agent: {status['agents']['running']} 运行 / {status['agents']['total']} 总计")
                print(f"任务: {status['tasks']['running']} 运行 / {status['tasks']['pending']} 等待 / {status['tasks']['completed']} 完成")
                print("-" * 60)
                
                if agents:
                    print("\n活跃Agent:")
                    for agent in agents[:5]:
                        progress_bar = "█" * int(agent['progress'] / 10) + "░" * (10 - int(agent['progress'] / 10))
                        print(f"  {agent['label'][:20]:20} {progress_bar} {agent['progress']:.0f}% {agent['runtime']}")
                        
                await asyncio.sleep(2)
                
        except KeyboardInterrupt:
            print("\n\n监控已停止")


async def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("""
🤖 Agent协调器管理工具

用法: python3 cli.py <命令> [参数]

命令:
  status           显示系统状态
  agents           列出所有Agent
  spawn <任务>     启动新Agent
  kill <会话ID>    终止Agent
  steer <ID> <消息> 向Agent发送指令
  submit <标题>    提交新任务
  tasks            显示任务列表
  monitor          实时监控模式

示例:
  python3 cli.py status
  python3 cli.py spawn "分析市场数据" --label market-analyzer
  python3 cli.py kill agent:main:subagent:xxx
  python3 cli.py submit "数据清洗任务" --priority 2
        """)
        return
        
    command = sys.argv[1]
    cli = CoordinatorCLI()
    
    if command == "status":
        await cli.status()
    elif command == "agents":
        await cli.agents()
    elif command == "spawn":
        task = sys.argv[2] if len(sys.argv) > 2 else "New task"
        label = None
        for i, arg in enumerate(sys.argv):
            if arg == "--label" and i + 1 < len(sys.argv):
                label = sys.argv[i + 1]
        await cli.spawn(task, label)
    elif command == "kill":
        if len(sys.argv) < 3:
            print("错误: 请提供会话ID")
            return
        await cli.kill(sys.argv[2])
    elif command == "steer":
        if len(sys.argv) < 4:
            print("错误: 请提供会话ID和消息")
            return
        await cli.steer(sys.argv[2], sys.argv[3])
    elif command == "submit":
        title = sys.argv[2] if len(sys.argv) > 2 else "New task"
        desc = ""
        priority = 3
        for i, arg in enumerate(sys.argv):
            if arg == "--desc" and i + 1 < len(sys.argv):
                desc = sys.argv[i + 1]
            if arg == "--priority" and i + 1 < len(sys.argv):
                priority = int(sys.argv[i + 1])
        await cli.submit(title, desc, priority)
    elif command == "tasks":
        await cli.tasks()
    elif command == "monitor":
        await cli.monitor()
    else:
        print(f"未知命令: {command}")


if __name__ == "__main__":
    asyncio.run(main())
