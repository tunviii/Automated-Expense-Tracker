import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.kicker}>WORKSPACE</Text>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Keep the demo honest while the automation layer is built.
      </Text>
      <Text style={styles.sectionTitle}>Automation status</Text>
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>Demo data active</Text>
            <Text style={styles.statusDetail}>
              Dashboard and transactions use fixed fictional data.
            </Text>
          </View>
          <Text style={styles.statusTag}>ON</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusRow}>
          <View style={[styles.dot, styles.pendingDot]} />
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>
              Automatic SMS reading not connected
            </Text>
            <Text style={styles.statusDetail}>
              No device permissions are requested in this MVP.
            </Text>
          </View>
          <Text style={styles.statusTag}>NEXT</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Roadmap</Text>
      <View style={styles.roadmap}>
        <Text style={styles.roadmapItem}>
          01 Android SMS or notification intake
        </Text>
        <Text style={styles.roadmapItem}>
          02 Review queue for parsed transactions
        </Text>
        <Text style={styles.roadmapItem}>
          03 ML classification service outside the app
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.version}>Automated Expense Tracker · MVP 0.1</Text>
        <AppButton variant="secondary" onPress={() => undefined}>
          Parser demo is available on Home
        </AppButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: theme.colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginTop: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  activeDot: { backgroundColor: theme.colors.success },
  pendingDot: { backgroundColor: theme.colors.warning },
  statusCopy: { flex: 1 },
  statusTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  statusDetail: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  statusTag: { color: theme.colors.mutedText, fontSize: 11, fontWeight: "800" },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  roadmap: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  roadmapItem: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  footer: { marginTop: theme.spacing.xxl, gap: theme.spacing.md },
  version: { color: theme.colors.mutedText, fontSize: 12, textAlign: "center" },
});
