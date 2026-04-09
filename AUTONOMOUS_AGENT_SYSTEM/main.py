#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██╗  ██╗██╗ ██████╗  ██████╗     ██╗     ███████╗ ██████╗ ║
║     ╚██╗██╔╝██║██╔═══██╗██╔═══██╗    ██║     ██╔════╝██╔════╝ ║
║      ╚███╔╝ ██║██║   ██║██║   ██║    ██║     █████╗  ██║      ║
║      ██╔██╗ ██║██║   ██║██║   ██║    ██║     ██╔══╝  ██║      ║
║     ██╔╝ ██╗██║╚██████╔╝╚██████╔╝    ███████╗███████╗╚██████╗ ║
║     ╚═╝  ╚═╝╚═╝ ╚═════╝  ╚═════╝     ╚══════╝╚══════╝ ╚═════╝ ║
║                                                               ║
║                    v1.0.0 - 完全自主AI Agent系统                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

启动入口
"""

import asyncio
import signal
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.legion_hq import legion


async def main():
    """主函数"""
    # 设置信号处理
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, legion.shutdown)
    
    try:
        # 初始化
        await legion.initialize()
        
        # 启动
        await legion.start()
        
        # 优雅关闭
        await legion.graceful_shutdown()
        
    except Exception as e:
        print(f"\n💥 系统启动失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    # 检查依赖
    try:
        import psutil
        import yaml
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install psutil pyyaml")
        sys.exit(1)
    
    # 打印启动画面
    print("""
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██╗  ██╗██╗ ██████╗  ██████╗     ██╗     ███████╗ ██████╗ ║
║     ╚██╗██╔╝██║██╔═══██╗██╔═══██╗    ██║     ██╔════╝██╔════╝ ║
║      ╚███╔╝ ██║██║   ██║██║   ██║    ██║     █████╗  ██║      ║
║      ██╔██╗ ██║██║   ██║██║   ██║    ██║     ██╔══╝  ██║      ║
║     ██╔╝ ██╗██║╚██████╔╝╚██████╔╝    ███████╗███████╗╚██████╗ ║
║     ╚═╝  ╚═╝╚═╝ ╚═════╝  ╚═════╝     ╚══════╝╚══════╝ ╚═════╝ ║
║                                                               ║
║                    v1.0.0 - 完全自主AI Agent系统                ║
║                                                               ║
║  功能:                                                        ║
║  ✓ 自我监控运行状态                                            ║
║  ✓ 自动分配任务给其他Agent                                      ║
║  ✓ 遇到错误能自我修复                                           ║
║  ✓ 能7x24小时持续运行                                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 用户中断")
    finally:
        print("\n系统已退出")
