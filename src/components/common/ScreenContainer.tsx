import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";

export function ScreenContainer({
  children,
  scroll = true,
}: PropsWithChildren<{ scroll?: boolean }>) {
  const content = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
});
