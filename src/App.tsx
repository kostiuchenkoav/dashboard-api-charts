import { useState } from 'react';
import type { TemperatureUnit } from './api/weather';
import { CitySearch } from './components/CitySearch';
import { CityCard } from './components/CityCard';
import { UnitToggle } from './components/UnitToggle';
import { useFavoriteCities } from './hooks/useFavoriteCities';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const { cities, addCity, removeCity } = useFavoriteCities();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Weather Dashboard</h1>
        <p className="muted">Live forecasts for the cities you track.</p>
      </header>

      <div className="toolbar">
        <CitySearch onSelect={addCity} />
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>

      {cities.length === 0 ? (
        <p className="empty">Search for a city above to add it to your dashboard.</p>
      ) : (
        <ul className="grid">
          {cities.map((city) => (
            <li key={city.id}>
              <CityCard city={city} unit={unit} onRemove={removeCity} />
            </li>
          ))}
        </ul>
      )}

      <footer className="app-footer muted">
        Weather data by <a href="https://open-meteo.com/">Open-Meteo.com</a> (CC BY 4.0).
      </footer>
    </div>
  );
}
