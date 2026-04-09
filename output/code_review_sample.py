"""
User Management System API Service
A simple Flask-based API with JWT authentication and user CRUD operations.
"""

from flask import Flask, request, jsonify
from functools import wraps
from datetime import datetime, timedelta
import jwt
import bcrypt
import re
from typing import Dict, Optional, Any

app = Flask(__name__)
app.config['SECRET_KEY'] = 'my-secret-key-change-in-production'
app.config['JWT_EXPIRATION_DELTA'] = 3600  # 1 hour

# Mock database
users_db: Dict[int, Dict[str, Any]] = {}
next_user_id = 1


class ValidationError(Exception):
    """Custom validation error"""
    pass


class AuthenticationError(Exception):
    """Custom authentication error"""
    pass


class NotFoundError(Exception):
    """Custom not found error"""
    pass


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> bool:
    """Validate password strength"""
    return len(password) >= 6


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_token(user_id: int, username: str) -> str:
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(seconds=app.config['JWT_EXPIRATION_DELTA']),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def decode_token(token: str) -> Dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError('Token has expired')
    except jwt.InvalidTokenError:
        raise AuthenticationError('Invalid token')


def token_required(f):
    """Decorator to require JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'message': 'Token format invalid'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            payload = decode_token(token)
            kwargs['current_user_id'] = payload['user_id']
            kwargs['current_username'] = payload['username']
        except AuthenticationError as e:
            return jsonify({'message': str(e)}), 401
        
        return f(*args, **kwargs)
    return decorated


@app.route('/api/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Request body required'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not username or not email or not password:
            return jsonify({'message': 'Username, email and password are required'}), 400
        
        if len(username) < 3:
            return jsonify({'message': 'Username must be at least 3 characters'}), 400
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        if not validate_password(password):
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        # Check if user exists
        for user in users_db.values():
            if user['username'] == username:
                return jsonify({'message': 'Username already exists'}), 409
            if user['email'] == email:
                return jsonify({'message': 'Email already registered'}), 409
        
        # Create user
        global next_user_id
        user_id = next_user_id
        next_user_id += 1
        
        users_db[user_id] = {
            'id': user_id,
            'username': username,
            'email': email,
            'password_hash': hash_password(password),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'is_active': True
        }
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'created_at': users_db[user_id]['created_at']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Request body required'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'message': 'Username and password are required'}), 400
        
        # Find user
        user = None
        user_id = None
        for uid, u in users_db.items():
            if u['username'] == username:
                user = u
                user_id = uid
                break
        
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not user['is_active']:
            return jsonify({'message': 'Account is deactivated'}), 401
        
        if not verify_password(password, user['password_hash']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate token
        token = generate_token(user_id, username)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500


@app.route('/api/logout', methods=['POST'])
@token_required
def logout(current_user_id=None, current_username=None):
    """User logout endpoint (token blacklisting would be implemented here)"""
    # In a real implementation, we would add the token to a blacklist
    # For this simple example, we just return success
    return jsonify({'message': 'Logout successful'}), 200


@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user_id=None, current_username=None):
    """Get all users (admin functionality - simplified for demo)"""
    try:
        user_list = []
        for uid, user in users_db.items():
            user_list.append({
                'id': uid,
                'username': user['username'],
                'email': user['email'],
                'is_active': user['is_active'],
                'created_at': user['created_at']
            })
        
        return jsonify({
            'users': user_list,
            'total': len(user_list)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to retrieve users: {str(e)}'}), 500


@app.route('/api/users/<int:user_id>', methods=['GET'])
@token_required
def get_user(user_id, current_user_id=None, current_username=None):
    """Get specific user by ID"""
    try:
        if user_id not in users_db:
            return jsonify({'message': 'User not found'}), 404
        
        user = users_db[user_id]
        return jsonify({
            'user': {
                'id': user_id,
                'username': user['username'],
                'email': user['email'],
                'is_active': user['is_active'],
                'created_at': user['created_at'],
                'updated_at': user['updated_at']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to retrieve user: {str(e)}'}), 500


@app.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id, current_user_id=None, current_username=None):
    """Update user information"""
    try:
        if user_id not in users_db:
            return jsonify({'message': 'User not found'}), 404
        
        # Users can only update their own profile (simplified auth check)
        if user_id != current_user_id:
            return jsonify({'message': 'Permission denied'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Request body required'}), 400
        
        user = users_db[user_id]
        
        # Update username
        if 'username' in data:
            new_username = data['username'].strip()
            if len(new_username) < 3:
                return jsonify({'message': 'Username must be at least 3 characters'}), 400
            
            # Check if username is taken
            for uid, u in users_db.items():
                if u['username'] == new_username and uid != user_id:
                    return jsonify({'message': 'Username already exists'}), 409
            
            user['username'] = new_username
        
        # Update email
        if 'email' in data:
            new_email = data['email'].strip()
            if not validate_email(new_email):
                return jsonify({'message': 'Invalid email format'}), 400
            
            # Check if email is taken
            for uid, u in users_db.items():
                if u['email'] == new_email and uid != user_id:
                    return jsonify({'message': 'Email already registered'}), 409
            
            user['email'] = new_email
        
        # Update password
        if 'password' in data:
            new_password = data['password']
            if not validate_password(new_password):
                return jsonify({'message': 'Password must be at least 6 characters'}), 400
            user['password_hash'] = hash_password(new_password)
        
        user['updated_at'] = datetime.utcnow().isoformat()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': {
                'id': user_id,
                'username': user['username'],
                'email': user['email'],
                'updated_at': user['updated_at']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Update failed: {str(e)}'}), 500


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id, current_user_id=None, current_username=None):
    """Delete/deactivate user account"""
    try:
        if user_id not in users_db:
            return jsonify({'message': 'User not found'}), 404
        
        # Users can only delete their own account
        if user_id != current_user_id:
            return jsonify({'message': 'Permission denied'}), 403
        
        # Soft delete - deactivate instead of hard delete
        users_db[user_id]['is_active'] = False
        users_db[user_id]['updated_at'] = datetime.utcnow().isoformat()
        
        return jsonify({'message': 'User account deactivated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Deletion failed: {str(e)}'}), 500


@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user_id=None, current_username=None):
    """Get current user's profile"""
    try:
        user = users_db.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': current_user_id,
                'username': user['username'],
                'email': user['email'],
                'is_active': user['is_active'],
                'created_at': user['created_at'],
                'updated_at': user['updated_at']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to retrieve profile: {str(e)}'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'message': 'Endpoint not found'}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({'message': 'Method not allowed'}), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'message': 'Internal server error'}), 500


if __name__ == '__main__':
    # Run with debug mode off in production
    app.run(host='0.0.0.0', port=5000, debug=True)
