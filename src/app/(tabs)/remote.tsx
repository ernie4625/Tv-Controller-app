import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RemoteKey } from '@/protocols/types';
import { RemoteButton } from '@/ui/components';
import { colors, radius, spacing, typography } from '@/ui/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type KeySpec = { key: RemoteKey; label: string; icon: IconName };

const NAV_ROW: KeySpec[] = [
  { key: 'power', label: 'Power', icon: 'power' },
  { key: 'back', label: 'Back', icon: 'arrow-back' },
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'menu', label: 'Menu', icon: 'menu' },
];

const MEDIA_ROW: KeySpec[] = [
  { key: 'rewind', label: 'Rewind', icon: 'play-back' },
  { key: 'playPause', label: 'Play/Pause', icon: 'play' },
  { key: 'fastForward', label: 'Fast-forward', icon: 'play-forward' },
];

const VOLUME_ROW: KeySpec[] = [
  { key: 'volumeDown', label: 'Volume down', icon: 'volume-low-outline' },
  { key: 'mute', label: 'Mute', icon: 'volume-mute-outline' },
  { key: 'volumeUp', label: 'Volume up', icon: 'volume-high-outline' },
];

// M1: no device yet — presses only give haptic feedback. M2 wires this to a RemoteDevice.
function onKey(_key: RemoteKey) {}

function IconKey({ spec, size = 52 }: { spec: KeySpec; size?: number }) {
  return (
    <RemoteButton label={spec.label} size={size} onPress={() => onKey(spec.key)}>
      <Ionicons name={spec.icon} size={size * 0.42} color={colors.text} />
    </RemoteButton>
  );
}

function Row({ keys }: { keys: KeySpec[] }) {
  return (
    <View style={styles.row}>
      {keys.map((k) => (
        <IconKey key={k.key} spec={k} />
      ))}
    </View>
  );
}

function DPad() {
  const arrow = (key: RemoteKey, label: string, icon: IconName) => (
    <IconKey spec={{ key, label, icon }} size={60} />
  );
  return (
    <View style={styles.dpad}>
      <View style={styles.dpadRow}>{arrow('up', 'Up', 'chevron-up')}</View>
      <View style={styles.dpadRow}>
        {arrow('left', 'Left', 'chevron-back')}
        <RemoteButton label="OK" size={80} haptic="press" onPress={() => onKey('select')} />
        {arrow('right', 'Right', 'chevron-forward')}
      </View>
      <View style={styles.dpadRow}>{arrow('down', 'Down', 'chevron-down')}</View>
    </View>
  );
}

export default function RemoteScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.banner} accessibilityRole="summary">
        <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
        <Text style={styles.bannerText}>
          No device connected — buttons give haptic feedback only.
        </Text>
      </View>
      <DPad />
      <Row keys={NAV_ROW} />
      <Row keys={MEDIA_ROW} />
      <Row keys={VOLUME_ROW} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg, alignItems: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  bannerText: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 },
  dpad: { gap: spacing.xs, alignItems: 'center' },
  dpadRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-evenly', alignSelf: 'stretch' },
});
