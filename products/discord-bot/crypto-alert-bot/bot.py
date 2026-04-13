# Discord Crypto Alert Bot
# 小七团队开发

import discord
from discord.ext import commands, tasks
import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# 定价配置
PRICING = {
    'free': {
        'max_alerts': 5,
        'check_interval_min': 60,
        'features': ['基础价格提醒', '5个监控']
    },
    'pro': {
        'price': 5,  # EUR/月
        'max_alerts': 100,
        'check_interval_min': 5,
        'features': ['无限监控', '5分钟检查', '价格预测', '组合分析', '优先支持']
    }
}

class CryptoBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(command_prefix='!', intents=intents)
        
        self.alerts: Dict[str, List[dict]] = {}  # user_id -> alerts
        self.prices: Dict[str, float] = {}  # coin -> current_price
        
    async def setup_hook(self):
        self.price_check.start()
        
    @tasks.loop(minutes=5)
    async def price_check(self):
        """每5分钟检查价格"""
        await self.check_prices()
        
    async def check_prices(self):
        """检查所有用户的价格提醒"""
        # 获取所有需要监控的币种
        coins = set()
        for user_alerts in self.alerts.values():
            for alert in user_alerts:
                coins.add(alert['coin'].lower())
        
        if not coins:
            return
            
        # 获取当前价格
        for coin in coins:
            price = await self.get_crypto_price(coin)
            if price:
                self.prices[coin] = price
                
        # 检查触发条件
        for user_id, user_alerts in self.alerts.items():
            for alert in user_alerts:
                coin = alert['coin'].lower()
                if coin not in self.prices:
                    continue
                    
                current_price = self.prices[coin]
                target_price = alert['target_price']
                condition = alert['condition']  # 'above' or 'below'
                
                triggered = False
                if condition == 'above' and current_price >= target_price:
                    triggered = True
                elif condition == 'below' and current_price <= target_price:
                    triggered = True
                    
                if triggered:
                    await self.send_alert(user_id, alert, current_price)
                    
    async def get_crypto_price(self, coin: str) -> Optional[float]:
        """获取加密货币价格"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies=usd"
                async with session.get(url) as response:
                    data = await response.json()
                    return data.get(coin, {}).get('usd')
        except Exception as e:
            print(f"获取价格失败: {e}")
            return None
            
    async def send_alert(self, user_id: str, alert: dict, current_price: float):
        """发送价格提醒"""
        user = await self.fetch_user(int(user_id))
        if user:
            embed = discord.Embed(
                title=f"🚨 {alert['coin'].upper()} 价格提醒",
                description=f"目标价格已触发！",
                color=0x00ff00 if alert['condition'] == 'above' else 0xff0000,
                timestamp=datetime.now()
            )
            embed.add_field(name="当前价格", value=f"${current_price:,.2f}", inline=True)
            embed.add_field(name="目标价格", value=f"${alert['target_price']:,.2f}", inline=True)
            embed.add_field(name="条件", value="📈 上涨" if alert['condition'] == 'above' else "📉 下跌", inline=True)
            
            try:
                await user.send(embed=embed)
            except discord.Forbidden:
                pass
                
    async def on_ready(self):
        """Bot启动"""
        print(f'{self.user} 已上线！')
        await self.change_presence(activity=discord.Activity(
            type=discord.ActivityType.watching,
            name="加密货币价格"
        ))

# 创建Bot实例
bot = CryptoBot()

@bot.command(name='price')
async def get_price(ctx, coin: str):
    """获取当前价格"""
    price = await bot.get_crypto_price(coin.lower())
    if price:
        embed = discord.Embed(
            title=f"💰 {coin.upper()} 当前价格",
            description=f"${price:,.2f}",
            color=0x3498db
        )
        await ctx.send(embed=embed)
    else:
        await ctx.send(f"❌ 无法获取 {coin} 的价格")

@bot.command(name='alert')
async def set_alert(ctx, coin: str, condition: str, price: float):
    """设置价格提醒"""
    user_id = str(ctx.author.id)
    
    # 检查用户提醒数量
    current_alerts = bot.alerts.get(user_id, [])
    if len(current_alerts) >= PRICING['free']['max_alerts']:
        await ctx.send(f"⚠️ 免费版最多{PRICING['free']['max_alerts']}个提醒。升级到Pro获得无限提醒！")
        return
        
    # 添加提醒
    if user_id not in bot.alerts:
        bot.alerts[user_id] = []
        
    alert = {
        'id': datetime.now().strftime('%Y%m%d%H%M%S'),
        'coin': coin.lower(),
        'condition': condition.lower(),
        'target_price': price,
        'created_at': datetime.now().isoformat()
    }
    
    bot.alerts[user_id].append(alert)
    
    embed = discord.Embed(
        title="✅ 提醒设置成功",
        description=f"当 {coin.upper()} { '上涨到' if condition.lower() == 'above' else '下跌到' } ${price:,.2f} 时通知你",
        color=0x00ff00
    )
    await ctx.send(embed=embed)

@bot.command(name='alerts')
async def list_alerts(ctx):
    """列出所有提醒"""
    user_id = str(ctx.author.id)
    alerts = bot.alerts.get(user_id, [])
    
    if not alerts:
        await ctx.send("📭 你还没有设置任何提醒")
        return
        
    embed = discord.Embed(
        title=f"🔔 你的价格提醒 ({len(alerts)}/{PRICING['free']['max_alerts']})",
        color=0x3498db
    )
    
    for alert in alerts:
        coin = alert['coin'].upper()
        condition = "📈" if alert['condition'] == 'above' else "📉"
        embed.add_field(
            name=f"{coin} {condition}",
            value=f"目标: ${alert['target_price']:,.2f}",
            inline=True
        )
        
    await ctx.send(embed=embed)

@bot.command(name='remove')
async def remove_alert(ctx, alert_id: str):
    """删除提醒"""
    user_id = str(ctx.author.id)
    alerts = bot.alerts.get(user_id, [])
    
    bot.alerts[user_id] = [a for a in alerts if a['id'] != alert_id]
    await ctx.send("🗑️ 提醒已删除")

@bot.command(name='pricing')
async def show_pricing(ctx):
    """显示定价"""
    embed = discord.Embed(
        title="💎 Crypto Alert Bot 定价",
        description="选择适合你的方案",
        color=0xffd700
    )
    
    free_features = '\n'.join([f"✅ {f}" for f in PRICING['free']['features']])
    pro_features = '\n'.join([f"⭐ {f}" for f in PRICING['pro']['features']])
    
    embed.add_field(
        name="🆓 Free",
        value=f"{free_features}\n\n**€0/月**",
        inline=True
    )
    embed.add_field(
        name="💎 Pro",
        value=f"{pro_features}\n\n**€{PRICING['pro']['price']}/月**",
        inline=True
    )
    
    embed.set_footer(text="使用 !upgrade 升级到Pro")
    await ctx.send(embed=embed)

@bot.command(name='help')
async def help_command(ctx):
    """帮助"""
    embed = discord.Embed(
        title="🤖 Crypto Alert Bot 命令",
        description="监控加密货币价格，到达目标价时自动提醒",
        color=0x3498db
    )
    
    commands_list = """
    `!price <币种>` - 获取当前价格 (例如: !price bitcoin)
    `!alert <币种> <above/below> <价格>` - 设置价格提醒
    `!alerts` - 查看所有提醒
    `!remove <ID>` - 删除提醒
    `!pricing` - 查看定价
    `!help` - 显示此帮助
    """
    
    embed.add_field(name="可用命令", value=commands_list, inline=False)
    embed.set_footer(text="支持BTC, ETH, SOL, ADA等1000+币种")
    
    await ctx.send(embed=embed)

# 运行Bot
if __name__ == '__main__':
    import os
    TOKEN = os.environ.get('DISCORD_BOT_TOKEN')
    if not TOKEN:
        print("请设置 DISCORD_BOT_TOKEN 环境变量")
    else:
        bot.run(TOKEN)
