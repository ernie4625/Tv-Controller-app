import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FAMILIES } from '@/catalog/compatibility';
import { ListGroup, ListRow, useToast } from '@/ui/components';
import { haptic } from '@/ui/haptics';
import { backdrop, colors, dome, radius, remoteBody, spacing, typography } from '@/ui/theme';

// Discovery and manual IP arrive with the protocols (M2 Roku, M4 Fire TV).
const NOT_YET = 'Device search arrives in the next update.';

export default function DevicesScreen() {
  const [toast, showToast] = useToast();
  return (
    <View style={[styles.screen, backdrop]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, remoteBody]}>
          <View style={styles.radar}>
            <Ionicons name="tv" size={34} color={colors.cyan} />
          </View>
          <Text style={styles.heroTitle}>Find your TV</Text>
          <Text style={styles.heroText}>
            Make sure your iPhone and TV are on the same Wi-Fi, then search.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search for devices"
            onPress={() => {
              void haptic('press');
              showToast(NOT_YET);
            }}
            style={({ pressed }) => [
              styles.search,
              dome('ok', pressed),
              { transform: [{ translateY: pressed ? 4 : 0 }] },
            ]}
          >
            <Ionicons name="search" size={18} color="#FFFFFF" />
            <Text style={styles.searchLabel}>Search Wi-Fi</Text>
          </Pressable>
        </View>

        <ListGroup title="Saved devices" footer="Devices you connect to are saved here.">
          <ListRow
            label="No devices yet"
            icon="albums-outline"
            iconColor={colors.textSecondary}
            last
          />
        </ListGroup>

        <ListGroup title="Add manually">
          <ListRow
            label="Enter IP address"
            detail="Find it on the TV under Settings → Network"
            icon="keypad"
            iconColor={colors.purple}
            onPress={() => showToast(NOT_YET)}
            last
          />
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 50,
    borderRadius: 25,
    marginTop: spacing.sm,
  },
  searchLabel: { ...typography.body, color: '#FFFFFF', fontWeight: '800' },
});
