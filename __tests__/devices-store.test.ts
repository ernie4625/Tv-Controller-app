import { readFileSync } from 'fs';
import { join } from 'path';

import { getShortcut } from '@/catalog/shortcuts';
import { devicesStore } from '@/store/devices';

const fx = (n: string) => readFileSync(join(__dirname, 'fixtures/roku', n), 'utf8');
const DEVICE_INFO = fx('device-info.xml');
const APPS = fx('apps.xml');

const calls: string[] = [];
let tvOnline = true;

beforeEach(() => {
  devicesStore.reset();
  calls.length = 0;
  tvOnline = true;
  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push(`${init?.method ?? 'GET'} ${url}`);
    if (!tvOnline || !url.startsWith('http://192.168.1.50:8060')) {
      throw new TypeError('Network request failed');
    }
    if (url.endsWith('/query/device-info')) return new Response(DEVICE_INFO);
    if (url.endsWith('/query/apps')) return new Response(APPS);
    return new Response('');
  }) as typeof fetch;
});

describe('devices store', () => {
  it('connects by IP, saves the TV and loads its apps', async () => {
    const d = await devicesStore.connect(' 192.168.1.50 ');
    expect(d).toMatchObject({ name: 'Living Room TV', ip: '192.168.1.50', kind: 'roku' });
    const s = devicesStore.get();
    expect(s.status).toBe('connected');
    expect(s.saved).toHaveLength(1);
    await new Promise((r) => setTimeout(r, 0));
    expect(devicesStore.get().apps?.length).toBe(6);
  });

  it('refuses a bad IP and Fire TV (not yet supported) with friendly messages', async () => {
    await expect(devicesStore.connect('abc')).rejects.toThrow("isn't a valid IP address");
    await expect(devicesStore.connect('192.168.1.3', 'firetv')).rejects.toThrow(
      'Fire TV control arrives',
    );
    expect(calls).toHaveLength(0);
  });

  it('records a failed connection so the status bar can show it', async () => {
    await expect(devicesStore.connect('192.168.1.99')).rejects.toThrow();
    expect(devicesStore.get().status).toBe('error');
    expect(devicesStore.get().error).toMatch(/Couldn't reach|No answer/);
  });

  it('sends keys and launches shortcuts on the connected TV', async () => {
    await devicesStore.connect('192.168.1.50');
    await devicesStore.refreshApps();
    await devicesStore.press('select');
    await devicesStore.launch(getShortcut('netflix')!);
    expect(calls).toContain('POST http://192.168.1.50:8060/keypress/Select');
    expect(calls).toContain('POST http://192.168.1.50:8060/launch/12');
  });

  it('says when a shortcut app is not installed', async () => {
    await devicesStore.connect('192.168.1.50');
    await devicesStore.refreshApps();
    await expect(devicesStore.launch(getShortcut('peacock')!)).rejects.toThrow(
      "Peacock isn't installed on Living Room TV.",
    );
  });

  it('asks the user to connect first', async () => {
    await expect(devicesStore.press('up')).rejects.toThrow('Connect a TV first');
    await expect(devicesStore.launch(getShortcut('netflix')!)).rejects.toThrow(
      'Connect a TV to open Netflix.',
    );
  });

  it('flags a TV that stops answering, and forgets on request', async () => {
    const d = await devicesStore.connect('192.168.1.50');
    tvOnline = false;
    await expect(devicesStore.press('up')).rejects.toThrow('Lost contact');
    expect(devicesStore.get().status).toBe('error');
    devicesStore.forget(d.id);
    expect(devicesStore.get()).toMatchObject({ saved: [], status: 'idle', currentId: undefined });
  });
});
