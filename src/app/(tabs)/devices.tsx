import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FAMILIES } from '@/catalog/compatibility';
import type { DeviceKind } from '@/protocols/types';
import { devicesStore, useDevices } from '@/store/devices';
import { ListGroup, ListRow, Segmented, useToast } from '@/ui/components';
import { haptic } from '@/ui/haptics';
import { backdrop, colors, dome, radius, remoteBody, spacing, typography } from '@/ui/theme';

const KINDS: readonly { value: DeviceKind; label: string }[] = [
  { value: 'roku', label: 'Roku' },
  { value: 'firetv', label: 'Fire TV' },
];

function BigButton({
  label,
  icon,
  onPress,
  busy,
}: {
  label: string;
  icon: 'search' | 'link' | 'stop';
  onPress: () => void;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        void haptic('press');
        onPress();
      }}
      style={({ pressed }) => [
        styles.big,
        dome('ok', pressed),
        { transform: [{ translateY: pressed ? 4 : 0 }] },
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      )}
      <Text style={styles.bigLabel}>{label}</Text>
    </Pressable>
  );
}

export default function DevicesScreen() {
  const { saved, currentId, status, scanning, found } = useDevices();
  const [toast, showToast] = useToast();
  const [ip, setIp] = useState('');
  const [kind, setKind] = useState<DeviceKind>('roku');
  const [busyIp, setBusyIp] = useState<string | null>(null);

  const connect = async (addr: string, k: DeviceKind = 'roku') => {
    setBusyIp(addr);
    try {
      const d = await devicesStore.connect(addr, k);
      void haptic('success');
      showToast(`Connected to ${d.name}.`);
      router.navigate('/remote');
    } catch (e) {
      void haptic('error');
      showToast(e instanceof Error ? e.message : 'Could not connect.');
    } finally {
      setBusyIp(null);
    }
  };

  const search = async () => {
    if (scanning) {
      devicesStore.stopScan();
      return;
    }
    const hits = await devicesStore.scan();
    if (hits.length === 0) {
      showToast("No Roku found. Enter the TV's IP address below, or check Works with for setup.");
    }
  };

  const newFound = found.filter((f) => !saved.some((s) => s.ip === f.ip));

  return (
    <View style={[styles.screen, backdrop]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, remoteBody]}>
          <View style={styles.radar}>
            <Ionicons name="tv" size={34} color={colors.cyan} />
          </View>
          <Text style={styles.heroTitle}>Find your TV</Text>
          <Text style={styles.heroText}>
            {scanning
              ? 'Searching your Wi-Fi for Rokus… this can take up to a minute.'
              : 'Make sure your iPhone and TV are on the same Wi-Fi, then search. Finds Roku now; Fire TV arrives next update.'}
          </Text>
          <BigButton
            label={scanning ? 'Stop search' : 'Search Wi-Fi'}
            icon={scanning ? 'stop' : 'search'}
            busy={scanning}
            onPress={() => void search()}
          />
        </View>

        {newFound.length > 0 ? (
          <ListGroup title="Found on your Wi-Fi">
            {newFound.map((f, i) => (
              <ListRow
                key={f.ip}
                label={f.info.name}
                detail={`${f.info.model ?? 'Roku'} · ${f.ip}`}
                icon="tv"
                iconColor="#9B5CE6"
                onPress={() => void connect(f.ip)}
                right={busyIp === f.ip ? <ActivityIndicator color={colors.cyan} /> : undefined}
                last={i === newFound.length - 1}
              />
            ))}
          </ListGroup>
        ) : null}

        <ListGroup
          title="Saved devices"
          footer={
            saved.length
              ? 'Tap a TV to connect. Saved TVs are forgotten when the app closes (for now).'
              : 'TVs you connect to are saved here.'
          }
        >
          {saved.length === 0 ? (
            <ListRow
              label="No devices yet"
              icon="albums-outline"
              iconColor={colors.textSecondary}
              last
            />
          ) : (
            saved.map((d, i) => {
              const active = d.id === currentId && status === 'connected';
              return (
                <ListRow
                  key={d.id}
                  label={d.name}
                  detail={`${active ? 'Connected' : (d.model ?? 'Roku')} · ${d.ip}`}
                  icon={active ? 'checkmark-circle' : 'tv-outline'}
                  iconColor={active ? colors.success : '#9B5CE6'}
                  onPress={() => void connect(d.ip, d.kind)}
                  right={
                    busyIp === d.ip ? (
                      <ActivityIndicator color={colors.cyan} />
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Forget ${d.name}`}
                        hitSlop={10}
                        onPress={() => {
                          void haptic('warning');
                          devicesStore.forget(d.id);
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                      </Pressable>
                    )
                  }
                  last={i === saved.length - 1}
                />
              );
            })
          )}
        </ListGroup>

        <ListGroup
          title="Add manually"
          footer={
            kind === 'roku'
              ? 'Roku: Settings → Network → About shows the IP address.'
              : 'Fire TV: Settings → My Fire TV → About → Network shows the IP address.'
          }
        >
          <View style={styles.form}>
            <Segmented options={KINDS} value={kind} onChange={setKind} />
            <TextInput
              accessibilityLabel="TV IP address"
              value={ip}
              onChangeText={setIp}
              placeholder="192.168.1.20"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => void connect(ip, kind)}
              style={styles.input}
            />
            <BigButton
              label="Connect"
              icon="link"
              busy={busyIp === ip.trim() && ip.trim() !== ''}
              onPress={() => void connect(ip, kind)}
            />
          </View>
        </ListGroup>

        <ListGroup title="Works with">
          {FAMILIES.map((f) => (
            <ListRow
              key={f.kind}
              label={f.title}
              detail={f.summary}
              icon="checkmark-circle"
              iconColor={f.color}
              onPress={() => router.push('/compatible')}
            />
          ))}
          <ListRow
            label="All compatible devices"
            icon="list"
            iconColor={colors.cyan}
            onPress={() => router.push('/compatible')}
            last
          />
        </ListGroup>
      </ScrollView>
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: 96 },
  hero: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg + 8 },
  radar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.45)',
    boxShadow: '0 0 24px rgba(34,211,238,0.35), inset 0 0 14px rgba(34,211,238,0.25)',
    marginBottom: spacing.xs,
  },
  heroTitle: { ...typography.heading, color: colors.text, fontWeight: '800' },
  heroText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  big: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 50,
    borderRadius: 25,
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  bigLabel: { ...typography.body, color: '#FFFFFF', fontWeight: '800' },
  form: { padding: spacing.md, gap: spacing.md, alignItems: 'stretch' },
  input: {
    ...typography.body,
    fontSize: 20,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: 'Menlo',
  },
});
