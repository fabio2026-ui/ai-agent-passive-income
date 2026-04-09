# Notification System Skill

本地和远程通知推送系统。

## 功能
- 桌面通知
- 移动端推送
- 邮件通知
- 通知优先级

## 通知类型

| 类型 | 图标 | 说明 |
|------|------|------|
| info | ℹ️ | 普通信息 |
| success | ✅ | 操作成功 |
| warning | ⚠️ | 警告提醒 |
| error | ❌ | 错误通知 |

## 使用

```typescript
Notification.send({
  title: '视频生成完成',
  body: '5个网文视频已生成完毕',
  type: 'success',
  actions: ['查看', '忽略']
});
```
