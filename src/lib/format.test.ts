import { describe, expect, it } from 'vitest';
import { formatCityName, formatTemperature } from './format';

describe('formatTemperature', () => {
  it('rounds to a whole number and appends the unit symbol', () => {
    expect(formatTemperature(12.4, '°C')).toBe('12°C');
    expect(formatTemperature(12.6, '°F')).toBe('13°F');
  });
});

describe('formatCityName', () => {
  it('combines the name with the country when available', () => {
    expect(formatCityName({ name: 'Berlin', country: 'Germany' })).toBe('Berlin, Germany');
  });

  it('uses only the name when no country is known', () => {
    expect(formatCityName({ name: 'Paris' })).toBe('Paris');
  });
});
