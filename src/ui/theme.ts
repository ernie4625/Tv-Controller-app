import { DarkTheme, type Theme } from 'expo-router';

/** Dark-first palette. The app ships dark-only in v1. */
export const colors = {
  background: '#0B0D10',
  surface: '#16191E',
  surfaceRaised: '#20242B',
  border: '#2A2F37',
  text: '#F2F4F7',
  textSecondary: '#9AA3AF',
  accent: '#2DD4BF',
  accentPressed: '#14B8A6',
  danger: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  round: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' },
  heading: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  mono: { fontSize: 13, fontFamily: 'Menlo' },
} as const;

/** React Navigation theme derived from our palette so headers and tab bars match. */
export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};
