import * as Haptics from 'expo-haptics';

import { haptic } from '@/ui/haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('haptic', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses a light impact for a normal tap', async () => {
    await haptic('tap');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('uses a medium impact for OK/select', async () => {
    await haptic('press');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('maps notification kinds', async () => {
    await haptic('success');
    await haptic('error');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
  });

  it('never throws when the device has no haptics', async () => {
    jest.mocked(Haptics.impactAsync).mockRejectedValueOnce(new Error('unavailable'));
    await expect(haptic('tap')).resolves.toBeUndefined();
  });
});
