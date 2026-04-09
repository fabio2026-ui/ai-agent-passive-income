---
name: mcp-client
description: Model Context Protocol client for connecting to various MCP servers. Enables AI to use external tools through standardized protocol.
version: 1.0.0
metadata:
  openclaw:
    emoji: 🔌
    requires:
      bins: ["node", "npm"]
---
# MCP Client Skill

## Available MCP Servers

### Filesystem
Access and manipulate local files through MCP.
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/root/.openclaw/workspace"]
    }
  }
}
```

### GitHub
Operate GitHub repos, issues, PRs through natural language.
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token"
      }
    }
  }
}
```

### Web Search
Search the web directly from AI conversations.
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_key"
      }
    }
  }
}
```

## Usage
Connect to MCP servers in openclaw.json configuration.
