# 代码质量审查指南

> 本文档旨在帮助团队建立规范的代码审查流程，提升代码质量和团队协作效率。

---

## 目录

1. [代码审查模板](#1-代码审查模板)
2. [常见代码问题及改进示例](#2-常见代码问题及改进示例)
   - 2.1 [命名规范问题](#21-命名规范问题)
   - 2.2 [逻辑重复/代码冗余](#22-逻辑重复代码冗余)
   - 2.3 [错误处理不完善](#23-错误处理不完善)
   - 2.4 [性能优化机会](#24-性能优化机会)
   - 2.5 [安全风险](#25-安全风险)
3. [代码审查清单](#3-代码审查清单)

---

## 1. 代码审查模板

### 1.1 Python 审查模板

```python
# ============================================
# 文件信息
# ============================================
"""
文件名: example.py
作者: 张三
创建日期: 2024-01-15
最后修改: 2024-01-20

功能描述:
    该模块提供用户认证相关功能，包括登录、登出和令牌验证。

依赖:
    - jwt >= 2.0.0
    - bcrypt >= 4.0.0

使用示例:
    >>> from example import AuthService
    >>> auth = AuthService()
    >>> token = auth.login("user@example.com", "password123")
"""

# ============================================
# 导入语句
# ============================================
import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import jwt
import bcrypt

# ============================================
# 常量定义
# ============================================
DEFAULT_TOKEN_EXPIRY_HOURS = 24
MAX_LOGIN_ATTEMPTS = 5

# ============================================
# 类定义
# ============================================
class AuthService:
    """用户认证服务类。
    
    提供安全的用户认证功能，支持 JWT 令牌生成和验证。
    
    Attributes:
        secret_key: 用于签名 JWT 的密钥
        token_expiry: 令牌过期时间（小时）
    """
    
    def __init__(self, secret_key: Optional[str] = None, 
                 token_expiry: int = DEFAULT_TOKEN_EXPIRY_HOURS):
        """初始化认证服务。
        
        Args:
            secret_key: JWT 签名密钥，默认从环境变量读取
            token_expiry: 令牌有效期（小时）
        """
        self.secret_key = secret_key or os.getenv('JWT_SECRET_KEY')
        if not self.secret_key:
            raise ValueError("JWT secret key is required")
        self.token_expiry = token_expiry
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """用户登录并生成访问令牌。
        
        Args:
            email: 用户邮箱
            password: 用户密码
            
        Returns:
            包含访问令牌和过期时间的字典
            
        Raises:
            AuthenticationError: 认证失败时抛出
        """
        # 实现逻辑...
        pass
```

### 1.2 JavaScript/TypeScript 审查模板

```typescript
/**
 * ============================================
 * 文件信息
 * ============================================
 * @fileoverview 用户认证服务模块
 * @module services/AuthService
 * @author 张三
 * @since 2024-01-15
 * 
 * @requires jsonwebtoken
 * @requires bcrypt
 * 
 * @example
 * ```typescript
 * const auth = new AuthService();
 * const token = await auth.login('user@example.com', 'password123');
 * ```
 */

// ============================================
// 导入语句
// ============================================
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';

// ============================================
// 常量定义
// ============================================
const DEFAULT_TOKEN_EXPIRY_HOURS = 24;
const MAX_LOGIN_ATTEMPTS = 5;

// ============================================
// 类型定义
// ============================================
interface AuthToken {
  accessToken: string;
  expiresAt: Date;
  tokenType: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================
// 类定义
// ============================================
/**
 * 用户认证服务类
 * 
 * 提供安全的用户认证功能，支持 JWT 令牌生成和验证
 */
export class AuthService {
  private readonly secretKey: string;
  private readonly tokenExpiry: number;
  private readonly userRepository: UserRepository;

  /**
   * 创建 AuthService 实例
   * 
   * @param secretKey - JWT 签名密钥
   * @param tokenExpiry - 令牌有效期（小时）
   * @param userRepository - 用户数据仓库
   */
  constructor(
    secretKey: string = process.env.JWT_SECRET_KEY!,
    tokenExpiry: number = DEFAULT_TOKEN_EXPIRY_HOURS,
    userRepository: UserRepository = new UserRepository()
  ) {
    if (!secretKey) {
      throw new Error('JWT secret key is required');
    }
    this.secretKey = secretKey;
    this.tokenExpiry = tokenExpiry;
    this.userRepository = userRepository;
  }

  /**
   * 用户登录
   * 
   * @param credentials - 登录凭证
   * @returns 认证令牌
   * @throws {AuthenticationError} 认证失败时抛出
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    // 实现逻辑...
    return {} as AuthToken;
  }
}
```

### 1.3 Java 审查模板

```java
/*
 * ============================================
 * 文件信息
 * ============================================
 * 文件名: AuthService.java
 * 包名: com.example.auth
 * 
 * 作者: 张三
 * 创建日期: 2024-01-15
 * 最后修改: 2024-01-20
 * 
 * 功能描述:
 *     该模块提供用户认证相关功能，包括登录、登出和令牌验证。
 * 
 * 依赖:
 *     - io.jsonwebtoken:jjwt:0.12.0
 *     - org.springframework.security:spring-security-crypto
 */

package com.example.auth;

// ============================================
// 导入语句
// ============================================
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * 用户认证服务类。
 * 
 * <p>提供安全的用户认证功能，支持 JWT 令牌生成和验证。</p>
 * 
 * @author 张三
 * @version 1.0.0
 * @since 2024-01-15
 */
@Service
public class AuthService {
    
    // ============================================
    // 常量定义
    // ============================================
    private static final int DEFAULT_TOKEN_EXPIRY_HOURS = 24;
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    
    // ============================================
    // 字段定义
    // ============================================
    private final String secretKey;
    private final int tokenExpiryHours;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    /**
     * 构造认证服务实例。
     *
     * @param secretKey JWT 签名密钥
     * @param tokenExpiryHours 令牌有效期（小时）
     * @param userRepository 用户数据仓库
     * @throws IllegalArgumentException 如果密钥为空
     */
    public AuthService(String secretKey, 
                       int tokenExpiryHours,
                       UserRepository userRepository) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalArgumentException("JWT secret key is required");
        }
        this.secretKey = secretKey;
        this.tokenExpiryHours = tokenExpiryHours;
        this.userRepository = Objects.requireNonNull(userRepository);
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    /**
     * 用户登录。
     *
     * @param email 用户邮箱
     * @param password 用户密码
     * @return 认证令牌
     * @throws AuthenticationException 认证失败时抛出
     */
    public AuthToken login(String email, String password) {
        // 实现逻辑...
        return null;
    }
}
```

---

## 2. 常见代码问题及改进示例

### 2.1 命名规范问题

#### 问题 1：不清晰/模糊的命名

**❌ 问题代码（Python）**

```python
# 糟糕的命名示例
def calc(d, r):
    """计算"""
    t = d / r
    c = 3.14 * r * 2
    a = 3.14 * r ** 2
    return t, c, a

# 使用
result = calc(100, 5)
```

**问题说明：**
- 函数名 `calc` 过于模糊，无法表达具体计算什么
- 参数 `d` 和 `r` 含义不明
- 返回值 `t`, `c`, `a` 无法直观理解
- 魔法数字 `3.14` 应该使用常量

**✅ 改进后代码（Python）**

```python
from typing import Tuple
from dataclasses import dataclass

# 使用有意义的常量
PI = 3.14159

@dataclass
class CircleMetrics:
    """圆的各项指标"""
    travel_time: float      # 行驶时间（小时）
    circumference: float    # 周长
    area: float            # 面积

def calculate_circle_metrics(
    distance: float, 
    radius: float, 
    speed: float
) -> CircleMetrics:
    """计算与圆相关的各项指标。
    
    计算给定半径的圆的周长、面积，以及以指定速度行驶指定距离所需的时间。
    
    Args:
        distance: 行驶距离（公里）
        radius: 圆的半径（米）
        speed: 行驶速度（公里/小时）
        
    Returns:
        CircleMetrics 包含计算结果的命名元组
        
    Raises:
        ValueError: 当半径或速度为非正数时
    """
    if radius <= 0:
        raise ValueError("Radius must be positive")
    if speed <= 0:
        raise ValueError("Speed must be positive")
    
    travel_time = distance / speed
    circumference = 2 * PI * radius
    area = PI * radius ** 2
    
    return CircleMetrics(
        travel_time=travel_time,
        circumference=circumference,
        area=area
    )

# 使用
metrics = calculate_circle_metrics(distance=100, radius=5, speed=60)
print(f"行驶时间: {metrics.travel_time:.2f} 小时")
print(f"圆周长: {metrics.circumference:.2f} 米")
print(f"圆面积: {metrics.area:.2f} 平方米")
```

**改进说明：**
- 使用描述性函数名 `calculate_circle_metrics`
- 使用完整单词作为参数名 `distance`, `radius`, `speed`
- 使用 `dataclass` 返回结构化数据，每个字段都有明确含义
- 添加了详细的文档字符串
- 添加了输入验证

---

#### 问题 2：不一致的命名风格

**❌ 问题代码（JavaScript）**

```javascript
// 不一致的命名风格
class user_data {
    constructor() {
        this.FirstName = '';
        this.last_name = '';
        this.userAge = 0;
    }
    
    getData() {
        return {
            Name: this.FirstName + ' ' + this.last_name,
            age_val: this.userAge
        };
    }
    
    ProcessUser() {
        // 处理逻辑
    }
}

const USER_COUNT = 10;
function fetch_user() { }
```

**问题说明：**
- 类名使用蛇形命名（`user_data`），应使用 PascalCase
- 属性混用驼峰、帕斯卡和下划线命名
- 方法名混用驼峰和帕斯卡命名
- 常量使用全大写，但函数名不一致

**✅ 改进后代码（JavaScript）**

```javascript
// 一致的命名风格

/**
 * 用户数据类
 * 
 * 管理用户的基本信息和操作
 */
class UserData {
    /**
     * @param {string} firstName - 名
     * @param {string} lastName - 姓
     * @param {number} age - 年龄
     */
    constructor(firstName = '', lastName = '', age = 0) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }
    
    /**
     * 获取完整用户信息
     * @returns {{fullName: string, age: number}}
     */
    getData() {
        return {
            fullName: `${this.firstName} ${this.lastName}`,
            age: this.age
        };
    }
    
    /**
     * 处理用户数据
     */
    processUser() {
        // 处理逻辑
    }
}

// 常量使用全大写蛇形命名
const MAX_USER_COUNT = 10;

// 函数使用驼峰命名
function fetchUser() {
    // 获取用户逻辑
}

// 私有方法和属性使用下划线前缀（可选约定）
class UserManager {
    constructor() {
        this._users = [];           // 私有属性
        this._initialized = false;
    }
    
    _validateUser(user) {           // 私有方法
        return user && user.id && user.name;
    }
}
```

**改进说明：**
- 类名使用 PascalCase (`UserData`)
- 所有属性和方法使用 camelCase
- 统一了代码风格，提高可读性
- 使用 JSDoc 注释增强文档

---

### 2.2 逻辑重复/代码冗余

#### 问题 1：重复的条件逻辑

**❌ 问题代码（Java）**

```java
public class OrderProcessor {
    
    public double calculateDiscount(Order order) {
        double discount = 0;
        
        if (order.getCustomerType().equals("VIP") && order.getAmount() > 1000) {
            discount = order.getAmount() * 0.2;
        } else if (order.getCustomerType().equals("VIP") && order.getAmount() > 500) {
            discount = order.getAmount() * 0.15;
        } else if (order.getCustomerType().equals("REGULAR") && order.getAmount() > 1000) {
            discount = order.getAmount() * 0.1;
        } else if (order.getCustomerType().equals("REGULAR") && order.getAmount() > 500) {
            discount = order.getAmount() * 0.05;
        }
        
        return discount;
    }
    
    public boolean isEligibleForFreeShipping(Order order) {
        if (order.getCustomerType().equals("VIP") && order.getAmount() > 1000) {
            return true;
        } else if (order.getCustomerType().equals("VIP") && order.getAmount() > 500) {
            return true;
        } else if (order.getCustomerType().equals("REGULAR") && order.getAmount() > 1000) {
            return true;
        }
        return false;
    }
}
```

**问题说明：**
- 多处重复的条件判断逻辑
- `order.getCustomerType()` 和 `order.getAmount()` 被多次调用
- 折扣规则散落在各处，难以维护
- 条件组合复杂，容易出错

**✅ 改进后代码（Java）**

```java
import java.util.EnumMap;
import java.util.Map;

/**
 * 客户类型枚举
 */
public enum CustomerType {
    VIP(0.2, 0.15, 500),
    REGULAR(0.1, 0.05, 1000),
    NEW(0.05, 0.0, 1000);
    
    private final double highTierDiscount;
    private final double standardDiscount;
    private final double highTierThreshold;
    private final double standardThreshold;
    
    CustomerType(double highTierDiscount, double standardDiscount, 
                 double highTierThreshold) {
        this.highTierDiscount = highTierDiscount;
        this.standardDiscount = standardDiscount;
        this.highTierThreshold = highTierThreshold;
        this.standardThreshold = highTierThreshold / 2;
    }
    
    public double calculateDiscount(double amount) {
        if (amount >= highTierThreshold) {
            return amount * highTierDiscount;
        } else if (amount >= standardThreshold) {
            return amount * standardDiscount;
        }
        return 0;
    }
    
    public boolean isEligibleForFreeShipping(double amount) {
        return amount >= standardThreshold;
    }
}

/**
 * 订单处理器
 */
public class OrderProcessor {
    
    /**
     * 计算订单折扣
     * 
     * @param order 订单对象
     * @return 折扣金额
     */
    public double calculateDiscount(Order order) {
        return order.getCustomerType().calculateDiscount(order.getAmount());
    }
    
    /**
     * 判断是否满足免运费条件
     * 
     * @param order 订单对象
     * @return 是否免运费
     */
    public boolean isEligibleForFreeShipping(Order order) {
        return order.getCustomerType().isEligibleForFreeShipping(order.getAmount());
    }
}

/**
 * 订单类
 */
class Order {
    private final CustomerType customerType;
    private final double amount;
    
    public Order(CustomerType customerType, double amount) {
        this.customerType = customerType;
        this.amount = amount;
    }
    
    public CustomerType getCustomerType() {
        return customerType;
    }
    
    public double getAmount() {
        return amount;
    }
}
```

**改进说明：**
- 使用策略模式，将折扣逻辑封装在 `CustomerType` 枚举中
- 消除了重复的条件判断
- 添加新的客户类型只需扩展枚举，无需修改处理器
- 规则集中管理，易于修改和测试

---

#### 问题 2：重复的代码块

**❌ 问题代码（Python）**

```python
import json

def process_user_data(data):
    # 验证输入
    if not data:
        print("Error: No data provided")
        return None
    
    try:
        user = json.loads(data)
    except json.JSONDecodeError:
        print("Error: Invalid JSON format")
        return None
    
    # 处理逻辑
    print(f"Processing user: {user.get('name')}")
    return user

def process_order_data(data):
    # 验证输入（重复代码）
    if not data:
        print("Error: No data provided")
        return None
    
    try:
        order = json.loads(data)
    except json.JSONDecodeError:
        print("Error: Invalid JSON format")
        return None
    
    # 处理逻辑
    print(f"Processing order: {order.get('id')}")
    return order

def process_product_data(data):
    # 验证输入（重复代码）
    if not data:
        print("Error: No data provided")
        return None
    
    try:
        product = json.loads(data)
    except json.JSONDecodeError:
        print("Error: Invalid JSON format")
        return None
    
    # 处理逻辑
    print(f"Processing product: {product.get('name')}")
    return product
```

**问题说明：**
- 输入验证和 JSON 解析代码完全重复
- 违反了 DRY（Don't Repeat Yourself）原则
- 修改验证逻辑需要在多处同步修改

**✅ 改进后代码（Python）**

```python
import json
import logging
from typing import Callable, TypeVar, Optional
from functools import wraps

# 配置日志
logger = logging.getLogger(__name__)

T = TypeVar('T')

class DataValidationError(Exception):
    """数据验证错误"""
    pass

def validate_json(func: Callable[[dict], T]) -> Callable[[str], Optional[T]]:
    """JSON 验证装饰器。
    
    验证输入数据是否为有效的 JSON 格式。
    
    Args:
        func: 处理解析后数据的函数
        
    Returns:
        包装后的函数
    """
    @wraps(func)
    def wrapper(data: str) -> Optional[T]:
        # 统一的输入验证
        if not data or not isinstance(data, str):
            logger.error("No data provided or invalid type")
            return None
        
        try:
            parsed_data = json.loads(data)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format: {e}")
            return None
        
        return func(parsed_data)
    
    return wrapper

@validate_json
def process_user_data(user: dict) -> dict:
    """处理用户数据。
    
    Args:
        user: 解析后的用户数据字典
        
    Returns:
        处理后的用户数据
        
    Raises:
        DataValidationError: 当缺少必要字段时
    """
    if 'name' not in user:
        raise DataValidationError("User name is required")
    
    logger.info(f"Processing user: {user['name']}")
    # 处理逻辑...
    return user

@validate_json
def process_order_data(order: dict) -> dict:
    """处理订单数据。"""
    if 'id' not in order:
        raise DataValidationError("Order ID is required")
    
    logger.info(f"Processing order: {order['id']}")
    # 处理逻辑...
    return order

@validate_json
def process_product_data(product: dict) -> dict:
    """处理产品数据。"""
    if 'name' not in product:
        raise DataValidationError("Product name is required")
    
    logger.info(f"Processing product: {product['name']}")
    # 处理逻辑...
    return product


# 使用示例
if __name__ == "__main__":
    # 有效数据
    user_json = '{"name": "张三", "age": 30}'
    result = process_user_data(user_json)
    print(f"Result: {result}")
    
    # 无效 JSON
    invalid_json = "not valid json"
    result = process_user_data(invalid_json)
    print(f"Result: {result}")
    
    # 空数据
    result = process_user_data("")
    print(f"Result: {result}")
```

**改进说明：**
- 使用装饰器模式提取公共的 JSON 验证逻辑
- 每个处理函数只关注自己的业务逻辑
- 使用日志代替 print，更专业
- 添加类型提示提高代码可读性
- 错误处理更加完善

---

### 2.3 错误处理不完善

#### 问题 1：忽略异常

**❌ 问题代码（JavaScript）**

```javascript
async function fetchUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        // 忽略错误
        console.log(error);
    }
}

function processPayment(orderId, amount) {
    try {
        chargeCreditCard(orderId, amount);
        updateOrderStatus(orderId, 'paid');
        sendConfirmationEmail(orderId);
    } catch (e) {
        // 静默失败
    }
}
```

**问题说明：**
- 使用空的 catch 块吞掉所有异常
- 用户无法知道操作是否成功
- 可能导致数据不一致（如支付扣款成功但订单状态未更新）
- 难以调试问题

**✅ 改进后代码（JavaScript）**

```javascript
/**
 * 自定义错误类
 */
class UserDataFetchError extends Error {
    constructor(userId, originalError) {
        super(`Failed to fetch user data for ID: ${userId}`);
        this.name = 'UserDataFetchError';
        this.userId = userId;
        this.originalError = originalError;
    }
}

class PaymentProcessingError extends Error {
    constructor(orderId, step, originalError) {
        super(`Payment failed for order ${orderId} at step: ${step}`);
        this.name = 'PaymentProcessingError';
        this.orderId = orderId;
        this.step = step;
        this.originalError = originalError;
    }
}

/**
 * 获取用户数据
 * 
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 用户数据
 * @throws {UserDataFetchError} 获取失败时抛出
 */
async function fetchUserData(userId) {
    if (!userId) {
        throw new Error('User ID is required');
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`);
        
        // 检查 HTTP 状态码
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 验证响应数据
        if (!data || !data.id) {
            throw new Error('Invalid response data: missing user ID');
        }
        
        return data;
    } catch (error) {
        // 记录详细错误信息
        console.error('Failed to fetch user data:', {
            userId,
            error: error.message,
            stack: error.stack
        });
        
        // 抛出自定义错误，不丢失原始错误信息
        throw new UserDataFetchError(userId, error);
    }
}

/**
 * 处理支付
 * 
 * @param {string} orderId - 订单ID
 * @param {number} amount - 金额
 * @param {Object} options - 支付选项
 * @returns {Promise<Object>} 支付结果
 * @throws {PaymentProcessingError} 处理失败时抛出
 */
async function processPayment(orderId, amount, options = {}) {
    if (!orderId || amount <= 0) {
        throw new Error('Invalid order ID or amount');
    }
    
    const { idempotencyKey = generateIdempotencyKey() } = options;
    
    try {
        // 步骤1：扣款（幂等操作）
        const chargeResult = await chargeCreditCard(orderId, amount, { 
            idempotencyKey 
        });
        
        // 步骤2：更新订单状态（带重试机制）
        await withRetry(
            () => updateOrderStatus(orderId, 'paid', { 
                transactionId: chargeResult.transactionId 
            }),
            { maxAttempts: 3 }
        );
        
        // 步骤3：发送确认邮件（非关键操作，失败不阻断）
        try {
            await sendConfirmationEmail(orderId);
        } catch (emailError) {
            // 记录但不阻断流程
            console.warn('Failed to send confirmation email:', emailError);
            // 可以加入重试队列
            await queueEmailForRetry(orderId);
        }
        
        return {
            success: true,
            orderId,
            transactionId: chargeResult.transactionId,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        // 根据错误发生的位置分类
        const step = error.step || 'payment_processing';
        
        // 记录错误
        console.error('Payment processing failed:', {
            orderId,
            amount,
            step,
            error: error.message,
            stack: error.stack
        });
        
        // 尝试回滚（如果适用）
        if (step === 'order_status_update') {
            await rollbackCharge(orderId, idempotencyKey).catch(rollbackError => {
                console.error('Rollback failed:', rollbackError);
            });
        }
        
        throw new PaymentProcessingError(orderId, step, error);
    }
}

// 辅助函数
function generateIdempotencyKey() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function withRetry(operation, options = {}) {
    const { maxAttempts = 3, delayMs = 1000 } = options;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxAttempts) {
                error.step = error.step || 'retry_exhausted';
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
    }
}

async function queueEmailForRetry(orderId) {
    // 实现邮件重试队列逻辑
    console.log(`Queued email for retry: ${orderId}`);
}

async function rollbackCharge(orderId, idempotencyKey) {
    // 实现回滚逻辑
    console.log(`Rolling back charge for order: ${orderId}`);
}
```

**改进说明：**
- 定义自定义错误类，提供更详细的错误信息
- 不忽略任何异常，都进行适当的处理或转换
- 区分关键操作和非关键操作
- 实现重试机制提高可靠性
- 添加回滚逻辑处理失败情况
- 详细记录日志便于调试

---

#### 问题 2：资源泄漏

**❌ 问题代码（Java）**

```java
import java.sql.*;

public class UserRepository {
    
    public User findById(Long id) {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DriverManager.getConnection(DB_URL, USER, PASS);
            stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
            stmt.setLong(1, id);
            rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapToUser(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        // 资源未关闭！
        
        return null;
    }
    
    public void updateUser(User user) {
        try {
            Connection conn = dataSource.getConnection();
            PreparedStatement stmt = conn.prepareStatement(
                "UPDATE users SET name = ? WHERE id = ?"
            );
            stmt.setString(1, user.getName());
            stmt.setLong(2, user.getId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        // 资源未关闭！
    }
}
```

**问题说明：**
- 数据库连接、语句和结果集未关闭
- 会导致资源泄漏，最终耗尽连接池
- 没有事务管理

**✅ 改进后代码（Java）**

```java
import java.sql.*;
import java.util.Optional;
import javax.sql.DataSource;

/**
 * 用户数据访问对象
 */
public class UserRepository {
    
    private final DataSource dataSource;
    
    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    /**
     * 根据 ID 查找用户
     * 
     * @param id 用户ID
     * @return 用户对象（可能为空）
     * @throws DataAccessException 数据库访问失败时抛出
     */
    public Optional<User> findById(Long id) {
        String sql = "SELECT id, name, email, created_at FROM users WHERE id = ?";
        
        // 使用 try-with-resources 自动关闭资源
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapToUser(rs));
                }
            }
            
        } catch (SQLException e) {
            throw new DataAccessException("Failed to find user by ID: " + id, e);
        }
        
        return Optional.empty();
    }
    
    /**
     * 更新用户信息
     * 
     * @param user 要更新的用户
     * @throws DataAccessException 数据库访问失败时抛出
     */
    public void updateUser(User user) {
        String sql = "UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, user.getName());
            stmt.setString(2, user.getEmail());
            stmt.setTimestamp(3, Timestamp.from(Instant.now()));
            stmt.setLong(4, user.getId());
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected == 0) {
                throw new NotFoundException("User not found: " + user.getId());
            }
            
        } catch (SQLException e) {
            throw new DataAccessException("Failed to update user: " + user.getId(), e);
        }
    }
    
    /**
     * 批量更新用户
     * 
     * @param users 要更新的用户列表
     * @return 更新的记录数
     * @throws DataAccessException 数据库访问失败时抛出
     */
    public int batchUpdateUsers(List<User> users) {
        String sql = "UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            // 禁用自动提交，手动管理事务
            conn.setAutoCommit(false);
            
            try {
                for (User user : users) {
                    stmt.setString(1, user.getName());
                    stmt.setString(2, user.getEmail());
                    stmt.setTimestamp(3, Timestamp.from(Instant.now()));
                    stmt.setLong(4, user.getId());
                    stmt.addBatch();
                }
                
                int[] results = stmt.executeBatch();
                conn.commit();
                
                return Arrays.stream(results).sum();
                
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
            
        } catch (SQLException e) {
            throw new DataAccessException("Failed to batch update users", e);
        }
    }
    
    private User mapToUser(ResultSet rs) throws SQLException {
        return new User(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getTimestamp("created_at").toInstant()
        );
    }
}

/**
 * 数据访问异常
 */
class DataAccessException extends RuntimeException {
    public DataAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * 资源未找到异常
 */
class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
```

**改进说明：**
- 使用 try-with-resources 确保资源自动关闭
- 使用 `Optional` 表示可能不存在的值
- 自定义异常提供更有意义的错误信息
- 添加事务管理支持批量操作
- 验证更新结果，处理记录不存在的情况

---

### 2.4 性能优化机会

#### 问题 1：低效的循环和查询

**❌ 问题代码（Python）**

```python
import requests

def get_user_orders(user_ids):
    """获取多个用户的订单"""
    all_orders = []
    
    for user_id in user_ids:
        # N+1 查询问题
        user = db.query(f"SELECT * FROM users WHERE id = {user_id}").first()
        
        # 对每个用户分别发起 API 请求
        response = requests.get(f"https://api.example.com/orders?user_id={user_id}")
        orders = response.json()
        
        for order in orders:
            # 对每个订单查询商品详情
            for item in order['items']:
                product = db.query(f"SELECT * FROM products WHERE id = {item['product_id']}").first()
                item['product_name'] = product.name
        
        all_orders.extend(orders)
    
    return all_orders

# 处理大数据列表
def process_large_list(data):
    """处理大数据列表"""
    result = []
    for i in range(len(data)):
        if data[i] not in result:  # O(n²) 复杂度
            result.append(data[i])
    return result
```

**问题说明：**
- N+1 查询问题：每个用户、每个商品都单独查询数据库
- SQL 注入风险：使用字符串拼接 SQL
- 没有批量处理 API 请求
- 使用列表的 `not in` 检查导致 O(n²) 复杂度
- 没有缓存机制

**✅ 改进后代码（Python）**

```python
import asyncio
import aiohttp
from typing import List, Dict, Set
from dataclasses import dataclass
from functools import lru_cache
import hashlib

@dataclass
class User:
    id: int
    name: str
    email: str

@dataclass
class Product:
    id: int
    name: str
    price: float

class OrderService:
    """订单服务类，优化查询性能"""
    
    def __init__(self, db_session, api_base_url: str):
        self.db = db_session
        self.api_base_url = api_base_url
        self._product_cache: Dict[int, Product] = {}
    
    @lru_cache(maxsize=1000)
    def get_user_by_id(self, user_id: int) -> User:
        """获取用户信息（带缓存）"""
        result = self.db.execute(
            "SELECT id, name, email FROM users WHERE id = :user_id",
            {"user_id": user_id}
        ).fetchone()
        
        if result:
            return User(id=result[0], name=result[1], email=result[2])
        return None
    
    def get_users_by_ids(self, user_ids: List[int]) -> Dict[int, User]:
        """批量获取用户信息"""
        if not user_ids:
            return {}
        
        # 使用参数化查询防止 SQL 注入
        placeholders = ', '.join([':id_' + str(i) for i in range(len(user_ids))])
        params = {f'id_{i}': uid for i, uid in enumerate(user_ids)}
        
        query = f"SELECT id, name, email FROM users WHERE id IN ({placeholders})"
        results = self.db.execute(query, params).fetchall()
        
        return {row[0]: User(id=row[0], name=row[1], email=row[2]) 
                for row in results}
    
    def get_products_by_ids(self, product_ids: Set[int]) -> Dict[int, Product]:
        """批量获取商品信息"""
        # 检查缓存
        cached = {pid: self._product_cache[pid] 
                  for pid in product_ids 
                  if pid in self._product_cache}
        
        missing_ids = product_ids - set(cached.keys())
        
        if missing_ids:
            placeholders = ', '.join([':id_' + str(i) for i in range(len(missing_ids))])
            params = {f'id_{i}': pid for i, pid in enumerate(missing_ids)}
            
            query = f"SELECT id, name, price FROM products WHERE id IN ({placeholders})"
            results = self.db.execute(query, params).fetchall()
            
            for row in results:
                product = Product(id=row[0], name=row[1], price=row[2])
                self._product_cache[row[0]] = product
                cached[row[0]] = product
        
        return cached
    
    async def fetch_orders_batch(self, user_ids: List[int], 
                                  session: aiohttp.ClientSession) -> Dict[int, List[dict]]:
        """批量异步获取订单"""
        
        async def fetch_single(user_id: int) -> tuple:
            url = f"{self.api_base_url}/orders"
            params = {'user_id': user_id, 'limit': 100}
            
            try:
                async with session.get(url, params=params, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        return user_id, data.get('orders', [])
                    return user_id, []
            except asyncio.TimeoutError:
                logger.error(f"Timeout fetching orders for user {user_id}")
                return user_id, []
            except Exception as e:
                logger.error(f"Error fetching orders for user {user_id}: {e}")
                return user_id, []
        
        # 并发获取所有用户的订单
        tasks = [fetch_single(uid) for uid in user_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {uid: orders for uid, orders in results if not isinstance(orders, Exception)}
    
    async def get_user_orders_optimized(self, user_ids: List[int]) -> List[dict]:
        """优化的获取用户订单方法"""
        if not user_ids:
            return []
        
        # 1. 批量获取用户信息
        users = self.get_users_by_ids(user_ids)
        
        # 2. 并发获取所有订单
        async with aiohttp.ClientSession() as session:
            orders_by_user = await self.fetch_orders_batch(user_ids, session)
        
        # 3. 收集所有需要查询的商品ID
        all_product_ids: Set[int] = set()
        for orders in orders_by_user.values():
            for order in orders:
                all_product_ids.update(item['product_id'] for item in order.get('items', []))
        
        # 4. 批量获取商品信息
        products = self.get_products_by_ids(all_product_ids)
        
        # 5. 组装结果
        all_orders = []
        for user_id, orders in orders_by_user.items():
            user = users.get(user_id)
            for order in orders:
                order['user_name'] = user.name if user else 'Unknown'
                
                for item in order.get('items', []):
                    product = products.get(item['product_id'])
                    item['product_name'] = product.name if product else 'Unknown'
                    item['product_price'] = product.price if product else 0
                
                all_orders.append(order)
        
        return all_orders


def process_large_list_optimized(data: List) -> List:
    """使用集合去重，O(n) 复杂度"""
    seen = set()
    result = []
    
    for item in data:
        # 对于不可哈希类型，使用哈希值
        if isinstance(item, dict):
            # 将字典转换为可哈希的元组
            key = tuple(sorted(item.items()))
        else:
            key = item
        
        if key not in seen:
            seen.add(key)
            result.append(item)
    
    return result


def process_large_list_generator(data: List, chunk_size: int = 1000):
    """使用生成器处理大数据，节省内存"""
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]
        yield from (item for item in chunk if item.get('active', False))


# 使用示例
async def main():
    service = OrderService(db_session=db, api_base_url="https://api.example.com")
    
    user_ids = list(range(1, 101))  # 100个用户
    orders = await service.get_user_orders_optimized(user_ids)
    
    print(f"Total orders: {len(orders)}")

if __name__ == "__main__":
    asyncio.run(main())
```

**改进说明：**
- 批量查询替代 N+1 查询，减少数据库往返次数
- 使用参数化查询防止 SQL 注入
- 实现本地缓存和 LRU 缓存减少重复查询
- 使用异步并发处理 API 请求
- 使用集合实现 O(n) 去重
- 使用生成器处理大数据，减少内存占用

---

#### 问题 2：内存使用优化

**❌ 问题代码（JavaScript）**

```javascript
// 读取大文件时一次性加载到内存
const fs = require('fs');

function processLargeFile(filePath) {
    // 将整个文件读入内存
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const results = [];
    for (const line of lines) {
        const data = JSON.parse(line);
        const processed = heavyComputation(data);
        results.push(processed);
    }
    
    // 再次遍历
    const summary = results.reduce((acc, item) => {
        acc.total += item.value;
        return acc;
    }, { total: 0 });
    
    return { results, summary };
}

// 无限增长的缓存
const cache = {};

function getData(key) {
    if (!cache[key]) {
        cache[key] = fetchFromDatabase(key); // 缓存永不清理
    }
    return cache[key];
}
```

**问题说明：**
- 大文件一次性读入内存，可能导致内存溢出
- 缓存无限制增长，导致内存泄漏
- 多次遍历数据，效率低下

**✅ 改进后代码（JavaScript）**

```javascript
const fs = require('fs');
const readline = require('readline');
const { Transform } = require('stream');
const LRU = require('lru-cache');

/**
 * 流式处理大文件
 * 
 * @param {string} filePath - 文件路径
 * @param {Function} processor - 行处理器
 * @returns {Promise<Object>} 处理结果
 */
async function processLargeFileStream(filePath, processor) {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    let processedCount = 0;
    let errorCount = 0;
    let totalValue = 0;
    
    // 使用流式处理，逐行读取
    for await (const line of rl) {
        if (!line.trim()) continue;
        
        try {
            const data = JSON.parse(line);
            const processed = await processor(data);
            
            // 即时聚合，不存储所有结果
            totalValue += processed.value;
            processedCount++;
            
            // 每1000条输出进度
            if (processedCount % 1000 === 0) {
                console.log(`Processed: ${processedCount} records`);
            }
            
        } catch (error) {
            errorCount++;
            console.error(`Error processing line: ${error.message}`);
            
            // 记录错误但继续处理
            if (errorCount > 100) {
                throw new Error('Too many errors, aborting');
            }
        }
    }
    
    return {
        processedCount,
        errorCount,
        summary: { total: totalValue, average: totalValue / processedCount }
    };
}

/**
 * 使用 Transform 流进行管道处理
 */
function createProcessingStream(processor) {
    let count = 0;
    let total = 0;
    
    return new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            try {
                const data = JSON.parse(chunk);
                const processed = processor(data);
                
                count++;
                total += processed.value;
                
                // 只传递必要的数据
                callback(null, {
                    id: processed.id,
                    value: processed.value,
                    _meta: { count, total }
                });
            } catch (error) {
                callback(error);
            }
        },
        flush(callback) {
            console.log(`Stream complete. Processed: ${count}, Total: ${total}`);
            callback();
        }
    });
}

// 使用管道处理大文件
function processWithPipeline(inputPath, outputPath, processor) {
    return new Promise((resolve, reject) => {
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        const transform = createProcessingStream(processor);
        
        input
            .pipe(transform)
            .pipe(output)
            .on('finish', resolve)
            .on('error', reject);
    });
}

// ============================================
// 优化的缓存实现
// ============================================

class DataCache {
    constructor(options = {}) {
        this.cache = new LRU({
            max: options.maxSize || 1000,          // 最大条目数
            maxAge: options.maxAge || 1000 * 60 * 5, // 默认5分钟过期
            updateAgeOnGet: true,
            dispose: (key, value) => {
                // 清理时执行的操作
                if (value && typeof value.cleanup === 'function') {
                    value.cleanup();
                }
            }
        });
        
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
    }
    
    async get(key, fetcher) {
        const cached = this.cache.get(key);
        
        if (cached !== undefined) {
            this.stats.hits++;
            return cached;
        }
        
        this.stats.misses++;
        const value = await fetcher(key);
        
        if (value !== undefined && value !== null) {
            this.cache.set(key, value);
        }
        
        return value;
    }
    
    set(key, value, ttl) {
        if (ttl) {
            // 设置特定 TTL
            this.cache.set(key, value, { ttl });
        } else {
            this.cache.set(key, value);
        }
    }
    
    invalidate(key) {
        this.cache.del(key);
    }
    
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.del(key);
            }
        }
    }
    
    clear() {
        this.cache.reset();
    }
    
    getStats() {
        return {
            ...this.stats,
            size: this.cache.itemCount,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
        };
    }
}

