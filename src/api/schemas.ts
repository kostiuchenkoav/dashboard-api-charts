import { z } from 'zod';

/**
 * Runtime schemas for the Open-Meteo responses used by the app.
 * Every response is validated before it reaches the UI, so an unexpected
 * payload fails loudly with a clear error instead of rendering broken data.
 */

export const citySchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  admin1: z.string().optional(),
});

export type City = z.infer<typeof citySchema>;

/** The geocoding API omits `results` entirely when nothing matches. */
export const geocodingResponseSchema = z.object({
  results: z.array(citySchema).optional(),
});

export const forecastResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    wind_speed_10m: z.number(),
    weather_code: z.number(),
  }),
  current_units: z.object({
    temperature_2m: z.string(),
    wind_speed_10m: z.string(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
});

export type Forecast = z.infer<typeof forecastResponseSchema>;
