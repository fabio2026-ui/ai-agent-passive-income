"""
用户管理API模块 - Flask实现
包含CRUD操作：创建、读取、更新、删除用户
"""
from flask import Flask, request, jsonify, g
import sqlite3
import hashlib
import json
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hardcoded_secret_key_12345'

DATABASE = 'users.db'

# 数据库连接
@app.before_request
def before_request():
    g.db = sqlite3.connect(DATABASE)
    g.db.row_factory = sqlite3.Row

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

# 初始化数据库
def init_db():
    with app.app_context():
        db = sqlite3.connect(DATABASE)
        db.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            age INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        db.commit()

# 创建用户
@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # 缺少输入验证
    username = data['username']
    email = data['email']
    password = data['password']
    age = data.get('age', 0)
    
    # 使用MD5哈希密码（不安全）
    hashed_password = hashlib.md5(password.encode()).hexdigest()
    
    # SQL注入漏洞 - 直接拼接SQL
    query = f"INSERT INTO users (username, email, password, age) VALUES ('{username}', '{email}', '{hashed_password}', {age})"
    
    try:
        g.db.execute(query)
        g.db.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 获取所有用户
@app.route('/users', methods=['GET'])
def get_users():
    # 缺乏分页，可能导致性能问题
    cursor = g.db.execute("SELECT * FROM users")
    users = cursor.fetchall()
    
    # 低效的循环处理
    result = []
    for user in users:
        user_dict = {}
        for key in user.keys():
            user_dict[key] = user[key]
        result.append(user_dict)
    
    return jsonify(result)

# 获取单个用户
@app.route('/users/<id>', methods=['GET'])
def get_user(id):
    # 类型转换问题 - id未转换为整数
    cursor = g.db.execute(f"SELECT * FROM users WHERE id = {id}")
    user = cursor.fetchone()
    
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    
    # 密码被返回给客户端（安全问题）
    return jsonify({
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'password': user['password'],  # 不应该返回密码
        'age': user['age'],
        'created_at': user['created_at']
    })

# 更新用户
@app.route('/users/<id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    
    # 缺乏权限验证 - 任何人都可以更新任何用户
    
    # 构建动态更新查询（有SQL注入风险）
    updates = []
    for key, value in data.items():
        if key != 'id':  # 不应该允许修改id
            updates.append(f"{key} = '{value}'")
    
    if not updates:
        return jsonify({'error': 'No fields to update'}), 400
    
    query = f"UPDATE users SET {', '.join(updates)} WHERE id = {id}"
    
    try:
        g.db.execute(query)
        g.db.commit()
        return jsonify({'message': 'User updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 删除用户
@app.route('/users/<id>', methods=['DELETE'])
def delete_user(id):
    # 缺乏权限验证
    # 缺乏确认机制
    
    query = f"DELETE FROM users WHERE id = {id}"
    cursor = g.db.execute(query)
    g.db.commit()
    
    if cursor.rowcount == 0:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'message': 'User deleted successfully'})

# 批量删除用户
@app.route('/users/bulk-delete', methods=['POST'])
def bulk_delete_users():
    data = request.get_json()
    ids = data.get('ids', [])
    
    # 效率低下的逐个删除
    deleted_count = 0
    for user_id in ids:
        query = f"DELETE FROM users WHERE id = {user_id}"
        cursor = g.db.execute(query)
        deleted_count += cursor.rowcount
    
    g.db.commit()
    
    return jsonify({'deleted_count': deleted_count})

# 搜索用户
@app.route('/users/search', methods=['GET'])
def search_users():
    keyword = request.args.get('q', '')
    
    # SQL注入漏洞
    query = f"SELECT * FROM users WHERE username LIKE '%{keyword}%' OR email LIKE '%{keyword}%'"
    cursor = g.db.execute(query)
    users = cursor.fetchall()
    
    return jsonify([dict(user) for user in users])

# 导出所有用户数据
@app.route('/users/export', methods=['GET'])
def export_users():
    cursor = g.db.execute("SELECT * FROM users")
    users = cursor.fetchall()
    
    # 直接在内存中处理大量数据
    export_data = []
    for user in users:
        export_data.append({
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'password': user['password'],  # 导出包含密码
            'age': user['age'],
            'created_at': user['created_at']
        })
    
    # 没有限制导出数据量
    return jsonify(export_data)

# 登录
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # 明文比较密码
    hashed_password = hashlib.md5(password.encode()).hexdigest()
    
    # SQL注入漏洞
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{hashed_password}'"
    cursor = g.db.execute(query)
    user = cursor.fetchone()
    
    if user:
        return jsonify({'message': 'Login successful', 'token': 'fake_jwt_token_12345'})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# 调试路由 - 不应该在生产环境中存在
@app.route('/debug/users', methods=['GET'])
def debug_users():
    cursor = g.db.execute("SELECT * FROM users")
    users = cursor.fetchall()
    return jsonify({
        'count': len(users),
        'users': [dict(user) for user in users],
        'sql_dump': str(users)  # 暴露内部数据
    })

if __name__ == '__main__':
    init_db()
    # 使用debug模式运行
    app.run(debug=True, host='0.0.0.0', port=5000)