// 使用示例
const dataCache = new DataCache({
    maxSize: 5000,
    maxAge: 1000 * 60 * 10  // 10分钟
});

async function getDataOptimized(key) {
    return dataCache.get(key, async (k) => {
        console.log(`Cache miss for key: ${k}`);
        return await fetchFromDatabase(k);
    });
}

// ============================================
// 分块处理大数据集
// ============================================

async function* chunkProcessor(array, chunkSize = 100) {
    for (let i = 0; i < array.length; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
}

async function processLargeArray(items, processor, options = {}) {
    const { chunkSize = 100, concurrency = 5 } = options;
    const results = [];
    
    // 使用异步迭代器分块处理
    for await (const chunk of chunkGenerator(items, chunkSize)) {
        // 控制并发数
        const chunkResults = await Promise.all(
            chunk.map(item => limitConcurrency(processor, item, concurrency))
        );
        
        // 即时处理结果，不累积
        for (const result of chunkResults) {
            if (result) {
                results.push(result);
            }
        }
        
        // 主动触发垃圾回收建议（如果可用）
        if (global.gc) {
            global.gc();
        }
    }
    
    return results;
}

// 辅助函数
async function* chunkGenerator(array, chunkSize) {
    for (let i = 0; i < array.length; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
}

// 简单的并发限制器
class ConcurrencyLimiter {
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        this.running = 0;
        this.queue = [];
    }
    
    async run(fn, ...args) {
        if (this.running >= this.maxConcurrency) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        
        this.running++;
        try {
            return await fn(...args);
        } finally {
            this.running--;
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                next();
            }
        }
    }
}

