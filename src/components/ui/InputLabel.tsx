import { theme } from "@/lib/theme";
import { StyleSheet, type TextProps } from "react-native";
import { AppText } from "./Text";

type InputLabelProps = TextProps & {};

export function AppInputLabel({ children, style, ...props }: InputLabelProps) {
  return (
    <AppText {...props} weight="medium" size={14} style={[styles.label, style]}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.text.primary,
  },
});
