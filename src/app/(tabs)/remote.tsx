import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getShortcut, type Shortcut } from '@/catalog/shortcuts';
import type { RemoteKey } from '@/protocols/types';
import { useFavorites } from '@/store/favorites';
import {
  AppTile,
  Chip,
  RemoteButton,
  SectionHeader,
  useToast,
  type IconName,
} from '@/ui/components';
import { haptic } from '@/ui/haptics';
import {
  backdrop,
  colors,
  dome,
  glow,
  radius,
  remoteBody,
  spacing,
  typography,
  type Finish,
} from '@/ui/theme';

/** Icon colors on graphite keys, by button family. */
const INK = {
  nav: '#D8B4FE',
  media: '#F9A8D4',
  pad: '#67E8F9',
  plain: colors.text,
} as const;

// M1: no device yet — presses only give haptic feedback. M2 wires this to a RemoteDevice.
function onKey(_key: RemoteKey) {}

type KeyProps = {
  k: RemoteKey;
  label: string;
  icon: IconName;
  ink?: string;
  size?: number;
  finish?: Finish;
  variant?: 'dome' | 'flat';
};

function Key({ k, label, icon, ink = INK.plain, size = 58, finish, variant }: KeyProps) {
  return (
    <RemoteButton
      label={label}
      size={size}
      finish={finish}
      variant={variant}
      onPress={() => onKey(k)}
    >
      <Ionicons
        name={icon}
        size={size * 0.4}
        color={finish && finish !== 'graphite' ? '#FFFFFF' : ink}
      />
    </RemoteButton>
  );
}

function DeviceBar() {
  return (
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
      <View style={{ flex: 1 }}>
        <Text style={styles.deviceName}>No device connected</Text>
        <Text style={styles.deviceHint}>Tap to find your Fire TV or Roku</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
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
          <AppTile key={s.id} shortcut={s} width={96} height={60} onPress={() => onLaunch(s)} />
        ))}
        {items.length === 0 ? (
          <Text style={styles.deviceHint}>Tap Edit to pick your apps.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const PAD = 228;
const ARROW = 62;

function DPad() {
  const edge = (PAD - ARROW) / 2;
  const arrow = (k: RemoteKey, label: string, icon: IconName, pos: ViewPos) => (
    <View style={[styles.arrowSlot, pos]}>
      <Key k={k} label={label} icon={icon} ink={INK.pad} size={ARROW} variant="flat" />
    </View>
  );
  return (
    <View style={[styles.pad, dome('graphite', false, 6)]}>
      {arrow('up', 'Up', 'caret-up', { top: 4, left: edge })}
      {arrow('down', 'Down', 'caret-down', { bottom: 4, left: edge })}
      {arrow('left', 'Left', 'caret-back', { left: 4, top: edge })}
      {arrow('right', 'Right', 'caret-forward', { right: 4, top: edge })}
      <View style={styles.okWell}>
        <RemoteButton
          label="OK"
          size={92}
          finish="ok"
          haptic="press"
          onPress={() => onKey('select')}
        />
      </View>
    </View>
  );
}

type ViewPos = { top?: number; bottom?: number; left?: number; right?: number };

function VolumeRocker() {
  return (
    <View style={[styles.rocker, dome('graphite')]}>
      <Key
        k="volumeDown"
        label="Volume down"
        icon="remove"
        ink={INK.pad}
        size={56}
        variant="flat"
      />
      <Text style={styles.rockerLabel}>VOL</Text>
      <Key k="volumeUp" label="Volume up" icon="add" ink={INK.pad} size={56} variant="flat" />
    </View>
  );
}

function Remote() {
  return (
    <View style={[styles.body, remoteBody]}>
      <View style={styles.topRow}>
        <Key k="power" label="Power" icon="power" size={52} finish="power" />
        <View style={styles.led} />
        <Key k="mute" label="Mute" icon="volume-mute" size={52} />
      </View>
      <DPad />
      <View style={styles.row}>
        <Key k="back" label="Back" icon="arrow-undo" ink={INK.nav} />
        <Key k="home" label="Home" icon="home" ink={INK.nav} />
        <Key k="menu" label="Menu" icon="menu" ink={INK.nav} />
      </View>
      <View style={styles.row}>
        <Key k="rewind" label="Rewind" icon="play-back" ink={INK.media} />
        <Key k="playPause" label="Play/Pause" icon="play" size={66} finish="play" />
        <Key k="fastForward" label="Fast-forward" icon="play-forward" ink={INK.media} />
      </View>
      <VolumeRocker />
      <Text style={styles.emboss}>CLICKER</Text>
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
        <Remote />
      </ScrollView>
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md + 4, paddingBottom: 96 },
  block: { gap: spacing.xs },
  devicePill: {
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
  strip: {
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  body: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  led: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B1111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pad: {
    width: PAD,
    height: PAD,
    borderRadius: PAD / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowSlot: { position: 'absolute' },
  okWell: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.6)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.sm,
  },
  rocker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 210,
    height: 58,
    borderRadius: 29,
    paddingHorizontal: 2,
  },
  rockerLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '800', letterSpacing: 2 },
  emboss: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 6,
    color: 'rgba(255,255,255,0.18)',
    marginTop: spacing.xs,
  },
});