module.exports = {
    processLargeFileStream,
    processWithPipeline,
    DataCache,
    processLargeArray,
    ConcurrencyLimiter
};
```

**改进说明：**
- 使用流式处理大文件，避免一次性加载到内存
- 即时聚合数据，不存储中间结果
- 使用 LRU 缓存替代无限增长的缓存
- 实现缓存统计和过期策略
- 分块处理大数据集，控制内存使用
- 实现并发限制器防止资源耗尽

---

### 2.5 安全风险

#### 问题 1：SQL 注入

**❌ 问题代码（Python）**

```python
from flask import Flask, request
import sqlite3

app = Flask(__name__)

@app.route('/search')
def search_users():
    name = request.args.get('name', '')
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # SQL 注入漏洞！
    query = f"SELECT * FROM users WHERE name = '{name}'"
    cursor.execute(query)
    
    results = cursor.fetchall()
    return {'users': results}

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # SQL 注入漏洞！
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    
    user = cursor.fetchone()
    if user:
        return {'success': True, 'user': user}
    return {'success': False}, 401
```

**问题说明：**
- 直接使用字符串拼接 SQL 查询
- 用户输入未经验证直接嵌入 SQL
- 攻击者可以注入恶意 SQL 代码

**✅ 改进后代码（Python）**

```python
from flask import Flask, request, abort
from werkzeug.security import check_password_hash
import sqlite3
import re
import logging
from functools import wraps

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ============================================
# 输入验证和清理
# ============================================

