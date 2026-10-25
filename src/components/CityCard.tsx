import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchForecast } from '../api/weather';
import type { TemperatureUnit } from '../api/weather';
import type { City } from '../api/schemas';
import { formatCityName, formatTemperature } from '../lib/format';
import { describeWeatherCode } from '../lib/weatherCodes';
// Recharts is the heaviest dependency, so the chart is loaded on demand.
const ForecastChart = lazy(() =>
  import('./ForecastChart').then((module) => ({ default: module.ForecastChart })),
);

/** Open-Meteo updates its models roughly every hour; refreshing every 15 minutes keeps data current. */
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

interface CityCardProps {
  city: City;
  unit: TemperatureUnit;
  onRemove: (id: number) => void;
}

export function CityCard({ city, unit, onRemove }: CityCardProps) {
  const headingId = `city-${city.id}`;

  const forecast = useQuery({
    queryKey: ['forecast', city.id, unit],
    queryFn: ({ signal }) => fetchForecast(city, unit, signal),
    refetchInterval: REFRESH_INTERVAL_MS,
  });

  const data = forecast.data;

  return (
    <article className="city-card" aria-labelledby={headingId}>
      <header className="city-card-header">
        <h2 id={headingId}>{formatCityName(city)}</h2>
        <button type="button" className="remove" aria-label={`Удалить ${city.name}`} onClick={() => onRemove(city.id)}>
          Удалить
        </button>
      </header>

      {forecast.isPending && (
        <p className="muted" role="status">
          Загрузка прогноза…
        </p>
      )}

      {forecast.isError && (
        <div className="error" role="alert">
          <p>{forecast.error instanceof Error ? forecast.error.message : 'Не удалось загрузить прогноз.'}</p>
          <button type="button" onClick={() => void forecast.refetch()}>
            Повторить
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="current">
            <p className="temperature" data-testid="current-temperature">
              {formatTemperature(data.current.temperature_2m, data.current_units.temperature_2m)}
            </p>
            <p>{describeWeatherCode(data.current.weather_code)}</p>
            <p className="muted">
              Ветер {Math.round(data.current.wind_speed_10m)} {data.current_units.wind_speed_10m} · обновлено{' '}
              {data.current.time.slice(11, 16)} (местное время)
            </p>
          </div>
          <Suspense fallback={<p className="muted">Загрузка графика…</p>}>
            <ForecastChart daily={data.daily} unitLabel={data.current_units.temperature_2m} />
          </Suspense>
        </>
      )}
    </article>
  );
}
