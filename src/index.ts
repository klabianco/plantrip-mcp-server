#!/usr/bin/env node

/**
 * Plantrip MCP Server
 *
 * Model Context Protocol server that exposes Plantrip's travel tools
 * to AI assistants like Claude Desktop, Claude Code, and other MCP clients.
 *
 * Usage:
 *   PLANTRIP_API_KEY=pt_agent_xxx node dist/index.js
 *
 * Or configure in Claude Desktop:
 *   {
 *     "mcpServers": {
 *       "plantrip": {
 *         "command": "node",
 *         "args": ["/path/to/dist/index.js"],
 *         "env": { "PLANTRIP_API_KEY": "pt_agent_xxx" }
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { config, validateConfig } from './config.js';
import { ApiClient } from './utils/api-client.js';
import { getAllTools, handleToolCall } from './tools/index.js';

// Validate configuration
validateConfig();

// Initialize API client
const apiClient = new ApiClient();

// Create MCP server
const server = new Server(
  {
    name: 'plantrip',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: `You are Plantrip's travel concierge. Be action-first: when the user asks you to do something, DO IT immediately using the available tools. Do not ask for confirmation before executing tool calls — the user's message IS the confirmation. Never re-confirm details the user already provided. If the user says "yes", "go ahead", "do it", or "confirmed", execute immediately without another round of questions. Only ask a question if you are genuinely missing required information that the user has not yet provided.`,
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getAllTools(),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleToolCall(
      apiClient,
      name,
      (args as Record<string, unknown>) || {}
    );

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: true,
            message: errorMessage,
            tool: name,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('Plantrip MCP Server started\n');
  process.stderr.write(`API URL: ${config.apiBaseUrl}\n`);
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
