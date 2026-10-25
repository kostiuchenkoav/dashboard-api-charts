import { describe, expect, it } from 'vitest';
import { describeWeatherCode } from './weatherCodes';

describe('describeWeatherCode', () => {
  it('maps known WMO codes to readable labels', () => {
    expect(describeWeatherCode(0)).toBe('Clear sky');
    expect(describeWeatherCode(63)).toBe('Moderate rain');
    expect(describeWeatherCode(99)).toBe('Thunderstorm with heavy hail');
  });

  it('falls back for unknown codes', () => {
    expect(describeWeatherCode(999)).toBe('Unknown conditions');
  });
});
