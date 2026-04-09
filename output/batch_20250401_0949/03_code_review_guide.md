# 代码审查完整指南

> 📋 团队代码审查标准规范 | 版本: v1.0
> 
> 本文档涵盖前端、后端、安全、性能等全方位代码审查要点

---

## 📑 目录

1. [代码审查检查清单](#1-代码审查检查清单)
2. [常见代码坏味道识别](#2-常见代码坏味道识别)
3. [安全漏洞扫描要点](#3-安全漏洞扫描要点)
4. [性能优化检查点](#4-性能优化检查点)
5. [代码审查流程规范](#5-代码审查流程规范)

---

## 1. 代码审查检查清单

### 1.1 通用检查项 (Universal)

| 检查项 | 严重级别 | 检查内容 |
|--------|----------|----------|
| 命名规范 | P1 | 变量、函数、类名是否语义清晰、符合命名规范 |
| 代码注释 | P2 | 复杂逻辑是否有注释，注释是否准确、不过时 |
| 代码格式 | P2 | 缩进、空格、换行是否统一，符合团队规范 |
| 单一职责 | P0 | 函数/类是否只做一件事，符合SRP原则 |
| 代码复用 | P1 | 是否有重复代码，是否可以提取公共函数 |
| 错误处理 | P0 | 是否处理了所有可能的异常情况 |
| 日志记录 | P1 | 关键操作是否有适当的日志记录 |
| 配置分离 | P1 | 硬编码的配置是否已提取到配置文件 |

### 1.2 前端检查项 (Frontend)

| 检查项 | 严重级别 | 检查内容 |
|--------|----------|----------|
| XSS防护 | P0 | 用户输入是否经过转义，是否使用 dangerouslySetInnerHTML |
| 组件纯度 | P1 | React/Vue组件是否保持纯函数特性，避免副作用 |
| 状态管理 | P1 | 状态是否合理，避免不必要的全局状态 |
| 事件处理 | P1 | 事件监听是否正确绑定和卸载 |
| 响应式设计 | P2 | 是否适配不同屏幕尺寸 |
| 资源优化 | P1 | 图片是否懒加载，是否使用合适的格式 |
| 可访问性 | P2 | 是否有合适的ARIA标签，键盘导航是否正常 |

### 1.3 后端检查项 (Backend)

| 检查项 | 严重级别 | 检查内容 |
|--------|----------|----------|
| SQL注入 | P0 | 是否使用参数化查询/ORM，避免字符串拼接SQL |
| 认证授权 | P0 | 接口是否有适当的权限校验 |
| 输入验证 | P0 | 所有外部输入是否经过验证和清理 |
| 敏感信息 | P0 | 密码、密钥等是否加密存储，不在日志中暴露 |
| 资源释放 | P1 | 数据库连接、文件句柄是否正确关闭 |
| 并发安全 | P1 | 多线程/并发场景下是否有竞态条件 |
| API设计 | P1 | RESTful规范、版本控制、错误返回格式 |

---

## 2. 常见代码坏味道识别

### 2.1 神秘命名 (Mysterious Name)

**❌ 问题代码 (JavaScript)**
```javascript
function calc(d, r) {
  return d * r * 0.18;
}

let x = calc(100, 5);
```

**✅ 修复后**
```javascript
function calculateTax(amount, taxRate) {
  return amount * taxRate * 0.18;
}

const salesTax = calculateTax(100, 0.05);
```

**📊 严重级别: P1**
**💡 修复建议**: 使用有意义的命名，避免缩写，名称要能表达意图

---

### 2.2 重复代码 (Duplicated Code)

**❌ 问题代码 (Python)**
```python
def get_user_name(user_id):
    conn = create_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result[0] if result else None

def get_user_email(user_id):
    conn = create_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result[0] if result else None
```

**✅ 修复后**
```python
from contextlib import contextmanager

@contextmanager
def get_db_cursor():
    conn = create_db_connection()
    cursor = conn.cursor()
    try:
        yield cursor
    finally:
        cursor.close()
        conn.close()

def get_user_field(user_id, field):
    with get_db_cursor() as cursor:
        cursor.execute(f"SELECT {field} FROM users WHERE id = %s", (user_id,))
        result = cursor.fetchone()
        return result[0] if result else None
```

**📊 严重级别: P1**
**💡 修复建议**: 提取公共函数，使用上下文管理器管理资源

---

### 2.3 长函数 (Long Function)

**❌ 问题代码 (JavaScript)**
```javascript
function processOrder(order) {
  // 验证订单 - 50行
  if (!order.items || order.items.length === 0) {
    throw new Error('订单不能为空');
  }
  // ... 更多验证代码
  
  // 计算价格 - 80行
  let total = 0;
  for (let item of order.items) {
    // ... 复杂的价格计算逻辑
  }
  // ... 折扣计算
  
  // 创建支付 - 60行
  // ... 支付处理逻辑
  
  // 发送通知 - 40行
  // ... 邮件/短信通知逻辑
  
  // 更新库存 - 50行
  // ... 库存扣减逻辑
  
  return { success: true, orderId: order.id };
}
```

**✅ 修复后**
```javascript
function processOrder(order) {
  validateOrder(order);
  const pricing = calculatePricing(order);
  const payment = createPayment(order, pricing);
  sendOrderNotification(order, payment);
  updateInventory(order.items);
  
  return { success: true, orderId: order.id };
}

function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('订单不能为空');
  }
  // ... 其他验证
}

function calculatePricing(order) {
  // 价格计算逻辑
}

function createPayment(order, pricing) {
  // 支付处理逻辑
}

function sendOrderNotification(order, payment) {
  // 通知逻辑
}

function updateInventory(items) {
  // 库存更新逻辑
}
```

**📊 严重级别: P1**
**💡 修复建议**: 遵循单一职责原则，每个函数只做一件事，长度控制在30行以内

---

### 2.4 过长参数列表 (Long Parameter List)

**❌ 问题代码 (Python)**
```python
def create_user(first_name, last_name, email, phone, address_line1, 
                address_line2, city, state, zip_code, country):
    pass
```

**✅ 修复后**
```python
from dataclasses import dataclass

@dataclass
class Address:
    line1: str
    line2: str = ""
    city: str = ""
    state: str = ""
    zip_code: str = ""
    country: str = ""

@dataclass
class UserInfo:
    first_name: str
    last_name: str
    email: str
    phone: str = ""
    address: Address = None

def create_user(user_info: UserInfo):
    pass

# 使用
user = UserInfo(
    first_name="John",
    last_name="Doe",
    email="john@example.com",
    address=Address(line1="123 Main St", city="New York")
)
create_user(user)
```

**📊 严重级别: P2**
**💡 修复建议**: 使用对象/字典封装参数，当参数超过3个时考虑重构

---

### 2.5 全局数据 (Global Data)

**❌ 问题代码 (JavaScript)**
```javascript
// config.js
let config = {
  apiUrl: 'http://api.example.com',
  timeout: 5000
};

// 任何地方都可以修改
function updateConfig(newConfig) {
  config = { ...config, ...newConfig }; // 看起来安全，但...
}

// 在某处意外修改
config.timeout = 1000; // 直接影响所有使用config的地方
```

**✅ 修复后**
```javascript
// config.js
class Config {
  #settings = {
    apiUrl: 'http://api.example.com',
    timeout: 5000
  };
  
  get(key) {
    return this.#settings[key];
  }
  
  set(key, value) {
    const oldValue = this.#settings[key];
    this.#settings[key] = value;
    this.#notifyChange(key, oldValue, value);
  }
  
  #notifyChange(key, oldValue, newValue) {
    console.log(`Config ${key} changed: ${oldValue} -> ${newValue}`);
  }
}

const config = new Config();
Object.freeze(config);
export default config;
```

**📊 严重级别: P1**
**💡 修复建议**: 封装全局数据，使用私有字段，提供受控的访问方式

---

### 2.6 霰弹式修改 (Shotgun Surgery)

**❌ 问题代码 (Python)**
```python
# 当需要修改用户字段时，需要在多个地方修改
# models/user.py
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        
# serializers/user_serializer.py  
class UserSerializer:
    def serialize(self, user):
        return {
            'name': user.name,
            'email': user.email
        }
        
# validators/user_validator.py
class UserValidator:
    def validate(self, data):
        if not data.get('name'):
            raise ValueError('Name required')
        if not data.get('email'):
            raise ValueError('Email required')
            
# templates/user_profile.html
# 显示 name 和 email 的HTML代码
```

**✅ 修复后**
```python
# models/user.py
from dataclasses import dataclass, fields

@dataclass
class User:
    name: str
    email: str
    
    @classmethod
    def get_fields(cls):
        return [f.name for f in fields(cls)]
        
    def to_dict(self):
        return {f: getattr(self, f) for f in self.get_fields()}

# serializers/auto_serializer.py
class AutoSerializer:
    def __init__(self, model_class):
        self.fields = model_class.get_fields()
    
    def serialize(self, instance):
        return {f: getattr(instance, f) for f in self.fields}

# validators/schema_validator.py  
class SchemaValidator:
    def __init__(self, required_fields):
        self.required_fields = required_fields
        
    def validate(self, data):
        for field in self.required_fields:
            if not data.get(field):
                raise ValueError(f'{field} required')
```

**📊 严重级别: P1**
**💡 修复建议**: 使用元编程和反射减少重复代码，集中管理字段定义

---

### 2.7 依恋情节 (Feature Envy)

**❌ 问题代码 (JavaScript)**
```javascript
class Order {
  constructor(customer, items) {
    this.customer = customer;
    this.items = items;
  }
}

class OrderProcessor {
  calculateDiscount(order) {
    // OrderProcessor 过于关注 Customer 的内部数据
    let baseDiscount = order.customer.membershipLevel === 'gold' ? 0.2 : 0.1;
    let loyaltyDiscount = order.customer.loyaltyPoints > 1000 ? 0.05 : 0;
    let totalDiscount = baseDiscount + loyaltyDiscount;
    
    if (order.customer.birthdayMonth === new Date().getMonth()) {
      totalDiscount += 0.1;
    }
    
    return totalDiscount;
  }
}
```

**✅ 修复后**
```javascript
class Customer {
  constructor(membershipLevel, loyaltyPoints, birthdayMonth) {
    this.membershipLevel = membershipLevel;
    this.loyaltyPoints = loyaltyPoints;
    this.birthdayMonth = birthdayMonth;
  }
  
  getDiscountRate() {
    let discount = this.membershipLevel === 'gold' ? 0.2 : 0.1;
    
    if (this.loyaltyPoints > 1000) {
      discount += 0.05;
    }
    
    if (this.birthdayMonth === new Date().getMonth()) {
      discount += 0.1;
    }
    
    return discount;
  }
}

class Order {
  constructor(customer, items) {
    this.customer = customer;
    this.items = items;
  }
  
  calculateDiscount() {
    return this.customer.getDiscountRate();
  }
}
```

**📊 严重级别: P2**
**💡 修复建议**: 将操作数据的行为放在数据所属的对象中

---

### 2.8 数据泥团 (Data Clumps)

**❌ 问题代码 (Python)**
```python
def book_flight(origin_airport, origin_terminal, origin_gate,
                dest_airport, dest_terminal, dest_gate,
                departure_time, arrival_time):
    pass

def reschedule_flight(origin_airport, origin_terminal, origin_gate,
                      dest_airport, dest_terminal, dest_gate,
                      new_departure_time, new_arrival_time):
    pass
```

**✅ 修复后**
```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class AirportLocation:
    airport: str
    terminal: str
    gate: str

@dataclass
class FlightSchedule:
    departure_time: datetime
    arrival_time: datetime

@dataclass
class Flight:
    origin: AirportLocation
    destination: AirportLocation
    schedule: FlightSchedule
    
    def reschedule(self, new_schedule: FlightSchedule):
        self.schedule = new_schedule

def book_flight(flight: Flight):
    pass
```

**📊 严重级别: P2**
**💡 修复建议**: 将经常一起出现的数据封装成类/对象

---

### 2.9 基本类型偏执 (Primitive Obsession)

**❌ 问题代码 (JavaScript)**
```javascript
// 使用字符串表示电话号码
const phone = "+86-138-0013-8000";

// 使用数组表示坐标
const point = [39.9042, 116.4074]; // 这是北京吗？还是纬度经度？

// 使用字符串表示金额
const price = "￥1,234.56";

// 验证逻辑到处散落
function validatePhone(phone) {
  return /^\+\d{2}-\d{3}-\d{4}-\d{4}$/.test(phone);
}
```

**✅ 修复后**
```javascript
class PhoneNumber {
  constructor(countryCode, areaCode, prefix, lineNumber) {
    this.countryCode = countryCode;
    this.areaCode = areaCode;
    this.prefix = prefix;
    this.lineNumber = lineNumber;
  }
  
  static fromString(phoneString) {
    const match = phoneString.match(/\+(\d{2})-(\d{3})-(\d{4})-(\d{4})/);
    if (!match) throw new Error('Invalid phone format');
    return new PhoneNumber(match[1], match[2], match[3], match[4]);
  }
  
  toString() {
    return `+${this.countryCode}-${this.areaCode}-${this.prefix}-${this.lineNumber}`;
  }
}

class GeoPoint {
  constructor(latitude, longitude) {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude');
    }
    this.latitude = latitude;
    this.longitude = longitude;
  }
  
  distanceTo(other) {
    // Haversine公式计算距离
    const R = 6371; // 地球半径(km)
    // ... 计算逻辑
  }
}

class Money {
  constructor(amount, currency = 'CNY') {
    if (amount < 0) throw new Error('Amount cannot be negative');
    this.amountCents = Math.round(amount * 100);
    this.currency = currency;
  }
  
  get amount() {
    return this.amountCents / 100;
  }
  
  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
  
  toString() {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: this.currency
    }).format(this.amount);
  }
}

// 使用
const phone = PhoneNumber.fromString("+86-138-0013-8000");
const beijing = new GeoPoint(39.9042, 116.4074);
const price = new Money(1234.56);
```

**📊 严重级别: P2**
**💡 修复建议**: 为基本类型创建值对象，封装验证逻辑和行为

---

### 2.10 夸夸其谈通用性 (Speculative Generality)

**❌ 问题代码 (Python)**
```python
from abc import ABC, abstractmethod

# 为了"未来可能"支持的多种数据库而设计的复杂抽象
class DatabaseConnection(ABC):
    @abstractmethod
    def connect(self):
        pass
    
    @abstractmethod
    def execute(self, query):
        pass
    
    @abstractmethod
    def transaction(self):
        pass
    
    @abstractmethod
    def rollback(self):
        pass
    
    @abstractmethod
    def commit(self):
        pass

class MySQLConnection(DatabaseConnection):
    # 实现...
    pass

class PostgreSQLConnection(DatabaseConnection):
    # 实现...
    pass

class MongoDBConnection(DatabaseConnection):
    # 等等，MongoDB需要transaction吗？
    pass

# 实际上团队只用PostgreSQL
```

**✅ 修复后 (YAGNI原则)**
```python
class PostgreSQLConnection:
    def __init__(self, dsn):
        self.dsn = dsn
        self.connection = None
    
    def connect(self):
        import psycopg2
        self.connection = psycopg2.connect(self.dsn)
        return self
    
    def execute(self, query, params=None):
        with self.connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()
    
    def close(self):
        if self.connection:
            self.connection.close()

# 当确实需要支持多个数据库时，再进行抽象
# 遵循"三次法则": 当同样代码出现第三次时，才进行抽象
```

**📊 严重级别: P2**
**💡 修复建议**: 遵循YAGNI原则，不要为未来可能的需求过度设计

---

## 3. 安全漏洞扫描要点

### 3.1 OWASP Top 10 检查清单

#### A01: 访问控制失效 (Broken Access Control)

**风险等级: 🔴 P0 (Critical)**

| 检查项 | 代码示例 |
|--------|----------|
| 水平越权检查 | 验证用户只能访问自己的资源 |
| 垂直越权检查 | 验证用户角色权限 |
| 未认证访问 | 所有敏感接口必须登录 |

**❌ 漏洞代码 (Python/Flask)**
```python
@app.route('/api/user/<user_id>/orders')
def get_user_orders(user_id):
    # ❌ 漏洞: 没有验证当前用户是否有权查看这些订单
    orders = Order.query.filter_by(user_id=user_id).all()
    return jsonify([o.to_dict() for o in orders])
```

**✅ 安全代码**
```python
from functools import wraps
from flask import session, abort

def require_owner_or_admin(resource_user_id_param):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            current_user_id = session.get('user_id')
            resource_user_id = kwargs.get(resource_user_id_param)
            
            # 验证当前用户是资源所有者或管理员
            if current_user_id != resource_user_id and not is_admin(current_user_id):
                abort(403, '无权访问此资源')
            
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.route('/api/user/<user_id>/orders')
@login_required
@require_owner_or_admin('user_id')
def get_user_orders(user_id):
    orders = Order.query.filter_by(user_id=user_id).all()
    return jsonify([o.to_dict() for o in orders])
```

---

#### A02: 加密机制失效 (Cryptographic Failures)

**风险等级: 🔴 P0 (Critical)**

| 检查项 | 要求 |
|--------|------|
| 密码存储 | 使用 bcrypt/Argon2，禁止 MD5/SHA1 |
| 数据传输 | HTTPS 强制，禁用 TLS 1.0/1.1 |
| 密钥管理 | 密钥不硬编码，使用 KMS/Vault |
| 敏感数据 | 日志中不输出密码、token |

**❌ 漏洞代码**
```javascript
// ❌ 明文存储密码
async function createUser(username, password) {
  await db.users.insert({ username, password });
}

// ❌ 使用弱哈希
const crypto = require('crypto');
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}
```

**✅ 安全代码**
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function createUser(username, password) {
  const passwordHash = await hashPassword(password);
  await db.users.insert({ 
    username, 
    password_hash: passwordHash,
    created_at: new Date()
  });
}
```

---

#### A03: 注入攻击 (Injection)

**风险等级: 🔴 P0 (Critical)**

##### SQL注入

**❌ 漏洞代码 (Python)**
```python
# ❌ 极其危险的字符串拼接
def search_users(name):
    query = f"SELECT * FROM users WHERE name LIKE '%{name}%'"
    cursor.execute(query)  # 攻击者可以输入: '; DROP TABLE users; --
```

**✅ 安全代码**
```python
# 方法1: 参数化查询
def search_users(name):
    query = "SELECT * FROM users WHERE name LIKE %s"
    cursor.execute(query, (f'%{name}%',))
    return cursor.fetchall()

# 方法2: 使用ORM
from sqlalchemy import text

def search_users_safe(name):
    return User.query.filter(User.name.like(f'%{name}%')).all()
```

##### NoSQL注入 (JavaScript/MongoDB)

**❌ 漏洞代码**
```javascript
// ❌ 直接将用户输入作为查询条件
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.users.findOne({ username, password });
  // 攻击者可以发送: { "username": { "$ne": null }, "password": { "$ne": null } }
});
```

**✅ 安全代码**
```javascript
const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required()
});

app.post('/login', async (req, res) => {
  // 1. 验证输入类型
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details });
  
  const { username, password } = value;
  
  // 2. 查找用户
  const user = await db.users.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  // 3. 验证密码
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  
  // 4. 生成会话
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});
```

---

#### A04: 不安全设计 (Insecure Design)

**风险等级: 🟠 P1 (High)**

| 检查项 | 说明 |
|--------|------|
| 业务逻辑漏洞 | 订单金额可在客户端修改 |
| 竞态条件 | 优惠券重复使用、库存超卖 |
| 限速控制 | API 无速率限制 |

**❌ 漏洞代码**
```javascript
// ❌ 客户端决定价格
app.post('/order', async (req, res) => {
  const { items, totalAmount } = req.body; // totalAmount来自客户端！
  
  const order = await Order.create({
    items,
    total: totalAmount,  // 用户可以将$100改成$1
    userId: req.user.id
  });
});
```

**✅ 安全代码**
```javascript
app.post('/order', async (req, res) => {
  const { items } = req.body;
  
  // 服务端计算价格
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < item.quantity) throw new Error('Out of stock');
    
    // 使用数据库中的价格，而非客户端传来的价格
    total += product.price * item.quantity;
  }
  
  // 应用优惠券（服务端验证）
  // ...
  
  const order = await Order.create({
    items,
    total,  // 服务端计算的价格
    userId: req.user.id
  });
});
```

---

#### A05: 安全配置错误 (Security Misconfiguration)

**风险等级: 🟠 P1 (High)**

| 检查项 | 要求 |
|--------|------|
| 默认凭证 | 删除所有默认账号密码 |
| 错误信息 | 生产环境不暴露堆栈跟踪 |
| 安全头 | 配置 CSP, HSTS, X-Frame-Options |
| 不必要功能 | 禁用未使用的端口、服务 |

**❌ 漏洞配置**
```javascript
// Express 默认配置暴露太多信息
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // ❌ 生产环境暴露堆栈！
  });
});
```

**✅ 安全配置**
```javascript
const helmet = require('helmet');

