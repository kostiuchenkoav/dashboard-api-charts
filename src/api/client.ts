import type { z } from 'zod';

/** Error raised for any failed request: network problems, HTTP errors or invalid payloads. */
export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Fetches JSON from `url` and validates it against `schema`.
 * Aborted requests re-throw the original AbortError so TanStack Query can ignore them.
 */
export async function fetchJson<T>(url: URL, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    throw new ApiError('Network error. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  const payload: unknown = await response.json();
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError('The weather service returned an unexpected response.');
  }
  return result.data;
}
