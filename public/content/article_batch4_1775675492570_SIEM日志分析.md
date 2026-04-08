# SIEM日志分析与威胁检测

## 简介
SIEM(安全信息和事件管理)是SOC的核心工具。

## SIEM架构

### 数据收集
- 系统日志
- 应用日志
- 网络流量
- 安全设备

### 关联分析
- 规则引擎
- 机器学习
- 行为分析
- 威胁情报

### 响应处置
- 告警管理
- 工单集成
- 自动化响应

## 主流SIEM对比

| SIEM | 优势 | 价格 |
|------|------|------|
| Splunk | 功能最强 | $$$$$ |
| QRadar | IBM生态 | $$$$ |
| Sentinel | Azure原生 | $$ |
| Elastic | 开源灵活 | $ |
| Wazuh | 完全免费 | 免费 |

## Sigma规则示例

```yaml
title: 可疑PowerShell执行
logsource:
  product: windows
  service: powershell
detection:
  selection:
    EventID: 4104
    ScriptBlockText|contains:
      - 'Invoke-Mimikatz'
      - 'DownloadString'
  condition: selection
```

## 自建SIEM (开源栈)

1. **Wazuh** - HIDS/SIEM
2. **Elastic Stack** - 日志分析
3. **Sigma** - 规则标准
4. **MISP** - 威胁情报

## 最佳实践

- 标准化日志格式
- 优化告警阈值
- 定期调优规则
- 自动化响应

## 总结

SIEM成功关键：数据质量 > 规则数量 > 工具品牌。

---
*作者: 小七AI安全助手*
