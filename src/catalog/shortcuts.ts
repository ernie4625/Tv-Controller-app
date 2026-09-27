import type { DeviceKind } from '@/protocols/types';

/**
 * Quick-launch shortcuts shown as colored tiles (Remote strip + Apps tab).
 *
 * Tiles mimic each brand: its real logo (simple-icons artwork, see `logos.ts`) tinted in brand color
 * on its brand background, or a styled wordmark where no logo file exists. ED chose real logos for
 * development; revisit before App Store submission (M7, guideline 5.2).
 *
 * Launch targets are best-known values, NOT verified on hardware. Roku channel IDs and Fire TV
 * package names can change, so launchers must fall back to matching `match` names against the
 * device's installed-app list (Roku `/query/apps`, Fire TV `pm list packages`). Verified in M2/M4.
 */

export type ShortcutSection = 'streaming' | 'sports' | 'system';

export type LaunchTarget =
  | { type: 'app'; id: string } // Roku channel ID or Fire TV package name
  | { type: 'key'; key: string } // Roku ECP key name or Android keycode name
  | { type: 'shell'; command: string }; // Fire TV only: raw ADB shell command

export type Shortcut = {
  id: string;
  label: string;
  section: ShortcutSection;
  /** Tile gradient, light end first. */
  colors: readonly [string, string];
  /** Label color when the tile is light (defaults to white). */
  textColor?: string;
  /** Ionicons glyph for tiles without a brand look (system tiles). */
  icon?: string;
  /** Key into LOGOS (`logos.ts`); drawn in `logoTint`. */
  logo?: string;
  logoTint?: string;
  /** Styled brand name for services without a logo file. */
  wordmark?: { text: string; color: string; italic?: boolean; size?: number; spacing?: number };
  /** Names to look for in the device's installed-app list when the ID is unknown or stale. */
  match?: readonly string[];
  roku?: LaunchTarget;
  firetv?: LaunchTarget;
};

const app = (id: string): LaunchTarget => ({ type: 'app', id });
const key = (k: string): LaunchTarget => ({ type: 'key', key: k });

