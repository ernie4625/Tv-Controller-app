import { DEFAULT_FAVORITES, MAX_FAVORITES, SHORTCUTS } from '@/catalog/shortcuts';
import { favoritesStore } from '@/store/favorites';

describe('favorites store', () => {
  beforeEach(() => favoritesStore.reset());

  it('starts with the defaults', () => {
    expect(favoritesStore.get()).toEqual(DEFAULT_FAVORITES);
  });

  it('adds and removes a shortcut', () => {
    expect(favoritesStore.toggle('nfl')).toBe(true);
    expect(favoritesStore.get().at(-1)).toBe('nfl');
    favoritesStore.toggle('nfl');
    expect(favoritesStore.has('nfl')).toBe(false);
  });

  it('refuses to add past the limit', () => {
    for (const s of SHORTCUTS) favoritesStore.toggle(s.id);
    expect(favoritesStore.get()).toHaveLength(MAX_FAVORITES);
    expect(favoritesStore.isFull()).toBe(true);
  });

  it('reorders and ignores moves off either end', () => {
    const [first, second] = favoritesStore.get();
    favoritesStore.move(second, -1);
    expect(favoritesStore.get().slice(0, 2)).toEqual([second, first]);
    favoritesStore.move(second, -1);
    expect(favoritesStore.get()[0]).toBe(second);
  });

  it('notifies subscribers', () => {
    const listener = jest.fn();
    const unsubscribe = favoritesStore.subscribe(listener);
    favoritesStore.toggle('nba');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    favoritesStore.toggle('nba');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
