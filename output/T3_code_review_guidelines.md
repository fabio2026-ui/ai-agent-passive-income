# 代码审查规范手册 (Code Review Guidelines)

> **版本**: v1.0  
> **适用范围**: 团队所有代码提交  
> **更新日期**: 2026-04-01

---

## 📋 目录

1. [通用审查流程](#通用审查流程)
2. [Python代码审查Checklist](#python代码审查checklist)
3. [JavaScript/TypeScript代码审查Checklist](#javascripttypescript代码审查checklist)
4. [示例代码对比](#示例代码对比)
5. [附录：审查工具推荐](#附录审查工具推荐)

---

## 通用审查流程

### 1. 审查前准备

- [ ] 理解需求背景和变更目的
- [ ] 阅读相关Issue/PR描述
- [ ] 确认测试用例已执行通过

### 2. 审查维度 (5W1H)

| 维度 | 检查内容 | 关键问题 |
|------|----------|----------|
| **What** | 代码做了什么 | 是否实现了预期功能？有无多余代码？ |
| **Why** | 为什么这样做 | 设计决策是否合理？有无更优方案？ |
| **How** | 如何实现 | 实现方式是否优雅？是否过于复杂？ |
| **When** | 时机/性能 | 是否存在性能瓶颈？异步处理是否合理？ |
| **Where** | 代码位置 | 是否放在合适的模块？耦合度如何？ |
| **Who** | 可维护性 | 其他开发者能否理解？文档是否充分？ |

### 3. 审查优先级

```
🔴 Blocker (必须修复)
   - 安全风险 (SQL注入、XSS、敏感信息泄露)
   - 功能缺陷 (导致系统错误)
   - 性能严重问题 (死锁、无限循环)

🟠 Critical (强烈建议修复)
   - 逻辑错误
   - 缺少关键测试
   - 违反架构设计原则

🟡 Major (建议修复)
   - 代码重复
   - 命名不规范
   - 缺少文档注释

🟢 Minor (可选修复)
   - 格式问题
   - 拼写错误
   - 代码风格不一致

💡 Suggestion (参考建议)
   - 优化建议
   - 替代方案
```

### 4. 审查反馈模板

```markdown
## 审查反馈

### 总体评价
- 功能完整度: ⭐⭐⭐⭐☆
- 代码质量: ⭐⭐⭐⭐☆
- 可维护性: ⭐⭐⭐⭐☆

### 发现的问题

#### 🔴 Blocker (1个)
1. [文件路径:行号] 具体问题描述
   - 建议: 如何修复
   - 原因: 为什么需要修复

#### 🟠 Critical (0个)

#### 🟡 Major (2个)
1. ...

### 肯定的地方
- ✅ 测试覆盖率高
- ✅ 错误处理完善

### 行动项
- [ ] 修复Blocker问题
- [ ] 考虑Major建议
- [ ] 更新CHANGELOG

### 审查者
@reviewer_name | 2026-04-01
```

### 5. 审查 checklist (可复制使用)

```markdown
## 通用审查 Checklist

### 功能性
- [ ] 代码实现了需求描述的所有功能
- [ ] 边界条件被正确处理
- [ ] 错误输入被妥善处理
- [ ] 没有引入回归问题

### 可读性
- [ ] 命名清晰、有意义
- [ ] 函数/方法长度适中 (<50行)
- [ ] 嵌套层级合理 (<4层)
- [ ] 代码注释充分且准确

### 可维护性
- [ ] 遵循单一职责原则
- [ ] 依赖关系清晰
- [ ] 避免重复代码 (DRY原则)
- [ ] 易于扩展和修改

### 性能
- [ ] 没有明显的性能瓶颈
- [ ] 资源使用合理 (内存、连接数)
- [ ] 批量操作替代循环单条处理
- [ ] 缓存策略合理

### 安全性
- [ ] 输入数据经过验证/转义
- [ ] 没有SQL注入风险
- [ ] 没有XSS漏洞
- [ ] 敏感信息未被硬编码
- [ ] 权限检查完整

### 测试
- [ ] 单元测试覆盖核心逻辑
- [ ] 边界测试用例充分
- [ ] 测试用例独立、可重复
- [ ] 集成测试覆盖主要流程
```

---

## Python代码审查Checklist

### 1. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块名 | 小写+下划线 | `user_service.py` |
| 类名 | 大驼峰 | `UserAuthentication` |
| 函数/变量 | 小写+下划线 | `get_user_by_id()` |
| 常量 | 全大写 | `MAX_RETRY_COUNT = 3` |
| 私有成员 | 单下划线前缀 | `_internal_helper()` |
| 魔术方法 | 双下划线 | `__init__`, `__str__` |

**检查点:**
- [ ] 命名清晰表达意图，避免 `data`, `temp`, `i`, `j` 等无意义命名
- [ ] 布尔变量使用肯定语气 (`is_valid` 而非 `is_not_valid`)
- [ ] 避免使用 Python 内置名称作为变量 (`list`, `dict`, `str`)

### 2. 代码结构

```markdown
- [ ] 导入顺序: 标准库 → 第三方库 → 本地模块
- [ ] 每个导入独立一行
- [ ] 使用 `isort` 工具自动排序
- [ ] 类方法顺序: __init__ → 公共方法 → 私有方法 → 魔术方法
- [ ] 函数定义间隔两个空行
- [ ] 类定义间隔两个空行
- [ ] 方法定义间隔一个空行
```

### 3. 性能优化

```markdown
- [ ] 避免在循环中使用 `+` 拼接字符串，使用 `join()`
- [ ] 列表推导式替代简单循环
- [ ] 生成器表达式处理大数据集
- [ ] 使用 `with` 语句管理资源
- [ ] 惰性加载 (property decorator)
- [ ] 避免重复计算 (缓存/memoization)
```

**示例:**
```python
# ❌ 差 - 字符串拼接
result = ""
for item in items:
    result += str(item) + ", "

# ✅ 好 - 使用 join
result = ", ".join(str(item) for item in items)

# ❌ 差 - 列表占用大量内存
all_users = [get_user(i) for i in range(1000000)]

# ✅ 好 - 生成器节省内存
all_users = (get_user(i) for i in range(1000000))
```

### 4. 安全性

```markdown
- [ ] SQL参数使用参数化查询，禁止字符串拼接
- [ ] 用户输入数据经过验证/转义
- [ ] 敏感配置从环境变量读取
- [ ] 文件路径验证，防止目录遍历
- [ ] 反序列化操作使用安全方法
- [ ] 密码等敏感信息使用哈希存储
```

**示例:**
```python
# ❌ 危险 - SQL注入风险
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# ✅ 安全 - 参数化查询
cursor.execute("SELECT * FROM users WHERE name = %s", (user_input,))

# ❌ 危险 - 硬编码密钥
API_KEY = "sk-1234567890abcdef"

# ✅ 安全 - 环境变量
import os
API_KEY = os.getenv("API_KEY")
```

### 5. 错误处理

```markdown
- [ ] 捕获具体异常，避免裸 `except:`
- [ ] 异常信息清晰、可操作
- [ ] 资源释放放在 `finally` 或使用上下文管理器
- [ ] 不吞掉异常，至少记录日志
- [ ] 自定义异常继承合适的基类
```

**示例:**
```python
# ❌ 差 - 裸异常捕获
try:
    process_data()
except:
    pass

# ✅ 好 - 捕获具体异常
import logging

logger = logging.getLogger(__name__)

try:
    process_data()
except ValueError as e:
    logger.error(f"Invalid data format: {e}")
    raise DataProcessingError("无法处理输入数据") from e
except ConnectionError:
    logger.error("数据库连接失败")
    raise
```

### 6. 测试要求

```markdown
- [ ] 测试函数名描述性: `test_should_return_404_when_user_not_found`
- [ ] 每个测试只验证一个概念
- [ ] 使用 fixtures 共享测试数据
- [ ] 使用 parametrize 测试多组数据
- [ ] Mock 外部依赖
- [ ] 测试覆盖率 > 80%
```

---

## JavaScript/TypeScript代码审查Checklist

### 1. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | 驼峰式 | `getUserById()` |
| 类/构造函数 | 大驼峰 | `UserService` |
| 常量 | 全大写+下划线 | `MAX_RETRY_COUNT` |
| 私有属性 | 下划线前缀或 `#` | `_privateField` / `#privateField` |
| 接口 | 大驼峰+I前缀 | `IUserService` |
| 类型别名 | 大驼峰+T后缀 | `TUserData` |

**检查点:**
- [ ] 布尔变量使用 `is`, `has`, `can` 前缀
- [ ] 回调函数使用 `handle`, `on` 前缀
- [ ] 避免单字母变量（循环中 `i`, `j` 除外）

### 2. 代码结构

```markdown
- [ ] 导入顺序: 内置模块 → 第三方 → 本地绝对路径 → 本地相对路径
- [ ] 使用解构赋值导入需要的部分
- [ ] 避免默认导出 (默认导出不利于tree-shaking)
- [ ] 导出位置统一在文件末尾
- [ ] 使用 TypeScript 时启用 strict 模式
```

**示例:**
```typescript
// ❌ 差 - 顺序混乱，默认导出
import utils from '../utils';
import React from 'react';
import fs from 'fs';

// ✅ 好 - 按规范排序
import fs from 'fs';
import path from 'path';

import React from 'react';
import { useState, useEffect } from 'react';

import { validateUser } from '@/utils/validation';
import { fetchUserData } from '../api/users';
```

### 3. 性能优化

```markdown
- [ ] 避免内存泄漏 (事件监听、定时器清理)
- [ ] 大数据列表使用虚拟滚动
- [ ] 防抖/节流处理高频事件
- [ ] 异步操作使用 Promise/async-await
- [ ] 避免深层嵌套回调 (回调地狱)
- [ ] 按需加载/代码分割
```

**示例:**
```javascript
// ❌ 差 - 内存泄漏
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // 没有清理
}, []);

// ✅ 好 - 正确清理
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// ❌ 差 - 回调地狱
fetchData(id)
  .then(data => process(data))
  .then(processed => save(processed))
  .then(() => updateUI())
  .catch(err => console.error(err));

// ✅ 好 - async/await
async function handleData(id) {
  try {
    const data = await fetchData(id);
    const processed = await process(data);
    await save(processed);
    updateUI();
  } catch (err) {
    console.error(err);
  }
}
```

### 4. 安全性

```markdown
- [ ] 防止XSS: 用户内容使用 innerText 而非 innerHTML
- [ ] 防止原型链污染: 检查属性来源
- [ ] 敏感数据不存储在localStorage
- [ ] 防止eval和new Function的使用
- [ ] CORS配置正确
- [ ] 依赖库定期安全检查 (npm audit)
```

**示例:**
```javascript
// ❌ 危险 - XSS风险
element.innerHTML = userInput;

// ✅ 安全 - 使用 textContent
element.textContent = userInput;

// ❌ 危险 - 原型链污染
function merge(target, source) {
  for (let key in source) {
    target[key] = source[key]; // 可能污染 __proto__
  }
}

// ✅ 安全 - 检查属性
function merge(target, source) {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}
```

### 5. TypeScript 专项

```markdown
- [ ] 避免使用 `any` 类型
- [ ] 启用 strictNullChecks
- [ ] 函数参数和返回值明确类型
- [ ] 使用接口定义对象形状
- [ ] 使用类型守卫缩小类型范围
- [ ] 泛型约束合理使用
```

**示例:**
```typescript
// ❌ 差 - 使用 any
function processData(data: any): any {
  return data.value;
}

// ✅ 好 - 明确类型
interface Data<T> {
  value: T;
  timestamp: number;
}

function processData<T>(data: Data<T>): T {
  return data.value;
}

// ❌ 差 - 类型守卫不足
function printLength(obj: string | string[]) {
  console.log(obj.length); // 可能不安全
}

// ✅ 好 - 类型守卫
function printLength(obj: string | string[]) {
  if (Array.isArray(obj)) {
    console.log(`Array length: ${obj.length}`);
  } else {
    console.log(`String length: ${obj.length}`);
  }
}
```

### 6. 错误处理

```markdown
- [ ] Promise rejection 被正确处理
- [ ] async/await 使用 try-catch
- [ ] 错误日志包含足够上下文
- [ ] 用户友好错误提示
- [ ] 不暴露敏感信息给前端
```

---

## 示例代码对比

### 示例 1: Python - 文件处理与错误处理

**问题代码:**
```python
import os
import json

def process_user_data(filename):
    f = open(filename, 'r')
    data = json.load(f)
    
    users = []
    for i in range(len(data['users'])):
        u = data['users'][i]
        if u['age'] > 18:
            user_info = u['name'] + " (" + str(u['age']) + ")"
            users.append(user_info)
    
    f.close()
    return users

# 调用
result = process_user_data("users.json")
print(result)
```

**审查意见:**
- 🔴 **Blocker**: 文件未关闭异常时不释放资源
- 🟠 **Critical**: 没有异常处理，文件不存在或JSON格式错误会导致崩溃
- 🟡 **Major**: 使用 `range(len())` 不符合Pythonic风格
- 🟡 **Major**: 字符串拼接效率低
- 🟢 **Minor**: 缺少类型注解
- 💡 **Suggestion**: 考虑使用生成器

**改进后代码:**
```python
import json
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def process_user_data(filename: str, min_age: int = 18) -> List[str]:
    """
    处理用户数据，返回符合年龄要求的用户列表。
    
    Args:
        filename: JSON文件路径
        min_age: 最小年龄阈值
        
    Returns:
        格式化的用户信息列表
        
    Raises:
        FileNotFoundError: 文件不存在
        json.JSONDecodeError: JSON格式错误
    """
    file_path = Path(filename)
    
    if not file_path.exists():
        raise FileNotFoundError(f"文件不存在: {filename}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data: Dict[str, Any] = json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"JSON解析失败: {e}")
        raise
    
    users = data.get('users', [])
    
    # 使用列表推导式，更Pythonic
    user_info_list = [
        f"{user['name']} ({user['age']})"
        for user in users
        if user.get('age', 0) > min_age
    ]
    
    logger.info(f"成功处理 {len(user_info_list)} 个用户")
    return user_info_list


# 调用示例
if __name__ == "__main__":
    try:
        result = process_user_data("users.json")
        print(result)
    except Exception as e:
        logger.error(f"处理失败: {e}")
```

**改进要点:**
1. ✅ 使用上下文管理器确保文件关闭
2. ✅ 完善的错误处理和日志记录
3. ✅ 类型注解增强可读性
4. ✅ Pythonic的列表推导式
5. ✅ 使用 f-string 替代字符串拼接
6. ✅ 安全的字典访问 (`.get()`)

---

### 示例 2: JavaScript - 异步处理与内存管理

**问题代码:**
```javascript
function fetchUserData(userIds) {
    let results = [];
    
    for (var i = 0; i < userIds.length; i++) {
        fetch(`/api/users/${userIds[i]}`)
            .then(res => res.json())
            .then(data => {
                results.push(data);
                console.log(`获取用户 ${i}:`, data);
            });
    }
    
    return results;
}

// 使用
const users = fetchUserData([1, 2, 3]);
displayUsers(users);
```

**审查意见:**
- 🔴 **Blocker**: 闭包陷阱，`i` 在回调中总是指向最终值
- 🔴 **Blocker**: 异步操作未完成就返回结果，数据为空
- 🟠 **Critical**: 没有错误处理
- 🟠 **Critical**: 并发请求无限制，可能导致请求洪泛
- 🟡 **Major**: 使用 `var` 而非 `let/const`
- 🟡 **Major**: 没有取消机制，组件卸载时可能操作已卸载组件
- 🟢 **Minor**: 缺少 JSDoc 注释

**改进后代码:**
```javascript
/**
 * 批量获取用户数据
 * @param {number[]} userIds - 用户ID数组
 * @param {Object} options - 配置选项
 * @param {number} options.concurrency - 并发数限制
 * @param {AbortSignal} options.signal - 取消信号
 * @returns {Promise<Array>} 用户数据数组
 */
async function fetchUserData(userIds, options = {}) {
    const { concurrency = 3, signal } = options;
    
    // 检查取消信号
    if (signal?.aborted) {
        throw new Error('请求已取消');
    }
    
    // 并发控制函数
    async function fetchWithLimit(id) {
        try {
            const response = await fetch(`/api/users/${id}`, { signal });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`获取用户 ${id}:`, data);
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`用户 ${id} 请求已取消`);
                throw error;
            }
            console.error(`获取用户 ${id} 失败:`, error);
            throw error;
        }
    }
    
    // 分批并发处理
    const results = [];
    for (let i = 0; i < userIds.length; i += concurrency) {
        const batch = userIds.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(id => fetchWithLimit(id))
        );
        results.push(...batchResults);
    }
    
    return results;
}

// 使用示例
const controller = new AbortController();

// 5秒后自动取消
setTimeout(() => controller.abort(), 5000);

fetchUserData([1, 2, 3, 4, 5, 6], { 
    concurrency: 2,
    signal: controller.signal 
})
    .then(users => displayUsers(users))
    .catch(error => {
        if (error.name === 'AbortError') {
            console.log('请求被取消');
        } else {
            console.error('获取用户数据失败:', error);
            showErrorNotification('无法加载用户数据');
        }
    });

// 组件卸载时取消
// useEffect(() => {
//     // ... fetchUserData
//     return () => controller.abort();
// }, []);
```

**改进要点:**
1. ✅ 修复闭包陷阱，使用正确的用户ID
2. ✅ 返回 Promise 确保异步完成
3. ✅ 添加并发控制避免请求洪泛
4. ✅ 完整的错误处理
5. ✅ 支持请求取消 (AbortController)
6. ✅ 使用 async/await 提升可读性

---

### 示例 3: TypeScript - 类型安全与API设计

**问题代码:**
```typescript
interface Data {
    id: number;
    value: any;
}

class DataProcessor {
    private cache: any;
    
    constructor() {
        this.cache = {};
    }
    
    process(input: any) {
        if (this.cache[input.id]) {
            return this.cache[input.id];
        }
        
        let result;
        if (typeof input.value === 'string') {
            result = input.value.toUpperCase();
        } else if (typeof input.value === 'number') {
            result = input.value * 2;
        } else {
            result = input.value;
        }
        
        this.cache[input.id] = result;
        return result;
    }
    
    getCache() {
        return this.cache;
    }
}

// 使用
const processor = new DataProcessor();
const output = processor.process({ id: 1, value: "hello" });
```

**审查意见:**
- 🔴 **Blocker**: 过度使用 `any`，失去类型安全
- 🟠 **Critical**: 缓存没有过期机制，内存泄漏风险
- 🟠 **Critical**: `input.id` 可能为 undefined
- 🟡 **Major**: 单一职责原则违反，缓存与处理混合
- 🟡 **Major**: 没有输入验证
- 🟢 **Minor**: 缺少返回类型注解

**改进后代码:**
```typescript
// 类型定义
interface StringData {
    id: string;
    type: 'string';
    value: string;
}

interface NumberData {
    id: string;
    type: 'number';
    value: number;
}

type Data = StringData | NumberData;

type ProcessResult<T extends Data> = T extends StringData 
    ? string 
    : T extends NumberData 
    ? number 
    : never;

// 缓存接口
interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

interface CacheConfig {
    maxSize: number;
    ttlMs: number;
}

// 专用缓存类
class LRUCache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    
    constructor(
        private config: CacheConfig = { maxSize: 100, ttlMs: 60000 }
    ) {}
    
    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        
        if (!entry) return undefined;
        
        // 检查过期
        if (Date.now() - entry.timestamp > this.config.ttlMs) {
            this.cache.delete(key);
            return undefined;
        }
        
        // 更新访问顺序 (LRU)
        this.cache.delete(key);
        this.cache.set(key, entry);
        
        return entry.value;
    }
    
    set(key: string, value: T): void {
        // 清理旧缓存
        if (this.cache.size >= this.config.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, { value, timestamp: Date.now() });
    }
    
    clear(): void {
        this.cache.clear();
    }
}

// 处理器类
class DataProcessor {
    private cache: LRUCache<string | number>;
    
    constructor(cacheConfig?: CacheConfig) {
        this.cache = new LRUCache(cacheConfig);
    }
    
    /**
     * 处理数据
     * @throws {TypeError} 输入格式无效
     */
    process<T extends Data>(input: T): ProcessResult<T> {
        // 输入验证
        if (!this.isValidInput(input)) {
            throw new TypeError(`Invalid input: ${JSON.stringify(input)}`);
        }
        
        // 检查缓存
        const cached = this.cache.get(input.id);
        if (cached !== undefined) {
            console.log(`Cache hit for ${input.id}`);
            return cached as ProcessResult<T>;
        }
        
        // 处理逻辑
        const result = this.executeProcess(input);
        
        // 更新缓存
        this.cache.set(input.id, result);
        
        return result as ProcessResult<T>;
    }
    
    private isValidInput(input: unknown): input is Data {
        return (
            typeof input === 'object' &&
            input !== null &&
            'id' in input &&
            typeof (input as Record<string, unknown>).id === 'string' &&
            'type' in input &&
            'value' in input
        );
    }
    
    private executeProcess(data: Data): string | number {
        switch (data.type) {
            case 'string':
                return data.value.toUpperCase();
            case 'number':
                return data.value * 2;
            default:
                // 穷尽检查
                const _exhaustive: never = data;
                throw new Error(`Unknown data type: ${_exhaustive}`);
        }
    }
    
    clearCache(): void {
        this.cache.clear();
    }
}

// 使用示例
const processor = new DataProcessor({ maxSize: 50, ttlMs: 30000 });

// 类型安全的使用
const stringData: StringData = { id: '1', type: 'string', value: 'hello' };
const numberData: NumberData = { id: '2', type: 'number', value: 42 };

const stringResult = processor.process(stringData); // 类型推断为 string
const numberResult = processor.process(numberData); // 类型推断为 number

console.log(stringResult); // "HELLO"
console.log(numberResult); // 84

// 无效输入会被拒绝
// processor.process({ id: '3', value: true }); // TypeError
```

**改进要点:**
1. ✅ 严格类型定义，消除 `any`
2. ✅ 使用联合类型和类型守卫
3. ✅ 泛型返回类型推断
4. ✅ LRU缓存带过期时间
5. ✅ 输入验证和类型谓词
6. ✅ 穷尽检查确保类型安全

---

## 附录：审查工具推荐

### Python 工具

| 工具 | 用途 | 配置建议 |
|------|------|----------|
| **Black** | 代码格式化 | `line-length = 88` |
| **isort** | 导入排序 | `profile = black` |
| **flake8** | 风格检查 | `max-line-length = 88` |
| **pylint** | 代码质量 | 启用所有检查 |
| **mypy** | 类型检查 | `strict = true` |
| **bandit** | 安全扫描 | 检查所有文件 |
| **pytest-cov** | 测试覆盖 | `fail-under = 80` |

**pre-commit 配置示例:**
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.x.x
    hooks:
      - id: black
        language_version: python3
  
  - repo: https://github.com/PyCQA/isort
    rev: 5.x.x
    hooks:
      - id: isort
  
  - repo: https://github.com/PyCQA/flake8
    rev: 6.x.x
    hooks:
      - id: flake8
        additional_dependencies: [flake8-docstrings]
  
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.x.x
    hooks:
      - id: mypy
  
  - repo: https://github.com/PyCQA/bandit
    rev: 1.x.x
    hooks:
      - id: bandit
```

### JavaScript/TypeScript 工具

| 工具 | 用途 | 配置建议 |
|------|------|----------|
| **ESLint** | 代码检查 | 使用 `@typescript-eslint` |
| **Prettier** | 代码格式化 | `printWidth: 80` |
| **TypeScript** | 类型检查 | `strict: true` |
| **Jest** | 测试框架 | 覆盖率 > 80% |
| **Husky** | Git hooks | pre-commit 自动检查 |

**ESLint 配置示例:**
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn"
  }
}
```

### 自动化审查流程

```bash
# 提交前自动检查 (package.json)
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write", "git add"],
    "*.py": ["black", "isort", "flake8", "mypy"]
  }
}
```

---

## 结语

代码审查不仅是找bug，更是：
- 📚 **知识共享** - 团队成员互相学习
- 🏗️ **架构一致性** - 维护代码库的统一风格
- 🛡️ **质量保障** - 在问题进入生产前发现
- 🤝 **团队协作** - 建立共同的代码标准

**黄金法则:** 对事不对人，专注于代码本身。

---

*本文档由代码审查Agent生成 | 最后更新: 2026-04-01*
