import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCities } from '../api/weather';
import type { City } from '../api/schemas';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatCityName } from '../lib/format';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface CitySearchProps {
  onSelect: (city: City) => void;
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), DEBOUNCE_MS);
  const enabled = query.length >= MIN_QUERY_LENGTH;

  const search = useQuery({
    queryKey: ['geocoding', query],
    queryFn: ({ signal }) => searchCities(query, signal),
    enabled,
  });

  function handleSelect(city: City) {
    onSelect(city);
    setInput('');
  }

  return (
    <section className="city-search" aria-label="Добавление города">
      <label htmlFor="city-query">Поиск города</label>
      <input
        id="city-query"
        type="search"
        placeholder="Например, Берлин"
        autoComplete="off"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />

      {enabled && search.isLoading && (
        <p className="muted" role="status">
          Searching…
        </p>
      )}

      {enabled && search.isError && (
        <p className="error" role="alert">
          {search.error instanceof Error ? search.error.message : 'Поиск не удался. Попробуйте ещё раз.'}
        </p>
      )}

      {enabled && search.data && search.data.length === 0 && (
        <p className="muted">No cities found for “{query}”.</p>
      )}

      {enabled && search.data && search.data.length > 0 && (
        <ul className="search-results">
          {search.data.map((city) => {
            const label = formatCityName(city);
            return (
              <li key={city.id}>
                <button type="button" aria-label={`Добавить ${label}`} onClick={() => handleSelect(city)}>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
