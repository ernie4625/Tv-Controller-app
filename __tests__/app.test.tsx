import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import * as Haptics from 'expo-haptics';

import { readFileSync } from 'fs';
import { join } from 'path';

import { devicesStore } from '@/store/devices';
import { favoritesStore } from '@/store/favorites';
import { settingsStore } from '@/store/settings';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('app smoke tests', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens on the Remote tab with the D-pad', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });
    expect(screen).toHavePathname('/remote');
    expect(await screen.findByLabelText('OK')).toBeTruthy();
    expect(screen.getByLabelText('Up')).toBeTruthy();
    expect(screen.getByLabelText('Play/Pause')).toBeTruthy();
  });

  it('gives haptic feedback on every remote button', async () => {
    await renderRouter('./src/app', { initialUrl: '/remote' });
    const left = await screen.findByLabelText('Left');
    await act(async () => fireEvent.press(left));
    await act(async () => fireEvent.press(screen.getByLabelText('OK')));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('shows quick-launch shortcuts on the Remote screen', async () => {
    await renderRouter('./src/app', { initialUrl: '/remote' });
    expect(await screen.findByLabelText('Netflix')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByLabelText('Netflix')));
    expect(await screen.findByText('Connect a TV to open Netflix.')).toBeTruthy();
  });

  it('lets the user add a shortcut to the remote from the Apps tab', async () => {
    await renderRouter('./src/app', { initialUrl: '/apps?edit=1' });
    expect(await screen.findByText('Sports')).toBeTruthy();
    expect(screen.queryByTestId('fav-nfl')).toBeNull();
    fireEvent.press(screen.getByTestId('tile-nfl'));
    expect(await screen.findByTestId('fav-nfl')).toBeTruthy();
    act(() => favoritesStore.reset());
  });

  it('renders the Apps and Devices tabs', async () => {
    await renderRouter('./src/app', { initialUrl: '/apps' });
    expect(await screen.findByText('Your shortcuts')).toBeTruthy();
    await renderRouter('./src/app', { initialUrl: '/devices' });
    expect(await screen.findByText('Find your TV')).toBeTruthy();
  });

  it('lists compatible Fire TV and Roku devices', async () => {
    await renderRouter('./src/app', { initialUrl: '/compatible' });
    expect(await screen.findByText('Fire TV Cube (all generations)')).toBeTruthy();
    expect(screen.getByText('Roku Ultra')).toBeTruthy();
    expect(screen.getByText('Turn ADB Debugging ON.')).toBeTruthy();
  });

  it('turns haptics off from Settings', async () => {
    await renderRouter('./src/app', { initialUrl: '/settings' });
    fireEvent(await screen.findByLabelText('Haptic feedback'), 'valueChange', false);
    expect(settingsStore.get().haptics).toBe(false);
    act(() => settingsStore.reset());
  });

  it('connects to a Roku by IP from the Devices tab and shows it on the Remote', async () => {
    const info = readFileSync(join(__dirname, 'fixtures/roku/device-info.xml'), 'utf8');
    const apps = readFileSync(join(__dirname, 'fixtures/roku/apps.xml'), 'utf8');
    const realFetch = global.fetch;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/query/device-info')) return new Response(info);
      if (url.endsWith('/query/apps')) return new Response(apps);
      return new Response('');
    }) as typeof fetch;
    await renderRouter('./src/app', { initialUrl: '/devices' });
    fireEvent.changeText(await screen.findByLabelText('TV IP address'), '192.168.1.50');
    fireEvent.press(screen.getByLabelText('Connect'));
    expect(await screen.findByText('Living Room TV')).toBeTruthy();
    expect(screen.getByText('Connected · 192.168.1.50')).toBeTruthy();
    global.fetch = realFetch;
    act(() => devicesStore.reset());
  });

  it('opens hidden Diagnostics after tapping Version 5 times', async () => {
    await renderRouter('./src/app', { initialUrl: '/settings' });
    const version = await screen.findByTestId('version-row');
    for (let i = 0; i < 4; i++) fireEvent.press(version);
    expect(screen).toHavePathname('/settings');
    fireEvent.press(version);
    expect(await screen.findByText('Update channel')).toBeTruthy();
    expect(screen).toHavePathname('/diagnostics');
  });
});
