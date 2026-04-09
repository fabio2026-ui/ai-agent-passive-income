#!/usr/bin/env python3
"""
Agent协调器启动脚本
"""
import asyncio
import sys
import signal
from agent_coordinator import AgentCoordinator, get_coordinator
from agent_coordinator.dashboard import DashboardServer


async def main():
    """主函数"""
    print("=" * 60)
    print("🤖 Agent 协调器系统")
    print("=" * 60)
    
    # 获取协调器实例
    coordinator = get_coordinator()
    
    # 创建Dashboard服务器
    dashboard = DashboardServer(coordinator, port=coordinator.config.get("dashboard_port", 8080))
    
    # 启动协调器
    await coordinator.start()
    
    # 启动Dashboard
    await dashboard.start()
    
    print("\n📊 Dashboard地址: http://localhost:8080")
    print("按 Ctrl+C 停止服务\n")
    
    # 等待中断信号
    stop_event = asyncio.Event()
    
    def signal_handler():
        print("\n\n正在停止服务...")
        stop_event.set()
        
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler)
    
    await stop_event.wait()
    
    # 清理
    await coordinator.stop()
    print("服务已停止")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n服务已停止")
        sys.exit(0)
