/**
 * Configuration for the Plantrip MCP Server
 */

export const config = {
  apiBaseUrl: process.env.PLANTRIP_API_URL || 'https://plantrip.io/api/agent',
  apiKey: process.env.PLANTRIP_API_KEY || '',
  pollingIntervalMs: 3000,
  maxPollingAttempts: 120, // ~6 minutes max wait
  requestTimeoutMs: 120000, // 2 minutes
};

export function validateConfig(): void {
  if (!config.apiKey) {
    throw new Error(
      'PLANTRIP_API_KEY environment variable is required. ' +
      'Get your API key at https://plantrip.io/developers'
    );
  }
}
