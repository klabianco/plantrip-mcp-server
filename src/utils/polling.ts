/**
 * Async polling utility for itinerary generation status
 */

import { ApiClient, ApiResponse } from './api-client.js';
import { config } from '../config.js';

export interface StatusResponse extends ApiResponse {
  status: string;
  progress_percent?: number;
  progress?: string;
  message?: string;
  new_itinerary_id?: number;
  outline?: {
    title?: string;
    days_summary?: Array<{
      day_number?: number;
      title?: string;
      focus?: string;
    }>;
  };
}

/**
 * Poll for itinerary generation completion
 */
export async function pollForCompletion(
  client: ApiClient,
  itineraryId: number,
  onProgress?: (status: StatusResponse) => void
): Promise<StatusResponse> {
  const completedStatuses = ['complete', 'error', 'cancelled'];
  let attempts = 0;

  while (attempts < config.maxPollingAttempts) {
    attempts++;

    const response = await client.executeTool('get_itinerary_status', {
      itinerary_id: itineraryId,
    }) as StatusResponse;

    if (onProgress) {
      onProgress(response);
    }

    if (completedStatuses.includes(response.status)) {
      return response;
    }

    // Wait before next poll
    await sleep(config.pollingIntervalMs);
  }

  throw new Error(
    `Itinerary generation timed out after ${config.maxPollingAttempts * config.pollingIntervalMs / 1000} seconds`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
