import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function HintRow({ title, hint }: { title?: string; hint?: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text>{title ?? "Try editing"}</Text>
      <Text>{hint ?? "src/app/index.tsx"}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
});
