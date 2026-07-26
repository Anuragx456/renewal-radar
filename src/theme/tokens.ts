export const colors = {
  // Primary palette
  primary: "#208AEF",
  primaryLight: "#60AEF5",
  primaryDark: "#1A6FB8",

  // Semantic colors
  danger: "#E53935",
  dangerLight: "#FF6B6B",
  warning: "#FB8C00",
  warningLight: "#FFB74D",
  success: "#43A047",
  successLight: "#81C784",

  // Neutrals
  white: "#FFFFFF",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  border: "#E0E4E8",
  divider: "#F0F2F5",

  // Text
  textPrimary: "#1A1D21",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Misc
  overlay: "rgba(0, 0, 0, 0.5)",
  disabled: "#D1D5DB",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 22 },
  bodyBold: { fontSize: 16, fontWeight: "600" as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: "600" as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: "400" as const, lineHeight: 14 },
  price: { fontSize: 24, fontWeight: "700" as const, lineHeight: 30 },
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