class InputValidator:
    """输入验证器"""
    
    # 允许的字符模式
    USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,32}$')
    NAME_PATTERN = re.compile(r'^[\w\s\-\.]{1,100}$')
    
    @staticmethod
    def validate_username(username):
        if not username or not isinstance(username, str):
            return False, "Username is required"
        if not InputValidator.USERNAME_PATTERN.match(username):
            return False, "Invalid username format"
        return True, None
    
    @staticmethod
    def validate_name(name):
        if not name or not isinstance(name, str):
            return False, "Name is required"
        if len(name) > 100:
            return False, "Name too long"
        if not InputValidator.NAME_PATTERN.match(name):
            return False, "Invalid name format"
        return True, None
    
    @staticmethod
    def sanitize_like_pattern(pattern):
        """转义 LIKE 模式中的特殊字符"""
        # 转义 % _ [ ] 等特殊字符
        return pattern.replace('%', '\\%').replace('_', '\\_')


# ============================================
# 安全的数据库访问层
# ============================================

class UserRepository:
    """用户数据仓库（安全实现）"""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    def _get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def search_by_name(self, name, limit=100):
        """安全地搜索用户（使用参数化查询）"""
        # 验证输入
        is_valid, error = InputValidator.validate_name(name)
        if not is_valid:
            logger.warning(f"Invalid search input: {error}")
            return []
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # 使用参数化查询防止 SQL 注入
            # LIKE 查询也需要转义特殊字符
            safe_pattern = f"%{InputValidator.sanitize_like_pattern(name)}%"
            
            query = """
                SELECT id, username, name, email, created_at 
                FROM users 
                WHERE name LIKE ? ESCAPE '\\'
                LIMIT ?
            """
            
            cursor.execute(query, (safe_pattern, limit))
            return [dict(row) for row in cursor.fetchall()]
    
    def find_by_username(self, username):
        """根据用户名查找用户"""
        is_valid, error = InputValidator.validate_username(username)
        if not is_valid:
            return None
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # 只查询需要的字段，不包括密码
            query = """
                SELECT id, username, name, email, created_at 
                FROM users 
                WHERE username = ?
            """
            
            cursor.execute(query, (username,))
            row = cursor.fetchone()
            
            return dict(row) if row else None
    
    def verify_credentials(self, username, password):
        """验证用户凭据"""
        is_valid, error = InputValidator.validate_username(username)
        if not is_valid:
            return None
        
        if not password or not isinstance(password, str):
            return None
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # 查询密码哈希
            query = "SELECT id, username, password_hash FROM users WHERE username = ?"
            cursor.execute(query, (username,))
            row = cursor.fetchone()
            
            if not row:
                # 使用恒定时间比较防止时序攻击
                check_password_hash(
                    'pbkdf2:sha256:150000$dummy$dummy',
                    password
                )
                return None
            
            # 验证密码
            if check_password_hash(row['password_hash'], password):
                return {
                    'id': row['id'],
                    'username': row['username']
                }
            
            return None


