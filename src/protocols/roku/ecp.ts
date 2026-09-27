/**
 * Roku External Control Protocol client (CLAUDE.md §3.1). Plain HTTP to port 8060; no pairing.
 * Status: implemented, UNTESTED on hardware (unit-tested against mocked HTTP only).
 */

import { fetchWithTimeout, isValidIPv4, TimeoutError, type FetchLike } from '../net';
import type { AppInfo, RemoteDevice, RemoteKey } from '../types';
import { parseApps, parseDeviceInfo, type RokuDeviceInfo } from './xml';

export const ROKU_PORT = 8060;

/** RemoteKey → ECP key name. Power is special-cased (see `press`). */
export const ROKU_KEYS: Readonly<Record<Exclude<RemoteKey, 'power'>, string>> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  select: 'Select',
  back: 'Back',
  home: 'Home',
  menu: 'Info',
  playPause: 'Play',
  rewind: 'Rev',
  fastForward: 'Fwd',
  volumeUp: 'VolumeUp',
  volumeDown: 'VolumeDown',
  mute: 'VolumeMute',
};

export type RokuErrorCode = 'invalid-ip' | 'unreachable' | 'forbidden' | 'not-roku' | 'http';

/** Errors carry a plain-language message that the UI shows as-is. */
export class RokuError extends Error {
  constructor(
    public code: RokuErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'RokuError';
  }
}

const MOBILE_APPS_FIX =
  'On the Roku open Settings → System → Advanced system settings → Control by mobile apps, and set Network access to Enabled or Permissive.';

export function rokuBaseUrl(ip: string): string {
  return `http://${ip.trim()}:${ROKU_PORT}`;
}

type Options = { fetch?: FetchLike; timeoutMs?: number };

/** GET /query/device-info — also the reachability probe used by discovery. */
export async function fetchRokuInfo(ip: string, opts: Options = {}): Promise<RokuDeviceInfo> {
  const f = opts.fetch ?? fetch;
  if (!isValidIPv4(ip)) throw new RokuError('invalid-ip', `"${ip}" isn't a valid IP address.`);
  let res: Response;
  try {
    res = await fetchWithTimeout(
      f,
      `${rokuBaseUrl(ip)}/query/device-info`,
      {},
      opts.timeoutMs ?? 3000,
    );
  } catch (e) {
    throw new RokuError(
      'unreachable',
      e instanceof TimeoutError
        ? `No answer from ${ip}. Check the IP and that your iPhone is on the same Wi-Fi as the TV.`
        : `Couldn't reach a Roku at ${ip}. Check the IP, and that the Roku is on. ${MOBILE_APPS_FIX}`,
    );
  }
  if (res.status === 403)
    throw new RokuError('forbidden', `The Roku refused control. ${MOBILE_APPS_FIX}`);
  if (!res.ok)
    throw new RokuError('http', `The device at ${ip} answered with error ${res.status}.`);
  try {
    return parseDeviceInfo(await res.text());
  } catch {
    throw new RokuError('not-roku', `The device at ${ip} doesn't look like a Roku.`);
  }
}

export class RokuDevice implements RemoteDevice {
  readonly kind = 'roku' as const;
  id: string;
  name: string;
  info?: RokuDeviceInfo;
  private connected = false;
  private readonly f: FetchLike;
  private readonly timeoutMs: number;

  constructor(
    public ip: string,
    opts: Options & { name?: string; id?: string } = {},
  ) {
    this.f = opts.fetch ?? fetch;
    this.timeoutMs = opts.timeoutMs ?? 3000;
    this.id = opts.id ?? `roku:${ip}`;
    this.name = opts.name ?? 'Roku';
  }

  get baseUrl(): string {
    return rokuBaseUrl(this.ip);
  }

  async connect(): Promise<void> {
    this.info = await fetchRokuInfo(this.ip, { fetch: this.f, timeoutMs: this.timeoutMs });
    this.name = this.info.name;
    if (this.info.deviceId) this.id = `roku:${this.info.deviceId}`;
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  /** POST to an ECP path. Any failure marks the device disconnected so the UI can say so. */
  private async post(path: string): Promise<void> {
    let res: Response;
    try {
      res = await fetchWithTimeout(
        this.f,
        `${this.baseUrl}${path}`,
        { method: 'POST' },
        this.timeoutMs,
      );
    } catch {
      this.connected = false;
      throw new RokuError(
        'unreachable',
        `Lost contact with ${this.name}. Is it on and on the same Wi-Fi?`,
      );
    }
    if (res.status === 403)
      throw new RokuError('forbidden', `${this.name} refused the command. ${MOBILE_APPS_FIX}`);
    if (!res.ok) throw new RokuError('http', `${this.name} answered with error ${res.status}.`);
  }

  /** Raw ECP key press, e.g. `Home`, `PowerOff`, `Lit_a`. */
  sendKey(ecpKey: string): Promise<void> {
    return this.post(`/keypress/${ecpKey}`);
  }

  async press(key: RemoteKey): Promise<void> {
    if (key !== 'power') return this.sendKey(ROKU_KEYS[key]);
    // Toggle: Roku TVs report their power mode; players have no real "off", so PowerOff = standby.
    let on = true;
    try {
      const info = await fetchRokuInfo(this.ip, { fetch: this.f, timeoutMs: this.timeoutMs });
      on = info.powerMode === undefined || info.powerMode === 'PowerOn';
    } catch {
      // Fall through and try PowerOff.
    }
    return this.sendKey(on ? 'PowerOff' : 'PowerOn');
  }

  hold(key: RemoteKey, down: boolean): Promise<void> {
    const name = key === 'power' ? 'Power' : ROKU_KEYS[key];
    return this.post(`/${down ? 'keydown' : 'keyup'}/${name}`);
  }

  /** One `Lit_` keypress per character, in order (Roku drops characters sent in parallel). */
  async typeText(text: string): Promise<void> {
    for (const ch of Array.from(text)) {
      await this.sendKey(`Lit_${encodeURIComponent(ch)}`);
    }
  }

  async listApps(): Promise<AppInfo[]> {
    let res: Response;
    try {
      res = await fetchWithTimeout(this.f, `${this.baseUrl}/query/apps`, {}, this.timeoutMs);
    } catch {
      this.connected = false;
      throw new RokuError('unreachable', `Lost contact with ${this.name}.`);
    }
    if (!res.ok) throw new RokuError('http', `${this.name} answered with error ${res.status}.`);
    return parseApps(await res.text(), this.baseUrl);
  }

  launchApp(appId: string): Promise<void> {
    return this.post(`/launch/${encodeURIComponent(appId)}`);
  }
}
