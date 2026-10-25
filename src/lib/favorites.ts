import { z } from 'zod';
import { citySchema } from '../api/schemas';
import type { City } from '../api/schemas';

export const FAVORITES_KEY = 'dashboard.favorite-cities';

const favoritesSchema = z.array(citySchema);

/** Reads saved cities. Missing, invalid or corrupted data yields an empty list. */
export function loadFavorites(storage: Storage = localStorage): City[] {
  try {
    const raw = storage.getItem(FAVORITES_KEY);
    if (raw === null) {
      return [];
    }
    const parsed = favoritesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveFavorites(cities: City[], storage: Storage = localStorage): void {
  storage.setItem(FAVORITES_KEY, JSON.stringify(cities));
}
