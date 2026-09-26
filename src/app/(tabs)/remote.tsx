import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getShortcut, type Shortcut } from '@/catalog/shortcuts';
import type { RemoteKey } from '@/protocols/types';
import { useFavorites } from '@/store/favorites';
import { AppTile, Chip, RemoteButton, SectionHeader, useToast } from '@/ui/components';
import { haptic } from '@/ui/haptics';
import {
  backdrop,
  colors,
  glow,
  radius,
  spacing,
  toneColor,
  typography,
  withAlpha,
  type Tone,
} from '@/ui/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type KeySpec = { key: RemoteKey; label: string; icon: IconName };

const NAV_ROW: KeySpec[] = [
  { key: 'back', label: 'Back', icon: 'arrow-back' },
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'menu', label: 'Menu', icon: 'menu' },
];

// M1: no device yet — presses only give haptic feedback. M2 wires this to a RemoteDevice.
function onKey(_key: RemoteKey) {}

function IconKey({
  spec,
  size = 56,
  tone = 'purple',
  variant = 'solid',
}: {
  spec: KeySpec;
  size?: number;
  tone?: Tone;
  variant?: 'solid' | 'ghost' | 'hero';
}) {
  return (
    <RemoteButton
      label={spec.label}
      size={size}
      tone={tone}
      variant={variant}
      onPress={() => onKey(spec.key)}
    >
      <Ionicons
        name={spec.icon}
        size={size * 0.42}
        color={variant === 'hero' ? '#FFFFFF' : toneColor[tone]}
      />
    </RemoteButton>
  );
}

function DeviceBar() {
  return (
    <View style={styles.deviceRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose device"
        onPress={() => {
          void haptic('selection');
          router.push('/devices');
        }}
        style={({ pressed }) => [styles.devicePill, pressed && { opacity: 0.75 }]}
      >
        <View style={styles.statusDot} />
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.deviceName}>No device connected</Text>
          <Text style={styles.deviceHint}>Tap to find your TV</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </Pressable>
      <IconKey spec={{ key: 'power', label: 'Power', icon: 'power' }} size={52} tone="rose" />
    </View>
  );
}

function QuickLaunch({ onLaunch }: { onLaunch: (s: Shortcut) => void }) {
  const ids = useFavorites();
  const items = ids.map(getShortcut).filter((s): s is Shortcut => !!s);
  return (
    <View style={styles.block}>
      <SectionHeader
        title="Quick launch"
        right={
          <Chip
            label="Edit"
            icon="create-outline"
            onPress={() => router.push({ pathname: '/apps', params: { edit: '1' } })}
          />
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
        style={styles.stripScroll}
      >
        {items.map((s) => (
          <AppTile key={s.id} shortcut={s} width={104} height={62} onPress={() => onLaunch(s)} />
        ))}
        {items.length === 0 ? (
          <Text style={styles.deviceHint}>Tap Edit to pick your apps.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const PAD = 224;
const ARROW = 64;

function DPad() {
  const arrow = (key: RemoteKey, label: string, icon: IconName, pos: object) => (
    <View style={[styles.arrowSlot, pos]}>
      <IconKey spec={{ key, label, icon }} size={ARROW} tone="cyan" variant="ghost" />
    </View>
  );
  const edge = (PAD - ARROW) / 2;
  return (
    <View style={styles.pad}>
      {arrow('up', 'Up', 'chevron-up', { top: 6, left: edge })}
      {arrow('down', 'Down', 'chevron-down', { bottom: 6, left: edge })}
      {arrow('left', 'Left', 'chevron-back', { left: 6, top: edge })}
      {arrow('right', 'Right', 'chevron-forward', { right: 6, top: edge })}
      <RemoteButton
        label="OK"
        size={100}
        variant="hero"
        haptic="press"
        onPress={() => onKey('select')}
      />
    </View>
  );
}

function MediaRow() {
  return (
    <View style={styles.row}>
      <IconKey spec={{ key: 'rewind', label: 'Rewind', icon: 'play-back' }} tone="pink" />
      <IconKey
        spec={{ key: 'playPause', label: 'Play/Pause', icon: 'play' }}
        size={72}
        variant="hero"
      />
      <IconKey
        spec={{ key: 'fastForward', label: 'Fast-forward', icon: 'play-forward' }}
        tone="pink"
      />
    </View>
  );
}

function VolumeRocker() {
  return (
    <View style={styles.volume}>
      <IconKey
        spec={{ key: 'volumeDown', label: 'Volume down', icon: 'remove' }}
        tone="cyan"
        variant="ghost"
        size={52}
      />
      <View style={styles.volumeCenter}>
        <IconKey
          spec={{ key: 'mute', label: 'Mute', icon: 'volume-mute' }}
          tone="cyan"
          variant="ghost"
          size={44}
        />
        <Text style={styles.volumeLabel}>VOL</Text>
      </View>
      <IconKey
        spec={{ key: 'volumeUp', label: 'Volume up', icon: 'add' }}
        tone="cyan"
        variant="ghost"
        size={52}
      />
    </View>
  );
}

export default function RemoteScreen() {
  const [toast, showToast] = useToast();
  const launch = (s: Shortcut) => showToast(`Connect a device to open ${s.label}.`);
  return (
    <View style={[styles.screen, backdrop]}>
      <ScrollView contentContainerStyle={styles.content}>
        <DeviceBar />
        <QuickLaunch onLaunch={launch} />
        <DPad />
        <View style={styles.row}>
          {NAV_ROW.map((k) => (
            <IconKey key={k.key} spec={k} />
          ))}
        </View>
        <MediaRow />
        <VolumeRocker />
      </ScrollView>
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md + 4, alignItems: 'center', paddingBottom: 96 },
  block: { alignSelf: 'stretch', gap: spacing.sm },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, alignSelf: 'stretch' },
  devicePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warning,
    ...glow(colors.warning, 0.8, 8),
  },
  deviceName: { ...typography.body, color: colors.text, fontWeight: '700' },
  deviceHint: { ...typography.caption, color: colors.textSecondary },
  stripScroll: { marginHorizontal: -spacing.md },
  strip: { gap: spacing.sm + 2, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  pad: {
    width: PAD,
    height: PAD,
    borderRadius: PAD / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: withAlpha(colors.cyan, 0.45),
    ...glow(colors.cyan, 0.3, 30),
  },
  arrowSlot: { position: 'absolute' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  volume: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 260,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.cyan, 0.45),
    ...glow(colors.cyan, 0.2, 16),
  },
  volumeCenter: { alignItems: 'center' },
  volumeLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: -6,
  },
});
