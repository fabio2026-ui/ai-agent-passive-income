# AI Chatbot - Customer Support Bot
# 小七团队开发
# 智能客服聊天机器人

import json
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

class MessageType(Enum):
    TEXT = "text"
    IMAGE = "image"
    QUICK_REPLY = "quick_reply"
    CARD = "card"
    TYPING = "typing"

@dataclass
class Conversation:
    id: str
    user_id: str
    messages: List[Dict]
    context: Dict
    created_at: datetime
    last_activity: datetime

class CustomerSupportBot:
    """智能客服机器人"""
    
    def __init__(self):
        self.knowledge_base = self.load_knowledge()
        self.conversations = {}
        
    def load_knowledge(self) -> Dict:
        """加载知识库"""
        return {
            'greetings': {
                'patterns': ['hi', 'hello', 'hey', '你好', '您好'],
                'responses': [
                    'Hello! How can I help you today?',
                    'Hi there! What can I do for you?',
                    '你好！有什么可以帮助您的吗？'
                ]
            },
            'pricing': {
                'patterns': ['price', 'cost', 'pricing', '多少钱', '价格'],
                'responses': [
                    'We offer flexible pricing plans:\n\n🚀 Starter: €9/month\n⭐ Pro: €29/month\n🏢 Enterprise: €99/month\n\nWould you like to know more about any plan?',
                    '我们的定价方案：\n\n入门版 €9/月\n专业版 €29/月\n企业版 €99/月'
                ],
                'follow_up': ['features', 'trial', 'compare']
            },
            'features': {
                'patterns': ['feature', 'what can', 'function', '功能'],
                'responses': [
                    'Our platform includes:\n\n✅ Unlimited projects\n✅ Team collaboration\n✅ API access\n✅ Priority support\n✅ Custom integrations\n\nWhich feature interests you most?'
                ]
            },
            'support': {
                'patterns': ['help', 'support', 'issue', 'problem', 'bug', '帮助', '问题'],
                'responses': [
                    'I\'m here to help! Could you describe the issue you\'re experiencing?',
                    '我来帮您！请描述一下您遇到的问题。'
                ],
                'action': 'create_ticket'
            },
            'trial': {
                'patterns': ['trial', 'free', 'demo', '试用', '免费'],
                'responses': [
                    'Great news! We offer a 14-day free trial with full access to all Pro features.\n\nNo credit card required! Would you like to start your trial?',
                    '我们提供14天免费试用，无需信用卡即可体验全部功能！'
                ],
                'action': 'start_trial'
            },
            'contact': {
                'patterns': ['contact', 'email', 'phone', 'human', 'agent', '联系', '人工'],
                'responses': [
                    'I can connect you with our support team.\n\n📧 Email: support@company.com\n💬 Live chat: Available 9am-6pm EST\n📞 Phone: +1-800-123-4567',
                    '我可以为您转接人工客服。\n\n邮箱: support@company.com\n在线客服: 9:00-18:00'
                ],
                'action': 'transfer_to_human'
            },
            'goodbye': {
                'patterns': ['bye', 'goodbye', 'thanks', 'thank you', '再见', '谢谢'],
                'responses': [
                    'You\'re welcome! Have a great day! 👋',
                    '不客气！祝您有美好的一天！👋',
                    'Thanks for chatting! Feel free to return anytime. 😊'
                ]
            }
        }
    
    def process_message(self, user_id: str, message: str) -> Dict:
        """处理用户消息"""
        # 获取或创建对话
        conversation = self.get_conversation(user_id)
        
        # 添加到历史
        conversation['messages'].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # 分析意图
        intent = self.detect_intent(message)
        
        # 生成响应
        response = self.generate_response(intent, message, conversation)
        
        # 添加到历史
        conversation['messages'].append({
            'role': 'bot',
            'content': response['text'],
            'timestamp': datetime.now().isoformat()
        })
        
        conversation['last_activity'] = datetime.now()
        
        return response
    
    def get_conversation(self, user_id: str) -> Dict:
        """获取对话"""
        if user_id not in self.conversations:
            self.conversations[user_id] = {
                'id': f"conv_{user_id}_{datetime.now().timestamp()}",
                'user_id': user_id,
                'messages': [],
                'context': {},
                'created_at': datetime.now(),
                'last_activity': datetime.now()
            }
        return self.conversations[user_id]
    
    def detect_intent(self, message: str) -> str:
        """检测用户意图"""
        message_lower = message.lower()
        
        for intent, data in self.knowledge_base.items():
            for pattern in data.get('patterns', []):
                if pattern.lower() in message_lower:
                    return intent
        
        return 'unknown'
    
    def generate_response(self, intent: str, message: str, conversation: Dict) -> Dict:
        """生成响应"""
        if intent == 'unknown':
            return {
                'text': 'I\'m not sure I understand. Could you rephrase that? Or choose from these options:',
                'quick_replies': ['Pricing', 'Features', 'Support', 'Start Trial'],
                'type': MessageType.QUICK_REPLY
            }
        
        knowledge = self.knowledge_base.get(intent, {})
        responses = knowledge.get('responses', ['I see. Tell me more.'])
        
        # 选择响应（简单轮询）
        response_text = responses[len(conversation['messages']) % len(responses)]
        
        result = {
            'text': response_text,
            'type': MessageType.TEXT,
            'intent': intent
        }
        
        # 添加快捷回复
        if 'follow_up' in knowledge:
            result['quick_replies'] = [f.capitalize() for f in knowledge['follow_up']]
            result['type'] = MessageType.QUICK_REPLY
        
        # 添加行动
        if 'action' in knowledge:
            result['action'] = knowledge['action']
        
        return result
    
    def handoff_to_human(self, conversation_id: str) -> bool:
        """转接人工"""
        # 标记对话需要人工处理
        for user_id, conv in self.conversations.items():
            if conv['id'] == conversation_id:
                conv['needs_human'] = True
                conv['handoff_time'] = datetime.now()
                return True
        return False
    
    def get_analytics(self) -> Dict:
        """获取机器人统计"""
        total_conversations = len(self.conversations)
        total_messages = sum(len(c['messages']) for c in self.conversations.values())
        
        # 意图分布
        intent_counts = {}
        for conv in self.conversations.values():
            for msg in conv['messages']:
                if msg['role'] == 'user':
                    intent = self.detect_intent(msg['content'])
                    intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        # 需要人工的对话
        human_handoffs = sum(1 for c in self.conversations.values() if c.get('needs_human'))
        
        return {
            'total_conversations': total_conversations,
            'total_messages': total_messages,
            'avg_messages_per_conversation': total_messages / total_conversations if total_conversations > 0 else 0,
            'intent_distribution': intent_counts,
            'human_handoffs': human_handoffs,
            'resolution_rate': (total_conversations - human_handoffs) / total_conversations if total_conversations > 0 else 0
        }

