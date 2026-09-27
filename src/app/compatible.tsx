import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { COMING_LATER, FAMILIES, REQUIREMENTS, type DeviceFamily } from '@/catalog/compatibility';
import { ListGroup, ListRow } from '@/ui/components';
import { backdrop, colors, gradient, mix, radius, spacing, typography } from '@/ui/theme';

function FamilyCard({ family: f }: { family: DeviceFamily }) {
  return (
    <View style={styles.family}>
      <View style={[styles.familyHero, gradient(f.color, mix(f.color, '#000000', 0.7), 135)]}>
        <Ionicons name="tv" size={26} color="#FFFFFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.familyTitle}>{f.title}</Text>
          <Text style={styles.familySummary}>{f.summary}</Text>
        </View>
      </View>
      {f.groups.map((g) => (
        <ListGroup key={g.title} title={g.title}>
          {g.models.map((m, i) => (
            <ListRow
              key={m}
              label={m}
              icon="checkmark-circle"
              iconColor={f.color}
              last={i === g.models.length - 1}
            />
          ))}
        </ListGroup>
      ))}
      <ListGroup title={`Set up ${f.title}`} footer={f.notes?.join(' ')}>
        {f.setup.map((step, i) => (
          <View key={step} style={[styles.step, i < f.setup.length - 1 && styles.stepDivider]}>
            <View style={[styles.stepNum, { backgroundColor: f.color }]}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </ListGroup>
    </View>
  );
}

export default function CompatibleScreen() {
  return (
    <ScrollView style={[styles.screen, backdrop]} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Clicker controls your TV over home Wi-Fi. No IR blaster or extra hardware needed.
      </Text>
      <ListGroup title="You need">
        {REQUIREMENTS.map((r, i) => (
          <ListRow
            key={r}
            label={r}
            icon={i === 0 ? 'wifi' : 'shield-checkmark'}
            iconColor={colors.cyan}
            last={i === REQUIREMENTS.length - 1}
          />
        ))}
      </ListGroup>
      {FAMILIES.map((f) => (
        <FamilyCard key={f.kind} family={f} />
      ))}
      <ListGroup title="Coming later">
        {COMING_LATER.map((c, i) => (
          <ListRow
            key={c}
            label={c}
            icon="time-outline"
            iconColor={colors.textSecondary}
            last={i === COMING_LATER.length - 1}
          />
        ))}
      </ListGroup>
      <Text style={styles.fine}>
        Fire TV and Roku are trademarks of their owners. Clicker is not affiliated with Amazon or
        Roku.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  lead: { ...typography.body, color: colors.text },
  family: { gap: spacing.md },
  familyHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    boxShadow: '0 6px 0 rgba(0,0,0,0.45), 0 10px 18px rgba(0,0,0,0.4)',
  },
  familyTitle: { ...typography.heading, color: '#FFFFFF', fontWeight: '800' },
  familySummary: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
  step: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, alignItems: 'flex-start' },
  stepDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#111111' },
  stepText: { ...typography.body, color: colors.text, flex: 1 },
  fine: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
