import { theme } from "@/lib/theme";
import type { ReactNode } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LayoutProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Layout({ children, style }: LayoutProps) {
  return <SafeAreaView style={[styles.safe, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
