import type { City, Forecast } from '../api/schemas';

export const berlin: City = {
  id: 2950159,
  name: 'Berlin',
  latitude: 52.52437,
  longitude: 13.41053,
  country: 'Germany',
  admin1: 'Berlin',
};

export const forecast: Forecast = {
  current: {
    time: '2026-10-25T16:00',
    temperature_2m: 12.4,
    wind_speed_10m: 15.2,
    weather_code: 2,
  },
  current_units: {
    temperature_2m: '°C',
    wind_speed_10m: 'km/h',
  },
  daily: {
    time: [
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ],
    temperature_2m_max: [13, 11, 9, 8, 10, 12, 14],
    temperature_2m_min: [6, 5, 3, 2, 4, 5, 7],
    weather_code: [2, 61, 3, 0, 1, 3, 63],
  },
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
