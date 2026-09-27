import { useSyncExternalStore } from 'react';

import { DEFAULT_FAVORITES, MAX_FAVORITES, getShortcut } from '@/catalog/shortcuts';

/**
 * The user's Remote-screen shortcuts, in display order.
 *
 * In-memory for now: edits last until the app is closed. Persisting to AsyncStorage (spec §2)
 * is a follow-up once `@react-native-async-storage/async-storage` is added; only `save`/`load`
 * need to change.
 */

type Listener = () => void;

let favorites: readonly string[] = [...DEFAULT_FAVORITES];
const listeners = new Set<Listener>();

function set(next: readonly string[]) {
  favorites = next.filter((id, i) => getShortcut(id) && next.indexOf(id) === i);
  listeners.forEach((l) => l());
}

export const favoritesStore = {
  get: (): readonly string[] => favorites,

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  has: (id: string): boolean => favorites.includes(id),

  isFull: (): boolean => favorites.length >= MAX_FAVORITES,

  /** Adds or removes a shortcut. Returns false when adding would exceed the limit. */
  toggle(id: string): boolean {
    if (favorites.includes(id)) {
      set(favorites.filter((f) => f !== id));
      return true;
    }
    if (favorites.length >= MAX_FAVORITES) return false;
    set([...favorites, id]);
    return true;
  },

  /** Moves a shortcut one place left (-1) or right (+1). */
  move(id: string, dir: -1 | 1) {
    const i = favorites.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= favorites.length) return;
    const next = [...favorites];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  },

  reset() {
    set([...DEFAULT_FAVORITES]);
  },
};

export function useFavorites(): readonly string[] {
  return useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get, favoritesStore.get);
}
