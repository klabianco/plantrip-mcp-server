# Plantrip MCP Server

[![npm version](https://badge.fury.io/js/plantrip-mcp-server.svg)](https://www.npmjs.com/package/plantrip-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server that connects AI assistants like Claude to [Plantrip's](https://plantrip.io) travel planning tools. Create itineraries, generate packing lists, get weather insights, estimate trip costs, and more.

## Features

- **Create Itineraries** - Generate detailed day-by-day travel plans with activities, costs, and locations
- **Packing Lists** - AI-powered packing lists based on destination, weather, and activities
- **Weather Insights** - Detailed climate information and weather patterns
- **Cost Estimates** - Budget breakdowns for accommodations, food, transport, and activities
- **Travel Expert** - Ask any travel question and get expert answers
- **Travel Guides** - Search Plantrip's library of destination guides
- **Tour Availability** - Check tour dates and submit booking inquiries

## Quick Start

### 1. Get an API Key

1. Go to [plantrip.io/developers](https://plantrip.io/developers)
2. Sign in (free — no subscription required)
3. Create a new API key

### 2. Configure Claude Desktop

Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "plantrip": {
      "command": "npx",
      "args": ["-y", "plantrip-mcp-server"],
      "env": {
        "PLANTRIP_API_KEY": "pt_agent_your_key_here"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

Quit and reopen Claude Desktop to load the server.

## Usage

Ask Claude things like:

- *"Create a 5-day itinerary for Tokyo focused on food and culture"*
- *"What should I pack for a hiking trip to Patagonia in March?"*
- *"What's the weather like in Bali in August?"*
- *"How much would a week in Iceland cost for 2 people?"*
- *"What are the visa requirements for US citizens visiting Vietnam?"*

## Available Tools

| Tool | Description |
|------|-------------|
| `create_itinerary` | Create a new travel itinerary |
| `get_itinerary_status` | Poll generation status |
| `get_itinerary` | Retrieve complete itinerary |
| `modify_itinerary` | Modify with natural language |
| `list_user_trips` | List saved trips |
| `save_itinerary` | Save to user's trips |
| `delete_trip` | Remove from saved trips |
| `generate_packing_list` | AI packing list |
| `ask_travel_expert` | Travel Q&A |
| `get_weather_insights` | Weather/climate info |
| `estimate_trip_cost` | Budget breakdown |
| `search_guides` | Search travel guides |
| `get_tour_availability` | Check tour dates |
| `submit_tour_inquiry` | Tour booking inquiry |

## Claude Code Setup

Add to `.mcp.json` in your project:

```json
{
  "mcpServers": {
    "plantrip": {
      "command": "npx",
      "args": ["-y", "plantrip-mcp-server"],
      "env": {
        "PLANTRIP_API_KEY": "pt_agent_your_key_here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PLANTRIP_API_KEY` | Yes | Your API key from [plantrip.io/developers](https://plantrip.io/developers) |
| `PLANTRIP_API_URL` | No | API base URL (default: `https://plantrip.io/api/agent`) |

## REST API

You can also use the Plantrip API directly:

```bash
curl -X POST https://plantrip.io/api/agent/execute \
  -H "X-API-Key: pt_agent_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create_itinerary",
    "arguments": {
      "destination": "Tokyo, Japan",
      "days": 5
    }
  }'
```

Full API docs at [plantrip.io/developers](https://plantrip.io/developers).

## Rate Limits

- 60 requests/minute
- 10,000 requests/day

## Links

- [Plantrip](https://plantrip.io)
- [Developer Portal & API Docs](https://plantrip.io/developers)
- [Get API Key](https://plantrip.io/developers#keys)

## License

MIT
