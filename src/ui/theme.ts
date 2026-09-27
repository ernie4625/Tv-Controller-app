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

/** Blends two #RRGGBB colors; `t` = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const n = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Physical button finishes for the classic 3D remote. */
export type Finish = 'graphite' | 'power' | 'ok' | 'play';

export const finishes: Record<Finish, { top: string; bottom: string; icon: string }> = {
  graphite: { top: '#4A4A5A', bottom: '#23232D', icon: colors.text },
  power: { top: '#FF6B7D', bottom: '#B80F2A', icon: '#FFFFFF' },
  ok: { top: '#C58BFF', bottom: '#6D28D9', icon: '#FFFFFF' },
  play: { top: '#FF7AC2', bottom: '#BE185D', icon: '#FFFFFF' },
};

/**
 * Domed, raised plastic button: light top, dark base, a solid "skirt" below and a soft floor
 * shadow. Pressed, the skirt disappears and the button sinks (pair with translateY).
 */
export function dome(finish: Finish, pressed = false, depth = 5): ViewStyle {
  const f = finishes[finish];
  const skirt = mix(f.bottom, '#000000', 0.55);
  const top = pressed ? mix(f.top, f.bottom, 0.35) : f.top;
  return {
    ...gradient(top, f.bottom, 180),
    boxShadow: pressed
      ? `inset 0 3px 6px rgba(0,0,0,0.55), 0 1px 0 ${skirt}, 0 2px 4px rgba(0,0,0,0.5)`
      : `inset 0 2px 1px rgba(255,255,255,0.30), inset 0 -3px 5px rgba(0,0,0,0.40), 0 ${depth}px 0 ${skirt}, 0 ${depth + 6}px 14px rgba(0,0,0,0.6)`,
  };
}

/** The remote's plastic housing. */
export const remoteBody: ViewStyle = {
  ...gradient('#2A2937', '#111018', 180),
  borderRadius: 44,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.07)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -2px 0 rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.65)',
};

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
