import { useCallback, useEffect, useState } from 'react';
import type { City } from '../api/schemas';
import { loadFavorites, saveFavorites } from '../lib/favorites';

/** Keeps the list of tracked cities in state and mirrors it to localStorage. */
export function useFavoriteCities() {
  const [cities, setCities] = useState<City[]>(() => loadFavorites());

  useEffect(() => {
    saveFavorites(cities);
  }, [cities]);

  const addCity = useCallback((city: City) => {
    setCities((prev) => (prev.some((item) => item.id === city.id) ? prev : [...prev, city]));
  }, []);

  const removeCity = useCallback((id: number) => {
    setCities((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { cities, addCity, removeCity };
}