// 安全HTTP头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 错误处理
app.use((err, req, res, next) => {
  console.error(err);  // 记录完整错误
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});
```

---

#### A06: 易受攻击和过时的组件

**风险等级: 🟠 P1 (High)**

| 检查项 | 工具/方法 |
|--------|----------|
| 依赖扫描 | `npm audit`, Snyk, Dependabot |
| 漏洞数据库 | CVE, NVD |
| 更新策略 | 及时更新安全补丁 |

**检查命令**
```bash
# JavaScript/Node.js
npm audit
npm audit fix

# Python
pip-audit
safety check

# 持续集成
npm audit --audit-level=moderate
```

---

#### A07: 身份识别和认证失效

**风险等级: 🔴 P0 (Critical)**

| 检查项 | 要求 |
|--------|------|
| 密码强度 | 最小长度、复杂度要求 |
| 暴力破解 | 登录限速、账户锁定 |
| 会话管理 | 安全的session/token机制 |
| MFA支持 | 敏感操作二次验证 |

**❌ 漏洞代码**
```python
# ❌ 弱密码接受
@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']  # 接受"123456"
    # ...

# ❌ 无登录限制
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    # 可以无限次尝试
```

**✅ 安全代码**
```python
import re
from flask_limiter import Limiter

# 密码强度验证
def validate_password(password):
    if len(password) < 12:
        return False, "密码至少需要12位"
    if not re.search(r'[A-Z]', password):
        return False, "需要包含大写字母"
    if not re.search(r'[a-z]', password):
        return False, "需要包含小写字母"
    if not re.search(r'\d', password):
        return False, "需要包含数字"
    if not re.search(r'[!@#$%^&*]', password):
        return False, "需要包含特殊字符"
    return True, None

