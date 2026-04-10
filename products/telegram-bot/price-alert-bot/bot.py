# Telegram Price Alert Bot
# 小七团队开发
# 功能: 商品价格监控提醒

import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, List

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    filters,
    ContextTypes,
    ConversationHandler
)

# 配置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# 状态定义
(SET_NAME, SET_URL, SET_TARGET_PRICE, SET_CHECK_INTERVAL) = range(4)

# 价格监控数据存储 (实际部署应使用数据库)
PRICE_ALERTS_FILE = 'price_alerts.json'
USER_DATA_FILE = 'user_data.json'

# 定价配置
PRICING = {
    'free': {
        'max_alerts': 3,
        'check_interval_hours': 24,
        'name': 'Free'
    },
    'pro': {
        'max_alerts': 50,
        'check_interval_hours': 1,
        'price': 5,  # EUR/month
        'name': 'Pro'
    }
}


class PriceAlertBot:
    def __init__(self, token: str):
        self.token = token
        self.application = Application.builder().token(token).build()
        self._setup_handlers()
        
    def _setup_handlers(self):
        """设置命令处理器"""
        
        # 基础命令
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("help", self.help))
        self.application.add_handler(CommandHandler("pricing", self.pricing))
        self.application.add_handler(CommandHandler("status", self.status))
        self.application.add_handler(CommandHandler("list", self.list_alerts))
        self.application.add_handler(CommandHandler("delete", self.delete_alert))
        
        # 添加监控对话
        add_conv = ConversationHandler(
            entry_points=[CommandHandler("add", self.add_start)],
            states={
                SET_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.set_name)],
                SET_URL: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.set_url)],
                SET_TARGET_PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.set_target_price)],
                SET_CHECK_INTERVAL: [CallbackQueryHandler(self.set_interval)],
            },
            fallbacks=[CommandHandler("cancel", self.cancel)],
        )
        self.application.add_handler(add_conv)
        
        # 回调处理
        self.application.add_handler(CallbackQueryHandler(self.button_callback))
        
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """开始命令"""
        user = update.effective_user
        welcome_msg = f"""
🎯 *Price Alert Bot*

你好 {user.first_name}！

我可以帮你监控商品价格变化，当价格降到目标值时立即通知你。

📱 *免费功能:*
• 最多3个价格监控
• 每24小时检查一次

⭐ *Pro功能 (€5/月):*
• 最多50个监控
• 每小时检查
• 优先通知

使用 /add 开始添加监控
使用 /help 查看所有命令
        """
        
        keyboard = [
            [InlineKeyboardButton("➕ 添加监控", callback_data='add_alert')],
            [InlineKeyboardButton("📋 查看列表", callback_data='list_alerts')],
            [InlineKeyboardButton("⭐ 升级Pro", callback_data='upgrade_pro')],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            welcome_msg,
            parse_mode='Markdown',
            reply_markup=reply_markup
        )
        
    async def help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """帮助命令"""
        help_text = """
🤖 *可用命令:*

/start - 开始使用
/add - 添加新的价格监控
/list - 查看所有监控
/delete - 删除监控
/status - 查看账户状态
/pricing - 查看定价
/help - 显示此帮助

*使用示例:*
1. 发送 /add
2. 输入商品名称 (如: "iPhone 15")
3. 输入商品链接
4. 输入目标价格
5. 选择检查频率

当价格达到目标时，我会立即通知你！
        """
        await update.message.reply_text(help_text, parse_mode='Markdown')
        
    async def pricing(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """定价页面"""
        pricing_text = f"""
💰 *定价方案*

🆓 *Free (免费)*
• {PRICING['free']['max_alerts']}个价格监控
• 每{PRICING['free']['check_interval_hours']}小时检查
• 基础通知

⭐ *Pro (€5/月)*
• {PRICING['pro']['max_alerts']}个价格监控
• 每{PRICING['pro']['check_interval_hours']}小时检查
• 优先通知
• 历史价格图表
• 价格趋势预测

点击下方按钮升级:
        """
        
        keyboard = [
            [InlineKeyboardButton("⭐ 升级到Pro (€5/月)", callback_data='upgrade_pro')],
            [InlineKeyboardButton("🔙 返回", callback_data='back_menu')],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            pricing_text,
            parse_mode='Markdown',
            reply_markup=reply_markup
        )
        
    async def status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """查看账户状态"""
        user_id = update.effective_user.id
        user_data = self._get_user_data(user_id)
        
        plan = user_data.get('plan', 'free')
        alerts_count = len(user_data.get('alerts', []))
        max_alerts = PRICING[plan]['max_alerts']
        
        status_text = f"""
📊 *账户状态*

👤 用户ID: `{user_id}`
📦 当前套餐: {PRICING[plan]['name']}
🔔 监控数量: {alerts_count}/{max_alerts}
⏰ 检查频率: 每{PRICING[plan]['check_interval_hours']}小时

剩余监控额度: {max_alerts - alerts_count}
        """
        
        keyboard = [
            [InlineKeyboardButton("➕ 添加监控", callback_data='add_alert')],
            [InlineKeyboardButton("⭐ 升级Pro", callback_data='upgrade_pro')],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            status_text,
            parse_mode='Markdown',
            reply_markup=reply_markup
        )
        
    # 添加监控对话流程
    async def add_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """开始添加监控"""
        user_id = update.effective_user.id
        user_data = self._get_user_data(user_id)
        
        # 检查监控数量限制
        plan = user_data.get('plan', 'free')
        alerts_count = len(user_data.get('alerts', []))
        max_alerts = PRICING[plan]['max_alerts']
        
        if alerts_count >= max_alerts:
            await update.message.reply_text(
                f"⚠️ 您已达到 {plan} 套餐的监控上限 ({max_alerts}个)。\n\n"
                f"请删除一些监控或升级到Pro套餐。",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("⭐ 升级Pro", callback_data='upgrade_pro')
                ]])
            )
            return ConversationHandler.END
            
        await update.message.reply_text(
            "📝 *添加新的价格监控*\n\n"
            "请输入商品名称 (例如: iPhone 15 Pro)",
            parse_mode='Markdown'
        )
        return SET_NAME
        
    async def set_name(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """设置商品名称"""
        context.user_data['product_name'] = update.message.text
        await update.message.reply_text(
            "🔗 请输入商品链接 (URL)\n\n"
            "支持的网站: Amazon, eBay, 淘宝, 京东等"
        )
        return SET_URL
        
    async def set_url(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """设置商品链接"""
        url = update.message.text
        if not url.startswith(('http://', 'https://')):
            await update.message.reply_text(
                "⚠️ 请输入有效的URL (以 http:// 或 https:// 开头)"
            )
            return SET_URL
            
        context.user_data['product_url'] = url
        await update.message.reply_text(
            "💰 请输入目标价格 (当价格≤此值时通知你)\n\n"
            "格式: 数字 (例如: 999 或 999.99)"
        )
        return SET_TARGET_PRICE
        
    async def set_target_price(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """设置目标价格"""
        try:
            target_price = float(update.message.text)
            context.user_data['target_price'] = target_price
            
            keyboard = [
                [InlineKeyboardButton("每1小时", callback_data='interval_1')],
                [InlineKeyboardButton("每6小时", callback_data='interval_6')],
                [InlineKeyboardButton("每12小时", callback_data='interval_12')],
                [InlineKeyboardButton("每24小时", callback_data='interval_24')],
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                "⏰ 请选择价格检查频率:",
                reply_markup=reply_markup
            )
            return SET_CHECK_INTERVAL
            
        except ValueError:
            await update.message.reply_text(
                "⚠️ 请输入有效的数字 (例如: 999.99)"
            )
            return SET_TARGET_PRICE
            
    async def set_interval(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """设置检查间隔"""
        query = update.callback_query
        await query.answer()
        
        interval_map = {
            'interval_1': 1,
            'interval_6': 6,
            'interval_12': 12,
            'interval_24': 24
        }
        
        interval = interval_map.get(query.data, 24)
        context.user_data['check_interval'] = interval
        
        # 保存监控
        user_id = update.effective_user.id
        alert_data = {
            'id': datetime.now().strftime('%Y%m%d%H%M%S'),
            'name': context.user_data['product_name'],
            'url': context.user_data['product_url'],
            'target_price': context.user_data['target_price'],
            'check_interval': interval,
            'created_at': datetime.now().isoformat(),
            'last_checked': None,
            'current_price': None,
            'status': 'active'
        }
        
        self._add_alert(user_id, alert_data)
        
        await query.edit_message_text(
            f"✅ *监控添加成功！*\n\n"
            f"📦 商品: {alert_data['name']}\n"
            f"🎯 目标价格: €{alert_data['target_price']}\n"
            f"⏰ 检查频率: 每{interval}小时\n\n"
            f"当价格降到目标值时，我会立即通知你！",
            parse_mode='Markdown'
        )
        
        return ConversationHandler.END
        
    async def cancel(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """取消对话"""
        await update.message.reply_text(
            "❌ 已取消添加监控。\n\n"
            "使用 /add 重新开始"
        )
        return ConversationHandler.END
        
    async def list_alerts(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """列出所有监控"""
        user_id = update.effective_user.id
        user_data = self._get_user_data(user_id)
        alerts = user_data.get('alerts', [])
        
        if not alerts:
            await update.message.reply_text(
                "📭 您还没有添加任何价格监控。\n\n"
                "使用 /add 添加第一个监控！",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("➕ 添加监控", callback_data='add_alert')
                ]])
            )
            return
            
        message = "📋 *您的价格监控列表:*\n\n"
        
        for i, alert in enumerate(alerts, 1):
            status_emoji = "🟢" if alert['status'] == 'active' else "🔴"
            current = f"€{alert.get('current_price', 'N/A')}"
            target = f"€{alert['target_price']}"
            
            message += (
                f"{i}. {status_emoji} *{alert['name']}*\n"
                f"   当前: {current} | 目标: {target}\n"
                f"   ⏰ 每{alert['check_interval']}h检查\n\n"
            )
            
        keyboard = [
            [InlineKeyboardButton("➕ 添加", callback_data='add_alert')],
            [InlineKeyboardButton("🗑️ 删除", callback_data='delete_alert')],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            message,
            parse_mode='Markdown',
            reply_markup=reply_markup
        )
        
    async def delete_alert(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """删除监控"""
        # 简化的删除功能
        await update.message.reply_text(
            "🗑️ 请输入要删除的监控编号\n\n"
            "使用 /list 查看编号"
        )
        
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理按钮回调"""
        query = update.callback_query
        await query.answer()
        
        if query.data == 'add_alert':
            await query.edit_message_text(
                "使用 /add 命令添加新的价格监控"
            )
        elif query.data == 'list_alerts':
            await self.list_alerts(update, context)
        elif query.data == 'upgrade_pro':
            await query.edit_message_text(
                "⭐ *升级到Pro*\n\n"
                "Pro功能:\n"
                "• 50个价格监控\n"
                "• 每小时检查\n"
                "• 优先通知\n\n"
                "请访问: [购买链接] 完成升级",
                parse_mode='Markdown'
            )
        elif query.data == 'back_menu':
            await self.start(update, context)
            
    # 数据存储方法 (实际应使用数据库)
    def _get_user_data(self, user_id: int) -> Dict:
        """获取用户数据"""
        try:
            with open(USER_DATA_FILE, 'r') as f:
                data = json.load(f)
                return data.get(str(user_id), {'plan': 'free', 'alerts': []})
        except FileNotFoundError:
            return {'plan': 'free', 'alerts': []}
            
    def _add_alert(self, user_id: int, alert_data: Dict):
        """添加监控"""
        try:
            with open(USER_DATA_FILE, 'r') as f:
                data = json.load(f)
        except FileNotFoundError:
            data = {}
            
        user_key = str(user_id)
        if user_key not in data:
            data[user_key] = {'plan': 'free', 'alerts': []}
            
        data[user_key]['alerts'].append(alert_data)
        
        with open(USER_DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
            
    def run(self):
        """运行Bot"""
        logger.info("启动 Price Alert Bot...")
        self.application.run_polling()


# 价格抓取函数 (示例)
async def fetch_price(url: str) -> Optional[float]:
    """
    抓取商品价格
    实际实现需要使用 Playwright 或 BeautifulSoup
    """
    # TODO: 实现价格抓取逻辑
    return None


# 主函数
if __name__ == '__main__':
    import os
    
    # 从环境变量获取Token
    TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not TOKEN:
        print("错误: 请设置 TELEGRAM_BOT_TOKEN 环境变量")
        print("示例: export TELEGRAM_BOT_TOKEN='your_bot_token_here'")
        exit(1)
        
    bot = PriceAlertBot(TOKEN)
    bot.run()
