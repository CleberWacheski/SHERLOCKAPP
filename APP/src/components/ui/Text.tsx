import { theme } from "@/lib/theme";
import { Text as RNText, StyleSheet, type TextProps } from "react-native";

type FontWeightKey = keyof typeof theme.fonts;

type AppTextProps = TextProps & {
  weight?: FontWeightKey;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  muted?: boolean;
};

export function AppText({
  children,
  style,
  weight = "regular",
  size = 14,
  color,
  align = "left",
  muted = false,
  ...props
}: AppTextProps) {
  const resolvedColor =
    color ?? (muted ? theme.colors.text.secondary : theme.colors.text.primary);

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        {
          fontFamily: theme.fonts[weight],
          fontSize: size,
          color: resolvedColor,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text.primary,
  },
});
