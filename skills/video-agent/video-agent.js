const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Video Agent - 视频理解与任务执行
 * 
 * 核心功能：
 * 1. 解析视频链接 → 提取元数据
 * 2. 下载/转录 → 获取内容
 * 3. 理解内容 → 生成摘要/分析
 * 4. 执行任务 → 基于视频内容完成用户指令
 */
class VideoAgent {
  constructor(options = {}) {
    this.tempDir = options.tempDir || '/tmp/video-agent';
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 主入口：解析视频链接
   */
  async parse(url) {
    console.log(`🔍 解析视频: ${url}`);
    
    const platform = this.detectPlatform(url);
    const videoId = this.extractVideoId(url, platform);
    
    return {
      url,
      platform,
      videoId,
      title: null,
      description: null,
      duration: null,
      thumbnails: []
    };
  }

  /**
   * 检测视频平台
   */
  detectPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('douyin.com')) return 'douyin';
    if (url.includes('ixigua.com')) return 'ixigua';
    if (url.includes('toutiao.com')) return 'toutiao';
    return 'unknown';
  }

  /**
   * 提取视频ID
   */
  extractVideoId(url, platform) {
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'youtube':
          return urlObj.searchParams.get('v') || url.split('/').pop();
        case 'bilibili':
          return urlObj.pathname.match(/BV[a-zA-Z0-9]+/)?.[0] || '';
        case 'tiktok':
        case 'douyin':
          return url.split('/').pop().split('?')[0];
        default:
          return '';
      }
    } catch {
      return '';
    }
  }

  /**
   * 提取视频内容
   */
  async extract(videoInfo) {
    console.log(`📥 提取内容: ${videoInfo.platform}`);
    
    const transcript = await this.getTranscript(videoInfo);
    const frames = await this.extractFrames(videoInfo);
    
    return {
      ...videoInfo,
      transcript,
      frames,
      summary: null
    };
  }

  /**
   * 获取字幕/转录
   */
  async getTranscript(videoInfo) {
    // 使用 yt-dlp 获取字幕
    if (videoInfo.platform === 'youtube') {
      return await this.getYoutubeTranscript(videoInfo);
    }
    
    // 其他平台使用浏览器抓取
    return await this.getGenericTranscript(videoInfo);
  }

  async getYoutubeTranscript(videoInfo) {
    const outputPath = path.join(this.tempDir, `${videoInfo.videoId}.json`);
    
    try {
      // 尝试获取自动字幕
      execSync(`yt-dlp --skip-download --write-auto-subs --sub-langs en,zh --convert-subs json3 -o "${outputPath}" "${videoInfo.url}"`, {
        stdio: 'pipe',
        timeout: 60000
      });
      
      // 读取字幕文件
      const files = fs.readdirSync(this.tempDir).filter(f => f.includes(videoInfo.videoId));
      for (const file of files) {
        if (file.endsWith('.json3') || file.endsWith('.json')) {
          const content = fs.readFileSync(path.join(this.tempDir, file), 'utf-8');
          return this.parseTranscript(content);
        }
      }
    } catch (e) {
      console.log('⚠️  无法获取字幕:', e.message);
    }
    
    return null;
  }

  parseTranscript(jsonContent) {
    try {
      const data = JSON.parse(jsonContent);
      // 简单的字幕解析
      return data.events?.map(e => e.segs?.map(s => s.utf8).join('')).join(' ') || '';
    } catch {
      return jsonContent;
    }
  }

  async getGenericTranscript(videoInfo) {
    // 对于头条/TikTok等平台，可以使用浏览器抓取字幕文本
    // 这里返回模拟数据，实际实现需要 browser 工具
    return `[${videoInfo.platform} 字幕需要浏览器抓取]`;
  }

  /**
   * 提取关键帧
   */
  async extractFrames(videoInfo) {
    const outputDir = path.join(this.tempDir, 'frames', videoInfo.videoId);
    fs.mkdirSync(outputDir, { recursive: true });
    
    const videoPath = path.join(this.tempDir, `${videoInfo.videoId}.mp4`);
    
    try {
      // 下载视频片段
      execSync(`yt-dlp -f "best[height<=720]" -o "${videoPath}" "${videoInfo.url}"`, {
        stdio: 'pipe',
        timeout: 120000
      });
      
      // 提取5个关键帧
      const timestamps = ['00:00:05', '00:00:30', '00:01:00', '00:02:00', '00:03:00'];
      const frames = [];
      
      for (let i = 0; i < timestamps.length; i++) {
        const framePath = path.join(outputDir, `frame_${i}.jpg`);
        execSync(`ffmpeg -ss ${timestamps[i]} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}"`, {
          stdio: 'pipe'
        });
        frames.push(framePath);
      }
      
      return frames;
    } catch (e) {
      console.log('⚠️  无法提取帧:', e.message);
      return [];
    }
  }

  /**
   * 执行任务
   */
  async execute(content, task) {
    console.log(`🎯 执行任务: ${task}`);
    
    // 如果没有转录，先尝试理解
    if (!content.transcript) {
      return `[无法获取视频内容] 任务: ${task}`;
    }
    
    // 根据任务类型处理
    switch (task.toLowerCase()) {
      case 'summarize':
      case '总结':
        return this.summarize(content.transcript);
      
      case 'transcript':
      case '字幕':
        return content.transcript;
      
      case 'keypoints':
      case '要点':
        return this.extractKeyPoints(content.transcript);
      
      default:
        return `[自定义任务] ${task}\n\n视频内容:\n${content.transcript.substring(0, 1000)}...`;
    }
  }

  summarize(transcript) {
    // 简单的摘要逻辑
    const sentences = transcript.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
    const keySentences = sentences.slice(0, 5);
    
    return `视频摘要:\n\n${keySentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}`;
  }

  extractKeyPoints(transcript) {
    const sentences = transcript.split(/[。！？.!?]/).filter(s => s.trim().length > 15);
    const keyPoints = sentences.filter(s => 
      s.includes('重要') || 
      s.includes('关键') || 
      s.includes('注意') ||
      s.includes('首先') ||
      s.includes('总结')
    ).slice(0, 5);
    
    return `关键要点:\n\n${keyPoints.map((s, i) => `• ${s.trim()}`).join('\n')}`;
  }
}

// CLI 支持
if (require.main === module) {
  const url = process.argv[2];
  const taskFlag = process.argv.indexOf('--task');
  const task = taskFlag > -1 ? process.argv[taskFlag + 1] : 'summarize';
  
  if (!url) {
    console.log('用法: node video-agent.js <视频链接> --task <任务>');
    console.log('任务: summarize, transcript, keypoints, 或自定义指令');
    process.exit(1);
  }
  
  const agent = new VideoAgent();
  
  agent.parse(url)
    .then(video => agent.extract(video))
    .then(content => agent.execute(content, task))
    .then(result => {
      console.log('\n' + '='.repeat(50));
      console.log(result);
      console.log('='.repeat(50));
    })
    .catch(err => {
      console.error('❌ 错误:', err.message);
      process.exit(1);
    });
}

module.exports = VideoAgent;