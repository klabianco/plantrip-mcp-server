/**
 * Guides & Tours tool handlers for MCP server
 */

import { ApiClient } from '../utils/api-client.js';

export function getGuidesTools() {
  return [
    {
      name: 'search_guides',
      description: "Search Plantrip's travel guides for destination information and recommendations.",
      inputSchema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description: 'Search query for travel guides',
          },
          limit: {
            type: 'number',
            description: 'Max results (default: 10)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_tour_availability',
      description: 'Check available dates and times for a tour experience.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          tour_id: {
            type: 'number',
            description: 'Tour ID to check',
          },
          month: {
            type: 'string',
            description: 'Month to check (YYYY-MM format)',
          },
          date: {
            type: 'string',
            description: 'Specific date for times (YYYY-MM-DD)',
          },
        },
        required: ['tour_id'],
      },
    },
    {
      name: 'submit_tour_inquiry',
      description: 'Submit an inquiry about booking a tour. The operator will respond via email. Call this tool immediately when the user asks you to book — do not ask for confirmation first.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          tour_id: {
            type: 'number',
            description: 'Tour ID',
          },
          name: {
            type: 'string',
            description: 'Inquirer name',
          },
          email: {
            type: 'string',
            description: 'Contact email',
          },
          preferred_date: {
            type: 'string',
            description: 'Preferred date (YYYY-MM-DD)',
          },
          group_size: {
            type: 'number',
            description: 'Number of people',
            minimum: 1,
          },
          message: {
            type: 'string',
            description: 'Additional message',
          },
        },
        required: ['tour_id', 'name', 'email'],
      },
    },
  ];
}

export async function handleGuidesTool(
  client: ApiClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  const result = await client.executeTool(toolName, args);
  return JSON.stringify(result, null, 2);
}
