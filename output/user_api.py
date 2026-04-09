"""
用户管理系统 API
模拟一个包含JWT认证、CRUD操作的生产级API服务
"""

from flask import Flask, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import re
import logging
import os

# 初始化应用
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============== 数据模型 ==============

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    role = db.Column(db.String(20), default='user')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active,
            'role': self.role
        }

# ============== 工具函数 ==============

def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_username(username):
    """验证用户名格式"""
    if not username or len(username) < 3 or len(username) > 20:
        return False
    return bool(re.match(r'^[a-zA-Z0-9_]+$', username))

def validate_password(password):
    """验证密码强度"""
    if not password or len(password) < 6:
        return False, "密码长度至少6位"
    if not re.search(r'[A-Z]', password):
        return False, "密码必须包含大写字母"
    if not re.search(r'[a-z]', password):
        return False, "密码必须包含小写字母"
    if not re.search(r'\d', password):
        return False, "密码必须包含数字"
    return True, "密码强度合格"

# ============== 认证装饰器 ==============

def token_required(f):
    """JWT Token验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 从Header获取token
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token格式错误', 'code': 401}), 401
        
        if not token:
            return jsonify({'message': '缺少认证token', 'code': 401}), 401
        
        try:
            # 解码token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'message': '用户不存在', 'code': 401}), 401
            
            if not current_user.is_active:
                return jsonify({'message': '用户已被禁用', 'code': 403}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token已过期', 'code': 401}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': '无效的Token', 'code': 401}), 401
        
        g.current_user = current_user
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """管理员权限验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user') or g.current_user.role != 'admin':
            return jsonify({'message': '需要管理员权限', 'code': 403}), 403
        return f(*args, **kwargs)
    return decorated

# ============== API路由 ==============

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        
        # 验证必填字段
        if not data:
            return jsonify({'message': '请求体不能为空', 'code': 400}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # 验证用户名
        if not validate_username(username):
            return jsonify({
                'message': '用户名格式错误，需要3-20位字母数字下划线', 
                'code': 400
            }), 400
        
        # 验证邮箱
        if not validate_email(email):
            return jsonify({'message': '邮箱格式错误', 'code': 400}), 400
        
        # 验证密码强度
        is_valid, msg = validate_password(password)
        if not is_valid:
            return jsonify({'message': msg, 'code': 400}), 400
        
        # 检查用户名是否已存在
        if User.query.filter_by(username=username).first():
            return jsonify({'message': '用户名已被注册', 'code': 409}), 409
        
        # 检查邮箱是否已存在
        if User.query.filter_by(email=email).first():
            return jsonify({'message': '邮箱已被注册', 'code': 409}), 409
        
        # 创建用户
        new_user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password, method='pbkdf2:sha256')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        logger.info(f"用户注册成功: {username}")
        
        return jsonify({
            'message': '注册成功',
            'code': 201,
            'data': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"注册失败: {str(e)}")
        return jsonify({'message': '服务器内部错误', 'code': 500}), 500


@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': '请求体不能为空', 'code': 400}), 400
        
        # 支持用户名或邮箱登录
        login_id = data.get('username', '').strip() or data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not login_id or not password:
            return jsonify({'message': '请提供用户名/邮箱和密码', 'code': 400}), 400
        
        # 查询用户
        user = User.query.filter(
            (User.username == login_id) | (User.email == login_id)
        ).first()
        
        # 验证密码
        if not user or not check_password_hash(user.password_hash, password):
            # 使用模糊错误信息防止用户枚举攻击
            return jsonify({'message': '用户名或密码错误', 'code': 401}), 401
        
        if not user.is_active:
            return jsonify({'message': '账户已被禁用', 'code': 403}), 403
        
        # 生成JWT token (24小时有效期)
        token_payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }
        
        token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')
        
        logger.info(f"用户登录成功: {user.username}")
        
        return jsonify({
            'message': '登录成功',
            'code': 200,
            'data': {
                'token': token,
                'token_type': 'Bearer',
                'expires_in': 86400,
                'user': user.to_dict()
            }
        }), 200
        
    except Exception as e:
        logger.error(f"登录失败: {str(e)}")
        return jsonify({'message': '服务器内部错误', 'code': 500}), 500


