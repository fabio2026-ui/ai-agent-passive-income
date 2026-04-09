#!/usr/bin/env python3
"""
Agent协调器系统演示
展示所有核心功能
"""
import asyncio
import sys
import os

# 添加父目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent_coordinator import get_coordinator, TaskPriority


async def demo():
    """演示所有功能"""
    print("=" * 70)
    print("🤖 Agent协调器系统演示")
    print("=" * 70)
    
    # 获取协调器实例
    coordinator = get_coordinator()
    
    # 1. 启动协调器
    print("\n📦 步骤1: 启动协调器...")
    await coordinator.start()
    print("✅ 协调器已启动")
    
    # 2. 查看初始状态
    print("\n📊 步骤2: 系统初始状态")
    status = coordinator.get_system_status()
    print(f"   状态: {status['status']}")
    print(f"   Agent总数: {status['agents']['total']}")
    print(f"   运行中: {status['agents']['running']}")
    
    # 3. 提交任务
    print("\n📝 步骤3: 提交新任务")
    tasks = [
        ("数据分析任务", "分析销售数据趋势", TaskPriority.HIGH),
        ("报告生成", "生成月度财务报告", TaskPriority.MEDIUM),
        ("数据清洗", "清洗用户数据", TaskPriority.LOW),
        ("紧急修复", "修复生产环境问题", TaskPriority.CRITICAL),
        ("后台同步", "同步数据库", TaskPriority.BACKGROUND),
    ]
    
    task_ids = []
    for title, desc, priority in tasks:
        task_id = await coordinator.submit_task(title, desc, priority)
        task_ids.append(task_id)
        priority_name = ["关键", "高", "中", "低", "后台"][priority - 1]
        print(f"   ✅ [{task_id}] {title} (优先级: {priority_name})")
    
    # 等待任务分配
    await asyncio.sleep(2)
    
    # 4. 查看任务状态
    print("\n📋 步骤4: 任务队列状态")
    all_tasks = coordinator.get_all_tasks()
    print(f"   待处理: {len(all_tasks['pending'])}")
    print(f"   运行中: {len(all_tasks['running'])}")
    print(f"   已完成: {len(all_tasks['completed'])}")
    
    # 5. 模拟Agent状态更新
    print("\n🤖 步骤5: 模拟Agent监控")
    print("   正在获取Agent状态...")
    
    # 查看当前运行的Agent
    agents = coordinator.get_all_agents()
    print(f"   活跃Agent数量: {len(agents)}")
    
    for agent in agents[:3]:
        print(f"   • {agent['label']}: {agent['status']} ({agent['runtime']})")
    
    # 6. 查看统计信息
    print("\n📈 步骤6: 系统统计")
    stats = coordinator.get_system_status()
    print(f"   任务统计:")
    print(f"     - 总数: {stats['tasks']['total']}")
    print(f"     - 待处理: {stats['tasks']['pending']}")
    print(f"     - 运行中: {stats['tasks']['running']}")
    print(f"     - 已完成: {stats['tasks']['completed']}")
    print(f"     - 失败: {stats['tasks']['failed']}")
    
    # 7. 资源冲突解决演示
    print("\n⚡ 步骤7: 资源冲突解决")
    print("   注册资源声明...")
    
    # 模拟资源声明
    await coordinator.resolver.register_claim(
        agent_id="agent:test-1",
        resource_type="cpu",
        amount=50,
        priority=TaskPriority.HIGH
    )
    await coordinator.resolver.register_claim(
        agent_id="agent:test-2",
        resource_type="cpu",
        amount=40,
        priority=TaskPriority.MEDIUM
    )
    
    current_claims = coordinator.resolver.get_current_claims()
    print(f"   当前资源声明:")
    for resource, claims in current_claims.items():
        print(f"     - {resource}: {len(claims)} 个声明")
    
    # 8. 事件系统演示
    print("\n📡 步骤8: 事件系统")
    
    event_received = []
    async def test_handler(data):
        event_received.append(data)
        print(f"   📨 收到事件: task_completed")
    
    await coordinator.event_bus.on("task_completed", test_handler)
    print("   ✅ 已订阅 task_completed 事件")
    
    # 触发测试事件
    await coordinator.event_bus.emit("task_completed", {"test": True})
    await asyncio.sleep(0.5)
    
    if event_received:
        print("   ✅ 事件系统工作正常")
    
    # 9. 进度报告
    print("\n📄 步骤9: 生成进度报告")
    report_path = "/root/.openclaw/workspace/agent_coordinator/reports/demo_report.json"
    
    report = {
        "timestamp": stats['started_at'],
        "agents": stats['agents'],
        "tasks": stats['tasks'],
        "resources": stats['resources']
    }
    
    import json
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"   ✅ 报告已保存: {report_path}")
    
    # 10. Dashboard信息
    print("\n🌐 步骤10: Dashboard信息")
    print(f"   Dashboard地址: http://localhost:8080")
    print(f"   WebSocket端点: ws://localhost:8080/ws")
    print(f"   API端点: http://localhost:8080/api/status")
    
    # 完成
    print("\n" + "=" * 70)
    print("✅ 演示完成!")
    print("=" * 70)
    print("\n💡 提示:")
    print("   • 使用 ./agent_coordinator/run.sh 启动完整服务")
    print("   • 使用 python3 agent_coordinator/cli.py 查看命令行工具")
    print("   • 在浏览器中打开 http://localhost:8080 查看Dashboard")
    
    # 停止协调器
    await coordinator.stop()
    print("\n🛑 协调器已停止")


if __name__ == "__main__":
    try:
        asyncio.run(demo())
    except KeyboardInterrupt:
        print("\n\n演示已中断")
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
