export const theme = {
  colors: {
    primary: "#00A86B", // Vibrant Green
    primaryDark: "#007A4D",
    primaryLight: "#E0F2F1", // Very light green for backgrounds
    secondary: "#004D40", // Dark Teal/Green
    background: "#FFFFFF", // Pure White
    surface: "#F8F9FA", // Light Grey for cards/inputs
    surfaceHighlight: "#F1F3F4",
    text: {
      primary: "#1A1A1A", // Almost Black
      secondary: "#666666", // Dark Grey
      tertiary: "#999999", // Light Grey
      inverse: "#FFFFFF", // White text on dark backgrounds
      brand: "#00A86B",
    },
    status: {
      success: "#4CAF50",
      error: "#D32F2F",
      warning: "#FFC107",
      info: "#2196F3",
    },
    border: "#E0E0E0",
    divider: "#EEEEEE",
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  fonts: {
    thin: "HostGrotesk_300Light",
    light: "HostGrotesk_300Light",
    regular: "HostGrotesk_400Regular",
    medium: "HostGrotesk_500Medium",
    bold: "HostGrotesk_700Bold",
    black: "HostGrotesk_800ExtraBold",
  },
};

export type Theme = typeof theme;
