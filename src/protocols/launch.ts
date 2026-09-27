import type { LaunchTarget, Shortcut } from '@/catalog/shortcuts';

import type { AppInfo, DeviceKind } from './types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]/g, '');

/**
 * Decides what a shortcut tile does on a given device.
 *
 * With the device's installed-app list: prefer the catalog's app ID when it is installed, else match
 * the shortcut's names against installed app names (IDs drift; names rarely do). Without a list, trust
 * the catalog ID. Returns null when the app isn't on the TV or the shortcut has no action for this kind.
 */
export function resolveLaunch(
  shortcut: Shortcut,
  kind: DeviceKind,
  installed?: readonly AppInfo[],
): LaunchTarget | null {
  const target = shortcut[kind];
  if (target && target.type !== 'app') return target;
  if (!installed) return target ?? null;

  if (target && installed.some((a) => a.id === target.id)) return target;

  const names = (shortcut.match ?? [shortcut.label]).map(norm);
  const exact = installed.find((a) => names.includes(norm(a.name)));
  if (exact) return { type: 'app', id: exact.id };
  const partial = installed.find((a) =>
    names.some((n) => n.length >= 3 && norm(a.name).startsWith(n)),
  );
  return partial ? { type: 'app', id: partial.id } : null;
}
