import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "@/constants/theme";

export function AppButton({
  children,
  onPress,
  variant = "primary",
}: PropsWithChildren<{
  onPress: () => void;
  variant?: "primary" | "secondary";
}>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" ? styles.secondary : styles.primary,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.label, variant === "secondary" && styles.secondaryLabel]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.primaryLight },
  label: { color: theme.colors.surface, fontWeight: "700", fontSize: 15 },
  secondaryLabel: { color: theme.colors.primary },
  pressed: { opacity: 0.78 },
});