# 登录限速
limiter = Limiter(
    app,
    key_func=lambda: request.form.get('username') or get_remote_address(),
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    username = request.form['username']
    password = request.form['password']
    
    user = User.query.filter_by(username=username).first()
    
    # 防时序攻击：即使用户不存在也进行假验证
    if not user:
        bcrypt.checkpw(b'fake', bcrypt.hashpw(b'fake', bcrypt.gensalt()))
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not bcrypt.checkpw(password.encode(), user.password_hash):
        # 记录失败次数
        increment_failed_attempts(username)
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # 生成短期JWT
    token = generate_jwt(user.id, expires_in=3600)
    return jsonify({'token': token})
```

---

#### A08: 软件和数据完整性故障

**风险等级: 🟠 P1 (High)**

| 检查项 | 说明 |
|--------|------|
| 依赖验证 | 验证包签名、checksum |
| 序列化安全 | 避免不安全的反序列化 |
| CI/CD安全 | 保护构建管道 |

**❌ 漏洞代码 (Python pickle)**
```python
import pickle

# ❌ 永远不要反序列化不可信数据！
data = pickle.loads(request.data)  # RCE漏洞
```

**✅ 安全替代**
```python
import json

# 使用JSON替代pickle
data = json.loads(request.data)

# 验证schema
schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string", "maxLength": 100},
        "age": {"type": "integer", "minimum": 0}
    },
    "required": ["name"]
}
validate(data, schema)  # jsonschema
```

---

#### A09: 安全日志和监控失效

**风险等级: 🟠 P1 (High)**

| 检查项 | 要求 |
|--------|------|
| 日志完整性 | 防篡改、集中存储 |
| 安全事件 | 登录失败、权限变更记录 |
| 告警机制 | 异常行为实时告警 |
| 日志保留 | 符合合规要求 |

**安全日志示例**
```python
import structlog
import hashlib

