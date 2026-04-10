# Meeting Scheduler - Calendar Assistant
# 小七团队开发
# 会议调度助手

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json

class TimeSlotStatus(Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    TENTATIVE = "tentative"

@dataclass
class TimeSlot:
    start_time: datetime
    end_time: datetime
    status: TimeSlotStatus = TimeSlotStatus.AVAILABLE
    title: str = ""

@dataclass
class Participant:
    id: str
    name: str
    email: str
    timezone: str = "UTC"
    availability: List[TimeSlot] = field(default_factory=list)

@dataclass
class Meeting:
    id: str
    title: str
    description: str
    duration_minutes: int
    organizer: Participant
    participants: List[Participant] = field(default_factory=list)
    proposed_slots: List[TimeSlot] = field(default_factory=list)
    selected_slot: Optional[TimeSlot] = None
    status: str = "draft"  # draft, scheduled, cancelled
    location: str = ""
    video_link: str = ""
    created_at: datetime = field(default_factory=datetime.now)

class MeetingScheduler:
    """会议调度助手"""
    
    def __init__(self):
        self.meetings = {}
        self.participants = {}
        self.default_meeting_types = {
            'quick': {'duration': 15, 'name': '快速会议'},
            'standup': {'duration': 30, 'name': '站会'},
            'regular': {'duration': 60, 'name': '常规会议'},
            'workshop': {'duration': 120, 'name': '工作坊'},
            'interview': {'duration': 45, 'name': '面试'}
        }
    
    def add_participant(self, participant: Participant):
        """添加参与者"""
        self.participants[participant.id] = participant
    
    def create_meeting(self, title: str, organizer: Participant, 
                      duration_minutes: int = 30) -> Meeting:
        """创建会议"""
        meeting_id = f"mtg_{len(self.meetings)}"
        
        meeting = Meeting(
            id=meeting_id,
            title=title,
            description="",
            duration_minutes=duration_minutes,
            organizer=organizer
        )
        
        self.meetings[meeting_id] = meeting
        return meeting
    
    def add_participant_to_meeting(self, meeting_id: str, participant: Participant):
        """添加参与者到会议"""
        if meeting_id in self.meetings:
            self.meetings[meeting_id].participants.append(participant)
    
    def find_common_slots(self, meeting_id: str, 
                         start_date: datetime, 
                         end_date: datetime,
                         slot_duration: int = None) -> List[TimeSlot]:
        """查找共同可用时间"""
        if meeting_id not in self.meetings:
            return []
        
        meeting = self.meetings[meeting_id]
        duration = slot_duration or meeting.duration_minutes
        
        all_participants = [meeting.organizer] + meeting.participants
        
        # 生成候选时间段（9:00-18:00，每30分钟）
        candidate_slots = []
        current = start_date.replace(hour=9, minute=0)
        
        while current < end_date:
            # 跳过周末
            if current.weekday() < 5:
                slot_end = current + timedelta(minutes=duration)
                candidate_slots.append(TimeSlot(current, slot_end))
            
            current += timedelta(minutes=30)
            if current.hour >= 18:
                current = current + timedelta(days=1)
                current = current.replace(hour=9, minute=0)
        
        # 检查所有参与者是否都有空
        available_slots = []
        for slot in candidate_slots:
            if self._is_slot_available_for_all(slot, all_participants):
                available_slots.append(slot)
        
        meeting.proposed_slots = available_slots[:10]  # 只保留前10个
        return available_slots[:10]
    
    def _is_slot_available_for_all(self, slot: TimeSlot, participants: List[Participant]) -> bool:
        """检查时间段是否对所有参与者可用"""
        for participant in participants:
            # 简化逻辑：检查是否与已知忙碌时间冲突
            for busy_slot in participant.availability:
                if busy_slot.status == TimeSlotStatus.BUSY:
                    if (slot.start_time < busy_slot.end_time and 
                        slot.end_time > busy_slot.start_time):
                        return False
        return True
    
    def schedule_meeting(self, meeting_id: str, slot: TimeSlot, 
                        location: str = "", video_link: str = ""):
        """确认会议时间"""
        if meeting_id in self.meetings:
            meeting = self.meetings[meeting_id]
            meeting.selected_slot = slot
            meeting.location = location
            meeting.video_link = video_link
            meeting.status = "scheduled"
            
            # 发送邀请（模拟）
            self._send_invitations(meeting)
    
    def _send_invitations(self, meeting: Meeting):
        """发送会议邀请"""
        print(f"📧 发送会议邀请: {meeting.title}")
        print(f"   时间: {meeting.selected_slot.start_time}")
        print(f"   参与者: {', '.join([p.name for p in meeting.participants])}")
    
    def get_meeting_details(self, meeting_id: str) -> Optional[Dict]:
        """获取会议详情"""
        if meeting_id not in self.meetings:
            return None
        
        meeting = self.meetings[meeting_id]
        return {
            'id': meeting.id,
            'title': meeting.title,
            'description': meeting.description,
            'duration': meeting.duration_minutes,
            'organizer': meeting.organizer.name,
            'participants': [p.name for p in meeting.participants],
            'status': meeting.status,
            'scheduled_time': meeting.selected_slot.start_time.isoformat() if meeting.selected_slot else None,
            'location': meeting.location,
            'video_link': meeting.video_link
        }
    
    def get_upcoming_meetings(self, participant_id: str, days: int = 7) -> List[Dict]:
        """获取即将开始的会议"""
        now = datetime.now()
        end = now + timedelta(days=days)
        
        upcoming = []
        for meeting in self.meetings.values():
            if meeting.status == 'scheduled' and meeting.selected_slot:
                if meeting.selected_slot.start_time >= now and meeting.selected_slot.start_time <= end:
                    # 检查参与者是否在此会议中
                    all_participants = [meeting.organizer] + meeting.participants
                    if any(p.id == participant_id for p in all_participants):
                        upcoming.append(self.get_meeting_details(meeting.id))
        
        return upcoming
    
    def cancel_meeting(self, meeting_id: str):
        """取消会议"""
        if meeting_id in self.meetings:
            self.meetings[meeting_id].status = "cancelled"
            print(f"❌ 会议已取消: {self.meetings[meeting_id].title}")
    
    def reschedule_meeting(self, meeting_id: str, new_slot: TimeSlot):
        """重新安排会议"""
        if meeting_id in self.meetings:
            meeting = self.meetings[meeting_id]
            meeting.selected_slot = new_slot
            print(f"🔄 会议已重新安排: {meeting.title}")
            print(f"   新时间: {new_slot.start_time}")
    
    def get_analytics(self) -> Dict:
        """获取统计信息"""
        total = len(self.meetings)
        scheduled = sum(1 for m in self.meetings.values() if m.status == 'scheduled')
        cancelled = sum(1 for m in self.meetings.values() if m.status == 'cancelled')
        
        total_duration = sum(m.duration_minutes for m in self.meetings.values() 
                           if m.status == 'scheduled')
        
        return {
            'total_meetings': total,
            'scheduled': scheduled,
            'cancelled': cancelled,
            'cancellation_rate': (cancelled / total * 100) if total > 0 else 0,
            'total_meeting_hours': total_duration / 60
        }

# 定价
PRICING = {
    'free': {
        'meetings_per_month': 10,
        'participants_per_meeting': 3,
        'features': ['基础调度', '邮件通知']
    },
    'pro': {
        'price': 8,
        'meetings_per_month': 999,
        'participants_per_meeting': 50,
        'features': ['日历集成', '自动提醒', '时区支持', '分析报告']
    },
    'team': {
        'price': 25,
        'meetings_per_month': 999,
        'participants_per_meeting': 100,
        'team_members': 10,
        'features': ['团队管理', '会议室预订', 'API访问', '优先支持']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'pro': 50,
        'team': 15
    }
    
    revenue = (
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['team'] * PRICING['team']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    scheduler = MeetingScheduler()
    
    # 创建参与者
    organizer = Participant(
        id="u1",
        name="张三",
        email="zhangsan@company.com",
        timezone="Asia/Shanghai"
    )
    
    participant1 = Participant(
        id="u2",
        name="李四",
        email="lisi@company.com",
        timezone="Asia/Shanghai"
    )
    
    scheduler.add_participant(organizer)
    scheduler.add_participant(participant1)
    
    # 创建会议
    meeting = scheduler.create_meeting("产品评审会议", organizer, 60)
    scheduler.add_participant_to_meeting(meeting.id, participant1)
    
    # 查找可用时间
    start = datetime.now()
    end = start + timedelta(days=7)
    slots = scheduler.find_common_slots(meeting.id, start, end)
    
    print(f"✅ 找到 {len(slots)} 个可用时间段")
    if slots:
        # 选择第一个时间段
        scheduler.schedule_meeting(meeting.id, slots[0], video_link="https://meet.xiaoqi.tech/abc123")
        print(f"\n会议已安排: {meeting.title}")
        print(f"时间: {slots[0].start_time}")
    
    # 统计
    analytics = scheduler.get_analytics()
    print(f"\n总会议数: {analytics['total_meetings']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
