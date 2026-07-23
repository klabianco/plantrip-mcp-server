/**
 * Travel tool handlers for MCP server
 */

import { ApiClient } from '../utils/api-client.js';

export function getTravelTools() {
  return [
    {
      name: 'generate_packing_list',
      description:
        'Generate an AI-powered packing list for a trip based on destination, weather, and activities.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          destination: {
            type: 'string',
            description: 'Travel destination',
          },
          when: {
            type: 'string',
            description: 'When the trip occurs (month, season, or dates)',
          },
          trip_details: {
            type: 'string',
            description: 'Trip activities or purpose',
          },
          itinerary_id: {
            type: 'number',
            description: 'Generate from existing itinerary ID',
          },
        },
        required: ['destination'],
      },
    },
    {
      name: 'ask_travel_expert',
      description:
        'Ask any travel question and get expert answers with current information about destinations, visas, safety, tips, etc.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          question: {
            type: 'string',
            description: 'Travel-related question',
          },
        },
        required: ['question'],
      },
    },
    {
      name: 'get_weather_insights',
      description:
        'Get detailed weather and climate insights for a destination including seasonal patterns and what to expect.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          destination: {
            type: 'string',
            description: 'Destination for weather info',
          },
          when: {
            type: 'string',
            description: 'When you plan to visit',
          },
        },
        required: ['destination'],
      },
    },
    {
      name: 'estimate_trip_cost',
      description:
        'Get a detailed budget breakdown for a trip including accommodation, food, transport, and activities.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          destination: {
            type: 'string',
            description: 'Travel destination',
          },
          days: {
            type: 'number',
            description: 'Number of days',
            minimum: 1,
          },
          origin: {
            type: 'string',
            description: 'Where traveling from',
          },
          travelers: {
            type: 'number',
            description: 'Number of travelers',
            minimum: 1,
          },
          budget_level: {
            type: 'string',
            description: 'Budget level',
            enum: ['budget', 'moderate', 'luxury'],
          },
        },
        required: ['destination', 'days'],
      },
    },
  ];
}

export async function handleTravelTool(
  client: ApiClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  const result = await client.executeTool(toolName, args);
  return JSON.stringify(result, null, 2);
}