# ============================================
# 速率限制
# ============================================

from time import time
from collections import defaultdict

class RateLimiter:
    """简单的内存速率限制器"""
    
    def __init__(self, max_requests=5, window_seconds=60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
    
    def is_allowed(self, key):
        now = time()
        window_start = now - self.window_seconds
        
        # 清理旧请求
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if req_time > window_start
        ]
        
        if len(self.requests[key]) >= self.max_requests:
            return False
        
        self.requests[key].append(now)
        return True

login_rate_limiter = RateLimiter(max_requests=5, window_seconds=300)

# ============================================
# 路由处理
# ============================================

user_repo = UserRepository('users.db')

@app.route('/search')
def search_users():
    """搜索用户（安全实现）"""
    name = request.args.get('name', '')
    limit = min(request.args.get('limit', 20, type=int), 100)
    
    try:
        results = user_repo.search_by_name(name, limit)
        return {
            'success': True,
            'count': len(results),
            'users': results
        }
    except Exception as e:
        logger.error(f"Search error: {e}")
        return {'success': False, 'error': 'Search failed'}, 500


@app.route('/login', methods=['POST'])
def login():
    """用户登录（安全实现）"""
    # 获取客户端 IP
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    
    # 速率限制检查
    if not login_rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return {
            'success': False,
            'error': 'Too many login attempts. Please try again later.'
        }, 429
    
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '')
    
    # 输入验证
    is_valid, error = InputValidator.validate_username(username)
    if not is_valid:
        logger.warning(f"Invalid login attempt: {error}")
        return {'success': False, 'error': 'Invalid credentials'}, 401
    
    try:
        user = user_repo.verify_credentials(username, password)
        
        if user:
            logger.info(f"Successful login: {username}")
            return {
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username']
                }
            }
        else:
            logger.warning(f"Failed login attempt for user: {username}")
            return {'success': False, 'error': 'Invalid credentials'}, 401
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return {'success': False, 'error': 'Login failed'}, 500


