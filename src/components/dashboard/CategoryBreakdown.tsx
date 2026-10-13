import { StyleSheet, Text, View } from "react-native";

import { categoryByLabel } from "@/constants/categories";
import { theme } from "@/constants/theme";
import { formatCurrency } from "@/utils/currency";

export function CategoryBreakdown({
  items,
}: {
  items: { category: string; amount: number }[];
}) {
  const maxAmount = items[0]?.amount ?? 1;
  return (
    <View style={styles.card}>
      {items.slice(0, 4).map((item) => {
        const definition =
          categoryByLabel[item.category as keyof typeof categoryByLabel];
        return (
          <View key={item.category} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.category}>
                {definition?.icon ?? "•"} {item.category}
              </Text>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.progress,
                  { width: `${Math.max(8, (item.amount / maxAmount) * 100)}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  item: { marginBottom: theme.spacing.md },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  category: { color: theme.colors.text, fontSize: 14, flex: 1 },
  amount: { color: theme.colors.text, fontSize: 14, fontWeight: "700" },
  track: {
    height: 7,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
  },
});
