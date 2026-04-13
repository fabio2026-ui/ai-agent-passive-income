# Notion Templates - Startup OS
# 初创公司运营系统
# 小七团队开发

NOTION_TEMPLATES = {
    'startup_os': {
        'name': 'Startup OS',
        'description': 'All-in-one startup management system',
        'pages': [
            {
                'name': '🎯 Company Home',
                'type': 'page',
                'content': '''
                # Company Dashboard
                
                ## Quick Links
                - [Mission & Vision](Mission)
                - [Team Directory](Team)
                - [Weekly Goals](Goals)
                - [Product Roadmap](Roadmap)
                
                ## Key Metrics
                | Metric | Target | Current | Status |
                |--------|--------|---------|--------|
                | MRR | $10K | $5K | 🟡 |
                | Users | 1000 | 650 | 🟢 |
                | Churn | <5% | 3% | 🟢 |
                | NPS | >50 | 45 | 🟡 |
                
                ## This Week's Focus
                1. Launch feature X
                2. Close 3 enterprise deals
                3. Hire senior developer
                ''',
                'databases': []
            },
            {
                'name': '📋 Product Roadmap',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Name', 'type': 'title'},
                        {'name': 'Status', 'type': 'select', 'options': ['Backlog', 'In Progress', 'Review', 'Done']},
                        {'name': 'Priority', 'type': 'select', 'options': ['P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low']},
                        {'name': 'Type', 'type': 'select', 'options': ['Feature', 'Bug', 'Improvement', 'Tech Debt']},
                        {'name': 'Assignee', 'type': 'people'},
                        {'name': 'Sprint', 'type': 'relation'},
                        {'name': 'Due Date', 'type': 'date'},
                        {'name': 'Effort', 'type': 'select', 'options': ['XS', 'S', 'M', 'L', 'XL']},
                        {'name': 'Impact', 'type': 'select', 'options': ['Low', 'Medium', 'High']},
                    ]
                },
                'views': ['Board', 'Table', 'Calendar', 'Timeline']
            },
            {
                'name': '👥 Team Directory',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Name', 'type': 'title'},
                        {'name': 'Role', 'type': 'select', 'options': ['Founder', 'Engineering', 'Design', 'Marketing', 'Sales', 'Ops']},
                        {'name': 'Department', 'type': 'select', 'options': ['Leadership', 'Product', 'Engineering', 'Growth', 'Operations']},
                        {'name': 'Start Date', 'type': 'date'},
                        {'name': 'Location', 'type': 'select', 'options': ['Remote', 'Office', 'Hybrid']},
                        {'name': 'Status', 'type': 'select', 'options': ['Active', 'On Leave', 'Offboarding']},
                        {'name': 'Manager', 'type': 'relation'},
                        {'name': 'Reports', 'type': 'relation'},
                    ]
                }
            },
            {
                'name': '📊 OKRs',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Objective', 'type': 'title'},
                        {'name': 'Quarter', 'type': 'select', 'options': ['Q1', 'Q2', 'Q3', 'Q4']},
                        {'name': 'Year', 'type': 'select', 'options': ['2024', '2025', '2026']},
                        {'name': 'Owner', 'type': 'people'},
                        {'name': 'Progress', 'type': 'number', 'format': 'percent'},
                        {'name': 'Status', 'type': 'select', 'options': ['On Track', 'At Risk', 'Behind', 'Completed']},
                    ]
                }
            },
            {
                'name': '💰 Financial Tracker',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Description', 'type': 'title'},
                        {'name': 'Type', 'type': 'select', 'options': ['Revenue', 'Expense', 'Investment']},
                        {'name': 'Category', 'type': 'select', 'options': ['Product', 'Marketing', 'Salaries', 'Tools', 'Office', 'Other']},
                        {'name': 'Amount', 'type': 'number', 'format': 'currency'},
                        {'name': 'Date', 'type': 'date'},
                        {'name': 'Status', 'type': 'select', 'options': ['Pending', 'Paid', 'Received']},
                    ]
                }
            },
            {
                'name': '📝 Meeting Notes',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Title', 'type': 'title'},
                        {'name': 'Type', 'type': 'select', 'options': ['1:1', 'Team Standup', 'All Hands', 'Board', 'Client']},
                        {'name': 'Date', 'type': 'date'},
                        {'name': 'Attendees', 'type': 'people'},
                        {'name': 'Action Items', 'type': 'relation'},
                    ]
                }
            },
            {
                'name': '✅ Action Items',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Task', 'type': 'title'},
                        {'name': 'Assignee', 'type': 'people'},
                        {'name': 'Due Date', 'type': 'date'},
                        {'name': 'Priority', 'type': 'select', 'options': ['Urgent', 'High', 'Medium', 'Low']},
                        {'name': 'Status', 'type': 'select', 'options': ['To Do', 'In Progress', 'Blocked', 'Done']},
                        {'name': 'Source', 'type': 'relation'},
                    ]
                }
            },
            {
                'name': '📈 User Research',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Interview Title', 'type': 'title'},
                        {'name': 'User Type', 'type': 'select', 'options': ['Prospect', 'Active User', 'Churned', 'Enterprise']},
                        {'name': 'Date', 'type': 'date'},
                        {'name': 'Interviewer', 'type': 'people'},
                        {'name': 'Key Insights', 'type': 'rich_text'},
                        {'name': 'Pain Points', 'type': 'multi_select'},
                        {'name': 'Feature Requests', 'type': 'relation'},
                    ]
                }
            },
            {
                'name': '🐛 Bug Tracker',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Bug Description', 'type': 'title'},
                        {'name': 'Severity', 'type': 'select', 'options': ['Critical', 'High', 'Medium', 'Low']},
                        {'name': 'Status', 'type': 'select', 'options': ['Reported', 'Investigating', 'In Progress', 'Testing', 'Resolved']},
                        {'name': 'Reporter', 'type': 'people'},
                        {'name': 'Assignee', 'type': 'people'},
                        {'name': 'Environment', 'type': 'select', 'options': ['Production', 'Staging', 'Development']},
                        {'name': 'Reported Date', 'type': 'date'},
                        {'name': 'Resolved Date', 'type': 'date'},
                    ]
                }
            },
            {
                'name': '📣 Content Calendar',
                'type': 'database',
                'schema': {
                    'properties': [
                        {'name': 'Title', 'type': 'title'},
                        {'name': 'Type', 'type': 'select', 'options': ['Blog', 'Social', 'Email', 'Video', 'Podcast']},
                        {'name': 'Platform', 'type': 'multi_select', 'options': ['Twitter', 'LinkedIn', 'Blog', 'YouTube', 'Newsletter']},
                        {'name': 'Status', 'type': 'select', 'options': ['Idea', 'Drafting', 'Review', 'Scheduled', 'Published']},
                        {'name': 'Publish Date', 'type': 'date'},
                        {'name': 'Author', 'type': 'people'},
                        {'name': 'Performance', 'type': 'rich_text'},
                    ]
                }
            }
        ]
    }
}

# 定价
PRICING = {
    'starter': {
        'price': 19,
        'templates': ['Startup OS Basic'],
        'support': 'Email'
    },
    'complete': {
        'price': 49,
        'templates': ['Startup OS Pro', 'Sales CRM', 'Content Calendar', 'Finance Tracker'],
        'support': 'Priority + Video Tutorial'
    },
    'agency': {
        'price': 199,
        'templates': 'All Templates + Custom Build',
        'support': '1:1 Setup Call'
    }
}

# 收入预测
def calculate_revenue():
    monthly_sales = {
        'starter': 40,
        'complete': 25,
        'agency': 3
    }
    
    monthly = sum(monthly_sales[tier] * PRICING[tier]['price'] for tier in monthly_sales)
    return {
        'monthly': monthly,
        'yearly': monthly * 12
    }

if __name__ == '__main__':
    print("📊 Notion Templates - Startup OS")
    print(f"模板包含: 10个数据库 + 完整页面结构")
    
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
