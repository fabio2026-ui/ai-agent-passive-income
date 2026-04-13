"""
FAQ Cog - Frequently Asked Questions responder with AI-like responses
"""

import discord
from discord.ext import commands
import json
import os
from difflib import get_close_matches

class FAQ(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.faq_file = 'data/faq.json'
        self.faqs = self.load_faqs()
        
    def load_faqs(self):
        """Load FAQs from file"""
        os.makedirs('data', exist_ok=True)
        default_faqs = {
            "what is devsecops": {
                "answer": "**DevSecOps** stands for Development, Security, and Operations. It's an approach to culture, automation, and platform design that integrates security as a shared responsibility throughout the entire IT lifecycle.",
                "category": "General"
            },
            "how to start learning": {
                "answer": "🎯 **Getting Started with DevSecOps:**\n\n"
                          "1. **Foundation**: Learn Linux, networking, and basic scripting\n"
                          "2. **DevOps**: Understand CI/CD, containers (Docker), orchestration (K8s)\n"
                          "3. **Security**: Study OWASP Top 10, secure coding practices\n"
                          "4. **Tools**: Familiarize with SAST/DAST tools, vulnerability scanners\n\n"
                          "📚 Resources:\n"
                          "• [DevSecOps Roadmap](https://roadmap.sh/devops)\n"
                          "• [OWASP](https://owasp.org)\n"
                          "• [Kubernetes Security Guide](https://kubernetes.io/docs/concepts/security/)",
                "category": "Career"
            },
            "best security tools": {
                "answer": "🔧 **Popular DevSecOps Tools:**\n\n"
                          "**SAST (Static Analysis):**\n"
                          "• SonarQube, Checkmarx, Semgrep, Bandit\n\n"
                          "**DAST (Dynamic Analysis):**\n"
                          "• OWASP ZAP, Burp Suite, Nikto\n\n"
                          "**SCA (Dependencies):**\n"
                          "• Snyk, Dependabot, OWASP Dependency-Check\n\n"
                          "**Secrets Detection:**\n"
                          "• GitLeaks, TruffleHog, GitGuardian\n\n"
                          "**Container Security:**\n"
                          "• Trivy, Clair, Anchore, Falco",
                "category": "Tools"
            },
            "how to secure docker": {
                "answer": "🐳 **Docker Security Best Practices:**\n\n"
                          "1. **Use official images** from Docker Hub\n"
                          "2. **Scan images** with Trivy or Clair before deployment\n"
                          "3. **Run as non-root** user in containers\n"
                          "4. **Use multi-stage builds** to reduce attack surface\n"
                          "5. **Keep base images updated**\n"
                          "6. **Use secrets management** (don't hardcode credentials)\n"
                          "7. **Enable Docker Content Trust**\n"
                          "8. **Use network policies** and limit container capabilities",
                "category": "Security"
            },
            "owasp top 10": {
                "answer": "🛡️ **OWASP Top 10 (2021):**\n\n"
                          "1. **Broken Access Control**\n"
                          "2. **Cryptographic Failures**\n"
                          "3. **Injection** (SQL, NoSQL, OS command)\n"
                          "4. **Insecure Design**\n"
                          "5. **Security Misconfiguration**\n"
                          "6. **Vulnerable and Outdated Components**\n"
                          "7. **Identification and Authentication Failures**\n"
                          "8. **Software and Data Integrity Failures**\n"
                          "9. **Security Logging and Monitoring Failures**\n"
                          "10. **Server-Side Request Forgery (SSRF)**\n\n"
                          "📖 [Full Details](https://owasp.org/Top10/)",
                "category": "Security"
            },
            "how to report bug": {
                "answer": "🐛 **How to Report Security Issues:**\n\n"
                          "1. **DO NOT** post vulnerabilities publicly\n"
                          "2. Contact moderators via DM with details\n"
                          "3. Include: affected system, steps to reproduce, impact\n"
                          "4. Allow reasonable time for remediation\n\n"
                          "⚠️ Responsible disclosure helps keep everyone safe!",
                "category": "Community"
            },
            "certifications": {
                "answer": "📜 **Recommended Security Certifications:**\n\n"
                          "**Entry Level:**\n"
                          "• CompTIA Security+\n"
                          "• AWS Certified Security - Specialty\n\n"
                          "**Intermediate:**\n"
                          "• Certified Ethical Hacker (CEH)\n"
                          "• GIAC Security Essentials (GSEC)\n\n"
                          "**Advanced:**\n"
                          "• CISSP\n"
                          "• OSCP (Offensive Security)\n"
                          "• GWAPT (Web App Pen Testing)",
                "category": "Career"
            },
            "kubernetes security": {
                "answer": "☸️ **Kubernetes Security Essentials:**\n\n"
                          "1. **RBAC**: Use Role-Based Access Control\n"
                          "2. **Pod Security**: Enable Pod Security Standards/PSPs\n"
                          "3. **Network Policies**: Segment traffic between pods\n"
                          "4. **Secrets**: Use external secret management (Vault, Sealed Secrets)\n"
                          "5. **Scanning**: Scan images before deployment\n"
                          "6. **Runtime Security**: Use Falco or similar for threat detection\n"
                          "7. **API Server**: Restrict access, enable audit logging\n"
                          "8. **etcd**: Encrypt at rest, limit access",
                "category": "Security"
            },
            "ci cd security": {
                "answer": "🔄 **CI/CD Pipeline Security:**\n\n"
                          "1. **Secure Credentials**: Use secret managers, never commit secrets\n"
                          "2. **Least Privilege**: Limit pipeline permissions\n"
                          "3. **Code Scanning**: Run SAST/DAST in pipeline\n"
                          "4. **Dependency Check**: Scan for vulnerable dependencies\n"
                          "5. **Signed Commits**: Require GPG-signed commits\n"
                          "6. **Immutable Artifacts**: Sign and verify build artifacts\n"
                          "7. **Pipeline as Code**: Version control your CI/CD config\n"
                          "8. **Audit Logs**: Monitor pipeline access and changes",
                "category": "Security"
            },
            "community rules": {
                "answer": "📋 **Community Guidelines:**\n\n"
                          "1. **Be respectful** to all members\n"
                          "2. **No spam** or self-promotion without permission\n"
                          "3. **Help others** when you can\n"
                          "4. **Share knowledge** and resources\n"
                          "5. **Stay on topic** in relevant channels\n"
                          "6. **No piracy** or illegal content sharing\n"
                          "7. **Use threads** for detailed discussions\n\n"
                          "Let's build a supportive security community! 🔒",
                "category": "Community"
            }
        }
        
        if os.path.exists(self.faq_file):
            with open(self.faq_file, 'r') as f:
                return json.load(f)
        else:
            # Create default FAQs
            with open(self.faq_file, 'w') as f:
                json.dump(default_faqs, f, indent=2)
            return default_faqs
            
    def save_faqs(self):
        """Save FAQs to file"""
        os.makedirs('data', exist_ok=True)
        with open(self.faq_file, 'w') as f:
            json.dump(self.faqs, f, indent=2)
            
    def find_best_match(self, query):
        """Find best matching FAQ"""
        query = query.lower().strip()
        
        # Exact match
        if query in self.faqs:
            return query
            
        # Close match
        matches = get_close_matches(query, self.faqs.keys(), n=1, cutoff=0.6)
        if matches:
            return matches[0]
            
        # Keyword matching
        for key in self.faqs.keys():
            keywords = key.split()
            if any(word in query for word in keywords if len(word) > 3):
                return key
                
        return None

    @commands.hybrid_command(name="faq", description="Get answers to common questions")
    async def faq(self, ctx, *, question: str = None):
        """FAQ command - answers common DevSecOps questions"""
        
        if not question:
            # Show FAQ categories
            embed = discord.Embed(
                title="📚 DevSecOps FAQ",
                description="Ask me anything about DevSecOps! Here are some popular topics:",
                color=0x00D4AA
            )
            
            # Group by category
            categories = {}
            for key, data in self.faqs.items():
                cat = data.get('category', 'General')
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append(key)
                
            for cat, questions in categories.items():
                embed.add_field(
                    name=f"📁 {cat}",
                    value="\n".join([f"• `{q}`" for q in questions[:5]]),
                    inline=True
                )
                
            embed.add_field(
                name="💡 Usage",
                value="Type `!faq <question>` or `/faq question:<question>`\n"
                      "Example: `!faq how to start learning`",
                inline=False
            )
            
            await ctx.send(embed=embed)
            return
            
        # Find matching FAQ
        match = self.find_best_match(question)
        
        if match:
            data = self.faqs[match]
            embed = discord.Embed(
                title=f"❓ {match.title()}",
                description=data['answer'],
                color=0x00D4AA
            )
            embed.set_footer(text=f"Category: {data.get('category', 'General')}")
            await ctx.send(embed=embed)
        else:
            # Suggest similar questions
            suggestions = get_close_matches(question.lower(), self.faqs.keys(), n=3, cutoff=0.4)
            
            embed = discord.Embed(
                title="❓ Question Not Found",
                description=f"I couldn't find an answer for: *{question}*",
                color=0xFFA500
            )
            
            if suggestions:
                embed.add_field(
                    name="💡 Did you mean?",
                    value="\n".join([f"• `{s}`" for s in suggestions]),
                    inline=False
                )
                
            embed.add_field(
                name="📋 All Topics",
                value="Type `!faq` to see all available topics",
                inline=False
            )
            
            await ctx.send(embed=embed)
            
    @commands.hybrid_command(name="faq_add", description="Add a new FAQ (Admin only)")
    @commands.has_permissions(administrator=True)
    async def add_faq(self, ctx, question: str, answer: str, category: str = "General"):
        """Add a new FAQ entry"""
        self.faqs[question.lower()] = {
            "answer": answer,
            "category": category
        }
        self.save_faqs()
        await ctx.send(f"✅ FAQ added: `{question}`", ephemeral=True)
        
    @commands.hybrid_command(name="faq_remove", description="Remove an FAQ (Admin only)")
    @commands.has_permissions(administrator=True)
    async def remove_faq(self, ctx, *, question: str):
        """Remove an FAQ entry"""
        match = self.find_best_match(question)
        if match and match in self.faqs:
            del self.faqs[match]
            self.save_faqs()
            await ctx.send(f"✅ FAQ removed: `{match}`", ephemeral=True)
        else:
            await ctx.send("❌ FAQ not found.", ephemeral=True)
            
    @commands.hybrid_command(name="faq_list", description="List all FAQs")
    async def list_faqs(self, ctx):
        """List all available FAQs"""
        embed = discord.Embed(
            title="📚 All FAQ Topics",
            color=0x00D4AA
        )
        
        categories = {}
        for key, data in self.faqs.items():
            cat = data.get('category', 'General')
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(key)
            
        for cat, questions in sorted(categories.items()):
            embed.add_field(
                name=f"📁 {cat} ({len(questions)})",
                value="\n".join([f"• `{q[:40]}{'...' if len(q) > 40 else ''}`" for q in questions]),
                inline=False
            )
            
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(FAQ(bot))