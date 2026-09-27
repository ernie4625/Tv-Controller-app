import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { APP_NAME, getBuildInfo } from '@/config/app-info';
import { favoritesStore, useFavorites } from '@/store/favorites';
import { settingsStore, useSettings, type HapticStrength } from '@/store/settings';
import { ListGroup, ListRow, Segmented, Toggle, useToast } from '@/ui/components';
import { haptic } from '@/ui/haptics';
import { backdrop, colors, spacing, typography } from '@/ui/theme';
import { useTapCounter } from '@/ui/use-tap-counter';

const STRENGTHS: readonly { value: HapticStrength; label: string }[] = [
  { value: 'soft', label: 'Soft' },
  { value: 'normal', label: 'Normal' },
  { value: 'strong', label: 'Strong' },
];

function openDiagnostics() {
  void haptic('success');
  router.push('/diagnostics');
}

export default function SettingsScreen() {
  const info = getBuildInfo();
  const onVersionTap = useTapCounter(openDiagnostics);
  const settings = useSettings();
  const favorites = useFavorites();
  const [toast, showToast] = useToast();

  return (
    <>
      <ScrollView style={[styles.screen, backdrop]} contentContainerStyle={styles.content}>
        <ListGroup title="Devices">
          <ListRow
            label="My devices"
            detail="Find, add and switch TVs"
            icon="tv"
            iconColor={colors.cyan}
            onPress={() => router.push('/devices')}
          />
          <ListRow
            label="Works with"
            detail="Fire TV and Roku models, setup steps"
            icon="checkmark-done-circle"
            iconColor={colors.lime}
            onPress={() => router.push('/compatible')}
            last
          />
        </ListGroup>

        <ListGroup title="Remote">
          <ListRow
            label="Haptic feedback"
            detail="Vibrate on every button press"
            icon="pulse"
            iconColor={colors.pink}
            right={
              <Toggle
                label="Haptic feedback"
                value={settings.haptics}
                onChange={(v) => settingsStore.update({ haptics: v })}
              />
            }
          />
          <ListRow
            label="Strength"
            icon="speedometer"
            iconColor={colors.purple}
            right={
              <Segmented
                options={STRENGTHS}
                value={settings.hapticStrength}
                onChange={(v) => {
                  settingsStore.update({ hapticStrength: v });
                  void haptic('press');
                }}
              />
            }
            last
          />
        </ListGroup>

        <ListGroup title="Quick launch">
          <ListRow
            label="Edit shortcuts"
            icon="apps"
            iconColor={colors.cyan}
            value={`${favorites.length}`}
            onPress={() => router.push({ pathname: '/apps', params: { edit: '1' } })}
          />
          <ListRow
            label="Reset to defaults"
            icon="refresh"
            iconColor={colors.warning}
            onPress={() => {
              favoritesStore.reset();
              showToast('Quick launch reset to the default apps.');
            }}
            last
          />
        </ListGroup>

        <ListGroup
          title="Privacy"
          footer={`${APP_NAME} talks only to TVs on your home Wi-Fi. No accounts, no ads, no tracking.`}
        >
          <ListRow
            label="Local network access"
            detail="Needed to find and control your TV. Change it in iPhone Settings → Privacy & Security → Local Network."
            icon="lock-closed"
            iconColor={colors.success}
            last
          />
        </ListGroup>

        <ListGroup title="About">
          <ListRow
            testID="version-row"
            label="Version"
            icon="information-circle"
            iconColor={colors.textSecondary}
            onPress={onVersionTap}
            right={
              <Text style={styles.value}>
                {info.appVersion} ({info.buildNumber})
              </Text>
            }
            last
          />
        </ListGroup>
        <Text style={styles.footer}>
          {APP_NAME} · Not affiliated with Amazon, Roku or any streaming service.
        </Text>
      </ScrollView>
      {toast}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  value: { ...typography.body, color: colors.textSecondary },
  footer: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
