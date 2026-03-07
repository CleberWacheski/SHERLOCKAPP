import { theme } from "@/lib/theme";
import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppInputLabel } from "./InputLabel";
import { AppText } from "./Text";

type AppInputProps = TextInputProps & {
  label?: string;
  errorMessage?: string;
  containerStyle?: object;
};

export function AppInput({
  label,
  errorMessage,
  style,
  containerStyle,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <AppInputLabel>{label}</AppInputLabel>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!errorMessage && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {errorMessage && (
        <AppText style={styles.errorText} size={12}>
          {errorMessage}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  input: {
    height: 48,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text.primary,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  inputError: {
    borderColor: theme.colors.status.error,
  },
  errorText: {
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs,
  },
});
