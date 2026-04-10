"""
AutoRole Cog - Automatic role assignment for new members and reaction roles
"""

import discord
from discord.ext import commands
import json
import os

class AutoRole(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.auto_role_id = os.getenv('AUTO_ROLE_ID')
        self.reaction_roles_file = 'data/reaction_roles.json'
        self.reaction_roles = self.load_reaction_roles()
        
    def load_reaction_roles(self):
        """Load reaction roles from file"""
        os.makedirs('data', exist_ok=True)
        if os.path.exists(self.reaction_roles_file):
            with open(self.reaction_roles_file, 'r') as f:
                return json.load(f)
        return {}
        
    def save_reaction_roles(self):
        """Save reaction roles to file"""
        os.makedirs('data', exist_ok=True)
        with open(self.reaction_roles_file, 'w') as f:
            json.dump(self.reaction_roles, f, indent=2)
            
    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        """Auto-assign role to new members"""
        if not self.auto_role_id:
            return
            
        try:
            role = member.guild.get_role(int(self.auto_role_id))
            if role:
                await member.add_roles(role, reason="Auto-role on join")
                print(f"✅ Added role {role.name} to {member.name}")
        except Exception as e:
            print(f"❌ Error assigning auto-role: {e}")
            
    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload):
        """Handle reaction role additions"""
        if payload.user_id == self.bot.user.id:
            return
            
        message_id = str(payload.message_id)
        if message_id not in self.reaction_roles:
            return
            
        guild = self.bot.get_guild(payload.guild_id)
        if not guild:
            return
            
        member = guild.get_member(payload.user_id)
        if not member:
            return
            
        emoji = str(payload.emoji)
        role_data = self.reaction_roles[message_id]
        
        if emoji in role_data.get('roles', {}):
            role_id = role_data['roles'][emoji]
            role = guild.get_role(int(role_id))
            if role:
                await member.add_roles(role, reason="Reaction role")
                
    @commands.Cog.listener()
    async def on_raw_reaction_remove(self, payload):
        """Handle reaction role removals"""
        message_id = str(payload.message_id)
        if message_id not in self.reaction_roles:
            return
            
        guild = self.bot.get_guild(payload.guild_id)
        if not guild:
            return
            
        member = guild.get_member(payload.user_id)
        if not member:
            return
            
        emoji = str(payload.emoji)
        role_data = self.reaction_roles[message_id]
        
        if emoji in role_data.get('roles', {}):
            role_id = role_data['roles'][emoji]
            role = guild.get_role(int(role_id))
            if role:
                await member.remove_roles(role, reason="Reaction role removed")

    # Slash Commands
    @commands.hybrid_command(name="autorole_set", description="Set the auto-role for new members")
    @commands.has_permissions(administrator=True)
    async def set_autorole(self, ctx, role: discord.Role):
        """Set auto-role (Admin only)"""
        self.auto_role_id = str(role.id)
        # Update .env file or use database in production
        await ctx.send(f"✅ Auto-role set to: {role.mention}", ephemeral=True)
        
    @commands.hybrid_command(name="reactionrole_create", description="Create a reaction role message")
    @commands.has_permissions(manage_roles=True)
    async def create_reaction_role(
        self, 
        ctx, 
        channel: discord.TextChannel,
        title: str,
        description: str
    ):
        """Create a reaction role message"""
        embed = discord.Embed(
            title=f"🎭 {title}",
            description=description,
            color=0x7289DA
        )
        embed.add_field(
            name="How to use",
            value="React with the emoji below to get the corresponding role!",
            inline=False
        )
        
        message = await channel.send(embed=embed)
        
        # Store in memory
        self.reaction_roles[str(message.id)] = {
            'channel_id': channel.id,
            'roles': {}
        }
        self.save_reaction_roles()
        
        await ctx.send(
            f"✅ Reaction role message created!\n"
            f"Message ID: `{message.id}`\n"
            f"Use `/reactionrole_add` to add roles to this message.",
            ephemeral=True
        )
        
    @commands.hybrid_command(name="reactionrole_add", description="Add a role to reaction role message")
    @commands.has_permissions(manage_roles=True)
    async def add_reaction_role(
        self,
        ctx,
        message_id: str,
        emoji: str,
        role: discord.Role
    ):
        """Add a role to a reaction role message"""
        if message_id not in self.reaction_roles:
            await ctx.send("❌ Message ID not found in reaction roles database.", ephemeral=True)
            return
            
        # Add to database
        self.reaction_roles[message_id]['roles'][emoji] = str(role.id)
        self.save_reaction_roles()
        
        # Add reaction to message
        try:
            channel_id = self.reaction_roles[message_id]['channel_id']
            channel = self.bot.get_channel(channel_id)
            message = await channel.fetch_message(int(message_id))
            await message.add_reaction(emoji)
            
            await ctx.send(
                f"✅ Added {emoji} → {role.mention} to reaction roles!",
                ephemeral=True
            )
        except Exception as e:
            await ctx.send(f"❌ Error adding reaction: {e}", ephemeral=True)
            
    @commands.hybrid_command(name="reactionrole_list", description="List all reaction roles")
    @commands.has_permissions(manage_roles=True)
    async def list_reaction_roles(self, ctx):
        """List all reaction role messages"""
        if not self.reaction_roles:
            await ctx.send("No reaction roles configured.", ephemeral=True)
            return
            
        embed = discord.Embed(
            title="🎭 Reaction Roles",
            color=0x7289DA
        )
        
        for msg_id, data in self.reaction_roles.items():
            channel = self.bot.get_channel(data['channel_id'])
            roles_text = "\n".join([
                f"{emoji} → <@&{role_id}>"
                for emoji, role_id in data['roles'].items()
            ]) or "No roles configured"
            
            embed.add_field(
                name=f"Message: {msg_id[:8]}... in #{channel.name if channel else 'Unknown'}",
                value=roles_text,
                inline=False
            )
            
        await ctx.send(embed=embed, ephemeral=True)

async def setup(bot):
    await bot.add_cog(AutoRole(bot))