export const SHORTCUTS: readonly Shortcut[] = [
  // ── Streaming ─────────────────────────────────────────────────────────
  {
    id: 'netflix',
    label: 'Netflix',
    section: 'streaming',
    colors: ['#1A1A1A', '#000000'],
    logo: 'netflix',
    logoTint: '#E50914',
    roku: app('12'),
    firetv: app('com.netflix.ninja'),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    section: 'streaming',
    colors: ['#2A2A2A', '#0F0F0F'],
    logo: 'youtube',
    logoTint: '#FF0033',
    roku: app('837'),
    firetv: app('com.amazon.firetv.youtube'),
  },
  {
    id: 'prime',
    label: 'Prime Video',
    section: 'streaming',
    colors: ['#1B2A3D', '#00050D'],
    wordmark: { text: 'prime video', color: '#1A98FF', size: 17, spacing: -0.5 },
    match: ['Prime Video', 'Amazon Prime Video'],
    roku: app('13'),
    firetv: app('com.amazon.avod'),
  },
  {
    id: 'max',
    label: 'HBO Max',
    section: 'streaming',
    colors: ['#1F48FF', '#001494'],
    logo: 'max',
    logoTint: '#FFFFFF',
    match: ['HBO Max', 'Max'],
    roku: app('61322'),
    firetv: app('com.wbd.stream'),
  },
  {
    id: 'hulu',
    label: 'Hulu',
    section: 'streaming',
    colors: ['#1F2227', '#0B0C0F'],
    wordmark: { text: 'hulu', color: '#1CE783', size: 28, spacing: -1.5 },
    roku: app('2285'),
    firetv: app('com.hulu.plus'),
  },
  {
    id: 'paramount',
    label: 'Paramount+',
    section: 'streaming',
    colors: ['#1A73FF', '#00287A'],
    logo: 'paramount',
    logoTint: '#FFFFFF',
    match: ['Paramount+', 'Paramount Plus'],
    roku: app('31440'),
    firetv: app('com.cbs.ott'),
  },
  {
    id: 'disney',
    label: 'Disney+',
    section: 'streaming',
    colors: ['#1B3A8C', '#040B2A'],
    wordmark: { text: 'Disney+', color: '#FFFFFF', italic: true, size: 20 },
    roku: app('291097'),
    firetv: app('com.disney.disneyplus'),
  },
  {
    id: 'peacock',
    label: 'Peacock',
    section: 'streaming',
    colors: ['#1C1C1C', '#000000'],
    wordmark: { text: 'peacock', color: '#FFFFFF', size: 19, spacing: -0.5 },
    roku: app('593099'),
    firetv: app('com.peacocktv.peacockandroid'),
  },
  {
    id: 'appletv',
    label: 'Apple TV',
    section: 'streaming',
    colors: ['#2C2C2E', '#000000'],
    logo: 'appletv',
    logoTint: '#FFFFFF',
    roku: app('551012'),
    firetv: app('com.apple.atve.amazon.appletv'),
  },
  {
    id: 'tubi',
    label: 'Tubi',
    section: 'streaming',
    colors: ['#8A2BFF', '#4400A8'],
    logo: 'tubi',
    logoTint: '#FFFF13',
    roku: app('41468'),
    firetv: app('com.tubitv'),
  },
  {
    id: 'pluto',
    label: 'Pluto TV',
    section: 'streaming',
    colors: ['#1E1E1E', '#000000'],
    wordmark: { text: 'pluto tv', color: '#FFF200', size: 19, spacing: -0.5 },
    roku: app('74519'),
    firetv: app('tv.pluto.android'),
  },
  {
    id: 'spotify',
    label: 'Spotify',
    section: 'streaming',
    colors: ['#1F1F1F', '#000000'],
    logo: 'spotify',
    logoTint: '#1ED760',
    roku: app('22297'),
    firetv: app('com.spotify.tv.android'),
  },
  {
    id: 'plex',
    label: 'Plex',
    section: 'streaming',
    colors: ['#2A2A2A', '#0F0F0F'],
    logo: 'plex',
    logoTint: '#EBAF00',
    roku: app('13535'),
    firetv: app('com.plexapp.android'),
  },

  // ── Sports ────────────────────────────────────────────────────────────
  {
    id: 'espn',
    label: 'ESPN',
    section: 'sports',
    colors: ['#1E1E1E', '#000000'],
    wordmark: { text: 'ESPN', color: '#E4002B', italic: true, size: 26, spacing: -1 },
    roku: app('34376'),
    firetv: app('com.espn.gtv'),
  },
  {
    id: 'nfl',
    label: 'NFL',
    section: 'sports',
    colors: ['#0B4A9E', '#001A36'],
    wordmark: { text: 'NFL', color: '#FFFFFF', size: 26, spacing: 1 },
    match: ['NFL', 'NFL+'],
  },
  {
    id: 'nba',
    label: 'NBA',
    section: 'sports',
    colors: ['#1D428A', '#0B2352'],
    logo: 'nba',
    logoTint: '#FFFFFF',
    match: ['NBA', 'NBA App'],
  },
  {
    id: 'mlb',
    label: 'MLB',
    section: 'sports',
    colors: ['#0A3D91', '#041E42'],
    logo: 'mlb',
    logoTint: '#FFFFFF',
    match: ['MLB', 'MLB.TV'],
  },
  {
    id: 'nhl',
    label: 'NHL',
    section: 'sports',
    colors: ['#3A3A3A', '#0A0A0A'],
    logo: 'nhl',
    logoTint: '#FFFFFF',
    match: ['NHL', 'NHL.TV'],
  },
  {
    id: 'foxsports',
    label: 'FOX Sports',
    section: 'sports',
    colors: ['#0A5CC2', '#001F4D'],
    logo: 'foxsports',
    logoTint: '#FFFFFF',
    match: ['FOX Sports', 'FOX One'],
  },
  {
    id: 'fifa',
    label: 'FIFA+',
    section: 'sports',
    colors: ['#2A7DE1', '#0B2A55'],
    logo: 'fifa',
    logoTint: '#FFFFFF',
    match: ['FIFA+', 'FIFA Plus'],
  },
  {
    id: 'dazn',
    label: 'DAZN',
    section: 'sports',
    colors: ['#1A242A', '#0C161C'],
    logo: 'dazn',
    logoTint: '#F7FF1A',
    match: ['DAZN'],
  },

  // ── System ────────────────────────────────────────────────────────────
  {
    id: 'settings',
    label: 'TV Settings',
    section: 'system',
    colors: ['#A855F7', '#4C1D95'],
    icon: 'settings',
    // Roku ECP has no "open Settings" call; tile shows as Fire TV only until a workaround exists.
    firetv: { type: 'shell', command: 'am start -a android.settings.SETTINGS' },
  },
  {
    id: 'quicksettings',
    label: 'Quick Settings',
    section: 'system',
    colors: ['#EC4899', '#831843'],
    icon: 'options',
    firetv: key('KEYCODE_SETTINGS'),
  },
  {
    id: 'firetvhome',
    label: 'Fire TV Home',
    section: 'system',
    colors: ['#FF9900', '#8A4B00'],
    textColor: '#1A0E00',
    icon: 'home',
    firetv: key('KEYCODE_HOME'),
  },
  {
    id: 'rokuhome',
    label: 'Roku Home',
    section: 'system',
    colors: ['#7B3FB0', '#3B1760'],
    logo: 'roku',
    logoTint: '#FFFFFF',
    roku: key('Home'),
  },
  {
    id: 'rokuchannel',
    label: 'The Roku Channel',
    section: 'system',
    colors: ['#6C2BD9', '#1F0A45'],
    logo: 'roku',
    logoTint: '#FFFFFF',
    roku: app('151908'),
  },
  {
    id: 'sleep',
    label: 'Sleep',
    section: 'system',
    colors: ['#22D3EE', '#0E4F6B'],
    textColor: '#021217',
    icon: 'moon',
    roku: key('PowerOff'),
    firetv: key('KEYCODE_SLEEP'),
  },
];

export const SECTIONS: readonly { id: ShortcutSection; title: string }[] = [
  { id: 'streaming', title: 'Streaming' },
  { id: 'sports', title: 'Sports' },
  { id: 'system', title: 'TV & System' },
];

/** What ships on the Remote strip before the user edits it. */
export const DEFAULT_FAVORITES: readonly string[] = [
  'netflix',
  'youtube',
  'prime',
  'max',
  'hulu',
  'paramount',
  'disney',
  'espn',
];

export const MAX_FAVORITES = 12;

const byId = new Map(SHORTCUTS.map((s) => [s.id, s]));

export function getShortcut(id: string): Shortcut | undefined {
  return byId.get(id);
}

/** True when the shortcut can do something on this kind of device (by ID or by name match). */
export function supportsDevice(s: Shortcut, kind: DeviceKind): boolean {
  if (s[kind]) return true;
  return s.section !== 'system' && (s.match?.length ?? 0) > 0;
}
