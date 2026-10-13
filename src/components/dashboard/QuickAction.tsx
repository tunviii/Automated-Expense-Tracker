import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "@/constants/theme";

export function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 84,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    justifyContent: "space-between",
  },
  icon: { fontSize: 20 },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
  pressed: { backgroundColor: theme.colors.primaryLight },
});
