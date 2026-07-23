/**
 * HTTP client for the Plantrip Agent API
 */

import { config } from '../config.js';

export interface ApiResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
  [key: string]: unknown;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.apiKey = config.apiKey;
  }

  /**
   * Execute a tool via the execute endpoint
   */
  async executeTool(toolName: string, args: Record<string, unknown>): Promise<ApiResponse> {
    return this.post('/execute', {
      tool: toolName,
      arguments: args,
    });
  }

  /**
   * Make a GET request to the API
   */
  async get(path: string, params?: Record<string, string>): Promise<ApiResponse> {
    let url = `${this.baseUrl}${path}`;

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    return this.handleResponse(response);
  }

  /**
   * Make a POST request to the API
   */
  async post(path: string, body: Record<string, unknown>): Promise<ApiResponse> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    return this.handleResponse(response);
  }

  private async handleResponse(response: Response): Promise<ApiResponse> {
    const text = await response.text();

    let data: ApiResponse;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
      const message = data.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  }
}
