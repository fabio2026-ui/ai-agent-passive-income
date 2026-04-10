"""
Utilities Cog - Help command and utility functions
"""

import discord
from discord.ext import commands
import platform
import psutil
from datetime import datetime

class Utilities(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        
    @commands.hybrid_command(name="help", description="Show bot commands and help")
    async def help_command(self, ctx, category: str = None):
        """Display help information"""
        
        if category and category.lower() == 'moderation':
            embed = discord.Embed(
                title="🛡️ Moderation Commands",
                description="Commands for server moderation",
                color=0xFF6B6B
            )
            embed.add_field(
                name="Member Management",
                value="`/kick @user reason` - Kick a member\n"
                      "`/ban @user reason` - Ban a member\n"
                      "`/unban user_id` - Unban a user\n"
                      "`/mute @user duration unit` - Timeout a member\n"
                      "`/unmute @user` - Remove timeout",
                inline=False
            )
            embed.add_field(
                name="Warnings",
                value="`/warn @user reason` - Warn a member\n"
                      "`/warnings @user` - View warnings\n"
                      "`/clearwarnings @user` - Clear all warnings",
                inline=False
            )
            embed.add_field(
                name="Channel Management",
                value="`/purge amount` - Delete messages\n"
                      "`/slowmode seconds` - Set slowmode\n"
                      "`/lock` - Lock channel\n"
                      "`/unlock` - Unlock channel",
                inline=False
            )
            
        elif category and category.lower() == 'security':
            embed = discord.Embed(
                title="🔒 Security Commands",
                description="Security-related commands",
                color=0xFF6B6B
            )
            embed.add_field(
                name="News & CVE",
                value="`/securitynews count` - Get latest security news\n"
                      "`/cve_lookup CVE-2024-XXXX` - Look up a CVE\n"
                      "`/news_sources` - List news sources",
                inline=False
            )
            
        elif category and category.lower() == 'faq':
            embed = discord.Embed(
                title="📚 FAQ Commands",
                description="Frequently Asked Questions",
                color=0x00D4AA
            )
            embed.add_field(
                name="Usage",
                value="`/faq question` - Ask a question\n"
                      "`/faq_list` - List all FAQs\n"
                      "Try: `/faq how to start learning`",
                inline=False
            )
            
        else:
            # Main help menu
            embed = discord.Embed(
                title="🤖 DevSecOps Hub Bot",
                description="Your all-in-one DevSecOps community bot!\n\n"
                           "Use `/help category` for specific categories:\n"
                           "• `moderation` - Mod commands\n"
                           "• `security` - Security tools\n"
                           "• `faq` - FAQ system",
                color=0x7289DA
            )
            
            embed.add_field(
                name="📋 General",
                value="`/help` - Show this message\n"
                      "`/ping` - Check bot latency\n"
                      "`/stats` - Bot statistics\n"
                      "`/serverinfo` - Server information",
                inline=False
            )
            
            embed.add_field(
                name="🔒 Security",
                value="`/securitynews` - Latest security news\n"
                      "`/cve_lookup` - Look up CVEs\n"
                      "`/faq` - DevSecOps FAQ",
                inline=False
            )
            
            embed.add_field(
                name="🛡️ Moderation",
                value="`/kick`, `/ban`, `/mute`\n"
                      "`/warn`, `/purge`, `/slowmode`\n"
                      "Type `/help moderation` for more",
                inline=False
            )
            
            embed.add_field(
                name="🎭 Roles",
                value="Reaction roles available in #roles",
                inline=False
            )
            
        embed.set_footer(text="DevSecOps Hub Bot | Prefix: / (slash commands)")
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="ping", description="Check bot latency")
    async def ping(self, ctx):
        """Check bot latency"""
        latency = round(self.bot.latency * 1000)
        
        # Color based on latency
        color = 0x00FF00 if latency < 100 else 0xFFA500 if latency < 200 else 0xFF0000
        
        embed = discord.Embed(
            title="🏓 Pong!",
            description=f"Latency: **{latency}ms**",
            color=color
        )
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="stats", description="Bot statistics")
    async def stats(self, ctx):
        """Display bot statistics"""
        embed = discord.Embed(
            title="📊 Bot Statistics",
            color=0x7289DA,
            timestamp=datetime.utcnow()
        )
        
        # System stats
        embed.add_field(
            name="💻 System",
            value=f"OS: {platform.system()} {platform.release()}\n"
                  f"Python: {platform.python_version()}\n"
                  f"Memory: {psutil.virtual_memory().percent}% used\n"
                  f"CPU: {psutil.cpu_percent()}%",
            inline=True
        )
        
        # Bot stats
        uptime = datetime.utcnow() - self.bot.start_time
        hours, remainder = divmod(int(uptime.total_seconds()), 3600)
        minutes, seconds = divmod(remainder, 60)
        
        embed.add_field(
            name="🤖 Bot",
            value=f"Servers: {len(self.bot.guilds)}\n"
                  f"Users: {sum(g.member_count for g in self.bot.guilds)}\n"
                  f"Uptime: {hours}h {minutes}m {seconds}s\n"
                  f"Latency: {round(self.bot.latency * 1000)}ms",
            inline=True
        )
        
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="serverinfo", description="Display server information")
    async def serverinfo(self, ctx):
        """Display server information"""
        guild = ctx.guild
        
        embed = discord.Embed(
            title=f"📊 {guild.name} Server Info",
            color=0x7289DA,
            timestamp=datetime.utcnow()
        )
        
        if guild.icon:
            embed.set_thumbnail(url=guild.icon.url)
            
        # Owner info
        embed.add_field(name="👑 Owner", value=guild.owner.mention if guild.owner else "Unknown", inline=True)
        embed.add_field(name="🆔 Server ID", value=guild.id, inline=True)
        embed.add_field(name="📅 Created", value=f"<t:{int(guild.created_at.timestamp())}:R>", inline=True)
        
        # Member stats
        total = guild.member_count
        humans = len([m for m in guild.members if not m.bot])
        bots = total - humans
        
        embed.add_field(name="👥 Members", value=f"{total} total\n{humans} humans\n{bots} bots", inline=True)
        embed.add_field(name="💬 Channels", value=f"{len(guild.text_channels)} text\n{len(guild.voice_channels)} voice\n{len(guild.categories)} categories", inline=True)
        embed.add_field(name="🎭 Roles", value=len(guild.roles), inline=True)
        
        # Boost info
        embed.add_field(
            name="✨ Boosts",
            value=f"Level {guild.premium_tier}\n{guild.premium_subscription_count} boosts",
            inline=True
        )
        
        # Security
        verification_levels = {
            discord.VerificationLevel.none: "None",
            discord.VerificationLevel.low: "Low",
            discord.VerificationLevel.medium: "Medium",
            discord.VerificationLevel.high: "High",
            discord.VerificationLevel.highest: "Highest"
        }
        embed.add_field(name="🔒 Verification", value=verification_levels.get(guild.verification_level, "Unknown"), inline=True)
        
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="userinfo", description="Display user information")
    async def userinfo(self, ctx, member: discord.Member = None):
        """Display user information"""
        member = member or ctx.author
        
        embed = discord.Embed(
            title=f"👤 {member} User Info",
            color=member.color if member.color != discord.Color.default() else 0x7289DA,
            timestamp=datetime.utcnow()
        )
        
        embed.set_thumbnail(url=member.display_avatar.url)
        
        # Basic info
        embed.add_field(name="🆔 User ID", value=member.id, inline=True)
        embed.add_field(name="📛 Nickname", value=member.nick or "None", inline=True)
        embed.add_field(name="🤖 Bot", value="Yes" if member.bot else "No", inline=True)
        
        # Dates
        embed.add_field(name="📅 Account Created", value=f"<t:{int(member.created_at.timestamp())}:R>", inline=True)
        embed.add_field(name="📥 Joined Server", value=f"<t:{int(member.joined_at.timestamp())}:R>", inline=True)
        
        # Roles
        roles = [role.mention for role in member.roles[1:]]  # Skip @everyone
        roles_text = ", ".join(roles[:10]) if roles else "None"
        if len(roles) > 10:
            roles_text += f" (+{len(roles) - 10} more)"
        embed.add_field(name=f"🎭 Roles ({len(roles)})", value=roles_text or "None", inline=False)
        
        # Permissions (if notable)
        key_perms = []
        if member.guild_permissions.administrator:
            key_perms.append("Administrator")
        elif member.guild_permissions.manage_guild:
            key_perms.append("Manage Server")
        elif member.guild_permissions.ban_members:
            key_perms.append("Ban Members")
        elif member.guild_permissions.kick_members:
            key_perms.append("Kick Members")
            
        if key_perms:
            embed.add_field(name="🔑 Key Permissions", value=", ".join(key_perms), inline=True)
        
        embed.set_footer(text=f"Requested by {ctx.author}")
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="invite", description="Get bot invite link")
    async def invite(self, ctx):
        """Get bot invite link"""
        permissions = discord.Permissions(
            send_messages=True,
            manage_messages=True,
            manage_roles=True,
            kick_members=True,
            ban_members=True,
            moderate_members=True,
            read_message_history=True,
            add_reactions=True,
            embed_links=True,
            attach_files=True,
            use_application_commands=True
        )
        
        invite_url = discord.utils.oauth_url(
            self.bot.user.id,
            permissions=permissions,
            scopes=["bot", "applications.commands"]
        )
        
        embed = discord.Embed(
            title="🤖 Invite DevSecOps Bot",
            description=f"[Click here to invite me]({invite_url})",
            color=0x7289DA
        )
        embed.add_field(
            name="Required Permissions",
            value="• Send Messages\n"
                  "• Manage Messages\n"
                  "• Manage Roles\n"
                  "• Kick/Ban Members\n"
                  "• Moderate Members\n"
                  "• Use Slash Commands",
            inline=False
        )
        
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="botinfo", description="Information about the bot")
    async def botinfo(self, ctx):
        """Display bot information"""
        embed = discord.Embed(
            title="🤖 DevSecOps Hub Bot",
            description="A comprehensive Discord bot for DevSecOps communities",
            color=0x7289DA
        )
        
        embed.add_field(
            name="✨ Features",
            value="• Welcome messages\n"
                  "• Auto-role assignment\n"
                  "• Security news feed\n"
                  "• FAQ responder\n"
                  "• Moderation tools",
            inline=False
        )
        
        embed.add_field(
            name="🛠️ Built With",
            value="• discord.py v2.x\n"
                  "• Python 3.10+\n"
                  "• Love for security ❤️",
            inline=True
        )
        
        embed.add_field(
            name="📚 Resources",
            value="• [Documentation](https://github.com)\n"
                  "• [Support Server](https://discord.gg)",
            inline=True
        )
        
        embed.set_footer(text="Made for DevSecOps Hub Community")
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(Utilities(bot))