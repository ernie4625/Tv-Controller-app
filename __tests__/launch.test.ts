import { getShortcut } from '@/catalog/shortcuts';
import { resolveLaunch } from '@/protocols/launch';
import type { AppInfo } from '@/protocols/types';

const s = (id: string) => getShortcut(id)!;
const installed: AppInfo[] = [
  { id: '12', name: 'Netflix' },
  { id: '77777', name: 'HBO Max' },
  { id: '99999', name: 'NBA App' },
];

describe('resolveLaunch', () => {
  it('uses the catalog channel ID when it is installed', () => {
    expect(resolveLaunch(s('netflix'), 'roku', installed)).toEqual({ type: 'app', id: '12' });
  });

  it('falls back to matching the name when the ID has changed', () => {
    expect(resolveLaunch(s('max'), 'roku', installed)).toEqual({ type: 'app', id: '77777' });
  });

  it('matches name prefixes for shortcuts without a known ID', () => {
    expect(resolveLaunch(s('nba'), 'roku', installed)).toEqual({ type: 'app', id: '99999' });
  });

  it('returns null when the app is not on the TV', () => {
    expect(resolveLaunch(s('hulu'), 'roku', installed)).toBeNull();
  });

  it('trusts the catalog when the app list is not loaded yet', () => {
    expect(resolveLaunch(s('youtube'), 'roku')).toEqual({ type: 'app', id: '837' });
  });

  it('returns key actions for system tiles and nothing for other-device tiles', () => {
    expect(resolveLaunch(s('rokuhome'), 'roku', installed)).toEqual({ type: 'key', key: 'Home' });
    expect(resolveLaunch(s('firetvhome'), 'roku', installed)).toBeNull();
  });
});
