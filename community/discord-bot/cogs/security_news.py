"""
Security News Cog - Automated security news feed
"""

import discord
from discord.ext import commands, tasks
import aiohttp
import feedparser
import os
from datetime import datetime, timedelta

class SecurityNews(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.news_channel_id = os.getenv('NEWS_CHANNEL_ID')
        self.posted_entries = set()
        self.news_sources = {
            'cve': 'https://cve.mitre.org/data/downloads/allitems.xml',
            'us_cert': 'https://www.us-cert.gov/ncas/current-activity.xml',
            'dark_reading': 'https://www.darkreading.com/rss.xml',
            'the_hacker_news': 'https://feeds.feedburner.com/TheHackersNews',
            'bleeping_computer': 'https://www.bleepingcomputer.com/feed/',
            'krebs': 'https://krebsonsecurity.com/feed/'
        }
        
    async def cog_load(self):
        """Start news feed loop when cog loads"""
        self.news_feed.start()
        
    def cog_unload(self):
        """Stop news feed loop when cog unloads"""
        self.news_feed.cancel()
        
    @tasks.loop(minutes=30)
    async def news_feed(self):
        """Fetch and post security news every 30 minutes"""
        if not self.news_channel_id:
            return
            
        channel = self.bot.get_channel(int(self.news_channel_id))
        if not channel:
            return
            
        news_items = await self.fetch_news()
        
        for item in news_items[:3]:  # Post max 3 items per cycle
            if item['link'] not in self.posted_entries:
                embed = self.create_news_embed(item)
                await channel.send(embed=embed)
                self.posted_entries.add(item['link'])
                
                # Keep memory usage in check
                if len(self.posted_entries) > 1000:
                    self.posted_entries.clear()
                    
    @news_feed.before_loop
    async def before_news_feed(self):
        """Wait for bot to be ready"""
        await self.bot.wait_until_ready()
        
    async def fetch_news(self):
        """Fetch news from multiple sources"""
        all_news = []
        
        async with aiohttp.ClientSession() as session:
            # Try to fetch from The Hacker News RSS
            try:
                async with session.get(
                    'https://feeds.feedburner.com/TheHackersNews',
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        content = await resp.text()
                        feed = feedparser.parse(content)
                        for entry in feed.entries[:5]:
                            all_news.append({
                                'title': entry.get('title', 'No title'),
                                'link': entry.get('link', ''),
                                'summary': entry.get('summary', '')[:200] + '...',
                                'published': entry.get('published', 'Unknown'),
                                'source': 'The Hacker News'
                            })
            except Exception as e:
                print(f"Error fetching THN: {e}")
                
            # Fetch from Bleeping Computer
            try:
                async with session.get(
                    'https://www.bleepingcomputer.com/feed/',
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        content = await resp.text()
                        feed = feedparser.parse(content)
                        for entry in feed.entries[:3]:
                            all_news.append({
                                'title': entry.get('title', 'No title'),
                                'link': entry.get('link', ''),
                                'summary': entry.get('summary', '')[:200] + '...',
                                'published': entry.get('published', 'Unknown'),
                                'source': 'BleepingComputer'
                            })
            except Exception as e:
                print(f"Error fetching BC: {e}")
                
        # Sort by relevance (could be improved with proper date parsing)
        return all_news[:10]
        
    def create_news_embed(self, item):
        """Create embed for news item"""
        embed = discord.Embed(
            title=item['title'][:256],
            url=item['link'],
            description=item['summary'][:4096],
            color=0xFF6B6B,
            timestamp=datetime.utcnow()
        )
        
        source_emoji = {
            'The Hacker News': '📰',
            'BleepingComputer': '💻',
            'US-CERT': '🇺🇸',
            'CVE': '🔴'
        }
        
        emoji = source_emoji.get(item['source'], '📢')
        embed.set_author(name=f"{emoji} {item['source']}")
        embed.set_footer(text=f"Published: {item['published']}")
        
        return embed
        
    # Manual Commands
    @commands.hybrid_command(name="securitynews", description="Get latest security news")
    async def security_news(self, ctx, count: int = 5):
        """Fetch latest security news manually"""
        await ctx.defer()
        
        news_items = await self.fetch_news()
        
        if not news_items:
            await ctx.send("❌ Unable to fetch news at the moment. Please try again later.")
            return
            
        embed = discord.Embed(
            title="🔒 Latest Security News",
            description=f"Top {min(count, len(news_items))} security stories",
            color=0xFF6B6B,
            timestamp=datetime.utcnow()
        )
        
        for i, item in enumerate(news_items[:count], 1):
            embed.add_field(
                name=f"{i}. {item['title'][:100]}",
                value=f"[Read more]({item['link']}) | Source: {item['source']}",
                inline=False
            )
            
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="cve_lookup", description="Look up a CVE")
    async def cve_lookup(self, ctx, cve_id: str):
        """Look up CVE information"""
        await ctx.defer()
        
        # Format CVE ID
        cve_id = cve_id.upper()
        if not cve_id.startswith('CVE-'):
            cve_id = f'CVE-{cve_id}'
            
        url = f"https://cve.mitre.org/cgi-bin/cvename.cgi?name={cve_id}"
        nvd_url = f"https://nvd.nist.gov/vuln/detail/{cve_id}"
        
        embed = discord.Embed(
            title=f"🔴 {cve_id}",
            url=url,
            color=0xFF0000,
            timestamp=datetime.utcnow()
        )
        
        embed.add_field(
            name="🔗 Links",
            value=f"[MITRE]({url}) | [NVD]({nvd_url})",
            inline=False
        )
        
        embed.add_field(
            name="⚠️ Note",
            value="Due to API limitations, please visit the links above for full details.",
            inline=False
        )
        
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="news_sources", description="List available news sources")
    async def list_sources(self, ctx):
        """List configured news sources"""
        embed = discord.Embed(
            title="📡 Security News Sources",
            description="Bot monitors these sources for security updates",
            color=0x00D4AA
        )
        
        sources_text = "\n".join([
            f"• {name.replace('_', ' ').title()}"
            for name in self.news_sources.keys()
        ])
        
        embed.add_field(name="Sources", value=sources_text, inline=False)
        embed.add_field(
            name="Update Frequency",
            value="Every 30 minutes",
            inline=False
        )
        
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(SecurityNews(bot))