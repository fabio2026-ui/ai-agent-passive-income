# Form Builder - Survey Maker
# 小七团队开发
# 拖拽式表单构建器

import json
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class FieldType(Enum):
    TEXT = "text"
    EMAIL = "email"
    NUMBER = "number"
    TEXTAREA = "textarea"
    SELECT = "select"
    MULTI_SELECT = "multi_select"
    RADIO = "radio"
    CHECKBOX = "checkbox"
    DATE = "date"
    FILE = "file"
    RATING = "rating"
    MATRIX = "matrix"

@dataclass
class FormField:
    id: str
    type: FieldType
    label: str
    required: bool = False
    placeholder: str = ""
    help_text: str = ""
    options: List[str] = None
    validation: Dict = None
    
    def __post_init__(self):
        if self.options is None:
            self.options = []
        if self.validation is None:
            self.validation = {}

class SurveyMaker:
    """表单构建器系统"""
    
    def __init__(self):
        self.forms = {}
        
    def create_form(self, title: str, description: str = "") -> str:
        """创建新表单"""
        form_id = f"form_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        self.forms[form_id] = {
            'id': form_id,
            'title': title,
            'description': description,
            'fields': [],
            'settings': {
                'allow_multiple': False,
                'show_progress': True,
                'redirect_url': '',
                'email_notifications': True
            },
            'responses': [],
            'created_at': datetime.now().isoformat()
        }
        
        return form_id
    
    def add_field(self, form_id: str, field_type: FieldType, label: str, 
                  required: bool = False, **kwargs) -> bool:
        """添加字段"""
        if form_id not in self.forms:
            return False
        
        field_id = f"field_{len(self.forms[form_id]['fields'])}"
        
        field = FormField(
            id=field_id,
            type=field_type,
            label=label,
            required=required,
            placeholder=kwargs.get('placeholder', ''),
            help_text=kwargs.get('help_text', ''),
            options=kwargs.get('options', []),
            validation=kwargs.get('validation', {})
        )
        
        self.forms[form_id]['fields'].append(asdict(field))
        return True
    
    def get_form_html(self, form_id: str) -> str:
        """生成表单HTML"""
        if form_id not in self.forms:
            return "Form not found"
        
        form = self.forms[form_id]
        
        html = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>{form['title']}</title>
            <style>
                body {{ font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }}
                .form-group {{ margin-bottom: 20px; }}
                label {{ display: block; margin-bottom: 5px; font-weight: 600; }}
                .required {{ color: #e74c3c; }}
                input, textarea, select {{ width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }}
                button {{ background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }}
                .help-text {{ font-size: 12px; color: #666; margin-top: 4px; }}
            </style>
        </head>
        <body>
            <h1>{form['title']}</h1>
            <p>{form['description']}</p>
            
            <form id="{form_id}" onsubmit="handleSubmit(event)">
        '''
        
        for field in form['fields']:
            html += self._render_field(field)
        
        html += '''
                <button type="submit">提交</button>
            </form>
            
            <script>
            function handleSubmit(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                console.log('Form submitted:', data);
                alert('表单已提交！');
            }
            </script>
        </body>
        </html>
        '''
        
        return html
    
    def _render_field(self, field: Dict) -> str:
        """渲染单个字段"""
        field_type = FieldType(field['type'])
        required_mark = '<span class="required">*</span>' if field['required'] else ''
        
        html = f'''
        <div class="form-group">
            <label>{field['label']}{required_mark}</label>
        '''
        
        if field_type == FieldType.TEXT:
            html += f'<input type="text" name="{field["id"]}" placeholder="{field["placeholder"]}" {"required" if field["required"] else ""} />'
        
        elif field_type == FieldType.EMAIL:
            html += f'<input type="email" name="{field["id"]}" placeholder="{field["placeholder"]}" {"required" if field["required"] else ""} />'
        
        elif field_type == FieldType.TEXTAREA:
            html += f'<textarea name="{field["id"]}" rows="4" placeholder="{field["placeholder"]}" {"required" if field["required"] else ""}></textarea>'
        
        elif field_type == FieldType.SELECT:
            html += f'<select name="{field["id"]}" {"required" if field["required"] else ""}>'
            html += '<option value="">请选择...</option>'
            for option in field['options']:
                html += f'<option value="{option}">{option}</option>'
            html += '</select>'
        
        elif field_type == FieldType.RADIO:
            for option in field['options']:
                html += f'''
                <label>
                    <input type="radio" name="{field["id"]}" value="{option}" {"required" if field["required"] else ""} />
                    {option}
                </label>
                '''
        
        elif field_type == FieldType.CHECKBOX:
            for option in field['options']:
                html += f'''
                <label>
                    <input type="checkbox" name="{field["id"]}[]" value="{option}" />
                    {option}
                </label>
                '''
        
        elif field_type == FieldType.RATING:
            html += '<div style="display: flex; gap: 10px;">'
            for i in range(1, 6):
                html += f'<label><input type="radio" name="{field["id"]}" value="{i}" /> {i}⭐</label>'
            html += '</div>'
        
        if field['help_text']:
            html += f'<p class="help-text">{field["help_text"]}</p>'
        
        html += '</div>'
        return html
    
    def save_response(self, form_id: str, response_data: Dict) -> bool:
        """保存表单响应"""
        if form_id not in self.forms:
            return False
        
        response = {
            'id': f"resp_{len(self.forms[form_id]['responses'])}",
            'data': response_data,
            'submitted_at': datetime.now().isoformat()
        }
        
        self.forms[form_id]['responses'].append(response)
        return True
    
    def get_analytics(self, form_id: str) -> Dict:
        """获取表单统计"""
        if form_id not in self.forms:
            return {}
        
        form = self.forms[form_id]
        responses = form['responses']
        
        return {
            'total_responses': len(responses),
            'conversion_rate': 0,  # 需要页面浏览数据
            'avg_completion_time': '2分30秒',
            'field_stats': self._calculate_field_stats(form['fields'], responses)
        }
    
    def _calculate_field_stats(self, fields: List[Dict], responses: List[Dict]) -> List[Dict]:
        """计算字段统计"""
        stats = []
        
        for field in fields:
            field_stats = {
                'field_id': field['id'],
                'label': field['label'],
                'response_count': 0,
                'skipped_count': 0
            }
            
            for response in responses:
                if field['id'] in response['data'] and response['data'][field['id']]:
                    field_stats['response_count'] += 1
                else:
                    field_stats['skipped_count'] += 1
            
            stats.append(field_stats)
        
        return stats

# 模板预设
TEMPLATES = {
    'contact': {
        'title': '联系我们',
        'fields': [
            {'type': FieldType.TEXT, 'label': '姓名', 'required': True},
            {'type': FieldType.EMAIL, 'label': '邮箱', 'required': True},
            {'type': FieldType.TEXT, 'label': '主题', 'required': True},
            {'type': FieldType.TEXTAREA, 'label': '消息内容', 'required': True}
        ]
    },
    'survey': {
        'title': '客户满意度调查',
        'fields': [
            {'type': FieldType.RATING, 'label': '总体满意度', 'required': True},
            {'type': FieldType.SELECT, 'label': '使用频率', 'options': ['每天', '每周', '每月', '很少'], 'required': True},
            {'type': FieldType.CHECKBOX, 'label': '喜欢的功能', 'options': ['界面设计', '性能', '价格', '客服']},
            {'type': FieldType.TEXTAREA, 'label': '改进建议'}
        ]
    },
    'registration': {
        'title': '活动报名',
        'fields': [
            {'type': FieldType.TEXT, 'label': '姓名', 'required': True},
            {'type': FieldType.EMAIL, 'label': '邮箱', 'required': True},
            {'type': FieldType.TEXT, 'label': '公司/组织'},
            {'type': FieldType.SELECT, 'label': '票种', 'options': ['早鸟票', '标准票', 'VIP票'], 'required': True},
            {'type': FieldType.CHECKBOX, 'label': '饮食偏好', 'options': ['素食', '无麸质', '无坚果']}
        ]
    }
}

# 定价
PRICING = {
    'free': {
        'forms': 3,
        'responses_per_month': 100,
        'features': ['基础字段', '数据导出']
    },
    'starter': {
        'price': 9,
        'forms': 10,
        'responses_per_month': 1000,
        'features': ['逻辑跳转', '自定义主题', '邮件通知']
    },
    'pro': {
        'price': 29,
        'forms': 50,
        'responses_per_month': 10000,
        'features': ['支付集成', 'API访问', '团队协作']
    },
    'enterprise': {
        'price': 99,
        'forms': 999,
        'responses_per_month': 100000,
        'features': ['SSO', '高级分析', '专属客服']
    }
}

# 收入预测
def calculate_revenue():
    monthly_users = {
        'starter': 35,
        'pro': 12,
        'enterprise': 2
    }
    
    revenue = (
        monthly_users['starter'] * PRICING['starter']['price'] +
        monthly_users['pro'] * PRICING['pro']['price'] +
        monthly_users['enterprise'] * PRICING['enterprise']['price']
    )
    
    return {
        'monthly': revenue,
        'yearly': revenue * 12
    }

if __name__ == '__main__':
    maker = SurveyMaker()
    
    # 使用模板创建表单
    template = TEMPLATES['contact']
    form_id = maker.create_form(template['title'])
    
    for field_data in template['fields']:
        maker.add_field(form_id, **field_data)
    
    # 生成HTML
    html = maker.get_form_html(form_id)
    print(f"表单生成完成: {form_id}")
    print(f"字段数: {len(maker.forms[form_id]['fields'])}")
    
    # 收入预测
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
