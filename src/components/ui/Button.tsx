import { theme } from "@/lib/theme";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from "react-native";

type AppButtonProps = TouchableOpacityProps & {
  isLoading?: boolean;
  icon?: React.ReactNode;
};

export function AppButton({
  children,
  style,
  isLoading = false,
  disabled = false,
  icon,
  ...props
}: AppButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      disabled={disabled || isLoading}
    >
      <View style={styles.buttonView}>
        {icon}
        {isLoading && (
          <ActivityIndicator
            color={
              disabled ? theme.colors.text.secondary : theme.colors.background
            }
          />
        )}
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonView: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
