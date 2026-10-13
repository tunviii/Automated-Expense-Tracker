export const theme = {
  colors: {
    background: "#F6F7F2",
    surface: "#FFFFFF",
    primary: "#244B3C",
    primaryLight: "#E5EEE8",
    accent: "#91A995",
    text: "#17231D",
    mutedText: "#748078",
    border: "#E4E9E3",
    danger: "#C65D53",
    success: "#36795A",
    warning: "#D9A441",
  },
  radius: { sm: 10, md: 16, lg: 22, pill: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
} as const;

export type ThemeColor = keyof typeof Colors.light;
export const Fonts = {
  sans: "System",
  serif: "serif",
  rounded: "System",
  mono: "monospace",
} as const;

export const Colors = {
  light: {
    text: theme.colors.text,
    background: theme.colors.background,
    backgroundElement: theme.colors.surface,
    backgroundSelected: theme.colors.primaryLight,
    textSecondary: theme.colors.mutedText,
  },
  dark: {
    text: theme.colors.surface,
    background: theme.colors.text,
    backgroundElement: "#26352D",
    backgroundSelected: "#3D5F4F",
    textSecondary: theme.colors.accent,
  },
} as const;

export const Spacing = {
  half: 2,
  one: theme.spacing.xs,
  two: theme.spacing.sm,
  three: theme.spacing.lg,
  four: theme.spacing.xl,
  five: theme.spacing.xxl,
  six: 64,
} as const;

export const BottomTabInset = 76;
export const MaxContentWidth = 800;
