import { fetchJson } from './client';
import { forecastResponseSchema, geocodingResponseSchema } from './schemas';
import type { City, Forecast } from './schemas';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** Looks up cities by name. Returns an empty array when nothing matches. */
export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name: query.trim(),
    count: '5',
    language: 'en',
    format: 'json',
  }).toString();

  const data = await fetchJson(url, geocodingResponseSchema, signal);
  return data.results ?? [];
}

/** Loads the current conditions and a 7-day daily forecast for a coordinate pair. */
export async function fetchForecast(
  location: Pick<City, 'latitude' | 'longitude'>,
  unit: TemperatureUnit,
  signal?: AbortSignal,
): Promise<Forecast> {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,wind_speed_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: unit,
    wind_speed_unit: 'kmh',
  }).toString();

  return fetchJson(url, forecastResponseSchema, signal);
}
