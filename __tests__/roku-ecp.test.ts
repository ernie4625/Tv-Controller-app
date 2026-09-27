import { readFileSync } from 'fs';
import { join } from 'path';

import { RokuDevice, RokuError, fetchRokuInfo } from '@/protocols/roku/ecp';
import { parseApps, parseDeviceInfo } from '@/protocols/roku/xml';

const fixture = (name: string) => readFileSync(join(__dirname, 'fixtures/roku', name), 'utf8');
const DEVICE_INFO = fixture('device-info.xml');
const APPS = fixture('apps.xml');

type Route = { status?: number; body?: string; fail?: boolean };

/** Fake fetch keyed by "METHOD path"; records every call. */
function fakeFetch(routes: Record<string, Route> = {}) {
  const calls: string[] = [];
  const fn = jest.fn(async (url: string, init?: RequestInit) => {
    const path = url.replace(/^http:\/\/[\d.]+:8060/, '');
    const key = `${init?.method ?? 'GET'} ${path}`;
    calls.push(key);
    const r = routes[key] ?? (key.startsWith('POST ') ? { status: 200 } : { status: 404 });
    if (r.fail) throw new TypeError('Network request failed');
    return new Response(r.body ?? '', { status: r.status ?? 200 });
  });
  return { fetch: fn, calls };
}

const online = () =>
  fakeFetch({
    'GET /query/device-info': { body: DEVICE_INFO },
    'GET /query/apps': { body: APPS },
  });

async function connected(f = online()) {
  const d = new RokuDevice('192.168.1.50', { fetch: f.fetch });
  await d.connect();
  f.calls.length = 0;
  return { d, calls: f.calls };
}

describe('Roku XML', () => {
  it('reads device info, preferring the name the user gave the TV', () => {
    const info = parseDeviceInfo(DEVICE_INFO);
    expect(info).toMatchObject({
      name: 'Living Room TV',
      model: 'TCL & Roku 55" 4K TV',
      deviceId: 'S0A123456789',
      isTv: true,
      powerMode: 'PowerOn',
    });
  });

  it('rejects documents that are not device-info', () => {
    expect(() => parseDeviceInfo('<html>router login</html>')).toThrow();
  });

  it('lists only real apps, decodes names and builds icon URLs', () => {
    const apps = parseApps(APPS, 'http://192.168.1.50:8060');
    expect(apps.map((a) => a.name)).toEqual([
      'Netflix',
      'YouTube',
      'HBO Max',
      'Hulu',
      'Apple TV',
      'NBA App',
    ]);
    expect(apps[0]).toEqual({
      id: '12',
      name: 'Netflix',
      iconUri: 'http://192.168.1.50:8060/query/icon/12',
    });
  });
});

describe('RokuDevice', () => {
  it('connects via device-info and takes the TV name and ID', async () => {
    const f = online();
    const d = new RokuDevice('192.168.1.50', { fetch: f.fetch });
    await d.connect();
    expect(d.isConnected()).toBe(true);
    expect(d.name).toBe('Living Room TV');
    expect(d.id).toBe('roku:S0A123456789');
    expect(f.fetch.mock.calls[0][0]).toBe('http://192.168.1.50:8060/query/device-info');
  });

  it('maps every remote key to the documented ECP key', async () => {
    const { d, calls } = await connected();
    for (const k of [
      'up',
      'down',
      'left',
      'right',
      'select',
      'back',
      'home',
      'menu',
      'playPause',
      'rewind',
      'fastForward',
      'volumeUp',
      'volumeDown',
      'mute',
    ] as const) {
      await d.press(k);
    }
    expect(calls).toEqual(
      [
        'Up',
        'Down',
        'Left',
        'Right',
        'Select',
        'Back',
        'Home',
        'Info',
        'Play',
        'Rev',
        'Fwd',
        'VolumeUp',
        'VolumeDown',
        'VolumeMute',
      ].map((k) => `POST /keypress/${k}`),
    );
  });

  it('power toggles off when the TV reports it is on', async () => {
    const { d, calls } = await connected();
    await d.press('power');
    expect(calls).toEqual(['GET /query/device-info', 'POST /keypress/PowerOff']);
  });

  it('power turns on when the TV is in standby', async () => {
    const f = online();
    const { d, calls } = await connected(f);
    f.fetch.mockImplementationOnce(
      async () => new Response(DEVICE_INFO.replace('PowerOn', 'DisplayOff'), { status: 200 }),
    );
    await d.press('power');
    expect(calls.at(-1)).toBe('POST /keypress/PowerOn');
  });

  it('uses keydown/keyup for hold-to-repeat', async () => {
    const { d, calls } = await connected();
    await d.hold('right', true);
    await d.hold('right', false);
    expect(calls).toEqual(['POST /keydown/Right', 'POST /keyup/Right']);
  });

  it('types text one URL-encoded character at a time, in order', async () => {
    const { d, calls } = await connected();
    await d.typeText('a b&é');
    expect(calls).toEqual([
      'POST /keypress/Lit_a',
      'POST /keypress/Lit_%20',
      'POST /keypress/Lit_b',
      'POST /keypress/Lit_%26',
      'POST /keypress/Lit_%C3%A9',
    ]);
  });

  it('lists and launches apps', async () => {
    const { d, calls } = await connected();
    const apps = await d.listApps();
    expect(apps).toHaveLength(6);
    await d.launchApp('12');
    expect(calls).toEqual(['GET /query/apps', 'POST /launch/12']);
  });

  it('explains how to fix "Control by mobile apps" on a 403', async () => {
    const f = fakeFetch({ 'GET /query/device-info': { status: 403 } });
    await expect(fetchRokuInfo('192.168.1.50', { fetch: f.fetch })).rejects.toMatchObject({
      code: 'forbidden',
      message: expect.stringContaining('Control by mobile apps'),
    });
  });

  it('reports an unreachable TV in plain language', async () => {
    const f = fakeFetch({ 'GET /query/device-info': { fail: true } });
    const err = await fetchRokuInfo('192.168.1.50', { fetch: f.fetch }).catch((e) => e);
    expect(err).toBeInstanceOf(RokuError);
    expect(err.code).toBe('unreachable');
  });

  it('times out instead of hanging', async () => {
    const hang = jest.fn(() => new Promise<Response>(() => {}));
    const err = await fetchRokuInfo('192.168.1.50', { fetch: hang, timeoutMs: 20 }).catch((e) => e);
    expect(err.code).toBe('unreachable');
    expect(err.message).toContain('No answer');
  });

  it('rejects a bad IP without touching the network', async () => {
    const f = fakeFetch();
    await expect(fetchRokuInfo('192.168.1', { fetch: f.fetch })).rejects.toMatchObject({
      code: 'invalid-ip',
    });
    expect(f.fetch).not.toHaveBeenCalled();
  });

  it('marks itself disconnected when a command cannot reach the TV', async () => {
    const f = online();
    const { d } = await connected(f);
    f.fetch.mockImplementationOnce(async () => {
      throw new TypeError('Network request failed');
    });
    await expect(d.press('up')).rejects.toMatchObject({ code: 'unreachable' });
    expect(d.isConnected()).toBe(false);
  });
});
