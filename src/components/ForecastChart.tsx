import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Forecast } from '../api/schemas';
import { formatWeekday } from '../lib/format';
import { describeWeatherCode } from '../lib/weatherCodes';

interface ForecastChartProps {
  daily: Forecast['daily'];
  unitLabel: string;
}

export function ForecastChart({ daily, unitLabel }: ForecastChartProps) {
  const rows = daily.time.map((date, index) => ({
    date,
    day: formatWeekday(date),
    high: daily.temperature_2m_max[index],
    low: daily.temperature_2m_min[index],
    condition: describeWeatherCode(daily.weather_code[index]),
  }));

  return (
    <figure className="forecast">
      <figcaption className="visually-hidden">Прогноз на 7 дней: дневные максимумы и минимумы</figcaption>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={56} unit={unitLabel} />
          <Tooltip formatter={(value: unknown) => `${Math.round(Number(value))}${unitLabel}`} />
          <Legend />
          <Line type="monotone" dataKey="high" name="Максимум" stroke="#ef4444" dot={false} />
          <Line type="monotone" dataKey="low" name="Минимум" stroke="#3b82f6" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      {/* The same data as a table, so screen reader users get the numbers without the chart. */}
      <table className="visually-hidden">
        <caption>Дневные максимальные и минимальные температуры</caption>
        <thead>
          <tr>
            <th scope="col">День</th>
            <th scope="col">Макс.</th>
            <th scope="col">Мин.</th>
            <th scope="col">Погода</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date}>
              <td>{row.day}</td>
              <td>
                {Math.round(row.high)}
                {unitLabel}
              </td>
              <td>
                {Math.round(row.low)}
                {unitLabel}
              </td>
              <td>{row.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
