# 即梦AI视频生成技能 (Video Generation Alternative)

## 简介
使用即梦AI (Jimeng) 替代剪映进行网文视频快速生成。生成速度 < 1分钟，每日免费额度66积分。

## 选择理由

| 维度 | 即梦AI | 剪映 |
|------|--------|------|
| 生成速度 | **41秒** / 5秒视频 | >30分钟 |
| 中文支持 | **优秀** (字节旗下) | 优秀 |
| 成本 | **免费66积分/天** | 付费 |
| API可用性 | **有** | 无 |
| 注册难度 | **简单** | 简单 |

## 前置要求

1. **即梦账号**: 访问 https://jimeng.jianying.com/ 注册
2. **获取Session ID**:
   - 登录即梦官网
   - F12 打开开发者工具 → Application → Cookies
   - 复制 `sessionid` 值
3. **安装依赖**:
   ```bash
   pip install requests
   ```

## 使用方法

### 直接调用Python脚本

```bash
python generate_video.py "富二代骑着电动车穿梭在城市夜景中，霓虹闪烁的摩天大楼，赛博朋克风格"
```

### 使用jimeng-free-api-all (推荐用于批量)

```bash
# 部署API服务
docker run -d --name jimeng-api -p 8001:8000 \
  wwwzhouhui569/jimeng-free-api-all:latest

# 调用API
curl -X POST http://localhost:8001/v1/videos/generations \
  -H "Authorization: Bearer YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jimeng-video-seedance-2.0",
    "prompt": "富二代骑着电动车穿梭在城市夜景中，霓虹闪烁的摩天大楼，赛博朋克风格"
  }'
```

## API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/v1/videos/generations` | POST | 同步视频生成 |
| `/v1/videos/generations/async` | POST | 异步提交任务 |
| `/v1/videos/generations/async/{taskId}` | GET | 查询任务结果 |
| `/v1/models` | GET | 获取可用模型列表 |

## 视频生成模型

- `jimeng-video-seedance-2.0` - Seedance 2.0 视频生成
- `jimeng-video-seedance-2.0-fast` - 快速版
- `jimeng-video-3.5-pro` - 3.5专业版

## 积分消耗

- 每日登录赠送 **66积分**
- 视频生成约消耗 1-3积分/次
- 每日可免费生成约 **20-30个** 视频

## 注意事项

⚠️ **仅供自用，禁止商用或对外提供服务**
⚠️ **逆向API不稳定，建议关注官方API动态**

## 参考项目

- [jimeng-free-api-all](https://github.com/wwwzhouhui/jimeng-free-api-all)
- [即梦官网](https://jimeng.jianying.com/)
