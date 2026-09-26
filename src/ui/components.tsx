import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptic, type HapticKind } from './haptics';
import { colors, radius, spacing, typography } from './theme';

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

type RemoteButtonProps = {
  label: string;
  onPress?: () => void;
  haptic?: HapticKind;
  size?: number;
  shape?: 'round' | 'pill';
  children?: ReactNode;
  testID?: string;
};

/** Every remote button goes through here so haptics are never forgotten. */
export function RemoteButton({
  label,
  onPress,
  haptic: kind = 'tap',
  size = 64,
  shape = 'round',
  children,
  testID,
}: RemoteButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={() => {
        void haptic(kind);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          height: size,
          minWidth: size,
          borderRadius: shape === 'round' ? size / 2 : radius.md,
          backgroundColor: pressed ? colors.surfaceRaised : colors.surface,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      {children ?? <Text style={styles.buttonLabel}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { ...typography.heading, color: colors.text },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  buttonLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
});
