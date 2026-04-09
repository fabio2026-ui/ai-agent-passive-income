"""
用户管理系统 - 一个简单的Flask Web应用
用于演示代码审查流程
"""
import sqlite3
import hashlib
import json
from flask import Flask, request, jsonify, session
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = "my_secret_key_123"  # 硬编码密钥（安全问题）

# 全局数据库连接（性能问题）
db_connection = None

def get_db():
    global db_connection
    if db_connection is None:
        db_connection = sqlite3.connect('users.db')
    return db_connection

# 创建表
@app.route('/init')
def init_db():
    db = get_db()
    cursor = db.cursor()
    # SQL注入风险
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT,
            email TEXT,
            created_at TEXT
        )
    """)
    db.commit()
    return "Database initialized"

# 密码哈希（弱哈希算法）
def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

# 注册用户
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']
    email = data.get('email', '')
    
    # 无输入验证
    hashed = hash_password(password)
    created_at = str(datetime.now())
    
    db = get_db()
    cursor = db.cursor()
    
    # 严重的SQL注入漏洞
    query = f"INSERT INTO users (username, password, email, created_at) VALUES ('{username}', '{hashed}', '{email}', '{created_at}')"
    cursor.execute(query)
    db.commit()
    
    return jsonify({"message": "User registered successfully"})

# 用户登录
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    
    hashed = hash_password(password)
    
    db = get_db()
    cursor = db.cursor()
    
    # SQL注入漏洞
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{hashed}'"
    cursor.execute(query)
    user = cursor.fetchone()
    
    if user:
        session['user_id'] = user[0]
        session['username'] = user[1]
        return jsonify({"message": "Login successful", "user": {"id": user[0], "username": user[1]}})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# 获取所有用户（无权限控制）
@app.route('/users')
def get_users():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users")
    users = cursor.fetchall()
    
    # 低效的数据转换
    result = []
    for user in users:
        result.append({
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "created_at": user[3]
        })
    
    return jsonify(result)

# 获取单个用户
@app.route('/user/<id>')
def get_user(id):
    db = get_db()
    cursor = db.cursor()
    
    # SQL注入漏洞
    cursor.execute(f"SELECT * FROM users WHERE id = {id}")
    user = cursor.fetchone()
    
    if user:
        return jsonify({
            "id": user[0],
            "username": user[1],
            "password": user[2],  # 返回密码哈希（安全问题）
            "email": user[3],
            "created_at": user[4]
        })
    else:
        return jsonify({"message": "User not found"}), 404

# 更新用户
@app.route('/user/<id>', methods=['PUT'])
def update_user(id):
    data = request.json
    
    # 无身份验证，任何人都可以更新任何用户
    db = get_db()
    cursor = db.cursor()
    
    updates = []
    for key in data:
        updates.append(f"{key} = '{data[key]}'")
    
    # SQL注入漏洞
    query = f"UPDATE users SET {', '.join(updates)} WHERE id = {id}"
    cursor.execute(query)
    db.commit()
    
    return jsonify({"message": "User updated"})

# 删除用户
@app.route('/user/<id>', methods=['DELETE'])
def delete_user(id):
    db = get_db()
    cursor = db.cursor()
    
    # SQL注入漏洞
    cursor.execute(f"DELETE FROM users WHERE id = {id}")
    db.commit()
    
    return jsonify({"message": "User deleted"})

# 处理大数据文件（性能问题）
@app.route('/process_data', methods=['POST'])
def process_data():
    data = request.json
    items = data.get('items', [])
    
    # O(n²) 复杂度，处理大量数据时性能极差
    results = []
    for i in range(len(items)):
        found = False
        for j in range(len(items)):
            if i != j and items[i] == items[j]:
                found = True
                break
        if not found:
            results.append(items[i])
    
    # 内存效率低下
    processed = []
    for item in results:
        processed.append(str(item).upper())
        processed.append(str(item).lower())
        processed.append(str(item)[::-1])
    
    return jsonify({"processed_items": processed, "count": len(processed)})

# 文件上传（安全问题）
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['file']
    filename = file.filename
    
    # 无文件类型验证，目录遍历风险
    file.save(f"./uploads/{filename}")
    
    return jsonify({"message": "File uploaded", "filename": filename})

# 执行系统命令（严重安全漏洞）
@app.route('/exec')
def exec_command():
    cmd = request.args.get('cmd', '')
    # 命令注入漏洞
    result = os.popen(cmd).read()
    return jsonify({"result": result})

# 日志记录（信息泄露）
@app.route('/logs')
def get_logs():
    try:
        with open('/var/log/app.log', 'r') as f:
            # 读取整个文件到内存
            logs = f.read()
            return jsonify({"logs": logs})
    except Exception as e:
        # 详细的错误信息泄露
        return jsonify({"error": str(e), "traceback": __import__('traceback').format_exc()}), 500

if __name__ == '__main__':
    # 调试模式，监听所有接口（安全问题）
    app.run(host='0.0.0.0', port=5000, debug=True)
