/**
 * Video Agent - Core Module
 * 
 * 视频链接解析、内容提取和智能理解
 * 
 * @module VideoAgent
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Video Agent 配置选项
 * @typedef {Object} VideoAgentConfig
 * @property {string} outputDir - 输出目录
 * @property {string} maxFileSize - 最大文件大小
 * @property {string} videoQuality - 视频质量
 * @property {string} audioQuality - 音频质量
 * @property {string} whisperModel - Whisper 模型 (tiny, base, small, medium, large)
 * @property {string} language - 默认语言
 * @property {boolean} keepFiles - 是否保留临时文件
 */

const DEFAULT_CONFIG = {
  outputDir: '/tmp/video-agent',
  maxFileSize: '500M',
  videoQuality: '720p',
  audioQuality: '128k',
  whisperModel: 'base',
  language: 'zh',
  keepFiles: false
};

/**
 * Video Agent 主类
 */
export class VideoAgent {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureDirectories();
  }

  /**
   * 确保输出目录存在
   */
  async ensureDirectories() {
    const dirs = [
      this.config.outputDir,
      path.join(this.config.outputDir, 'downloads'),
      path.join(this.config.outputDir, 'audio'),
      path.join(this.config.outputDir, 'frames'),
      path.join(this.config.outputDir, 'subtitles'),
      path.join(this.config.outputDir, 'transcripts')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true }).catch(() => {});
    }
  }

  /**
   * 执行 shell 命令
   * @param {string} command - 命令
   * @param {string[]} args - 参数
   * @returns {Promise<string>}
   */
  execCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { shell: false });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * 解析视频 URL 获取元数据
   * @param {string} url - 视频 URL
   * @returns {Promise<Object>}
   */
  async parseUrl(url) {
    try {
      const output = await this.execCommand('yt-dlp', [
        '--dump-json',
        '--no-download',
        url
      ]);

      const metadata = JSON.parse(output);
      return {
        id: metadata.id,
        title: metadata.title,
        description: metadata.description,
        duration: metadata.duration,
        uploader: metadata.uploader,
        uploadDate: metadata.upload_date,
        thumbnail: metadata.thumbnail,
        webpageUrl: metadata.webpage_url,
        extractor: metadata.extractor,
        formats: metadata.formats?.map(f => ({
          formatId: f.format_id,
          ext: f.ext,
          resolution: f.resolution,
          fps: f.fps
        })) || []
      };
    } catch (error) {
      throw new Error(`Failed to parse URL: ${error.message}`);
    }
  }

  /**
   * 下载视频
   * @param {string} url - 视频 URL
   * @param {Object} options - 选项
   * @returns {Promise<string>} 下载的文件路径
   */
  async downloadVideo(url, options = {}) {
    const videoId = await this.getVideoId(url);
    const outputPath = path.join(this.config.outputDir, 'downloads', `${videoId}.mp4`);

    const format = options.quality === 'best' ? 'best' : 
                   options.quality === 'audio' ? 'bestaudio' : 
                   `best[height<=${this.config.videoQuality.replace('p', '')}]`;

    try {
      await this.execCommand('yt-dlp', [
        '-f', format,
        '--max-filesize', this.config.maxFileSize,
        '-o', outputPath,
        url
      ]);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }

  /**
   * 下载音频
   * @param {string} url - 视频 URL
   * @returns {Promise<string>} 音频文件路径
   */
  async downloadAudio(url) {
    const videoId = await this.getVideoId(url);
    const outputPath = path.join(this.config.outputDir, 'audio', `${videoId}.mp3`);

    try {
      await this.execCommand('yt-dlp', [
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', this.config.audioQuality,
        '-o', outputPath,
        url
      ]);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to download audio: ${error.message}`);
    }
  }

  /**
   * 提取字幕
   * @param {string} url - 视频 URL
   * @param {Object} options - 选项
   * @returns {Promise<Object>}
   */
  async extractSubtitles(url, options = {}) {
    const videoId = await this.getVideoId(url);
    const subtitleDir = path.join(this.config.outputDir, 'subtitles');
    const outputPath = path.join(subtitleDir, `${videoId}`);

    const lang = options.language || this.config.language;

    try {
      // 尝试下载自动生成的字幕
      await this.execCommand('yt-dlp', [
        '--write-auto-sub',
        '--sub-langs', lang,
        '--skip-download',
        '-o', outputPath,
        url
      ]).catch(() => {});

      // 检查是否有字幕文件生成
      const files = await fs.readdir(subtitleDir);
      const subtitleFile = files.find(f => f.startsWith(videoId) && f.endsWith('.vtt'));

      if (subtitleFile) {
        const content = await fs.readFile(path.join(subtitleDir, subtitleFile), 'utf-8');
        return {
          type: 'auto',
          language: lang,
          content: this.parseVTT(content),
          rawContent: content,
          filePath: path.join(subtitleDir, subtitleFile)
        };
      }

      // 如果没有自动字幕，尝试手动字幕
      await this.execCommand('yt-dlp', [
        '--write-sub',
        '--sub-langs', lang,
        '--skip-download',
        '-o', outputPath,
        url
      ]).catch(() => {});

      const manualFiles = await fs.readdir(subtitleDir);
      const manualSubtitleFile = manualFiles.find(f => f.startsWith(videoId) && f.endsWith('.vtt'));

      if (manualSubtitleFile) {
        const content = await fs.readFile(path.join(subtitleDir, manualSubtitleFile), 'utf-8');
        return {
          type: 'manual',
          language: lang,
          content: this.parseVTT(content),
          rawContent: content,
          filePath: path.join(subtitleDir, manualSubtitleFile)
        };
      }

      return { type: 'none', message: 'No subtitles available' };
    } catch (error) {
      return { type: 'none', message: error.message };
    }
  }

  /**
   * 解析 VTT 字幕
   * @param {string} vttContent - VTT 内容
   * @returns {Array}
   */
  parseVTT(vttContent) {
    const lines = vttContent.split('\n');
    const subtitles = [];
    let current = null;

    for (const line of lines) {
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
      
      if (timeMatch) {
        if (current) subtitles.push(current);
        current = {
          start: timeMatch[1],
          end: timeMatch[2],
          text: ''
        };
      } else if (current && line.trim() && !line.startsWith('WEBVTT') && !line.startsWith('NOTE')) {
        current.text += (current.text ? ' ' : '') + line.trim();
      }
    }

    if (current) subtitles.push(current);
    return subtitles;
  }

  /**
   * 使用 Whisper 转录音频
   * @param {string} url - 视频 URL
   * @param {Object} options - 选项
   * @returns {Promise<Object>}
   */
  async transcribe(url, options = {}) {
    const videoId = await this.getVideoId(url);
    const transcriptPath = path.join(this.config.outputDir, 'transcripts', `${videoId}.txt`);

    try {
      // 先下载音频
      const audioPath = await this.downloadAudio(url);

      // 使用 Whisper 转录
      const model = options.model || this.config.whisperModel;
      const language = options.language || this.config.language;

      const outputDir = path.join(this.config.outputDir, 'transcripts');
      
      await this.execCommand('whisper', [
        audioPath,
        '--model', model,
        '--language', language,
        '--output_dir', outputDir,
        '--output_format', 'txt'
      ]);

      // 读取转录结果
      const transcriptFile = path.join(outputDir, `${path.basename(audioPath, '.mp3')}.txt`);
      const content = await fs.readFile(transcriptFile, 'utf-8');

      // 清理临时文件
      if (!this.config.keepFiles) {
        await fs.unlink(audioPath).catch(() => {});
      }

      return {
        text: content,
        model,
        language,
        wordCount: content.split(/\s+/).length,
        filePath: transcriptFile
      };
    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * 提取关键帧
   * @param {string} url - 视频 URL
   * @param {Object} options - 选项
   * @returns {Promise<Array>}
   */
  async extractFrames(url, options = {}) {
    const videoId = await this.getVideoId(url);
    const framesDir = path.join(this.config.outputDir, 'frames', videoId);
    await fs.mkdir(framesDir, { recursive: true });

    const interval = options.interval || 10;

    try {
      // 先下载视频
      const videoPath = await this.downloadVideo(url, { quality: '720p' });

      // 使用 ffmpeg 提取关键帧
      await this.execCommand('ffmpeg', [
        '-i', videoPath,
        '-vf', `fps=1/${interval},scale=1280:-1`,
        '-q:v', '2',
        path.join(framesDir, 'frame_%04d.jpg')
      ]);

      // 获取生成的帧列表
      const files = await fs.readdir(framesDir);
      const frames = files
        .filter(f => f.endsWith('.jpg'))
        .sort()
        .map((f, i) => ({
          index: i + 1,
          timestamp: i * interval,
          filePath: path.join(framesDir, f)
        }));

      // 清理临时文件
      if (!this.config.keepFiles) {
        await fs.unlink(videoPath).catch(() => {});
      }

      return {
        total: frames.length,
        interval,
        frames,
        directory: framesDir
      };
    } catch (error) {
      throw new Error(`Frame extraction failed: ${error.message}`);
    }
  }

  /**
   * 获取视频 ID
   * @param {string} url - 视频 URL
   * @returns {Promise<string>}
   */
  async getVideoId(url) {
    try {
      const output = await this.execCommand('yt-dlp', [
        '--print', 'id',
        '--no-download',
        url
      ]);
      return output.trim();
    } catch (error) {
      // 如果 yt-dlp 失败，使用 URL hash
      return Buffer.from(url).toString('base64').substring(0, 12);
    }
  }

  /**
   * 分析视频内容
   * @param {string} url - 视频 URL
   * @param {Object} options - 选项
   * @returns {Promise<Object>}
   */
  async analyze(url, options = {}) {
    const metadata = await this.parseUrl(url);
    const result = {
      metadata,
      subtitles: null,
      transcript: null,
      frames: null
    };

    // 并行提取字幕、转录和关键帧
    const tasks = [];

    if (options.subtitles !== false) {
      tasks.push(
        this.extractSubtitles(url, options)
          .then(subs => { result.subtitles = subs; })
          .catch(() => { result.subtitles = null; })
      );
    }

    if (options.transcribe) {
      tasks.push(
        this.transcribe(url, options)
          .then(trans => { result.transcript = trans; })
          .catch(() => { result.transcript = null; })
      );
    }

    if (options.frames) {
      tasks.push(
        this.extractFrames(url, options)
          .then(frames => { result.frames = frames; })
          .catch(() => { result.frames = null; })
      );
    }

    await Promise.all(tasks);

    return result;
  }

  /**
   * 生成视频摘要
   * @param {string} url - 视频 URL
   * @param {Object} options - 选项
   * @returns {Promise<Object>}
   */
  async summarize(url, options = {}) {
    const analysis = await this.analyze(url, { 
      subtitles: true, 
      transcribe: true,
      ...options 
    });

    const content = analysis.subtitles?.content || [];
    const transcript = analysis.transcript?.text || '';

    // 合并字幕文本
    const fullText = content.map(c => c.text).join(' ') || transcript;

    // 简单摘要：提取前 N 个句子
    const sentences = fullText.match(/[^.!?。！？]+[.!?。！？]+/g) || [];
    const summaryLength = options.summaryLength || 5;
    const summary = sentences.slice(0, summaryLength).join(' ');

    // 提取关键词（简单实现：高频词）
    const words = fullText.toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    const wordFreq = {};
    words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    
    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return {
      title: analysis.metadata.title,
      duration: analysis.metadata.duration,
      summary,
      keywords,
      transcriptLength: fullText.length,
      wordCount: words.length,
      hasSubtitles: !!analysis.subtitles?.content?.length,
      hasTranscript: !!analysis.transcript?.text
    };
  }

  /**
   * 清理临时文件
   */
  async cleanup() {
    if (!this.config.keepFiles) {
      const dirs = ['downloads', 'audio', 'frames', 'subtitles', 'transcripts'];
      for (const dir of dirs) {
        const dirPath = path.join(this.config.outputDir, dir);
        try {
          const files = await fs.readdir(dirPath);
          for (const file of files) {
            await fs.rm(path.join(dirPath, file), { recursive: true }).catch(() => {});
          }
        } catch (e) {
          // 忽略错误
        }
      }
    }
  }
}

export default VideoAgent;
