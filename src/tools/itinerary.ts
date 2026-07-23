/**
 * Itinerary tool handlers for MCP server
 */

import { ApiClient } from '../utils/api-client.js';
import { pollForCompletion } from '../utils/polling.js';

export function getItineraryTools() {
  return [
    {
      name: 'create_itinerary',
      description:
        'Create a new travel itinerary for a destination. Returns the itinerary ID and polls for completion automatically. The generation takes 30-60 seconds.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          destination: {
            type: 'string',
            description: 'Travel destination (city, country, or region)',
          },
          days: {
            type: 'number',
            description: 'Number of days (1-30)',
            minimum: 1,
            maximum: 30,
          },
          preferences: {
            type: 'string',
            description: 'Travel preferences (e.g., "food and culture", "adventure", "budget")',
          },
          start_date: {
            type: 'string',
            description: 'Trip start date (YYYY-MM-DD format)',
          },
          travelers: {
            type: 'number',
            description: 'Number of travelers',
            minimum: 1,
          },
          budget: {
            type: 'string',
            description: 'Budget level',
            enum: ['budget', 'moderate', 'luxury'],
          },
        },
        required: ['destination', 'days'],
      },
    },
    {
      name: 'get_itinerary_status',
      description: 'Check the generation status of an itinerary.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          itinerary_id: {
            type: 'number',
            description: 'Itinerary ID to check',
          },
        },
        required: ['itinerary_id'],
      },
    },
    {
      name: 'get_itinerary',
      description: 'Retrieve a complete itinerary with all details.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          itinerary_id: {
            type: 'number',
            description: 'Itinerary ID to retrieve',
          },
        },
        required: ['itinerary_id'],
      },
    },
    {
      name: 'modify_itinerary',
      description: 'Modify an existing itinerary using natural language instructions.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          itinerary_id: {
            type: 'number',
            description: 'Itinerary ID to modify',
          },
          instructions: {
            type: 'string',
            description: 'Natural language instructions for changes',
          },
        },
        required: ['itinerary_id', 'instructions'],
      },
    },
    {
      name: 'list_user_trips',
      description: 'List saved trips for the authenticated user.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: 'Max results (default: 20)',
          },
          offset: {
            type: 'number',
            description: 'Pagination offset',
          },
        },
      },
    },
    {
      name: 'save_itinerary',
      description: "Save an itinerary to user's trips.",
      inputSchema: {
        type: 'object' as const,
        properties: {
          itinerary_id: {
            type: 'number',
            description: 'Itinerary ID to save',
          },
          custom_title: {
            type: 'string',
            description: 'Custom title for the trip',
          },
        },
        required: ['itinerary_id'],
      },
    },
    {
      name: 'delete_trip',
      description: "Remove a trip from user's saved trips.",
      inputSchema: {
        type: 'object' as const,
        properties: {
          trip_id: {
            type: 'number',
            description: 'Trip ID to delete',
          },
        },
        required: ['trip_id'],
      },
    },
  ];
}

export async function handleItineraryTool(
  client: ApiClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case 'create_itinerary': {
      // Step 1: Start creation
      const createResult = await client.executeTool('create_itinerary', args);

      if (createResult.error) {
        return JSON.stringify(createResult);
      }

      const itineraryId = createResult.itinerary_id as number;

      // Step 2: Poll for completion
      try {
        const statusResult = await pollForCompletion(client, itineraryId, (status) => {
          // Log progress (visible in MCP transport)
          if (status.progress_percent) {
            process.stderr.write(
              `Itinerary ${itineraryId}: ${status.progress} (${status.progress_percent}%)\n`
            );
          }
        });

        if (statusResult.status === 'complete') {
          // Step 3: Fetch the full itinerary
          const itinerary = await client.executeTool('get_itinerary', {
            itinerary_id: itineraryId,
          });
          return JSON.stringify(itinerary, null, 2);
        }

        return JSON.stringify(statusResult);
      } catch (error) {
        // Polling timed out or errored - return what we have
        return JSON.stringify({
          itinerary_id: itineraryId,
          status: 'still_generating',
          message:
            'Itinerary is still being generated. Use get_itinerary_status to check progress, then get_itinerary when complete.',
          outline: createResult.outline,
        });
      }
    }

    case 'modify_itinerary': {
      const modifyResult = await client.executeTool('modify_itinerary', args);

      if (modifyResult.error) {
        return JSON.stringify(modifyResult);
      }

      // If already complete (blocking modification)
      if (modifyResult.status === 'complete' && modifyResult.new_itinerary_id) {
        const itinerary = await client.executeTool('get_itinerary', {
          itinerary_id: modifyResult.new_itinerary_id,
        });
        return JSON.stringify(itinerary, null, 2);
      }

      // Async modification - poll for completion
      const itineraryId = args.itinerary_id as number;
      try {
        const statusResult = await pollForCompletion(client, itineraryId);

        if (statusResult.status === 'complete') {
          const fetchId = statusResult.new_itinerary_id || itineraryId;
          const itinerary = await client.executeTool('get_itinerary', {
            itinerary_id: fetchId,
          });
          return JSON.stringify(itinerary, null, 2);
        }

        return JSON.stringify(statusResult);
      } catch {
        return JSON.stringify({
          itinerary_id: itineraryId,
          status: 'still_modifying',
          message: 'Modifications still in progress. Use get_itinerary_status to check.',
        });
      }
    }

    default: {
      // Direct pass-through for simple tools
      const result = await client.executeTool(toolName, args);
      return JSON.stringify(result, null, 2);
    }
  }
}
