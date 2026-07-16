'use client';

import { getApiBaseUrl } from '@/lib/api/config';

export class ApiError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getErrorMessage(payload: unknown, fallbackMessage: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = payload['message'];

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallbackMessage;
}

export async function apiRequest<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? ((await response.json()) as unknown) : await response.text();

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, `API error ${response.status}`), response.status);
  }

  return payload as TResponse;
}
