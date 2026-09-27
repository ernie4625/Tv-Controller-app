import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  MAX_FAVORITES,
  SECTIONS,
  SHORTCUTS,
  getShortcut,
  type Shortcut,
} from '@/catalog/shortcuts';
import type { AppInfo } from '@/protocols/types';
import { devicesStore, useDevices } from '@/store/devices';
import { favoritesStore, useFavorites } from '@/store/favorites';
import { AppTile, Chip, SectionHeader, useToast } from '@/ui/components';
import { haptic } from '@/ui/haptics';
import { backdrop, colors, radius, spacing, typography } from '@/ui/theme';

const COLUMNS = 3;
const GAP = 10;

/** A real app on the connected TV, drawn with the icon the TV provides. */
function InstalledTile({
  app,
  width,
  onPress,
}: {
  app: AppInfo;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${app.name}`}
      onPress={() => {
        void haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [
        styles.installed,
        { width, transform: [{ translateY: pressed ? 3 : 0 }] },
      ]}
    >
      {app.iconUri ? (
        <Image source={{ uri: app.iconUri }} style={styles.installedIcon} resizeMode="cover" />
      ) : (
        <View style={[styles.installedIcon, styles.installedFallback]}>
          <Ionicons name="apps" size={22} color={colors.textSecondary} />
        </View>
      )}
      <Text numberOfLines={1} style={styles.installedName}>
        {app.name}
      </Text>
    </Pressable>
  );
}

function MoveButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: 'chevron-back' | 'chevron-forward';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        void haptic('selection');
        onPress();
      }}
      style={({ pressed }) => [styles.move, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
}

export default function AppsScreen() {
  const params = useLocalSearchParams<{ edit?: string }>();
  // Edit mode lives in the URL so the Remote screen's Edit chip can open it directly.
  const editing = params.edit === '1';

  const favorites = useFavorites();
  const [toast, showToast] = useToast();
  const { width } = useWindowDimensions();
  const tileWidth = Math.floor((width - spacing.md * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

  const toggleEditing = () => router.setParams({ edit: editing ? undefined : '1' });

  const { status, apps } = useDevices();
  const tv = status === 'connected' ? devicesStore.current() : undefined;
  const fail = (e: unknown) => showToast(e instanceof Error ? e.message : 'Something went wrong.');

  const onTile = (s: Shortcut) => {
    if (!editing) {
      void devicesStore.launch(s).catch(fail);
      return;
    }
    if (!favoritesStore.toggle(s.id)) {
      void haptic('warning');
      showToast(`Your remote holds up to ${MAX_FAVORITES} shortcuts. Remove one first.`);
    }
  };

  const favItems = favorites.map(getShortcut).filter((s): s is Shortcut => !!s);

  return (
    <View style={[styles.screen, backdrop]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Your shortcuts</Text>
            <Text style={styles.heroSub}>
              {editing
                ? 'Tap any tile to add or remove it from your remote.'
                : `${favItems.length} of ${MAX_FAVORITES} on your remote`}
            </Text>
          </View>
          {editing ? <Chip label="Reset" onPress={() => favoritesStore.reset()} /> : null}
          <Chip
            label={editing ? 'Done' : 'Edit'}
            icon={editing ? 'checkmark' : 'create-outline'}
            active={editing}
            onPress={toggleEditing}
          />
        </View>

        {tv && apps && !editing ? (
          <View style={styles.section}>
            <SectionHeader title={`On ${tv.name}`} />
            <View style={styles.grid}>
              {apps.map((a) => (
                <InstalledTile
                  key={a.id}
                  app={a}
                  width={tileWidth}
                  onPress={() => void devicesStore.launchApp(a.id).catch(fail)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <SectionHeader title="On your remote" />
        <View style={styles.grid}>
          {favItems.map((s, i) => (
            <View key={s.id} style={{ width: tileWidth, gap: 6 }}>
              <AppTile
                shortcut={s}
                width={tileWidth}
                height={80}
                caption
                onPress={() => onTile(s)}
                badge={editing ? 'added' : undefined}
                testID={`fav-${s.id}`}
              />
              {editing ? (
                <View style={styles.moveRow}>
                  <MoveButton
                    label={`Move ${s.label} left`}
                    icon="chevron-back"
                    onPress={() => favoritesStore.move(s.id, -1)}
                  />
                  <Text style={styles.position}>{i + 1}</Text>
                  <MoveButton
                    label={`Move ${s.label} right`}
                    icon="chevron-forward"
                    onPress={() => favoritesStore.move(s.id, 1)}
                  />
                </View>
              ) : null}
            </View>
          ))}
          {favItems.length === 0 ? (
            <Text style={styles.heroSub}>Nothing yet. Tap Edit, then pick apps below.</Text>
          ) : null}
        </View>

        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <SectionHeader title={section.title} />
            <View style={styles.grid}>
              {SHORTCUTS.filter((s) => s.section === section.id).map((s) => {
                const added = favorites.includes(s.id);
                return (
                  <AppTile
                    key={s.id}
                    shortcut={s}
                    width={tileWidth}
                    height={80}
                    caption
                    onPress={() => onTile(s)}
                    badge={editing ? (added ? 'added' : 'add') : undefined}
                    dimmed={editing && !added && favorites.length >= MAX_FAVORITES}
                    testID={`tile-${s.id}`}
                  />
                );
              })}
            </View>
          </View>
        ))}
        <Text style={styles.note}>
          App names are shown for compatibility only. Clicker is not affiliated with these services.
        </Text>
      </ScrollView>
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 96 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroTitle: { ...typography.title, color: colors.text },
  heroSub: { ...typography.caption, color: colors.textSecondary },
  section: { gap: spacing.md, marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  moveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  move: {
    width: 30,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  installed: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 4px 0 rgba(0,0,0,0.55), 0 8px 14px rgba(0,0,0,0.45)',
  },
  installedIcon: { width: '100%', aspectRatio: 1.5 },
  installedFallback: { alignItems: 'center', justifyContent: 'center' },
  installedName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  position: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
