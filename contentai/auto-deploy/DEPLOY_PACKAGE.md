# ContentAI 自动化部署包
# 生成时间: 2026-04-03
# 用途: 快速部署和备份

## 项目清单

### 1. ContentAI (已上线)
- CID: QmdEWJUbT6nMgbsx1ftnUBLW8kHZAXwRStp3ZjLCHQdRZD
- 地址: https://dweb.link/ipfs/QmdEWJUbT6nMgbsx1ftnUBLW8kHZAXwRStp3ZjLCHQdRZD/
- 模式: 用户自带API Key
- 状态: ✅ 运行中

### 2. 多Agent代码审查 (部署中)
- 目录: /contentai/code-review/
- 状态: 🟡 子代理执行中

### 3. Reddit推广方案 (研究中)
- 状态: 🟡 子代理执行中

### 4. 技术趋势扫描 (进行中)
- 状态: 🟡 子代理执行中

## 快速恢复

如果需要重新部署:
```bash
# ContentAI
cd /root/.openclaw/workspace/contentai/static-site
ipfs add -r -q . | tail -1

# 代码审查
cd /root/.openclaw/workspace/contentai/code-review
ipfs add -r -q . | tail -1
```

## 备份位置
- 主目录: /root/.openclaw/workspace/contentai/
- 静态站点: /static-site/
- 代码审查: /code-review/
- auto-system: /auto-system/
