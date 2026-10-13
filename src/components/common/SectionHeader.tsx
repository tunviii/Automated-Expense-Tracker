import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} accessibilityRole="button">
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: "700" },
  action: { color: theme.colors.success, fontSize: 14, fontWeight: "700" },
});
