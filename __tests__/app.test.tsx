import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import * as Haptics from 'expo-haptics';

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
    fireEvent.press(await screen.findByLabelText('Left'));
    fireEvent.press(screen.getByLabelText('OK'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('shows quick-launch shortcuts on the Remote screen', async () => {
    await renderRouter('./src/app', { initialUrl: '/remote' });
    expect(await screen.findByLabelText('Netflix')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Netflix'));
    expect(await screen.findByText('Connect a device to open Netflix.')).toBeTruthy();
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
