"""
Welcome Cog - Handles new member welcome messages
"""

import discord
from discord.ext import commands
import os

class Welcome(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        
    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        """Send welcome message when a new member joins"""
        
        # Get welcome channel
        welcome_channel_id = os.getenv('WELCOME_CHANNEL_ID')
        if not welcome_channel_id:
            return
            
        try:
            channel = self.bot.get_channel(int(welcome_channel_id))
            if not channel:
                return
                
            # Create welcome embed
            embed = discord.Embed(
                title="🎉 Welcome to DevSecOps Hub!",
                description=f"Hey {member.mention}, welcome to **{member.guild.name}**! 🔒",
                color=0x00D4AA,
                timestamp=discord.utils.utcnow()
            )
            
            embed.add_field(
                name="🚀 Getting Started",
                value="• Read the rules in <#rules-channel>\n"
                      "• Introduce yourself in <#introductions>\n"
                      "• Check out our resources below",
                inline=False
            )
            
            embed.add_field(
                name="📚 Resources",
                value="• [DevSecOps Roadmap](https://roadmap.sh/devops)\n"
                      "• [OWASP Top 10](https://owasp.org/www-project-top-ten/)\n"
                      "• [Security Best Practices](https://cheatsheetseries.owasp.org/)",
                inline=False
            )
            
            embed.add_field(
                name="💬 Channels",
                value="• `#general` - General discussions\n"
                      "• `#security-news` - Latest security updates\n"
                      "• `#tools` - Security tools discussion\n"
                      "• `#help` - Ask for help",
                inline=False
            )
            
            embed.set_thumbnail(url=member.display_avatar.url)
            embed.set_footer(text=f"Member #{len(member.guild.members)} | ID: {member.id}")
            
            await channel.send(embed=embed)
            
            # Send DM to new member
            try:
                dm_embed = discord.Embed(
                    title="Welcome to DevSecOps Hub! 👋",
                    description="We're excited to have you in our security community!",
                    color=0x00D4AA
                )
                dm_embed.add_field(
                    name="Quick Tips",
                    value="• Use `!faq` to see common questions\n"
                          "• Use `!help` to see available commands\n"
                          "• Be respectful and follow our code of conduct",
                    inline=False
                )
                await member.send(embed=dm_embed)
            except discord.Forbidden:
                pass  # User has DMs disabled
                
        except Exception as e:
            print(f"Error in welcome message: {e}")
            
    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        """Log when a member leaves"""
        welcome_channel_id = os.getenv('WELCOME_CHANNEL_ID')
        if not welcome_channel_id:
            return
            
        try:
            channel = self.bot.get_channel(int(welcome_channel_id))
            if channel:
                await channel.send(
                    f"👋 **{member.name}** has left the server. "
                    f"We now have {len(member.guild.members)} members."
                )
        except Exception as e:
            print(f"Error in leave message: {e}")

    # Slash command to test welcome message
    @commands.hybrid_command(name="welcome", description="Test the welcome message")
    @commands.has_permissions(administrator=True)
    async def welcome_test(self, ctx, member: discord.Member = None):
        """Test welcome message (Admin only)"""
        member = member or ctx.author
        
        embed = discord.Embed(
            title="🎉 Welcome to DevSecOps Hub!",
            description=f"Hey {member.mention}, welcome to **{ctx.guild.name}**! 🔒",
            color=0x00D4AA
        )
        
        embed.add_field(
            name="🚀 Getting Started",
            value="• Read the rules\n"
                  "• Introduce yourself\n"
                  "• Check out resources",
            inline=False
        )
        
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(Welcome(bot))