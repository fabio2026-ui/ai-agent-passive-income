# HeyGen Auto Video Generator

## Purpose
自动化HeyGen视频生成 - 输入文案，输出高质量AI数字人视频。

## Prerequisites
- HeyGen账号（免费版可用）
- API Token（从设置中获取）

## Setup

### 1. 获取API Token
1. 登录 https://app.heygen.com
2. 点击头像 → Settings → API
3. 生成并复制Token

### 2. 配置环境变量
```bash
export HEYGEN_API_TOKEN="your_token_here"
```

## Usage

### 基础用法
```python
python3 -m heygen_video "你的视频文案"
```

### 高级用法
```python
python3 -m heygen_video \
  --script "文案内容" \
  --avatar "your_avatar_id" \
  --voice "your_voice_id" \
  --output "output.mp4"
```

## API调用示例

```python
import requests
import os

API_TOKEN = os.getenv("HEYGEN_API_TOKEN")
BASE_URL = "https://api.heygen.com/v2"

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# 1. 获取可用头像列表
def list_avatars():
    resp = requests.get(f"{BASE_URL}/avatars", headers=headers)
    return resp.json()["data"]["avatars"]

# 2. 获取可用声音列表  
def list_voices():
    resp = requests.get(f"{BASE_URL}/voices", headers=headers)
    return resp.json()["data"]["voices"]

# 3. 生成视频
def create_video(script: str, avatar_id: str, voice_id: str):
    payload = {
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": avatar_id,
                "avatar_style": "normal"
            },
            "voice": {
                "type": "text",
                "input_text": script,
                "voice_id": voice_id
            },
            "background": {
                "type": "color",
                "value": "#f5f5f5"
            }
        }],
        "dimension": {
            "width": 1080,
            "height": 1920  # 9:16 竖屏
        }
    }
    
    resp = requests.post(
        f"{BASE_URL}/video/generate",
        headers=headers,
        json=payload
    )
    return resp.json()["data"]["video_id"]

# 4. 查询视频状态
def get_video_status(video_id: str):
    resp = requests.get(
        f"{BASE_URL}/video/status?video_id={video_id}",
        headers=headers
    )
    return resp.json()["data"]
```

## 工作流程

```
用户输入文案 → 选择头像/声音 → 提交生成任务 → 轮询状态 → 下载视频
```

## 价格参考
- 免费版：1 credit/月（约1分钟视频）
- 付费版：$24/月起，60 credits/月

## 限制
- 免费版有生成次数限制
- 视频生成时间约1-5分钟
- 单视频最长10分钟

## 故障排除

### API返回401
- 检查Token是否过期
- 确认Token格式正确（Bearer前缀）

### 视频生成失败
- 检查头像ID和声音ID是否有效
- 确认文案不为空
- 检查账户credits是否充足

## 相关链接
- API文档：https://docs.heygen.com/
- 定价：https://www.heygen.com/pricing
