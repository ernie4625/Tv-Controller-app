import { useSyncExternalStore } from 'react';

/**
 * User preferences. In-memory for now (reset on app close), like the favorites store; persisted
 * once AsyncStorage is added.
 */

export type HapticStrength = 'soft' | 'normal' | 'strong';

export type Settings = {
  haptics: boolean;
  hapticStrength: HapticStrength;
};

const DEFAULTS: Settings = { haptics: true, hapticStrength: 'normal' };

type Listener = () => void;

let settings: Settings = { ...DEFAULTS };
const listeners = new Set<Listener>();

export const settingsStore = {
  get: (): Settings => settings,

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  update(patch: Partial<Settings>) {
    settings = { ...settings, ...patch };
    listeners.forEach((l) => l());
  },

  reset() {
    settingsStore.update(DEFAULTS);
  },
};

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get, settingsStore.get);
}
