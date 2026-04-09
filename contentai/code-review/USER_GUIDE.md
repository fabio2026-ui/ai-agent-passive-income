# 使用指南

## 🚀 快速开始

### 1. 打开应用
部署完成后，打开页面URL。

### 2. 获取API Key

#### Moonshot API Key（必填）
1. 访问 https://platform.moonshot.cn/
2. 注册账户
3. 进入控制台 → API Key管理
4. 创建新Key

#### GitHub Token（可选）
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo`（访问私有仓库）
4. 生成并复制Token

### 3. 开始审查

1. 输入GitHub仓库URL
   ```
   https://github.com/owner/repository
   ```

2. 输入Moonshot API Key

3. （可选）输入GitHub Token

4. （可选）指定代码路径
   ```
   src/        # 只审查src目录
   packages/   # 只审查packages目录
   ```

5. 选择分支（默认main）

6. 点击"开始代码审查"

## 📊 审查流程

```
1. 获取文件列表
        ↓
2. 架构师Agent分析
        ↓
3. 安全专家Agent审查
        ↓
4. 性能Agent检测
        ↓
5. 质量Agent检查
        ↓
6. Bug猎手Agent扫描
        ↓
7. 报告生成Agent汇总
        ↓
8. 展示综合报告
```

## 📈 评分标准

| 维度 | 分数范围 | 说明 |
|------|---------|------|
| 综合评分 | 0-100 | 整体代码质量 |
| 架构 | 0-100 | 结构合理性 |
| 安全 | 0-100 | 安全漏洞数量 |
| 性能 | 0-100 | 性能问题数量 |
| 质量 | 0-100 | 代码规范遵循度 |

## 🎯 结果解读

### 评分等级
- **90-100**: 优秀，生产就绪
- **80-89**: 良好，小优化空间
- **70-79**: 中等，需要改进
- **60-69**: 及格，有明显问题
- **<60**: 需要重构

### 问题严重级别
- 🔴 **High**: 必须立即修复
- 🟡 **Medium**: 建议修复
- 🔵 **Low**: 可优化

## 💾 数据存储

### 本地存储
- API Key保存在浏览器localStorage
- 审查结果不会保存，刷新页面后消失

### 隐私说明
- ✅ 密钥仅存储在本地
- ✅ 代码通过GitHub API直接获取
- ✅ AI分析通过Moonshot API直接调用
- ❌ 不会上传到任何第三方服务器

## 🐛 常见问题

### "API错误: 401"
- 检查API Key是否正确（以sk-开头）
- 检查API Key是否有效

### "仓库或路径不存在"
- 检查仓库URL格式
- 检查代码路径是否正确
- 确认分支名称正确

### "访问被拒绝"
- 私有仓库需要提供GitHub Token
- Token需要有repo权限

### "API调用失败"
- 可能是网络问题
- Moonshot API可能有临时问题
- 刷新页面重试

## 🔧 高级配置

### 修改代码文件数量限制
编辑index.html中的 `slice(0, 10)` 调整文件数量。

### 修改Agent提示词
搜索各Agent的prompt变量，自定义审查重点。

### 添加新的Agent
复制现有Agent函数，修改提示词和ID。

## 📝 示例仓库

适合测试的公开仓库：
- https://github.com/facebook/react
- https://github.com/vuejs/core
- https://github.com/microsoft/vscode

建议只审查src或packages目录，避免文件过多。

## 🆘 技术支持

如遇到问题：
1. 检查浏览器控制台错误信息
2. 确认API Key和Token正确
3. 尝试公开仓库测试
4. 检查网络连接
