# 🛡️ Security Guard Agent

24/7 自动运行的系统安全维护机器人

## 📋 功能特性

### 1. 每小时自动扫描
- 🔍 **代码安全漏洞扫描** - 检测硬编码密码、SQL注入、eval/exec使用等
- 📦 **依赖包安全检查** - 扫描 npm/pip 依赖的已知漏洞
- 🌐 **API健康检查** - 监控服务端点可用性

### 2. 自动修复
- 🔧 发现安全问题立即自动修复
- 📤 更新过期依赖包
- 🔄 重启崩溃的服务

### 3. 实时监控告警
- 💻 **系统性能监控** - CPU、内存、磁盘使用率
- 📊 **异常流量检测** - 网络连接数、错误率监控
- 📝 **错误日志监控** - 实时错误追踪

### 4. 每日安全报告
- 📈 生成安全状态报告 (JSON + HTML)
- 📋 记录所有修复操作
- 🔮 预测潜在风险

## 🚀 快速安装

```bash
# 进入项目目录
cd security-guard-agent

# 运行安装脚本 (需要root权限)
sudo bash install.sh
```

安装脚本会自动：
- ✅ 安装Python依赖
- ✅ 创建系统服务
- ✅ 设置定时任务
- ✅ 启动监控服务

## 📖 使用说明

### 命令行工具

安装后会创建 `security-guard` 命令：

```bash
# 服务管理
security-guard start      # 启动服务
security-guard stop       # 停止服务
security-guard restart    # 重启服务
security-guard status     # 查看状态

# 功能操作
security-guard scan       # 立即执行安全扫描
security-guard report     # 立即生成报告
security-guard logs       # 查看实时日志
```

### 直接运行

```bash
# 持续监控模式
python3 scripts/main_controller.py --mode continuous

# 单次扫描
python3 scripts/main_controller.py --mode once --task scan

# 单次监控
python3 scripts/main_controller.py --mode once --task monitor

# 生成报告
python3 scripts/main_controller.py --mode once --task report
```

### Web监控面板

```bash
# 启动Web面板 (默认端口9999)
./start-web.sh

# 访问 http://localhost:9999 查看报告
```

## ⚙️ 配置说明

配置文件位置：`config/config.json`

```json
{
  "scan_interval": 3600,        // 扫描间隔(秒)
  "report_interval": 86400,     // 报告间隔(秒)
  "monitor_interval": 60,       // 监控间隔(秒)
  "auto_fix": true,             // 是否启用自动修复
  "alert_thresholds": {
    "cpu_percent": 80,          // CPU告警阈值
    "memory_percent": 85,       // 内存告警阈值
    "disk_percent": 90,         // 磁盘告警阈值
    "load_average": 10          // 负载告警阈值
  },
  "scan_paths": ["/path/to/scan"],  // 扫描路径
  "notification_channels": ["log", "file", "console"],  // 通知渠道
  "webhook_url": ""             // Webhook通知地址
}
```

## 📁 目录结构

```
security-guard-agent/
├── scripts/              # 核心脚本
│   ├── main_controller.py    # 主控制器
│   ├── security_scanner.py   # 安全扫描模块
│   ├── auto_fixer.py         # 自动修复模块
│   ├── system_monitor.py     # 系统监控模块
│   ├── alert_manager.py      # 告警管理模块
│   └── report_generator.py   # 报告生成模块
├── config/               # 配置文件
│   └── config.json
├── logs/                 # 日志文件
│   ├── security-guard-YYYYMMDD.log
│   ├── scan-results/     # 扫描结果
│   ├── metrics/          # 监控数据
│   └── alerts/           # 告警记录
├── reports/              # 生成的报告
├── web/                  # Web面板文件
├── install.sh            # 安装脚本
├── requirements.txt      # Python依赖
└── README.md            # 本文件
```

## 🔍 检测的安全问题

### 代码漏洞检测
- 硬编码密码/密钥
- SQL注入风险
- eval/exec 代码注入
- pickle/yaml 反序列化风险
- 调试模式开启
- SSL证书验证禁用
- 弱哈希算法使用
- 不安全的临时文件

### 依赖漏洞检测
- Python pip 包漏洞 (通过 pip-audit)
- Node.js npm 包漏洞 (通过 npm audit)

### 自动修复能力
- 升级有漏洞的依赖包
- 替换不安全的 yaml.load
- 关闭调试模式
- 启用SSL验证
- 重启崩溃的服务

## 🔔 告警通知

支持多种通知渠道：
- **日志** - 写入日志文件
- **控制台** - 输出到终端
- **文件** - 保存为JSON
- **Webhook** - 发送到Slack/Discord/自定义接口

## 📊 报告示例

每日报告包含：
- 扫描统计（文件数、漏洞数）
- 修复统计（成功/失败数）
- 系统性能（CPU/内存/磁盘）
- 告警统计（按级别分类）
- 风险预测（基于趋势分析）

## 🔧 系统要求

- Python 3.7+
- Linux/macOS (推荐)
- 依赖：psutil, requests
- 可选：pip-audit (Python依赖扫描)

## 🛠️ 故障排除

### 服务无法启动
```bash
# 检查日志
journalctl -u security-guard -f
# 或
security-guard logs
```

### 依赖扫描失败
```bash
# 安装 pip-audit
pip3 install pip-audit
```

### 权限问题
```bash
# 确保日志目录可写
chmod 755 /opt/security-guard-agent/logs -R
```

## 📜 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和PR！

---

🤖 **Security Guard Agent** - 守护您的系统安全
