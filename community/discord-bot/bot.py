"""
DevSecOps Hub Discord Bot
A comprehensive bot for DevSecOps communities with:
- Welcome messages
- Auto-role assignment
- Security news feed
- FAQ responder
- Moderation tools
"""

import os
import asyncio
import logging
from datetime import datetime

import discord
from discord.ext import commands, tasks
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Bot configuration
class DevSecOpsBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.all()
        super().__init__(
            command_prefix=os.getenv('BOT_PREFIX', '!'),
            intents=intents,
            help_command=None,
            description="DevSecOps Hub - Your Security Community Bot"
        )
        self.start_time = datetime.utcnow()
        
    async def setup_hook(self):
        """Load cogs on startup"""
        cogs = [
            'cogs.welcome',
            'cogs.autorole',
            'cogs.security_news',
            'cogs.faq',
            'cogs.moderation',
            'cogs.utilities'
        ]
        
        for cog in cogs:
            try:
                await self.load_extension(cog)
                logger.info(f'✅ Loaded {cog}')
            except Exception as e:
                logger.error(f'❌ Failed to load {cog}: {e}')
                
    async def on_ready(self):
        """Called when bot is ready"""
        logger.info(f'🚀 {self.user.name} is online!')
        logger.info(f'Bot ID: {self.user.id}')
        logger.info(f'Discord.py version: {discord.__version__}')
        
        # Set bot status
        activity = discord.Activity(
            type=discord.ActivityType.watching,
            name="over DevSecOps Hub 🔒"
        )
        await self.change_presence(activity=activity)
        
        # Sync slash commands
        try:
            synced = await self.tree.sync()
            logger.info(f'🔄 Synced {len(synced)} slash commands')
        except Exception as e:
            logger.error(f'Failed to sync commands: {e}')
            
    async def on_command_error(self, ctx, error):
        """Global error handler"""
        if isinstance(error, commands.CommandNotFound):
            return
        elif isinstance(error, commands.MissingPermissions):
            await ctx.send("❌ You don't have permission to use this command.", delete_after=10)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(f"❌ Missing required argument: `{error.param.name}`", delete_after=10)
        elif isinstance(error, commands.MemberNotFound):
            await ctx.send("❌ Member not found.", delete_after=10)
        else:
            logger.error(f'Command error: {error}')
            await ctx.send("❌ An error occurred while processing your command.", delete_after=10)

def main():
    """Main entry point"""
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        logger.error("❌ DISCORD_TOKEN not found in environment variables!")
        logger.error("Please check your .env file")
        return
        
    bot = DevSecOpsBot()
    
    try:
        bot.run(token, reconnect=True)
    except discord.LoginFailure:
        logger.error("❌ Invalid Discord token!")
    except KeyboardInterrupt:
        logger.info("👋 Bot shutdown requested")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    main()