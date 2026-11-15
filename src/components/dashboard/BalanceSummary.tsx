import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { formatCurrency } from "@/utils/currency";

export function BalanceSummary({
  totalSpent,
  totalCredits,
  transactionCount,
}: {
  totalSpent: number;
  totalCredits: number;
  transactionCount: number;
}) {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const year = now.getFullYear();

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{`${monthName} ${year} SPENDING`}</Text>
      <Text style={styles.amount}>{formatCurrency(totalSpent)}</Text>
      <Text style={styles.caption}>
        Across {transactionCount} transaction{transactionCount === 1 ? "" : "s"}
      </Text>
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Incoming</Text>
          <Text style={styles.footerValue}>{formatCurrency(totalCredits)}</Text>
        </View>
        <View style={styles.rule} />
        <View>
          <Text style={styles.footerLabel}>Data source</Text>
          <Text style={styles.footerValue}>
            {transactionCount > 0 ? "Saved locally" : "Empty"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  amount: {
    color: theme.colors.surface,
    fontSize: 36,
    fontWeight: "800",
    marginTop: theme.spacing.sm,
  },
  caption: { color: "#D7E5DC", fontSize: 14, marginTop: theme.spacing.xs },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#48685A",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  footerLabel: { color: "#B9CDBF", fontSize: 12, marginBottom: 3 },
  footerValue: { color: theme.colors.surface, fontWeight: "700", fontSize: 14 },
  rule: { width: 1, height: 28, backgroundColor: "#48685A" },
});
