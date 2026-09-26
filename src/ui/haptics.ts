import * as Haptics from 'expo-haptics';

export type HapticKind = 'tap' | 'press' | 'success' | 'warning' | 'error' | 'selection';

/**
 * One helper for every haptic in the app. Failures are swallowed on purpose:
 * haptics are feedback only and must never break a button press.
 */
export async function haptic(kind: HapticKind = 'tap'): Promise<void> {
  try {
    switch (kind) {
      case 'tap':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'press':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
