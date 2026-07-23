/**
 * Tool registration and routing for MCP server
 */

import { ApiClient } from '../utils/api-client.js';
import { getItineraryTools, handleItineraryTool } from './itinerary.js';
import { getTravelTools, handleTravelTool } from './travel.js';
import { getGuidesTools, handleGuidesTool } from './guides.js';

// All itinerary tool names
const itineraryTools = new Set([
  'create_itinerary',
  'get_itinerary_status',
  'get_itinerary',
  'modify_itinerary',
  'list_user_trips',
  'save_itinerary',
  'delete_trip',
]);

// All travel tool names
const travelTools = new Set([
  'generate_packing_list',
  'ask_travel_expert',
  'get_weather_insights',
  'estimate_trip_cost',
]);

// All guides/tours tool names
const guidesTools = new Set([
  'search_guides',
  'get_tour_availability',
  'submit_tour_inquiry',
]);

/**
 * Get all tool definitions for MCP registration
 */
export function getAllTools() {
  return [
    ...getItineraryTools(),
    ...getTravelTools(),
    ...getGuidesTools(),
  ];
}

/**
 * Route a tool call to the appropriate handler
 */
export async function handleToolCall(
  client: ApiClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  if (itineraryTools.has(toolName)) {
    return handleItineraryTool(client, toolName, args);
  }

  if (travelTools.has(toolName)) {
    return handleTravelTool(client, toolName, args);
  }

  if (guidesTools.has(toolName)) {
    return handleGuidesTool(client, toolName, args);
  }

  throw new Error(`Unknown tool: ${toolName}`);
}
