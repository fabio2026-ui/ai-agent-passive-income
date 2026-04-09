# Page Agent Skill

## 描述
浏览器页面自动化与AI Agent结合的技能，实现网页操作、数据提取、自动化任务执行。

## 用途
- 网页自动化操作
- 数据抓取与监控
- 表单自动填写
- 批量任务处理
- 竞品信息收集

## 使用场景

### 场景1: 竞品监控
```
监控竞争对手网站价格变化
每日自动抓取并对比
价格变动时发送通知
```

### 场景2: 内容采集
```
自动采集目标网站文章
提取标题、正文、图片
保存到数据库
```

### 场景3: 自动化测试
```
模拟用户操作流程
验证页面功能
生成测试报告
```

## 技术实现

### 核心工具
- Playwright - 浏览器自动化
- Cheerio - HTML解析
- Puppeteer - 备用方案

### API设计
```typescript
interface PageAgent {
  // 导航
  navigate(url: string): Promise<void>
  
  // 元素操作
  click(selector: string): Promise<void>
  type(selector: string, text: string): Promise<void>
  
  // 数据提取
  extract(selector: string): Promise<string>
  extractAll(selector: string): Promise<string[]>
  
  // 截图
  screenshot(path?: string): Promise<Buffer>
  
  // 等待
  waitFor(selector: string, timeout?: number): Promise<void>
}
```

## 集成到ContentAI

### 用途1: 小红书数据采集
- 采集热门笔记
- 分析爆款文案结构
- 提取高频关键词

### 用途2: 竞品分析
- 监控竞品动态
- 分析定价策略
- 跟踪功能更新

### 用途3: 自动化运营
- 自动发布内容
- 批量账号管理
- 数据报表生成

## 下一步开发
- [ ] 集成Playwright
- [ ] 封装常用操作
- [ ] 添加反检测机制
- [ ] 实现任务调度
