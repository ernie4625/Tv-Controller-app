import {
  DEFAULT_FAVORITES,
  MAX_FAVORITES,
  SHORTCUTS,
  getShortcut,
  supportsDevice,
} from '@/catalog/shortcuts';
import { LOGOS } from '@/catalog/logos';

describe('shortcut catalog', () => {
  it('has unique IDs', () => {
    const ids = SHORTCUTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes the requested services', () => {
    for (const id of [
      'netflix',
      'youtube',
      'prime',
      'max',
      'hulu',
      'paramount',
      'nfl',
      'nba',
      'mlb',
      'fifa',
      'settings',
      'rokuhome',
      'firetvhome',
    ]) {
      expect(getShortcut(id)).toBeDefined();
    }
  });

  it('gives every tile a valid gradient', () => {
    for (const s of SHORTCUTS) {
      for (const c of s.colors) expect(c).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('only uses known IDs for the default favorites, within the limit', () => {
    expect(DEFAULT_FAVORITES.length).toBeLessThanOrEqual(MAX_FAVORITES);
    for (const id of DEFAULT_FAVORITES) expect(getShortcut(id)).toBeDefined();
  });

  it('every shortcut can launch on at least one device kind', () => {
    for (const s of SHORTCUTS) {
      expect(supportsDevice(s, 'roku') || supportsDevice(s, 'firetv')).toBe(true);
    }
  });

  it('keeps device-specific system tiles to their device', () => {
    expect(supportsDevice(getShortcut('rokuhome')!, 'firetv')).toBe(false);
    expect(supportsDevice(getShortcut('firetvhome')!, 'roku')).toBe(false);
    expect(supportsDevice(getShortcut('nfl')!, 'roku')).toBe(true);
  });

  it('gives every tile a logo, a wordmark or an icon, and every logo has artwork', () => {
    for (const s of SHORTCUTS) {
      expect(s.logo || s.wordmark || s.icon).toBeTruthy();
      if (s.logo) expect(LOGOS[s.logo]).toBeDefined();
    }
  });
});
