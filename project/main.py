#!/usr/bin/env python3
"""
用户管理系统 - 主程序
命令行界面用于管理用户数据
"""

import sys
import argparse
from user_manager import UserManager

def print_menu():
    """打印主菜单"""
    print("\n" + "="*40)
    print("      用户管理系统 v1.0")
    print("="*40)
    print("1. 添加用户")
    print("2. 查看用户")
    print("3. 更新用户")
    print("4. 删除用户")
    print("5. 列出所有用户")
    print("6. 搜索用户")
    print("0. 退出")
    print("="*40)

def add_user_interactive(manager: UserManager):
    """交互式添加用户"""
    print("\n--- 添加用户 ---")
    user_id = input("用户ID: ").strip()
    if not user_id:
        print("错误: 用户ID不能为空")
        return
    
    name = input("姓名: ").strip()
    email = input("邮箱: ").strip()
    age_input = input("年龄 (可选): ").strip()
    
    age = None
    if age_input:
        try:
            age = int(age_input)
        except ValueError:
            print("警告: 年龄输入无效，将设为None")
    
    if manager.add_user(user_id, name, email, age):
        print(f"✓ 用户 {name} 添加成功")
    else:
        print(f"✗ 用户ID '{user_id}' 已存在")

def view_user_interactive(manager: UserManager):
    """交互式查看用户"""
    print("\n--- 查看用户 ---")
    user_id = input("输入用户ID: ").strip()
    user = manager.get_user(user_id)
    
    if user:
        print(f"\n用户信息:")
        print(f"  ID: {user_id}")
        print(f"  姓名: {user.get('name', 'N/A')}")
        print(f"  邮箱: {user.get('email', 'N/A')}")
        print(f"  年龄: {user.get('age', 'N/A')}")
        print(f"  创建时间: {user.get('created_at', 'N/A')}")
    else:
        print(f"✗ 未找到用户 '{user_id}'")

def update_user_interactive(manager: UserManager):
    """交互式更新用户"""
    print("\n--- 更新用户 ---")
    user_id = input("输入用户ID: ").strip()
    
    if not manager.get_user(user_id):
        print(f"✗ 未找到用户 '{user_id}'")
        return
    
    print("(留空表示不修改)")
    updates = {}
    
    name = input("新姓名: ").strip()
    if name:
        updates['name'] = name
    
    email = input("新邮箱: ").strip()
    if email:
        updates['email'] = email
    
    age_input = input("新年龄: ").strip()
    if age_input:
        try:
            updates['age'] = int(age_input)
        except ValueError:
            print("警告: 年龄输入无效，跳过")
    
    if updates and manager.update_user(user_id, **updates):
        print("✓ 用户信息更新成功")
    else:
        print("✗ 更新失败或无修改")

def delete_user_interactive(manager: UserManager):
    """交互式删除用户"""
    print("\n--- 删除用户 ---")
    user_id = input("输入用户ID: ").strip()
    
    if not manager.get_user(user_id):
        print(f"✗ 未找到用户 '{user_id}'")
        return
    
    confirm = input(f"确认删除用户 '{user_id}'? (y/N): ").strip().lower()
    if confirm == 'y':
        if manager.delete_user(user_id):
            print("✓ 用户已删除")
        else:
            print("✗ 删除失败")
    else:
        print("已取消")

def list_users_interactive(manager: UserManager):
    """交互式列出所有用户"""
    print("\n--- 用户列表 ---")
    users = manager.list_users()
    
    if not users:
        print("暂无用户数据")
        return
    
    print(f"\n共 {len(users)} 个用户:\n")
    print(f"{'ID':<15} {'姓名':<15} {'邮箱':<25} {'年龄':<5}")
    print("-" * 65)
    
    for user in users:
        age_str = str(user.get('age', '-')) if user.get('age') else '-'
        print(f"{user.get('id', 'N/A'):<15} {user.get('name', 'N/A'):<15} "
              f"{user.get('email', 'N/A'):<25} {age_str:<5}")

def search_user_interactive(manager: UserManager):
    """交互式搜索用户"""
    print("\n--- 搜索用户 ---")
    keyword = input("输入搜索关键词: ").strip()
    
    if not keyword:
        print("搜索关键词不能为空")
        return
    
    results = manager.search_by_name(keyword)
    
    if not results:
        print(f"未找到包含 '{keyword}' 的用户")
        return
    
    print(f"\n找到 {len(results)} 个结果:\n")
    print(f"{'ID':<15} {'姓名':<15} {'邮箱':<25}")
    print("-" * 55)
    
    for user in results:
        print(f"{user.get('id', 'N/A'):<15} {user.get('name', 'N/A'):<15} "
              f"{user.get('email', 'N/A'):<25}")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='用户管理系统')
    parser.add_argument('--data-file', default='users.json',
                        help='数据文件路径 (默认: users.json)')
    parser.add_argument('--demo', action='store_true',
                        help='运行演示模式，添加测试数据')
    
    args = parser.parse_args()
    
    # 初始化管理器
    manager = UserManager(args.data_file)
    
    # 演示模式
    if args.demo:
        print("运行演示模式...")
        demo_users = [
            ('u001', '张三', 'zhangsan@example.com', 25),
            ('u002', '李四', 'lisi@example.com', 30),
            ('u003', '王五', 'wangwu@example.com', 28),
        ]
        for uid, name, email, age in demo_users:
            manager.add_user(uid, name, email, age)
        print(f"已添加 {len(demo_users)} 个测试用户")
    
    # 交互模式
    while True:
        print_menu()
        choice = input("请选择操作 [0-6]: ").strip()
        
        if choice == '1':
            add_user_interactive(manager)
        elif choice == '2':
            view_user_interactive(manager)
        elif choice == '3':
            update_user_interactive(manager)
        elif choice == '4':
            delete_user_interactive(manager)
        elif choice == '5':
            list_users_interactive(manager)
        elif choice == '6':
            search_user_interactive(manager)
        elif choice == '0':
            print("再见!")
            sys.exit(0)
        else:
            print("无效选择，请重新输入")

if __name__ == '__main__':
    main()
