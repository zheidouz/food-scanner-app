// ========================================
// Design Tokens — Calming Aesthetic
// Palette: soft blues & greens
// ========================================

export const colors = {
  // Primary palette
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',

  // Secondary (blue)
  secondary: '#64B5F6',
  secondaryLight: '#90CAF9',
  secondaryDark: '#42A5F5',

  // Score colors
  scoreExcellent: '#2E7D32',
  scoreGood: '#4CAF50',
  scoreFair: '#FFC107',
  scorePoor: '#FF9800',
  scoreBad: '#F44336',

  // Nutri-Score colors
  nutriA: '#2E7D32',
  nutriB: '#4CAF50',
  nutriC: '#FFC107',
  nutriD: '#FF9800',
  nutriE: '#F44336',

  // Neutrals
  background: '#F5F9F5',
  surface: '#FFFFFF',
  surfaceAlt: '#E8F5E9',
  textPrimary: '#1B1B1F',
  textSecondary: '#49454F',
  textTertiary: '#7A757F',
  outline: '#CAC4D0',
  outlineLight: '#E0E0E0',

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#64B5F6',

  // Good / Bad
  goodGreen: '#4CAF50',
  badRed: '#F44336',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    letterSpacing: -1,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} as const;

export type Theme = typeof theme;
