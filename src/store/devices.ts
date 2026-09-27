import { useSyncExternalStore } from 'react';

import type { Shortcut } from '@/catalog/shortcuts';
import { resolveLaunch } from '@/protocols/launch';
import { isValidIPv4 } from '@/protocols/net';
import { scanSubnet, subnetsToScan, type Found } from '@/protocols/roku/discovery';
import { RokuDevice } from '@/protocols/roku/ecp';
import type { AppInfo, DeviceKind, RemoteKey } from '@/protocols/types';

/**
 * Saved TVs, the active connection and discovery state.
 * In-memory for now (like favorites): saved devices are forgotten when the app closes until
 * AsyncStorage is added — then last-used auto-connect (M5) can build on `saved` + `currentId`.
 */

export type SavedDevice = {
  id: string;
  name: string;
  ip: string;
  kind: DeviceKind;
  model?: string;
};

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export type DevicesState = {
  saved: readonly SavedDevice[];
  currentId?: string;
  status: ConnectionStatus;
  error?: string;
  apps?: readonly AppInfo[];
  scanning: boolean;
  found: readonly Found[];
};

/** Message the UI can show as-is. */
export class UserFacingError extends Error {}

const INITIAL: DevicesState = { saved: [], status: 'idle', scanning: false, found: [] };

let state: DevicesState = INITIAL;
let device: RokuDevice | null = null;
let scanAbort: { aborted: boolean } | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<DevicesState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.';
}

function requireDevice(): RokuDevice {
  if (!device || state.status !== 'connected') {
    throw new UserFacingError('Connect a TV first: tap the bar at the top of the Remote screen.');
  }
  return device;
}

/** Runs a device command; on failure records the error so the status bar shows it. */
async function run<T>(fn: (d: RokuDevice) => Promise<T>): Promise<T> {
  const d = requireDevice();
  try {
    return await fn(d);
  } catch (e) {
    if (!d.isConnected()) set({ status: 'error', error: message(e) });
    throw new UserFacingError(message(e));
  }
}

export const devicesStore = {
  get: (): DevicesState => state,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  current(): SavedDevice | undefined {
    return state.saved.find((d) => d.id === state.currentId);
  },

  /** Connects to a TV by IP and remembers it. */
  async connect(ip: string, kind: DeviceKind = 'roku'): Promise<SavedDevice> {
    const addr = ip.trim();
    if (kind === 'firetv') {
      throw new UserFacingError('Fire TV control arrives in the next update. Roku works now.');
    }
    if (!isValidIPv4(addr)) {
      throw new UserFacingError(`"${addr}" isn't a valid IP address. It looks like 192.168.1.20.`);
    }
    set({ status: 'connecting', error: undefined });
    const d = new RokuDevice(addr);
    try {
      await d.connect();
    } catch (e) {
      set({ status: 'error', error: message(e) });
      throw new UserFacingError(message(e));
    }
    device?.disconnect();
    device = d;
    const saved: SavedDevice = { id: d.id, name: d.name, ip: addr, kind, model: d.info?.model };
    set({
      saved: [saved, ...state.saved.filter((s) => s.id !== saved.id && s.ip !== addr)],
      currentId: saved.id,
      status: 'connected',
      apps: undefined,
    });
    void devicesStore.refreshApps().catch(() => {});
    return saved;
  },

  /** Reconnects to a saved TV. */
  select(id: string): Promise<SavedDevice> {
    const s = state.saved.find((d) => d.id === id);
    if (!s) return Promise.reject(new UserFacingError('That TV is no longer saved.'));
    return devicesStore.connect(s.ip, s.kind);
  },

  forget(id: string) {
    if (state.currentId === id) {
      device?.disconnect();
      device = null;
      set({ currentId: undefined, status: 'idle', apps: undefined, error: undefined });
    }
    set({ saved: state.saved.filter((d) => d.id !== id) });
  },

  press: (key: RemoteKey) => run((d) => d.press(key)),

  typeText: (text: string) => run((d) => d.typeText(text)),

  launchApp: (appId: string) => run((d) => d.launchApp(appId)),

  async refreshApps(): Promise<readonly AppInfo[]> {
    const apps = await run((d) => d.listApps());
    set({ apps });
    return apps;
  },

  /** Opens a shortcut tile on the current TV. */
  async launch(shortcut: Shortcut): Promise<void> {
    if (!device || state.status !== 'connected') {
      throw new UserFacingError(`Connect a TV to open ${shortcut.label}.`);
    }
    const d = device;
    const target = resolveLaunch(shortcut, d.kind, state.apps);
    if (!target) {
      throw new UserFacingError(
        shortcut[d.kind] || shortcut.match
          ? `${shortcut.label} isn't installed on ${d.name}.`
          : `${shortcut.label} isn't available on Roku.`,
      );
    }
    if (target.type === 'app') return run((dev) => dev.launchApp(target.id));
    if (target.type === 'key') return run((dev) => dev.sendKey(target.key));
    throw new UserFacingError(`${shortcut.label} isn't available on Roku.`);
  },

  /** Scans likely home subnets for Rokus; stops after the first subnet that has any. */
  async scan(): Promise<readonly Found[]> {
    scanAbort = { aborted: false };
    const signal = scanAbort;
    set({ scanning: true, found: [] });
    try {
      for (const subnet of subnetsToScan(state.saved.map((s) => s.ip))) {
        await scanSubnet(subnet, {
          signal,
          onFound: (hit) => {
            if (!state.found.some((f) => f.ip === hit.ip)) set({ found: [...state.found, hit] });
          },
        });
        if (state.found.length > 0 || signal.aborted) break;
      }
    } finally {
      if (scanAbort === signal) set({ scanning: false });
    }
    return state.found;
  },

  stopScan() {
    if (scanAbort) scanAbort.aborted = true;
    set({ scanning: false });
  },

  /** Tests only. */
  reset() {
    if (scanAbort) scanAbort.aborted = true;
    device = null;
    state = INITIAL;
    listeners.forEach((l) => l());
  },
};

export function useDevices(): DevicesState {
  return useSyncExternalStore(devicesStore.subscribe, devicesStore.get, devicesStore.get);
}