@app.route('/api/v1/users', methods=['GET'])
@token_required
def get_users():
    """获取用户列表（支持分页和搜索）"""
    try:
        # 分页参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '').strip()
        
        # 限制每页数量
        per_page = min(per_page, 100)
        
        query = User.query
        
        # 搜索过滤
        if search:
            query = query.filter(
                (User.username.contains(search)) | 
                (User.email.contains(search))
            )
        
        # 非管理员只能看到活跃用户
        if g.current_user.role != 'admin':
            query = query.filter_by(is_active=True)
        
        # 分页
        pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users = [user.to_dict() for user in pagination.items]
        
        return jsonify({
            'message': '获取成功',
            'code': 200,
            'data': {
                'users': users,
                'pagination': {
                    'total': pagination.total,
                    'pages': pagination.pages,
                    'current_page': page,
                    'per_page': per_page,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                }
            }
        }), 200
        
    except Exception as e:
        logger.error(f"获取用户列表失败: {str(e)}")
        return jsonify({'message': '服务器内部错误', 'code': 500}), 500


@app.route('/api/v1/users/<int:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    """获取单个用户信息"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': '用户不存在', 'code': 404}), 404
        
        # 非管理员且非本人不能查看非活跃用户
        if (not user.is_active and 
            g.current_user.role != 'admin' and 
            g.current_user.id != user_id):
            return jsonify({'message': '用户不存在', 'code': 404}), 404
        
        return jsonify({
            'message': '获取成功',
            'code': 200,
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"获取用户信息失败: {str(e)}")
        return jsonify({'message': '服务器内部错误', 'code': 500}), 500


@app.route('/api/v1/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    """更新用户信息"""
    try:
        # 权限检查
        if g.current_user.id != user_id and g.current_user.role != 'admin':
            return jsonify({'message': '无权修改其他用户信息', 'code': 403}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': '用户不存在', 'code': 404}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'message': '请求体不能为空', 'code': 400}), 400
        
        # 普通用户可更新的字段
        allowed_fields = ['email']
        
        # 管理员可更新的额外字段
        if g.current_user.role == 'admin':
            allowed_fields.extend(['is_active', 'role'])
        
        # 处理邮箱更新
        if 'email' in data:
            new_email = data['email'].strip().lower()
            if not validate_email(new_email):
                return jsonify({'message': '邮箱格式错误', 'code': 400}), 400
            
            # 检查邮箱是否已被其他用户使用
            existing = User.query.filter_by(email=new_email).first()
            if existing and existing.id != user_id:
                return jsonify({'message': '邮箱已被其他用户使用', 'code': 409}), 409
            
            user.email = new_email
        
        # 处理状态更新（仅管理员）
        if 'is_active' in data and g.current_user.role == 'admin':
            user.is_active = bool(data['is_active'])
        
        # 处理角色更新（仅管理员）
        if 'role' in data and g.current_user.role == 'admin':
            if data['role'] in ['user', 'admin']:
                user.role = data['role']
        
        db.session.commit()
        
        logger.info(f"用户更新成功: {user.username} (by {g.current_user.username})")
        
        return jsonify({
            'message': '更新成功',
            'code': 200,
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"更新用户失败: {str(e)}")
        return jsonify({'message': '服务器内部错误', 'code': 500}), 500


@app.route('/api/v1/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    """删除用户（软删除 - 标记为非活跃）"""
    try:
        # 权限检查
        if g.current_user.id != user_id and g.current_user.role != 'admin':
            return jsonify({'message': '无权删除其他用户', 'code': 403}), 403
        
        # 防止管理员删除自己
        if user_id == g.current_user.id:
            return jsonify({'message': '不能删除自己的账户', 'code': 400}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': '用户不存在', 'code': 404}), 404
        
        # 软删除
        user.is_active = False
        db.session.commit()
        
        logger.info(f"用户已删除: {user.username} (by {g.current_user.username})")
        
        return jsonify({
            'message': '删除成功',
            'code': 200,
            'data': {'id': user_id}
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"删除用户失败: {str(e)}")
        return jsonify({'message': '服务器内部错误', 'code': 500}), 500


@app.route('/api/v1/users/me', methods=['GET'])
@token_required
def get_current_user():
    """获取当前登录用户信息"""
    return jsonify({
        'message': '获取成功',
        'code': 200,
        'data': g.current_user.to_dict()
    }), 200


@app.route('/api/v1/auth/refresh', methods=['POST'])
@token_required
def refresh_token():
    """刷新Token"""
    try:
        user = g.current_user
        
        token_payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }
        
        new_token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Token刷新成功',
            'code': 200,
            'data': {
                'token': new_token,
                'token_type': 'Bearer',
                'expires_in': 86400
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Token刷新失败: {str(e)}")
        return jsonify({'message': '服务器内部错误', 'code': 500}), 500


# ============== 错误处理器 ==============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': '接口不存在', 'code': 404}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'message': '请求方法不允许', 'code': 405}), 405

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'message': '服务器内部错误', 'code': 500}), 500


# ============== 初始化 ==============

@app.before_first_request
def create_tables():
    """创建数据库表"""
    db.create_all()


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
