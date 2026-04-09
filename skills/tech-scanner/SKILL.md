# Tech Scanner Skill
# 技术扫描机器人 - 自动发现最新技术和技能

## 用途
自动扫描互联网，发现最新的AI技术、工具、框架和赚钱机会。

## 工作流程

### 1. 扫描源配置
```yaml
sources:
  - name: "GitHub Trending"
    url: "https://github.com/trending"
    type: "scraping"
    frequency: "daily"
  
  - name: "Hacker News"
    url: "https://news.ycombinator.com"
    type: "api"
    frequency: "daily"
  
  - name: "Product Hunt"
    url: "https://www.producthunt.com"
    type: "scraping"
    frequency: "daily"
  
  - name: "Reddit r/MachineLearning"
    url: "https://www.reddit.com/r/MachineLearning"
    type: "api"
    frequency: "daily"
  
  - name: "ArXiv CS.AI"
    url: "https://arxiv.org/list/cs.AI/recent"
    type: "rss"
    frequency: "daily"
  
  - name: "Tech Blogs"
    urls:
      - "https://blog.openai.com"
      - "https://anthropic.com/news"
      - "https://deepmind.google/discover/blog/"
    type: "rss"
    frequency: "daily"
```

### 2. 扫描内容分类

#### A. 新技术/框架
- 编程框架
- AI模型
- 开发工具
- 基础设施

#### B. 新商业模式
- SaaS产品
- 付费应用
- 开源变现
- API服务

#### C. 市场机会
- 需求痛点
- 竞品动态
- 趋势变化
- 监管政策

#### D. 学习资源
- 教程文档
- 开源项目
- 视频课程
- 社区讨论

### 3. 评估标准

#### 技术价值 (0-100)
- 创新性: 是否突破现有方案
- 实用性: 能否解决实际问题
- 成熟度: 是否生产可用
- 社区活跃度: GitHub stars, contributors

#### 商业价值 (0-100)
- 市场规模: TAM/SAM/SOM
- 付费意愿: 用户是否愿意付费
- 竞争壁垒: 护城河宽度
- 变现难度: 从0到1的复杂度

#### 学习成本 (0-100)
- 上手难度: 学习曲线
- 文档质量: 是否完善
- 社区支持: 遇到问题能否解决
- 与现有技能匹配度

### 4. 输出格式

```markdown
## 📡 技术扫描报告 - YYYY-MM-DD

### 🔥 热点技术 (Top 5)

| 排名 | 技术 | 类型 | 热度 | 商业价值 | 学习建议 |
|------|------|------|------|----------|----------|
| 1 | xxx | 框架 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 立即学习 |
| 2 | xxx | 工具 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 本周学习 |
| 3 | xxx | 模型 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 持续关注 |

### 💰 新机会发现

#### 机会1: [名称]
- **来源**: [链接]
- **痛点**: [描述]
- **解决方案**: [描述]
- **目标客户**: [人群]
- **变现方式**: [模式]
- **竞争格局**: [分析]
- **建议行动**: [下一步]

### 📚 推荐学习

1. **技术名称**
   - 学习资源: [链接]
   - 预计时间: X小时
   - 应用场景: [描述]

### 🎯 今日行动

- [ ] 学习 [技术A]
- [ ] 测试 [工具B]
- [ ] 调研 [机会C]

---
*扫描时间: HH:MM*
*数据来源: [列表]*
```

### 5. 自动化集成

#### 每日执行流程
```
09:00 - 触发扫描任务
09:05 - 搜索GitHub Trending
09:10 - 扫描Hacker News
09:15 - 检查Product Hunt
09:20 - 分析Reddit讨论
09:25 - 汇总生成报告
09:30 - 评估并推荐行动
09:35 - 更新技能清单
09:40 - 汇报给用户
```

#### 技能自动应用
- 发现新工具 → 创建tools/记录
- 发现新框架 → 添加到学习清单
- 发现新机会 → 创建项目评估
- 发现新资源 → 更新知识库

### 6. 质量过滤

#### 自动过滤
- 发布时间 < 7天（新鲜度）
- GitHub stars > 100（社区认可）
- 有实际用户/案例（非概念）
- 文档完整（可学习）

#### 手动审核
- 检查是否已存在类似技能
- 验证商业价值真实性
- 测试技术可行性

## 使用示例

### 手动触发
```
执行技术扫描
→ 扫描所有源
→ 生成报告
→ 推荐行动
```

### 自动触发
```
cron: 0 9 * * *
→ 每日9点自动扫描
→ 发送报告到指定频道
→ 高价值机会立即通知
```

## 输出位置

- **报告**: `output/tech-scanner/report-YYYY-MM-DD.md`
- **技能候选**: `output/tech-scanner/skills-candidate.md`
- **机会清单**: `output/tech-scanner/opportunities.md`
- **学习清单**: `output/tech-scanner/learning-queue.md`

## 持续优化

### 反馈循环
1. 用户评估推荐质量
2. 调整评分权重
3. 优化扫描源
4. 改进输出格式

### 指标追踪
- 扫描覆盖率: 多少源被覆盖
- 推荐采纳率: 用户采纳比例
- 学习转化率: 学到→应用
- 变现成功率: 机会→收入

---
*创建: 2026-04-01*  
*版本: 1.0*  
*状态: 活跃*
