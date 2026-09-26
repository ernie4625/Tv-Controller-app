import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getBuildInfo } from '@/config/app-info';
import { colors, radius, spacing, typography } from '@/ui/theme';

/**
 * Hidden screen (Settings → tap Version 5×). M1 shows build/update info so ED can confirm
 * which build or OTA update is running. M3 adds the step-by-step ADB handshake test here.
 */
export default function DiagnosticsScreen() {
  const info = getBuildInfo();
  const rows: [string, string][] = [
    ['App version', info.appVersion],
    ['Build number', info.buildNumber],
    ['Bundle ID', info.bundleId],
    ['Runtime version', info.runtimeVersion],
    ['Update channel', info.updateChannel],
    ['Update ID', info.updateId],
    ['Launched from', info.launchSource],
    ['OS', `${Platform.OS} ${String(Platform.Version)}`],
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Build</Text>
      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} selectable>
              {value}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.section}>Fire TV connection test</Text>
      <View style={styles.card}>
        <Text style={styles.placeholder}>Coming in Milestone 3.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  section: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  label: { ...typography.body, color: colors.text },
  value: { ...typography.mono, color: colors.textSecondary, flexShrink: 1, textAlign: 'right' },
  placeholder: { ...typography.body, color: colors.textSecondary },
});
