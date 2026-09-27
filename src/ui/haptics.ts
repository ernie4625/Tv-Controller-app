import * as Haptics from 'expo-haptics';

import { settingsStore, type HapticStrength } from '@/store/settings';

export type HapticKind = 'tap' | 'press' | 'success' | 'warning' | 'error' | 'selection';

/**
 * One helper for every haptic in the app. Failures are swallowed on purpose:
 * haptics are feedback only and must never break a button press.
 */
const IMPACT: Record<
  HapticStrength,
  { tap: Haptics.ImpactFeedbackStyle; press: Haptics.ImpactFeedbackStyle }
> = {
  soft: { tap: Haptics.ImpactFeedbackStyle.Light, press: Haptics.ImpactFeedbackStyle.Light },
  normal: { tap: Haptics.ImpactFeedbackStyle.Light, press: Haptics.ImpactFeedbackStyle.Medium },
  strong: { tap: Haptics.ImpactFeedbackStyle.Medium, press: Haptics.ImpactFeedbackStyle.Heavy },
};

export async function haptic(kind: HapticKind = 'tap'): Promise<void> {
  const { haptics, hapticStrength } = settingsStore.get();
  if (!haptics) return;
  try {
    switch (kind) {
      case 'tap':
      case 'press':
        await Haptics.impactAsync(IMPACT[hapticStrength][kind]);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    // Device without a Taptic Engine, or haptics disabled in iOS settings.
  }
}