# 定价
PRICING = {
    'free': {
        'conversations': 100,
        'features': ['基础问答', '知识库', '标准响应']
    },
    'starter': {
        'price': 19,
        'conversations': 1000,
        'features': ['自定义知识库', '对话历史', '基础分析']
    },
    'growth': {
        'price': 49,
        'conversations': 10000,
        'features': ['AI增强', '多渠道', '高级分析', '人工接管']
    },
    'enterprise': {
        'price': 199,
        'conversations': 100000,
        'features': ['定制AI模型', 'SSO', 'SLA', '专属客服']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 25,
        'growth': 12,
        'enterprise': 3
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['growth'] * PRICING['growth']['price'] +
        monthly_users['enterprise'] * PRICING['enterprise']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    bot = CustomerSupportBot()
    
    # 测试对话
    test_messages = [
        'Hello',
        'How much does it cost?',
        'What features do you have?',
        'I want to try it',
        'Thanks, bye!'
    ]
    
    user_id = 'test_user_123'
    
    for msg in test_messages:
        response = bot.process_message(user_id, msg)
        print(f"\nUser: {msg}")
        print(f"Bot: {response['text']}")
    
    # 统计
    analytics = bot.get_analytics()
    print(f"\n📊 对话统计:")
    print(f"总对话: {analytics['total_conversations']}")
    print(f"总消息: {analytics['total_messages']}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