@app.errorhandler(404)
def not_found(error):
    return {'success': False, 'error': 'Not found'}, 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return {'success': False, 'error': 'Internal server error'}, 500


if __name__ == '__main__':
    # 生产环境应禁用 debug 模式
    app.run(debug=False, host='0.0.0.0', port=5000)
```

**改进说明：**
- 使用参数化查询（PreparedStatement）防止 SQL 注入
- 输入验证和清理，限制允许的字符
- LIKE 查询中正确转义特殊字符
- 密码使用哈希存储，使用恒定时间比较
- 实现速率限制防止暴力破解
- 详细的日志记录便于审计
- 错误处理不暴露敏感信息

---

#### 问题 2：XSS 和其他 Web 安全漏洞

**❌ 问题代码（JavaScript/Node.js）**

```javascript
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

// XSS 漏洞：直接输出用户输入
app.get('/search', (req, res) => {
    const query = req.query.q || '';
    res.send(`
        <html>
            <body>
                <h1>Search Results for: ${query}</h1>
                <div id="results"></div>
            </body>
        </html>
    `);
});

// 不安全的 Cookie 设置
app.get('/login', (req, res) => {
    res.cookie('session', 'abc123');  // 未设置 httpOnly, secure
    res.cookie('user', req.query.username);  // 存储用户输入
    res.send('Logged in');
});

