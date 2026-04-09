---
name: youtube-video-analyzer
description: Multimodal YouTube video analysis through both audio (transcript) and visual (frame extraction + image analysis) channels. Use for learning tutorials, competitor analysis, and extracting actionable insights from videos.
version: 1.0.0
metadata:
  openclaw:
    emoji: "🎬"
    requires:
      bins: ["ffmpeg", "python3", "curl", "yt-dlp"]
---
# YouTube Video Analyzer

Analyzes YouTube videos to extract:
1. Full transcript with timestamps
2. Key frames and visual content
3. Synchronized audio-visual analysis

## Usage

```bash
# Extract transcript and frames from a video
yt-dlp --dump-json "<YOUTUBE_URL>" | python3 -c "...extract and analyze..."
```

## Safety
- Only processes public videos
- Local processing, no data leaves machine
- Temporary files auto-cleaned