logger = structlog.get_logger()

def log_security_event(event_type, user_id, details, ip_address):
    """记录安全事件，包含完整性校验"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "ip_address": hashlib.sha256(ip_address.encode()).hexdigest()[:16],  # 匿名化
        "details": details,
        "session_id": get_session_id()
    }
    
    # 计算完整性哈希
    log_entry["integrity_hash"] = calculate_hash(log_entry)
    
    logger.warning("security_event", **log_entry)

# 使用
log_security_event(
    event_type="failed_login",
    user_id="user_123",
    details={"reason": "invalid_password", "attempt": 3},
    ip_address=request.remote_addr
)
```

---

#### A10: 服务端请求伪造 (SSRF)

**风险等级: 🔴 P0 (Critical)**

**❌ 漏洞代码**
```python
import requests

@app.route('/fetch')
def fetch_url():
    url = request.args.get('url')
    # ❌ 用户可以访问内部服务！
    # url=http://localhost:8080/admin
    # url=file:///etc/passwd
    response = requests.get(url)
    return response.text
```

**✅ 安全代码**
```python
import requests
from urllib.parse import urlparse
import ipaddress

def is_internal_ip(hostname):
    """检查是否为内网IP"""
    try:
        ip = ipaddress.ip_address(hostname)
        return ip.is_private or ip.is_loopback or ip.is_reserved
    except ValueError:
        # 是域名，需要解析
        return False

ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com']

def fetch_url_safe(user_url):
    # 1. 解析URL
    parsed = urlparse(user_url)
    
    # 2. 协议白名单
    if parsed.scheme not in ['http', 'https']:
        raise ValueError("仅允许HTTP/HTTPS协议")
    
    # 3. 域名白名单或DNS重绑定防护
    hostname = parsed.hostname
    
    # 方案A: 域名白名单
    if hostname not in ALLOWED_DOMAINS:
        raise ValueError("域名不在白名单中")
    
    # 方案B: 解析后检查IP
    import socket
    resolved_ip = socket.gethostbyname(hostname)
    if is_internal_ip(resolved_ip):
        raise ValueError("禁止访问内网地址")
    
    # 4. 使用无redirect的session
    session = requests.Session()
    session.max_redirects = 0
    
    # 5. 超时控制
    response = session.get(
        user_url,
        timeout=5,
        headers={'User-Agent': 'SecureFetcher/1.0'}
    )
    
    # 6. 内容长度限制
    if len(response.content) > 10 * 1024 * 1024:  # 10MB
        raise ValueError("响应过大")
    
    return response.text
```

---

### 3.2 其他常见安全漏洞

#### XSS (跨站脚本攻击)

**❌ 漏洞代码**
```javascript
// ❌ 直接渲染用户输入
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h1>搜索结果: ${query}</h1>`);  // XSS!
});
```

**✅ 安全代码**
```javascript
const escapeHtml = require('escape-html');

app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h1>搜索结果: ${escapeHtml(query)}</h1>`);
});

// 或使用模板引擎的自动转义
// EJS/Pug/Jinja2 默认会转义变量
```

#### CSRF (跨站请求伪造)

**✅ 防护代码**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/form', csrfProtection, (req, res) => {
  // 处理表单
});
```

---

## 4. 性能优化检查点

### 4.1 前端性能

| 检查项 | 严重级别 | 优化建议 |
|--------|----------|----------|
| 首屏加载 | P0 | 关键CSS内联，异步加载JS |
| 图片优化 | P1 | WebP格式，响应式图片，懒加载 |
| 代码分割 | P1 | 路由级别分割，动态导入 |
| 缓存策略 | P1 | 静态资源长期缓存 |
| Bundle大小 | P1 | 分析并移除未使用代码 |
| 渲染性能 | P2 | 虚拟列表，避免重排重绘 |

**性能预算建议**
```
首屏加载 < 3秒 (4G网络)
首屏资源 < 1MB
JavaScript < 300KB (gzip)
图片 < 500KB (首屏)
Lighthouse Performance Score > 90
```

**代码示例: 图片懒加载**
```javascript
// ❌ 原始代码
<img src="large-image.jpg" alt="description" />

// ✅ 懒加载
<img 
  loading="lazy"
  src="placeholder.jpg"
  data-src="large-image.jpg"
  alt="description"
/>

// Intersection Observer实现
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

### 4.2 后端性能

| 检查项 | 严重级别 | 优化建议 |
|--------|----------|----------|
| 数据库查询 | P0 | 避免N+1查询，使用索引 |
| 缓存使用 | P1 | Redis/Memcached缓存热点数据 |
| 连接池 | P1 | 数据库连接池配置 |
| 异步处理 | P1 | 耗时的IO操作异步化 |
| 分页加载 | P1 | 大数据集必须分页 |
| 算法复杂度 | P0 | 避免O(n²)以上的算法 |

**❌ 性能问题代码 (Python/SQLAlchemy N+1)**
```python
# ❌ N+1查询问题
users = User.query.all()  # 1次查询
for user in users:
    print(user.department.name)  # N次查询
```

**✅ 优化代码**
```python
# ✅ 使用joinedload预加载
from sqlalchemy.orm import joinedload

users = User.query.options(
    joinedload(User.department)
).all()  # 1次查询

for user in users:
    print(user.department.name)  # 使用缓存数据，无额外查询

# ✅ 或使用selectinload（适合大数据量）
from sqlalchemy.orm import selectinload

users = User.query.options(
    selectinload(User.department)
).all()
```

**缓存策略示例**
```python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379)

def cached(timeout=300):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            cache_key = f"{f.__name__}:{hash(str(args) + str(kwargs))}"
            
            # 尝试从缓存获取
            cached_value = redis_client.get(cache_key)
            if cached_value:
                return json.loads(cached_value)
            
            # 执行函数
            result = f(*args, **kwargs)
            
            # 存入缓存
            redis_client.setex(
                cache_key,
                timeout,
                json.dumps(result, default=str)
            )
            
            return result
        return wrapper
    return decorator

@cached(timeout=600)
def get_user_statistics(user_id):
    # 复杂的统计计算
    return calculate_statistics(user_id)
```

### 4.3 数据库性能

| 检查项 | 严重级别 | 检查方法 |
|--------|----------|----------|
| 索引使用 | P0 | EXPLAIN分析查询计划 |
| 慢查询 | P0 | 定期审查慢查询日志 |
| 表结构 | P1 | 避免冗余字段，适当拆分 |
| 连接数 | P1 | 监控连接数，配置连接池 |
| 死锁 | P1 | 监控并解决死锁问题 |

**索引检查示例**
```sql
-- 查看查询是否使用索引
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- 期望看到: Index Scan 或 Index Only Scan
-- 避免: Seq Scan (全表扫描)

-- 创建索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- 复合索引
CREATE INDEX CONCURRENTLY idx_orders_user_created 
ON orders(user_id, created_at DESC);
```

---

## 5. 代码审查流程规范

### 5.1 审查前准备

**提交者清单**
- [ ] 自测通过，所有测试用例通过
- [ ] 代码符合团队编码规范（已通过 linter）
- [ ] 敏感信息已清理（密码、密钥、调试代码）
- [ ] 提交信息清晰描述改动内容
- [ ] 复杂逻辑已添加注释
- [ ] 相关文档已更新

### 5.2 审查流程图

```
┌─────────────────┐
│  提交Pull Request │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  自动化检查      │
│  (CI/CD, Lint)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌─────────┐
│ 通过  │  │  失败   │
└───┬───┘  └────┬────┘
    │           │
    ▼           ▼
┌─────────────────┐
│  人工代码审查    │
│  (至少1人)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌─────────┐
│ 通过  │  │ 需修改  │
└───┬───┘  └────┬────┘
    │           │
    ▼           │
┌─────────────────┐    │
│   合并到主分支   │◄───┘
└─────────────────┘
```

### 5.3 审查反馈规范

#### 严重级别定义

| 级别 | 标识 | 说明 | 处理方式 |
|------|------|------|----------|
| **P0** | 🔴 **Blocker** | 严重问题，必须修复 | 阻止合并，修复后重新审查 |
| **P1** | 🟠 **Major** | 重要问题，建议修复 | 原则上修复，特殊情况可协商 |
| **P2** | 🟡 **Minor** | 轻微问题，可选修复 | 可在后续迭代中修复 |
| **Nit** | 🟢 **Nitpick** | 风格/建议性问题 | 非强制，由作者决定 |

#### 反馈模板

```markdown
## 🔴 P0 - [问题类型]
**位置**: `file.py:line 45`
**问题**: [具体描述]
**风险**: [如果不修复会发生什么]
**建议**: [如何修复]
```python
# 示例代码
```

## 🟠 P1 - [问题类型]
**位置**: `file.js:line 23`
**问题**: [具体描述]
**建议**: [改进方案]
```javascript
// 示例代码
```

## 🟡 P2 - [问题类型]
**位置**: [文件位置]
**建议**: [可选改进]
```

## 💡 疑问/讨论
[对某个设计决策的疑问或建议讨论]
```

### 5.4 审查检查清单 (打印版)

```markdown
# 📋 代码审查检查清单
## PR #____ 审查人: ______ 日期: ______

### 基础检查
- [ ] 代码是否清晰可读
- [ ] 命名是否语义明确
- [ ] 是否有适当的注释
- [ ] 是否有单元测试
- [ ] 测试是否通过

### 功能检查
- [ ] 功能是否按需求实现
- [ ] 边界条件是否处理
- [ ] 错误处理是否完善
- [ ] 输入验证是否充分

### 安全检查 [P0]
- [ ] 无SQL注入风险
- [ ] 无XSS漏洞
- [ ] 权限控制正确
- [ ] 敏感信息未泄露
- [ ] 依赖无已知漏洞

### 性能检查 [P1]
- [ ] 无N+1查询问题
- [ ] 适当的缓存使用
- [ ] 大数据集已分页
- [ ] 无明显的性能瓶颈

### 架构检查 [P1]
- [ ] 符合单一职责原则
- [ ] 无重复代码
- [ ] 适当的抽象层级
- [ ] 向后兼容性考虑

### 审查结论
- [ ] ✅ 批准合并
- [ ] 📝 批准，有小建议
- [ ] ⏸️ 需要修改 (问题数: ____)

### 问题汇总
| 级别 | 数量 | 列表 |
|------|------|------|
| P0 🔴 | ___ | |
| P1 🟠 | ___ | |
| P2 🟡 | ___ | |
| Nit 🟢 | ___ | |

---
审查耗时: ____ 分钟
```

### 5.5 高效Code Review原则

#### 对审查者

1. **及时响应**: 收到审查请求后24小时内响应
2. **就事论事**: 评论代码，不评论人
3. **解释原因**: 不仅说"这是什么"，更要说"为什么"
4. **提供方案**: 指出问题的同时给出解决建议
5. **区分优先级**: 用严重级别帮助作者聚焦重要问题
6. **学习心态**: 每个PR都是学习机会，保持开放

#### 对提交者

1. **小步提交**: 每个PR控制在200-400行改动
2. **自我审查**: 提交前自己先review一遍
3. **积极回应**: 对所有评论进行回应，即使只是"已修复"
4. **不辩解**: 对建议保持开放，有不同意见可讨论
5. **感谢反馈**: 审查者是帮你提升代码质量

#### 团队规范

| 规则 | 说明 |
|------|------|
| 最少审查人数 | 至少1名其他成员审查 |
| 审查时间限制 | 单个PR审查不超过30分钟 |
| PR大小限制 | 建议不超过400行改动 |
| 阻塞规则 | 任何成员发现P0问题可阻止合并 |
| 知识分享 | 重要设计决策在PR描述中说明 |

### 5.6 工具推荐

| 类别 | 工具 | 用途 |
|------|------|------|
| 静态分析 | ESLint, Pylint, SonarQube | 代码质量检查 |
| 安全扫描 | Snyk, OWASP Dependency-Check | 依赖漏洞检测 |
| 性能分析 | Lighthouse, Py-Spy | 性能瓶颈分析 |
| 测试覆盖 | Jest, pytest-cov, Codecov | 测试覆盖率 |
| 审查工具 | GitHub PR, GitLab MR, Phabricator | 协作审查 |

---

## 📎 附录

### 附录A: 常见缩写

| 缩写 | 全称 | 说明 |
|------|------|------|
| P0/P1/P2 | Priority 0/1/2 | 严重级别 |
| SSRF | Server-Side Request Forgery | 服务端请求伪造 |
| XSS | Cross-Site Scripting | 跨站脚本攻击 |
| CSRF | Cross-Site Request Forgery | 跨站请求伪造 |
| SQLi | SQL Injection | SQL注入 |
| RCE | Remote Code Execution | 远程代码执行 |
| SRP | Single Responsibility Principle | 单一职责原则 |
| YAGNI | You Ain't Gonna Need It | 你不会需要它 |
| DRY | Don't Repeat Yourself | 不要重复自己 |

### 附录B: 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Refactoring Guru - Code Smells](https://refactoring.guru/refactoring/smells)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

*本文档最后更新: 2026-04-01*

*如有建议或发现遗漏，请提交Issue或PR*