// CSRF 漏洞：没有 CSRF 保护
app.post('/transfer', (req, res) => {
    const { to, amount } = req.body;
    // 直接执行转账，不验证来源
    transferMoney(req.user.id, to, amount);
    res.send('Transfer completed');
});

// 不安全的反序列化
app.post('/import', (req, res) => {
    const data = JSON.parse(req.body.data);
    // 如果 data 包含恶意构造的对象...
    res.send('Import completed');
});

// 路径遍历漏洞
app.get('/download', (req, res) => {
    const filePath = './uploads/' + req.query.filename;
    res.sendFile(filePath);  // 可以访问 ../../etc/passwd
});
```

**问题说明：**
- XSS：直接输出用户输入到 HTML
- 不安全的 Cookie：未设置 httpOnly 和 secure 标志
- CSRF：没有验证请求来源
- 路径遍历：未验证文件路径
- 敏感操作缺少身份验证

**✅ 改进后代码（JavaScript/Node.js）**

```javascript
const express = require('express');
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const DOMPurify = require('isomorphic-dompurify');
const path = require('path');
const crypto = require('crypto');

const app = express();

// ============================================
// 安全中间件配置
// ============================================

// Helmet：设置安全相关的 HTTP 头
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],  // 生产环境应移除 unsafe-inline
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 每个 IP 限制 100 次请求
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// 严格传输安全
app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
    }
    res.redirect(`https://${req.headers.host}${req.url}`);
});

// Cookie 解析
app.use(cookieParser());

// Session 配置（安全）
app.use(session({
    name: '__Host-sessionId',  // __Host- 前缀要求 Secure 和 Path=/
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,      // 仅 HTTPS
        httpOnly: true,    // 防止 JavaScript 访问
        sameSite: 'strict', // CSRF 保护
        maxAge: 24 * 60 * 60 * 1000 // 24 小时
    }
}));

// CSRF 保护
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: true } });

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// 安全工具函数
// ============================================

const SecurityUtils = {
    /**
     * HTML 转义
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = { toString: () => '' };
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    /**
     * 净化 HTML（允许白名单标签）
     */
    sanitizeHtml(dirty) {
        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
            ALLOWED_ATTR: []
        });
    },
    
    /**
     * 验证文件路径（防止路径遍历）
     */
    sanitizeFilePath(filename) {
        // 移除路径分隔符和空字节
        const sanitized = filename
            .replace(/\0/g, '')
            .replace(/[\/\\]/g, '_')
            .replace(/\.\./g, '_');
        
        // 只允许字母数字、点、下划线和连字符
        if (!/^[\w\-.]+$/.test(sanitized)) {
            throw new Error('Invalid filename');
        }
        
        return sanitized;
    },
    
    /**
     * 生成安全随机令牌
     */
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    },
    
    /**
     * 安全比较字符串（防止时序攻击）
     */
    timingSafeEqual(a, b) {
        try {
            return crypto.timingSafeEqual(
                Buffer.from(a, 'utf8'),
                Buffer.from(b, 'utf8')
            );
        } catch {
            return false;
        }
    }
};

// ============================================
// 认证中间件
// ============================================

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// ============================================
// 安全路由
// ============================================

