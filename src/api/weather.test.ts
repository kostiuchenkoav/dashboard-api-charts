import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './client';
import { fetchForecast, searchCities } from './weather';
import { berlin, forecast, jsonResponse } from '../test/fixtures';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('sends a trimmed query and returns the matching cities', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [berlin] }));
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities('  Berlin ');

    expect(cities).toEqual([berlin]);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(url.searchParams.get('name')).toBe('Berlin');
    expect(url.searchParams.get('count')).toBe('5');
  });

  it('returns an empty array when the API reports no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ generationtime_ms: 0.4 })));

    await expect(searchCities('zzzz')).resolves.toEqual([]);
  });
});

describe('fetchForecast', () => {
  it('requests the chosen temperature unit and the 7-day daily forecast', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(forecast));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchForecast(berlin, 'fahrenheit');

    expect(result).toEqual(forecast);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit');
    expect(url.searchParams.get('forecast_days')).toBe('7');
    expect(url.searchParams.get('latitude')).toBe(String(berlin.latitude));
  });

  it('throws an ApiError carrying the HTTP status on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })));

    const error = await fetchForecast(berlin, 'celsius').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500 });
  });

  it('rejects payloads that do not match the expected shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ current: {} })));

    await expect(fetchForecast(berlin, 'celsius')).rejects.toThrow('unexpected response');
  });

  it('wraps network failures in an ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(fetchForecast(berlin, 'celsius')).rejects.toThrow('Network error');
  });
});
