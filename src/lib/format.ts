/** Formats a temperature already expressed in the requested unit, e.g. `12°C`. */
export function formatTemperature(value: number, symbol: string): string {
  return `${Math.round(value)}${symbol}`;
}

/** Short weekday name for an ISO date string (YYYY-MM-DD), interpreted in local time. */
export function formatWeekday(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

export function formatCityName(city: { name: string; country?: string }): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}