// 搜索（XSS 防护）
app.get('/search', (req, res) => {
    const query = req.query.q || '';
    
    // 限制查询长度
    if (query.length > 200) {
        return res.status(400).json({ error: 'Query too long' });
    }
    
    // 净化查询并转义输出
    const safeQuery = SecurityUtils.escapeHtml(query);
    const sanitizedQuery = SecurityUtils.sanitizeHtml(query);
    
    // 搜索结果也应转义
    const results = searchDatabase(sanitizedQuery).map(item => ({
        id: item.id,
        title: SecurityUtils.escapeHtml(item.title),
        description: SecurityUtils.escapeHtml(item.description)
    }));
    
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Search</title>
            </head>
            <body>
                <h1>Search Results for: ${safeQuery}</h1>
                <div id="results">
                    ${results.map(r => `
                        <div class="result">
                            <h3>${r.title}</h3>
                            <p>${r.description}</p>
                        </div>
                    `).join('')}
                </div>
            </body>
        </html>
    `);
});

// 登录（安全 Cookie）
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // 验证凭据
    const user = await authenticateUser(username, password);
    
    if (!user) {
        // 延迟响应防止暴力破解
        await new Promise(r => setTimeout(r, 1000));
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 设置 session（安全）
    req.session.userId = user.id;
    req.session.csrfToken = SecurityUtils.generateToken();
    
    // 设置额外的安全 cookie
    res.cookie('preferences', JSON.stringify({ theme: user.theme }), {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 天
    });
    
    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username
        },
        csrfToken: req.session.csrfToken
    });
});

// 登出
app.post('/logout', requireAuth, (req, res) => {
    req.session.destroy();
    res.clearCookie('__Host-sessionId');
    res.clearCookie('preferences');
    res.json({ success: true });
});

// 转账（CSRF 保护 + 认证）
app.post('/transfer', 
    requireAuth,
    csrfProtection,
    async (req, res) => {
        const { to, amount, note } = req.body;
        
        // 验证输入
        if (!to || !amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }
        
        if (amount > 100000) {
            return res.status(400).json({ error: 'Amount exceeds limit' });
        }
        
        try {
            // 执行转账
            const result = await transferMoney({
                from: req.session.userId,
                to: SecurityUtils.escapeHtml(to),
                amount: parseFloat(amount),
                note: SecurityUtils.sanitizeHtml(note || ''),
                timestamp: new Date()
            });
            
            res.json({ success: true, transactionId: result.id });
        } catch (error) {
            console.error('Transfer error:', error);
            res.status(500).json({ error: 'Transfer failed' });
        }
    }
);

// 安全的文件下载
app.get('/download', requireAuth, (req, res) => {
    try {
        const filename = SecurityUtils.sanitizeFilePath(req.query.filename);
        const filePath = path.join(__dirname, 'uploads', filename);
        
        // 验证路径仍在允许的目录内
        const resolvedPath = path.resolve(filePath);
        const uploadsDir = path.resolve(__dirname, 'uploads');
        
        if (!resolvedPath.startsWith(uploadsDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.sendFile(resolvedPath, (err) => {
            if (err) {
                res.status(404).json({ error: 'File not found' });
            }
        });
    } catch (error) {
        res.status(400).json({ error: 'Invalid filename' });
    }
});

// 安全的 JSON 导入
app.post('/import', 
    requireAuth,
    (req, res) => {
        try {
            // 使用安全解析限制深度和大小
            const data = JSON.parse(req.body.data);
            
            // 验证数据结构（白名单）
            if (!validateImportSchema(data)) {
                return res.status(400).json({ error: 'Invalid data format' });
            }
            
            // 处理导入
            const result = processImport(data);
            res.json({ success: true, imported: result.count });
            
        } catch (error) {
            if (error instanceof SyntaxError) {
                return res.status(400).json({ error: 'Invalid JSON' });
            }
            console.error('Import error:', error);
            res.status(500).json({ error: 'Import failed' });
        }
    }
);

// ============================================
// 辅助函数
// ============================================

function searchDatabase(query) {
    // 模拟数据库搜索
    return [];
}

async function authenticateUser(username, password) {
    // 模拟认证
    return null;
}

async function transferMoney(params) {
    // 模拟转账
    return { id: 'tx_' + Date.now() };
}

function validateImportSchema(data) {
    // 验证导入数据的结构
    if (!Array.isArray(data)) return false;
    return data.every(item => 
        item && 
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string'
    );
}

function processImport(data) {
    return { count: data.length };
}

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // CSRF 错误
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

**改进说明：**
- 使用 Helmet 设置安全 HTTP 头（CSP、HSTS 等）
- 实施速率限制防止暴力攻击
- 使用 HttpOnly、Secure 和 SameSite Cookie
- HTML 转义和净化防止 XSS
- CSRF 令牌保护表单提交
- 路径验证防止目录遍历
- 安全比较防止时序攻击
- 输入验证和白名单

---

## 3. 代码审查清单

### 3.1 通用审查清单

#### 功能性
- [ ] 代码实现了预期的功能
- [ ] 边界条件已正确处理
- [ ] 错误场景已考虑并处理
- [ ] 输入数据已验证

#### 可读性
- [ ] 命名清晰且具有描述性
- [ ] 函数/方法长度适中（< 50 行）
- [ ] 类的职责单一且明确
- [ ] 复杂的逻辑有注释说明
- [ ] 代码格式一致

#### 可维护性
- [ ] 没有重复代码（DRY 原则）
- [ ] 硬编码值已提取为常量
- [ ] 魔法数字已命名
- [ ] 依赖关系清晰
- [ ] 代码组织合理

#### 性能
- [ ] 没有明显的性能瓶颈
- [ ] 数据库查询已优化
- [ ] 大文件使用流式处理
- [ ] 缓存使用得当
- [ ] 不必要的循环已消除

#### 安全性
- [ ] 用户输入已验证和清理
- [ ] SQL 使用参数化查询
- [ ] XSS 漏洞已防护
- [ ] CSRF 保护已实施
- [ ] 敏感数据已加密
- [ ] 身份验证和授权已检查

#### 错误处理
- [ ] 异常被捕获和处理
- [ ] 错误消息不泄露敏感信息
- [ ] 资源正确释放（文件、连接等）
- [ ] 日志记录适当

#### 测试
- [ ] 单元测试覆盖核心逻辑
- [ ] 边界情况有测试
- [ ] 错误路径有测试
- [ ] 测试易于理解和维护

---

### 3.2 Python 专项清单

- [ ] 遵循 PEP 8 风格指南
- [ ] 类型提示已添加
- [ ] 使用 `with` 语句管理资源
- [ ] 字符串格式化使用 f-string 或 `format()`
- [ ] 列表推导式使用得当
- [ ] 避免使用 `*` 导入
- [ ] 文档字符串完整（遵循 Google/NumPy 风格）
- [ ] 虚拟环境依赖已冻结

---

### 3.3 JavaScript/TypeScript 专项清单

- [ ] 使用 `===` 而非 `==`
- [ ] 异步代码正确处理
- [ ] Promise 错误已捕获
- [ ] `var` 已替换为 `const`/`let`
- [ ] 避免使用 `eval()`
- [ ] DOM 操作已考虑 XSS
- [ ] npm 依赖已锁定版本
- [ ] TypeScript 类型定义完整

---

### 3.4 Java 专项清单

- [ ] 遵循 Java 命名规范
- [ ] 使用适当的集合类型
- [ ] Stream API 使用得当
- [ ] Optional 用于可能为空的情况
- [ ] 字符串拼接使用 StringBuilder
- [ ] 避免使用原始 SQL
- [ ] 异常类型具体而非通用
- [ ] 资源使用 try-with-resources

---

### 3.5 审查流程清单

#### 审查前
- [ ] 理解需求和设计文档
- [ ] 代码在本地运行通过
- [ ] 所有自动化测试通过
- [ ] 静态代码分析无严重问题

#### 审查中
- [ ] 理解代码的意图
- [ ] 检查逻辑正确性
- [ ] 评估设计选择
- [ ] 确认测试覆盖

#### 审查后
- [ ] 所有评论已回复
- [ ] 必要的修改已完成
- [ ] 重新验证修改部分
- [ ] 批准或拒绝变更

---

## 附录：审查评论模板

### 评论级别

**🔴 严重（Blocker）**
```
[严重] 问题描述

影响：具体影响说明
建议：如何修复
参考：相关文档或示例链接
```

**🟠 重要（Major）**
```
[重要] 问题描述

建议改进方案，可以稍后处理
```

**🟡 建议（Minor）**
```
[建议] 改进建议

可选的优化方案
```

**🟢 肯定（Positive）**
```
[肯定] 描述做得好的地方

正面的反馈
```

---

## 总结

代码审查是保障软件质量的重要环节。通过系统化的审查流程和标准化的检查清单，团队可以：

1. **提高代码质量**：发现潜在问题，统一代码风格
2. **促进知识共享**：团队成员互相学习最佳实践
3. **降低维护成本**：及早发现问题，减少技术债务
4. **培养团队文化**：建立对代码质量的共同责任感

记住，代码审查的目标是**改进代码**，而非批评作者。保持建设性的态度，提供具体的改进建议，才能最大化审查的价值。

---

*本文档版本: 1.0*
*最后更新: 2024年*
