import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import ExpensesScreen from "@/screens/ExpensesScreen";
import HomeScreen from "@/screens/HomeScreen";
import SettingsScreen from "@/screens/SettingsScreen";

type Screen = "home" | "transactions" | "settings";

export default function AppNavigator() {
  const [screen, setScreen] = useState<Screen>("home");
  const content =
    screen === "home" ? (
      <HomeScreen onNavigate={setScreen} />
    ) : screen === "transactions" ? (
      <ExpensesScreen />
    ) : (
      <SettingsScreen />
    );
  return (
    <View style={styles.container}>
      {content}
      <View style={styles.tabBar}>
        {(
          [
            ["home", "⌂", "Home"],
            ["transactions", "≡", "Transactions"],
            ["settings", "◌", "Settings"],
          ] as const
        ).map(([value, icon, label]) => (
          <Pressable
            key={value}
            onPress={() => setScreen(value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: screen === value }}
            style={styles.tab}
          >
            <Text style={[styles.icon, screen === value && styles.active]}>
              {icon}
            </Text>
            <Text style={[styles.label, screen === value && styles.active]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
    gap: 3,
  },
  icon: { color: theme.colors.mutedText, fontSize: 20 },
  label: { color: theme.colors.mutedText, fontSize: 11, fontWeight: "700" },
  active: { color: theme.colors.primary },
});
