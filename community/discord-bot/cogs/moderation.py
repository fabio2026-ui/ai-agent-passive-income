"""
Moderation Cog - Server moderation tools
"""

import discord
from discord.ext import commands
import asyncio
from datetime import datetime, timedelta
import re

class Moderation(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.warning_db = {}  # user_id: [warnings]
        
    # Message filtering
    @commands.Cog.listener()
    async def on_message(self, message):
        """Auto-moderate messages"""
        if message.author.bot:
            return
            
        # Check for Discord invites (unless in specific channels)
        if self.contains_invite(message.content) and not message.author.guild_permissions.manage_messages:
            if 'promotion' not in message.channel.name.lower():
                await message.delete()
                await message.channel.send(
                    f"{message.author.mention} Discord invites are not allowed here. "
                    "Please use the appropriate channel or ask a moderator.",
                    delete_after=10
                )
                return
                
        # Check for excessive caps
        if self.is_excessive_caps(message.content):
            caps_percentage = sum(1 for c in message.content if c.isupper()) / len(message.content) * 100
            if caps_percentage > 70 and len(message.content) > 10:
                await message.channel.send(
                    f"{message.author.mention} Please avoid excessive caps.",
                    delete_after=5
                )
                
    def contains_invite(self, content):
        """Check if message contains Discord invite"""
        patterns = [
            r'discord\.gg/[a-zA-Z0-9]+',
            r'discord\.com/invite/[a-zA-Z0-9]+',
            r'discordapp\.com/invite/[a-zA-Z0-9]+'
        ]
        return any(re.search(pattern, content) for pattern in patterns)
        
    def is_excessive_caps(self, content):
        """Check for excessive caps"""
        if len(content) < 5:
            return False
        letters = [c for c in content if c.isalpha()]
        if not letters:
            return False
        return sum(1 for c in letters if c.isupper()) / len(letters) > 0.7

    # Moderation Commands
    @commands.hybrid_command(name="kick", description="Kick a member from the server")
    @commands.has_permissions(kick_members=True)
    async def kick(self, ctx, member: discord.Member, *, reason: str = "No reason provided"):
        """Kick a member"""
        if member.top_role >= ctx.author.top_role:
            await ctx.send("❌ You cannot kick this member (higher or equal role).", ephemeral=True)
            return
            
        try:
            # DM the user
            embed = discord.Embed(
                title=f"👢 You were kicked from {ctx.guild.name}",
                description=f"**Reason:** {reason}",
                color=0xFF6B6B
            )
            await member.send(embed=embed)
        except:
            pass
            
        await member.kick(reason=f"{ctx.author}: {reason}")
        
        embed = discord.Embed(
            title="👢 Member Kicked",
            description=f"**{member}** has been kicked.",
            color=0xFF6B6B
        )
        embed.add_field(name="Reason", value=reason)
        embed.add_field(name="Moderator", value=ctx.author.mention)
        
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="ban", description="Ban a member from the server")
    @commands.has_permissions(ban_members=True)
    async def ban(self, ctx, member: discord.Member, *, reason: str = "No reason provided"):
        """Ban a member"""
        if member.top_role >= ctx.author.top_role:
            await ctx.send("❌ You cannot ban this member (higher or equal role).", ephemeral=True)
            return
            
        try:
            embed = discord.Embed(
                title=f"🔨 You were banned from {ctx.guild.name}",
                description=f"**Reason:** {reason}\n\n"
                           "If you believe this was a mistake, please contact the server staff.",
                color=0xFF0000
            )
            await member.send(embed=embed)
        except:
            pass
            
        await member.ban(reason=f"{ctx.author}: {reason}", delete_message_days=1)
        
        embed = discord.Embed(
            title="🔨 Member Banned",
            description=f"**{member}** has been banned.",
            color=0xFF0000
        )
        embed.add_field(name="Reason", value=reason)
        embed.add_field(name="Moderator", value=ctx.author.mention)
        
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="unban", description="Unban a user")
    @commands.has_permissions(ban_members=True)
    async def unban(self, ctx, user_id: str):
        """Unban a user by ID"""
        try:
            user = await self.bot.fetch_user(int(user_id))
            await ctx.guild.unban(user)
            await ctx.send(f"✅ **{user}** has been unbanned.")
        except ValueError:
            await ctx.send("❌ Invalid user ID.", ephemeral=True)
        except discord.NotFound:
            await ctx.send("❌ User not found or not banned.", ephemeral=True)
            
    @commands.hybrid_command(name="mute", description="Timeout/mute a member")
    @commands.has_permissions(moderate_members=True)
    async def mute(self, ctx, member: discord.Member, duration: int, unit: str = "m"):
        """Mute a member for a specified duration"""
        if member.top_role >= ctx.author.top_role:
            await ctx.send("❌ You cannot mute this member.", ephemeral=True)
            return
            
        # Parse duration
        unit = unit.lower()
        if unit in ['m', 'min', 'minute', 'minutes']:
            delta = timedelta(minutes=duration)
        elif unit in ['h', 'hour', 'hours']:
            delta = timedelta(hours=duration)
        elif unit in ['d', 'day', 'days']:
            delta = timedelta(days=duration)
        else:
            await ctx.send("❌ Invalid time unit. Use m/h/d", ephemeral=True)
            return
            
        if duration > 28 and unit in ['d', 'day', 'days']:
            await ctx.send("❌ Maximum timeout is 28 days.", ephemeral=True)
            return
            
        await member.timeout(delta, reason=f"Muted by {ctx.author}")
        
        embed = discord.Embed(
            title="🔇 Member Muted",
            description=f"**{member}** has been muted for {duration}{unit}.",
            color=0xFFA500
        )
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="unmute", description="Remove timeout from a member")
    @commands.has_permissions(moderate_members=True)
    async def unmute(self, ctx, member: discord.Member):
        """Unmute a member"""
        await member.timeout(None, reason=f"Unmuted by {ctx.author}")
        await ctx.send(f"✅ **{member}** has been unmuted.")
        
    @commands.hybrid_command(name="warn", description="Warn a member")
    @commands.has_permissions(manage_messages=True)
    async def warn(self, ctx, member: discord.Member, *, reason: str):
        """Warn a member"""
        if member.id not in self.warning_db:
            self.warning_db[member.id] = []
            
        warning = {
            'reason': reason,
            'moderator': ctx.author.id,
            'timestamp': datetime.utcnow()
        }
        self.warning_db[member.id].append(warning)
        
        # DM the user
        try:
            embed = discord.Embed(
                title=f"⚠️ Warning from {ctx.guild.name}",
                description=f"**Reason:** {reason}",
                color=0xFFA500
            )
            embed.set_footer(text=f"Warning #{len(self.warning_db[member.id])}")
            await member.send(embed=embed)
        except:
            pass
            
        await ctx.send(
            f"⚠️ **{member}** has been warned. Reason: {reason}\n"
            f"Total warnings: {len(self.warning_db[member.id])}"
        )
        
    @commands.hybrid_command(name="warnings", description="View warnings for a member")
    @commands.has_permissions(manage_messages=True)
    async def warnings(self, ctx, member: discord.Member = None):
        """View member warnings"""
        member = member or ctx.author
        
        user_warnings = self.warning_db.get(member.id, [])
        
        if not user_warnings:
            await ctx.send(f"✅ **{member}** has no warnings.")
            return
            
        embed = discord.Embed(
            title=f"⚠️ Warnings for {member}",
            description=f"Total: {len(user_warnings)}",
            color=0xFFA500
        )
        
        for i, warn in enumerate(user_warnings[-5:], 1):  # Show last 5
            moderator = ctx.guild.get_member(warn['moderator'])
            mod_name = moderator.mention if moderator else "Unknown"
            embed.add_field(
                name=f"Warning #{i}",
                value=f"**Reason:** {warn['reason']}\n"
                      f"**By:** {mod_name}\n"
                      f"**When:** <t:{int(warn['timestamp'].timestamp())}:R>",
                inline=False
            )
            
        await ctx.send(embed=embed)
        
    @commands.hybrid_command(name="clearwarnings", description="Clear all warnings for a member")
    @commands.has_permissions(administrator=True)
    async def clear_warnings(self, ctx, member: discord.Member):
        """Clear all warnings for a member"""
        if member.id in self.warning_db:
            count = len(self.warning_db[member.id])
            del self.warning_db[member.id]
            await ctx.send(f"✅ Cleared {count} warning(s) for **{member}**.")
        else:
            await ctx.send(f"✅ **{member}** has no warnings to clear.")
            
    @commands.hybrid_command(name="purge", description="Delete multiple messages")
    @commands.has_permissions(manage_messages=True)
    async def purge(self, ctx, amount: int):
        """Delete multiple messages"""
        if amount < 1 or amount > 100:
            await ctx.send("❌ Amount must be between 1 and 100.", ephemeral=True)
            return
            
        deleted = await ctx.channel.purge(limit=amount + 1)  # +1 for command message
        msg = await ctx.send(f"🗑️ Deleted {len(deleted) - 1} message(s).", delete_after=5)
        
    @commands.hybrid_command(name="slowmode", description="Set slowmode for the channel")
    @commands.has_permissions(manage_channels=True)
    async def slowmode(self, ctx, seconds: int):
        """Set channel slowmode"""
        if seconds < 0 or seconds > 21600:
            await ctx.send("❌ Seconds must be between 0 and 21600 (6 hours).", ephemeral=True)
            return
            
        await ctx.channel.edit(slowmode_delay=seconds)
        
        if seconds == 0:
            await ctx.send("✅ Slowmode disabled.")
        else:
            await ctx.send(f"✅ Slowmode set to {seconds} seconds.")
            
    @commands.hybrid_command(name="lock", description="Lock the channel")
    @commands.has_permissions(manage_channels=True)
    async def lock(self, ctx):
        """Lock the current channel"""
        overwrite = ctx.channel.overwrites_for(ctx.guild.default_role)
        overwrite.send_messages = False
        await ctx.channel.set_permissions(ctx.guild.default_role, overwrite=overwrite)
        await ctx.send(f"🔒 **{ctx.channel.mention}** has been locked.")
        
    @commands.hybrid_command(name="unlock", description="Unlock the channel")
    @commands.has_permissions(manage_channels=True)
    async def unlock(self, ctx):
        """Unlock the current channel"""
        overwrite = ctx.channel.overwrites_for(ctx.guild.default_role)
        overwrite.send_messages = None
        await ctx.channel.set_permissions(ctx.guild.default_role, overwrite=overwrite)
        await ctx.send(f"🔓 **{ctx.channel.mention}** has been unlocked.")
        
    @commands.hybrid_command(name="modlogs", description="View recent moderation actions")
    @commands.has_permissions(manage_messages=True)
    async def modlogs(self, ctx, member: discord.Member = None):
        """View moderation logs (placeholder - integrate with database in production)"""
        embed = discord.Embed(
            title="📋 Moderation Logs",
            description="This is a placeholder. Connect to a database for full audit logs.",
            color=0x7289DA
        )
        embed.add_field(
            name="Integration Required",
            value="To enable full audit logging, connect this bot to a PostgreSQL/MongoDB database.",
            inline=False
        )
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(Moderation(bot))