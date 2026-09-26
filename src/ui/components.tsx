import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Shortcut } from '@/catalog/shortcuts';

import { haptic, type HapticKind } from './haptics';
import {
  backdrop,
  colors,
  glow,
  gradient,
  radius,
  spacing,
  toneColor,
  typography,
  withAlpha,
  type Tone,
} from './theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.screen, backdrop, style]}>{children}</View>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

type RemoteButtonProps = {
  label: string;
  onPress?: () => void;
  haptic?: HapticKind;
  size?: number;
  shape?: 'round' | 'pill';
  /** Neon color family for border, icon glow and pressed tint. */
  tone?: Tone;
  /** `solid`: outlined neon button. `ghost`: no chrome until pressed (D-pad arrows, volume rocker). `hero`: gradient fill. */
  variant?: 'solid' | 'ghost' | 'hero';
  children?: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/** Every remote button goes through here so haptics are never forgotten. */
export function RemoteButton({
  label,
  onPress,
  haptic: kind = 'tap',
  size = 64,
  shape = 'round',
  tone = 'purple',
  variant = 'solid',
  children,
  testID,
  style,
}: RemoteButtonProps) {
  const c = toneColor[tone];
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
          borderRadius: shape === 'round' ? size / 2 : radius.lg,
          transform: [{ scale: pressed ? 0.93 : 1 }],
        },
        variant === 'solid' && {
          backgroundColor: pressed ? withAlpha(c, 0.28) : colors.surface,
          borderColor: withAlpha(c, pressed ? 1 : 0.55),
          borderWidth: 1.5,
          ...glow(c, pressed ? 0.7 : 0.25, pressed ? 22 : 12),
        },
        variant === 'ghost' && {
          backgroundColor: pressed ? withAlpha(c, 0.3) : 'transparent',
        },
        variant === 'hero' && {
          ...gradient(colors.purple, colors.pink),
          ...glow(colors.pink, pressed ? 0.95 : 0.6, pressed ? 34 : 24),
        },
        style,
      ]}
    >
      {children ?? <Text style={styles.buttonLabel}>{label}</Text>}
    </Pressable>
  );
}

type AppTileProps = {
  shortcut: Shortcut;
  width: number;
  height?: number;
  onPress: () => void;
  /** Edit-mode badge: `add` (+), `added` (check) or none. */
  badge?: 'add' | 'added';
  dimmed?: boolean;
  testID?: string;
};

/** Colored launch tile: service name on its signature gradient. No logos (App Store 5.2). */
export function AppTile({
  shortcut,
  width,
  height = 72,
  onPress,
  badge,
  dimmed,
  testID,
}: AppTileProps) {
  const [from, to] = shortcut.colors;
  const fg = shortcut.textColor ?? '#FFFFFF';
  const len = shortcut.label.length;
  const fontSize = len > 12 ? 13 : len > 8 || shortcut.icon ? 14 : 17;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={shortcut.label}
      accessibilityState={badge ? { selected: badge === 'added' } : undefined}
      testID={testID}
      onPress={() => {
        void haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [
        styles.tile,
        { width, height, opacity: dimmed ? 0.4 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
        gradient(from, to, 150),
        glow(from, pressed ? 0.8 : 0.35, pressed ? 24 : 14),
      ]}
    >
      {shortcut.icon ? (
        <Ionicons name={shortcut.icon as IconName} size={20} color={fg} style={styles.tileIcon} />
      ) : null}
      <Text numberOfLines={2} style={[styles.tileLabel, { color: fg, fontSize }]}>
        {shortcut.label}
      </Text>
      {badge ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: badge === 'added' ? colors.lime : colors.surfaceRaised },
          ]}
        >
          <Ionicons
            name={badge === 'added' ? 'checkmark' : 'add'}
            size={14}
            color={badge === 'added' ? '#0B1400' : colors.text}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

/** Small chip-style text button (Edit, Done, Reset). */
export function Chip({
  label,
  onPress,
  active,
  icon,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        void haptic('selection');
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        active && { ...gradient(colors.purple, colors.pink), borderColor: 'transparent' },
        pressed && { opacity: 0.7 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={colors.text} /> : null}
      <Text style={styles.chipLabel}>{label}</Text>
    </Pressable>
  );
}

/** Brief message pinned above the tab bar; clears itself after ~2.5 s. */
export function useToast(): [ReactNode, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const show = (m: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(m);
    timer.current = setTimeout(() => setMessage(null), 2500);
  };
  const node = message ? (
    <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
      <Ionicons name="flash" size={16} color={colors.cyan} />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  ) : null;
  return [node, show];
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  sectionTitle: { ...typography.section, color: colors.textSecondary },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonLabel: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: 1 },
  tile: {
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  tileIcon: { position: 'absolute', top: spacing.sm, left: spacing.sm + 2 },
  tileLabel: { fontWeight: '800', letterSpacing: 0.2 },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipLabel: { ...typography.caption, color: colors.text, fontWeight: '700' },
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: withAlpha(colors.cyan, 0.5),
    ...glow(colors.cyan, 0.35),
  },
  toastText: { ...typography.caption, color: colors.text, flexShrink: 1 },
});
