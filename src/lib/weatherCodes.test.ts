import { describe, expect, it } from 'vitest';
import { describeWeatherCode } from './weatherCodes';

describe('describeWeatherCode', () => {
  it('maps known WMO codes to readable labels', () => {
    expect(describeWeatherCode(0)).toBe('Ясно');
    expect(describeWeatherCode(63)).toBe('Умеренный дождь');
    expect(describeWeatherCode(99)).toBe('Гроза с сильным градом');
  });

  it('falls back for unknown codes', () => {
    expect(describeWeatherCode(999)).toBe('Неизвестно');
  });
});
