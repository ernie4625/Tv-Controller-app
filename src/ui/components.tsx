import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { LOGOS } from '@/catalog/logos';
import type { Shortcut } from '@/catalog/shortcuts';

import { haptic, type HapticKind } from './haptics';
import {
  backdrop,
  colors,
  dome,
  finishes,
  glow,
  gradient,
  radius,
  spacing,
  typography,
  withAlpha,
  type Finish,
} from './theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

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
  /** Width for pill-shaped keys; defaults to `size` (round). */
  width?: number;
  /** Plastic color of a raised key. */
  finish?: Finish;
  /** `dome`: raised 3D key. `flat`: no chrome until pressed (arrows on the D-pad ring, rocker halves). */
  variant?: 'dome' | 'flat';
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
  width,
  finish = 'graphite',
  variant = 'dome',
  children,
  testID,
  style,
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
        { height: size, width: width ?? size, borderRadius: size / 2 },
        variant === 'dome'
          ? [dome(finish, pressed), { transform: [{ translateY: pressed ? 4 : 0 }] }]
          : { backgroundColor: pressed ? 'rgba(0,0,0,0.35)' : 'transparent' },
        style,
      ]}
    >
      {children ?? (
        <Text style={[styles.buttonLabel, { color: finishes[finish].icon }]}>{label}</Text>
      )}
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
  /** Show the service name under the logo (Apps grid). Off on the compact Remote strip. */
  caption?: boolean;
  testID?: string;
};

/** Launch tile drawn in the brand's look: real logo, styled wordmark, or icon + name. */
export function AppTile({
  shortcut: s,
  width,
  height = 72,
  onPress,
  badge,
  dimmed,
  caption,
  testID,
}: AppTileProps) {
  const [from, to] = s.colors;
  const logo = s.logo ? LOGOS[s.logo] : undefined;
  const fg = s.textColor ?? '#FFFFFF';
  const logoH = Math.min(height * 0.42, 34);
  const logoW = logo ? Math.min(logoH * logo.aspect, width - 28) : 0;

  let art: ReactNode;
  if (logo) {
    art = (
      <Image
        source={logo.source}
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        style={{ width: logoW, height: logoW / logo.aspect, tintColor: s.logoTint ?? '#FFFFFF' }}
      />
    );
  } else if (s.wordmark) {
    const w = s.wordmark;
    art = (
      <Text
        numberOfLines={1}
        style={{
          color: w.color,
          fontSize: (w.size ?? 18) * (height < 70 ? 0.85 : 1),
          fontWeight: '900',
          fontStyle: w.italic ? 'italic' : 'normal',
          letterSpacing: w.spacing ?? 0,
        }}
      >
        {w.text}
      </Text>
    );
  } else {
    art = (
      <View style={styles.iconArt}>
        {s.icon ? <Ionicons name={s.icon as IconName} size={22} color={fg} /> : null}
        <Text numberOfLines={2} style={[styles.iconLabel, { color: fg }]}>
          {s.label}
        </Text>
      </View>
    );
  }

  const showCaption = caption && (logo || s.wordmark);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={s.label}
      accessibilityState={badge ? { selected: badge === 'added' } : undefined}
      testID={testID}
      onPress={() => {
        void haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [
        styles.tile,
        {
          width,
          height,
          opacity: dimmed ? 0.35 : 1,
          transform: [{ translateY: pressed ? 3 : 0 }, { scale: pressed ? 0.97 : 1 }],
        },
        gradient(from, to, 160),
        {
          boxShadow: pressed
            ? 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.5)'
            : 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 0 rgba(0,0,0,0.55), 0 8px 14px rgba(0,0,0,0.45)',
        },
      ]}
    >
      <View style={styles.tileArt}>{art}</View>
      {showCaption ? (
        <Text numberOfLines={1} style={styles.tileCaption}>
          {s.label}
        </Text>
      ) : null}
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

/** Rounded card holding a list of rows (Settings, Devices). */
export function ListGroup({
  title,
  footer,
  children,
}: {
  title?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.groupWrap}>
      {title ? <Text style={[styles.sectionTitle, styles.groupTitle]}>{title}</Text> : null}
      <View style={styles.group}>{children}</View>
      {footer ? <Text style={styles.groupFooter}>{footer}</Text> : null}
    </View>
  );
}

type ListRowProps = {
  label: string;
  icon?: IconName;
  iconColor?: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  last?: boolean;
  testID?: string;
};

export function ListRow({
  label,
  icon,
  iconColor = colors.purple,
  detail,
  value,
  onPress,
  right,
  last,
  testID,
}: ListRowProps) {
  const body = (
    <>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: withAlpha(iconColor, 0.18) }]}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {right}
      {onPress && !right ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      ) : null}
    </>
  );
  const rowStyle = [styles.row, !last && styles.rowDivider];
  if (!onPress) {
    return (
      <View style={rowStyle} testID={testID}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={() => {
        void haptic('selection');
        onPress();
      }}
      style={({ pressed }) => [rowStyle, pressed && { backgroundColor: colors.surfaceRaised }]}
    >
      {body}
    </Pressable>
  );
}

export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={(v) => {
        onChange(v);
        void haptic('selection');
      }}
      trackColor={{ false: colors.border, true: colors.pink }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.border}
    />
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ checked: on }}
            onPress={() => {
              onChange(o.value);
              void haptic('selection');
            }}
            style={[styles.segment, on && gradient(colors.purple, colors.pink)]}
          >
            <Text style={[styles.segmentLabel, on && { color: '#FFFFFF' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
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
  button: { alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  tile: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tileArt: { flex: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  tileCaption: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  iconArt: { alignItems: 'center', gap: 4 },
  iconLabel: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
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
  groupWrap: { gap: spacing.sm },
  groupTitle: { marginLeft: spacing.sm },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  groupFooter: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...typography.body, color: colors.text },
  rowDetail: { ...typography.caption, color: colors.textSecondary },
  rowValue: { ...typography.body, color: colors.textSecondary },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.round,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.round },
  segmentLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
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
