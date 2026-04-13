# DevSecOps Hub Discord Bot

A comprehensive Discord bot designed specifically for DevSecOps communities, featuring welcome messages, auto-role assignment, security news feed, FAQ responder, and moderation tools.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Discord.py](https://img.shields.io/badge/discord.py-2.x-7289da.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 1. 🎉 Welcome Messages
- Automatic welcome message when new members join
- Customizable welcome embed with server info
- DM to new members with quick tips
- Leave notifications

### 2. 🎭 Auto-Role Assignment
- Automatic role assignment for new members
- Reaction role system (self-assignable roles)
- Easy setup with slash commands
- Persistent storage

### 3. 🔒 Security News Feed
- Automated security news from multiple sources:
  - The Hacker News
  - BleepingComputer
  - CVE Database
  - US-CERT Alerts
- Updates every 30 minutes
- Manual news lookup with `/securitynews`
- CVE lookup with `/cve_lookup`

### 4. 📚 FAQ Responder
- Pre-loaded DevSecOps FAQs:
  - Career guidance
  - Security best practices
  - Tool recommendations
  - Certification paths
- Fuzzy matching for similar questions
- Easy to add new FAQs

### 5. 🛡️ Moderation Tools
- Member Management: Kick, Ban, Mute/Unmute
- Warning System with tracking
- Message Purge
- Channel Lock/Unlock
- Slowmode control
- Auto-moderation (invite blocking, caps filter)

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- A Discord bot token ([Get one here](https://discord.com/developers/applications))
- Discord server with admin permissions

### Installation

1. **Clone or download the bot files**
```bash
git clone <repository-url>
cd discord-bot
```

2. **Create a virtual environment (recommended)**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

5. **Run the bot**
```bash
python bot.py
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Required
DISCORD_TOKEN=your_bot_token_here

# Optional - Channel IDs (right-click channel → Copy Channel ID)
WELCOME_CHANNEL_ID=1234567890123456789
NEWS_CHANNEL_ID=1234567890123456789

# Optional - Role IDs (right-click role → Copy Role ID)
AUTO_ROLE_ID=1234567890123456789

# Bot Settings
BOT_PREFIX=!
```

### How to get Channel/Role IDs

1. Enable Developer Mode: User Settings → Advanced → Developer Mode
2. Right-click on a channel/role
3. Click "Copy Channel ID" or "Copy Role ID"

## 📖 Commands

### General Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/help` | Show help menu | `/help [category]` |
| `/ping` | Check bot latency | `/ping` |
| `/stats` | Bot statistics | `/stats` |
| `/serverinfo` | Server information | `/serverinfo` |
| `/userinfo` | User information | `/userinfo [@user]` |
| `/invite` | Get bot invite link | `/invite` |
| `/botinfo` | Bot information | `/botinfo` |

### Security Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/securitynews` | Get latest security news | `/securitynews [count]` |
| `/cve_lookup` | Look up a CVE | `/cve_lookup CVE-2024-XXXX` |
| `/news_sources` | List news sources | `/news_sources` |
| `/faq` | Ask a question | `/faq [question]` |
| `/faq_list` | List all FAQs | `/faq_list` |

### Moderation Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/kick` | Kick a member | `/kick @user reason` |
| `/ban` | Ban a member | `/ban @user reason` |
| `/unban` | Unban a user | `/unban user_id` |
| `/mute` | Timeout/mute member | `/mute @user 10 m` |
| `/unmute` | Remove timeout | `/unmute @user` |
| `/warn` | Warn a member | `/warn @user reason` |
| `/warnings` | View warnings | `/warnings [@user]` |
| `/clearwarnings` | Clear warnings | `/clearwarnings @user` |
| `/purge` | Delete messages | `/purge 10` |
| `/slowmode` | Set slowmode | `/slowmode 5` |
| `/lock` | Lock channel | `/lock` |
| `/unlock` | Unlock channel | `/unlock` |

### Admin Commands (Admin only)
| Command | Description | Usage |
|---------|-------------|-------|
| `/autorole_set` | Set auto-role | `/autorole_set @role` |
| `/reactionrole_create` | Create reaction roles | `/reactionrole_create #channel Title Description` |
| `/reactionrole_add` | Add role to message | `/reactionrole_add msg_id emoji @role` |
| `/reactionrole_list` | List reaction roles | `/reactionrole_list` |
| `/faq_add` | Add FAQ | `/faq_add question answer category` |
| `/faq_remove` | Remove FAQ | `/faq_remove question` |
| `/welcome` | Test welcome msg | `/welcome [@user]` |

## 🏗️ Project Structure

```
discord-bot/
├── bot.py                 # Main bot file
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── README.md             # This file
├── cogs/                 # Feature modules
│   ├── __init__.py
│   ├── welcome.py        # Welcome messages
│   ├── autorole.py       # Auto-role & reaction roles
│   ├── security_news.py  # Security news feed
│   ├── faq.py            # FAQ responder
│   ├── moderation.py     # Moderation tools
│   └── utilities.py      # Utility commands
├── data/                 # Data storage (auto-created)
│   ├── faq.json
│   └── reaction_roles.json
└── bot.log              # Log file (auto-created)
```

## 🐳 Docker Deployment

### Using Docker

1. **Build the image**
```bash
docker build -t devsecops-bot .
```

2. **Run the container**
```bash
docker run -d \
  --name devsecops-bot \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  devsecops-bot
```

### Using Docker Compose

```bash
docker-compose up -d
```

## 🔧 Advanced Configuration

### Customizing FAQs

Edit `data/faq.json` or use commands:
```bash
/faq_add "your question" "your answer" "Category"
```

### Adding Reaction Roles

1. Create the message:
```bash
/reactionrole_create #roles "Select Your Roles" "React to get roles!"
```

2. Add roles to the message:
```bash
/reactionrole_add message_id 🎨 @Artist
/reactionrole_add message_id 💻 @Developer
```

### News Sources

The bot currently fetches from:
- The Hacker News
- BleepingComputer

To add more sources, edit `cogs/security_news.py` and add RSS feeds.

## 🐛 Troubleshooting

### Bot doesn't start
- Check your `DISCORD_TOKEN` is correct
- Ensure Python 3.10+ is installed
- Check `bot.log` for errors

### Commands don't work
- Ensure the bot has proper permissions
- Check if slash commands are synced (happens automatically on startup)
- Try kicking and re-inviting the bot

### News feed not posting
- Check `NEWS_CHANNEL_ID` is set correctly
- Ensure bot has permission to send messages in that channel
- Check `bot.log` for fetch errors

### Auto-role not working
- Verify `AUTO_ROLE_ID` is correct
- Ensure bot's role is higher than the auto-role
- Check bot has "Manage Roles" permission

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [discord.py](https://github.com/Rapptz/discord.py) - Discord API wrapper
- [DevSecOps Hub](https://discord.gg) - Community inspiration

## 📞 Support

Need help? Join our support server or create an issue on GitHub.

---

Made with ❤️ for the DevSecOps community