#!/bin/bash
# ContentAI 每日内容生成器
# 自动生成社交媒体内容

DATE=$(date +%Y%m%d)
CONTENT_DIR="/root/.openclaw/workspace/contentai/marketing/daily-content"
mkdir -p $CONTENT_DIR

echo "=== 生成每日内容 $DATE ==="

# Twitter/X 推文
cat > "$CONTENT_DIR/twitter-$DATE.txt" << EOF
🚀 ContentAI Update $DATE

✅ 4 AI tools launched
✅ Zero operating cost
✅ BYOK model
✅ Chinese cross-border e-commerce focus

Try it free: https://dweb.link/ipfs/QmdEWJUbT6nMgbsx1ftnUBLW8kHZAXwRStp3ZjLCHQdRZD/

#AI #ContentCreation #FreeTools #IndieHackers
EOF

# LinkedIn 帖子
cat > "$CONTENT_DIR/linkedin-$DATE.txt" << EOF
Just launched ContentAI - a suite of 4 AI tools for content creators.

What makes it different?
→ Zero operating costs (BYOK model)
→ Focus on Chinese cross-border e-commerce
→ Completely free
→ Open source philosophy

In a market where competitors charge $13-40/month, we're offering professional-grade AI tools for free.

Check it out and let me know what you think!

#AI #ContentMarketing #SaaS #Bootstrapped
EOF

# Reddit 帖子
cat > "$CONTENT_DIR/reddit-$DATE.txt" << EOF
[Showoff] I built 4 AI content tools and launched them for $0

Hi r/SideProject!

I just launched ContentAI - a suite of 4 AI-powered content creation tools:

1. ContentAI - General content generation
2. CodeReview AI - Multi-agent code review
3. ReplyAI - Chrome extension for email replies
4. MCP Hub - Tool marketplace

Why it's different:
- Zero operating costs (users bring their own API key)
- Focus on Chinese cross-border e-commerce
- Completely free
- No signup required

Would love your feedback!

Links in comments.
EOF

echo "✅ 内容已生成到 $CONTENT_DIR"
ls -la $CONTENT_DIR/
