import type { PropsWithChildren } from "react";
import { Pressable, Text, View } from "react-native";

export function Collapsible({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <View>
      <Pressable>
        <Text>{title}</Text>
      </Pressable>
      {children}
    </View>
  );
}
