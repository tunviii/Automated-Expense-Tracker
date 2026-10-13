import { Colors, type ThemeColor } from "@/constants/theme";
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & { type?: ThemeColor };
export function ThemedView({
  style,
  type = "background",
  ...props
}: ThemedViewProps) {
  return (
    <View style={[{ backgroundColor: Colors.light[type] }, style]} {...props} />
  );
}
