# Voice Transcriber - Audio to Text
# 小七团队开发
# 语音转文字服务

import sqlite3
from datetime import datetime
from typing import Optional, Dict, List
from dataclasses import dataclass
from enum import Enum
import os

class TranscriptionStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class TranscriptionJob:
    id: Optional[int]
    filename: str
    status: TranscriptionStatus
    language: str = "auto"
    result_text: Optional[str] = None
    duration: Optional[float] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None

class VoiceTranscriber:
    """语音转文字服务"""
    
    SUPPORTED_LANGUAGES = {
        'auto': '自动检测',
        'zh': '中文',
        'en': 'English',
        'ja': '日本語',
        'ko': '한국어',
        'es': 'Español',
        'fr': 'Français',
        'de': 'Deutsch'
    }
    
    def __init__(self, db_path: str = "transcriptions.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transcriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                language TEXT DEFAULT 'auto',
                result_text TEXT,
                duration REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def submit_job(self, filename: str, language: str = "auto") -> int:
        """提交转录任务"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO transcriptions (filename, language, status)
            VALUES (?, ?, ?)
        ''', (filename, language, TranscriptionStatus.PENDING.value))
        
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # 异步处理
        self._process_job(job_id)
        
        return job_id
    
    def _process_job(self, job_id: int):
        """处理转录任务"""
        # 这里应该调用实际的语音识别API
        # 例如: OpenAI Whisper, Google Speech-to-Text, AWS Transcribe
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 更新状态
        cursor.execute('''
            UPDATE transcriptions 
            SET status = ? WHERE id = ?
        ''', (TranscriptionStatus.PROCESSING.value, job_id))
        conn.commit()
        
        # 模拟处理
        import time
        time.sleep(2)
        
        # 模拟结果
        mock_result = "这是转录的示例文本。在实际应用中，这里会是语音识别API的真实输出。"
        mock_duration = 120.5  # 秒
        
        cursor.execute('''
            UPDATE transcriptions 
            SET status = ?, result_text = ?, duration = ?, completed_at = ?
            WHERE id = ?
        ''', (
            TranscriptionStatus.COMPLETED.value,
            mock_result,
            mock_duration,
            datetime.now().isoformat(),
            job_id
        ))
        
        conn.commit()
        conn.close()
    
    def get_result(self, job_id: int) -> Optional[Dict]:
        """获取转录结果"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM transcriptions WHERE id = ?', (job_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return {
            'id': row[0],
            'filename': row[1],
            'status': row[2],
            'language': row[3],
            'result_text': row[4],
            'duration': row[5],
            'created_at': row[6],
            'completed_at': row[7]
        }
    
    def get_user_jobs(self, limit: int = 20) -> List[Dict]:
        """获取用户任务列表"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM transcriptions 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (limit,))
        
        jobs = []
        for row in cursor.fetchall():
            jobs.append({
                'id': row[0],
                'filename': row[1],
                'status': row[2],
                'language': row[3],
                'duration': row[5],
                'created_at': row[6],
                'completed_at': row[7]
            })
        
        conn.close()
        return jobs
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM transcriptions")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM transcriptions WHERE status = 'completed'")
        completed = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM transcriptions WHERE status = 'failed'")
        failed = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(duration) FROM transcriptions WHERE status = 'completed'")
        total_duration = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_jobs': total,
            'completed': completed,
            'failed': failed,
            'total_hours': total_duration / 3600
        }
    
    def export_transcription(self, job_id: int, format: str = "txt") -> str:
        """导出转录结果"""
        result = self.get_result(job_id)
        
        if not result or not result['result_text']:
            return ""
        
        if format == "txt":
            return result['result_text']
        
        elif format == "srt":
            # 生成SRT字幕格式
            lines = result['result_text'].split('。')
            srt = ""
            for i, line in enumerate(lines, 1):
                if line.strip():
                    start_time = self._seconds_to_srt_time((i-1) * 5)
                    end_time = self._seconds_to_srt_time(i * 5)
                    srt += f"{i}\n{start_time} --> {end_time}\n{line.strip()}\n\n"
            return srt
        
        elif format == "vtt":
            # 生成VTT格式
            lines = result['result_text'].split('。')
            vtt = "WEBVTT\n\n"
            for i, line in enumerate(lines, 1):
                if line.strip():
                    start_time = self._seconds_to_vtt_time((i-1) * 5)
                    end_time = self._seconds_to_vtt_time(i * 5)
                    vtt += f"{start_time} --> {end_time}\n{line.strip()}\n\n"
            return vtt
        
        return result['result_text']
    
    def _seconds_to_srt_time(self, seconds: float) -> str:
        """转换为SRT时间格式"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
    
    def _seconds_to_vtt_time(self, seconds: float) -> str:
        """转换为VTT时间格式"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

# 定价
PRICING = {
    'free': {
        'minutes_per_month': 30,
        'max_file_size': '10MB',
        'features': ['标准质量', '基础导出']
    },
    'starter': {
        'price': 9,
        'minutes_per_month': 120,
        'max_file_size': '100MB',
        'features': ['高质量', '所有格式导出', '字幕生成']
    },
    'pro': {
        'price': 29,
        'minutes_per_month': 600,
        'max_file_size': '500MB',
        'features': ['最高质量', 'API访问', '批量处理', '优先队列']
    },
    'business': {
        'price': 99,
        'minutes_per_month': 3000,
        'max_file_size': '2GB',
        'features': ['无限并发', '团队协作', '自定义词汇', 'SLA']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 40,
        'pro': 15,
        'business': 2
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['business'] * PRICING['business']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    transcriber = VoiceTranscriber()
    
    # 提交示例任务
    job_id = transcriber.submit_job("meeting_recording.mp3", language="zh")
    print(f"✅ 转录任务已提交: ID {job_id}")
    
    # 获取结果
    result = transcriber.get_result(job_id)
    if result:
        print(f"状态: {result['status']}")
        if result['result_text']:
            print(f"结果: {result['result_text'][:50]}...")
    
    # 统计
    stats = transcriber.get_statistics()
    print(f"\n总任务: {stats['total_jobs']}")
    print(f"已完成: {stats['completed']}小时")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
