import { DarkTheme, type Theme } from 'expo-router';
import { Platform, type ViewStyle } from 'react-native';

/** "Neon" palette: electric purple, pink and cyan on near-black. The app ships dark-only in v1. */
export const colors = {
  background: '#07050F',
  surface: '#120D24',
  surfaceRaised: '#1C1536',
  border: '#2C2250',
  text: '#F5F3FF',
  textSecondary: '#A59BC9',
  purple: '#A855F7',
  pink: '#EC4899',
  cyan: '#22D3EE',
  rose: '#FB3B6B',
  lime: '#A3E635',
  accent: '#EC4899',
  accentPressed: '#DB2777',
  danger: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
} as const;

/** Button families on the remote each get their own neon color. */
export type Tone = 'cyan' | 'purple' | 'pink' | 'rose';

export const toneColor: Record<Tone, string> = {
  cyan: colors.cyan,
  purple: colors.purple,
  pink: colors.pink,
  rose: colors.rose,
};

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
  section: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  mono: { fontSize: 13, fontFamily: 'Menlo' },
} as const;

/** Appends a two-digit hex alpha to a #RRGGBB color. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/**
 * Linear gradient fill using React Native's built-in CSS gradient support (no extra package).
 * Native reads `experimental_backgroundImage`; react-native-web (screenshots only) reads `backgroundImage`.
 */
export function gradient(from: string, to: string, angle = 135): ViewStyle {
  const css = `linear-gradient(${angle}deg, ${from}, ${to})`;
  if (Platform.OS === 'web') {
    // react-native-web passes this CSS property straight through; it is not in RN's ViewStyle type.
    return { backgroundImage: css } as unknown as ViewStyle;
  }
  return { experimental_backgroundImage: css };
}

/** Soft neon glow around a view. */
export function glow(color: string, strength = 0.45, blur = 18): ViewStyle {
  return { boxShadow: `0 0 ${blur}px ${withAlpha(color, strength)}` };
}

/** Header color; also the top of the screen backdrop so header and content read as one surface. */
export const headerBackground = '#1E0B45';

/** Full-screen backdrop: violet at the top fading to near-black. */
export const backdrop: ViewStyle = gradient(headerBackground, colors.background, 180);

/** React Navigation theme derived from our palette so headers and tab bars match. */
export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};
