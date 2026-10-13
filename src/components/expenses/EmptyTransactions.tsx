import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

export function EmptyTransactions({
  message = "No transactions match this filter.",
}: {
  message?: string;
}) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={styles.icon}>○</Text>
      <Text style={styles.title}>Nothing here yet</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: theme.spacing.xxl },
  icon: { color: theme.colors.accent, fontSize: 34 },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginTop: theme.spacing.sm,
  },
  message: {
    color: theme.colors.mutedText,
    fontSize: 14,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
});
