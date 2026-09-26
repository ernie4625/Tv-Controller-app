import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_NAME, getBuildInfo } from '@/config/app-info';
import { Screen } from '@/ui/components';
import { haptic } from '@/ui/haptics';
import { colors, radius, spacing, typography } from '@/ui/theme';
import { useTapCounter } from '@/ui/use-tap-counter';

function openDiagnostics() {
  void haptic('success');
  router.push('/diagnostics');
}

export default function SettingsScreen() {
  const info = getBuildInfo();
  const onVersionTap = useTapCounter(openDiagnostics);

  return (
    <Screen>
      <View style={styles.card}>
        <Pressable
          testID="version-row"
          accessibilityRole="text"
          onPress={onVersionTap}
          style={styles.row}
        >
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>
            {info.appVersion} ({info.buildNumber})
          </Text>
        </Pressable>
      </View>
      <Text style={styles.footer}>{APP_NAME}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  label: { ...typography.body, color: colors.text },
  value: { ...typography.body, color: colors.textSecondary },
  footer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
