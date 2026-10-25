import { beforeEach, describe, expect, it } from 'vitest';
import { FAVORITES_KEY, loadFavorites, saveFavorites } from './favorites';
import { berlin } from '../test/fixtures';

describe('favorites storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips saved cities', () => {
    saveFavorites([berlin]);
    expect(loadFavorites()).toEqual([berlin]);
  });

  it('returns an empty list when nothing is stored', () => {
    expect(loadFavorites()).toEqual([]);
  });

  it('returns an empty list for corrupted JSON', () => {
    localStorage.setItem(FAVORITES_KEY, '{not json');
    expect(loadFavorites()).toEqual([]);
  });

  it('discards entries that do not match the city schema', () => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([{ id: 'oops' }]));
    expect(loadFavorites()).toEqual([]);
  });
});
