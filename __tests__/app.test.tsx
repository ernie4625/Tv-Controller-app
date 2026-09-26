import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
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

  it('renders the Apps and Devices tabs', async () => {
    await renderRouter('./src/app', { initialUrl: '/apps' });
    expect(await screen.findByText('No apps yet')).toBeTruthy();
    await renderRouter('./src/app', { initialUrl: '/devices' });
    expect(await screen.findByText('No devices')).toBeTruthy();
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
