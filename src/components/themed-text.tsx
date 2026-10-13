import { Colors, type ThemeColor } from "@/constants/theme";
import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  type?: string;
  themeColor?: ThemeColor;
};
export function ThemedText({
  style,
  themeColor = "text",
  ...props
}: ThemedTextProps) {
  return (
    <Text style={[{ color: Colors.light[themeColor] }, style]} {...props} />
  );
}
