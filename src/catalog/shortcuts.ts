import type { DeviceKind } from '@/protocols/types';

/**
 * Quick-launch shortcuts shown as colored tiles (Remote strip + Apps tab).
 *
 * Tiles use each service's name and signature color only — never its logo — to stay clear of
 * App Store guideline 5.2 (third-party trademarks). Names appear as compatibility labels.
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
  /** Ionicons glyph for sports and system tiles. Streaming tiles are text-only. */
  icon?: string;
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
    colors: ['#E50914', '#7A0008'],
    roku: app('12'),
    firetv: app('com.netflix.ninja'),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    section: 'streaming',
    colors: ['#FF1F3D', '#9E0018'],
    roku: app('837'),
    firetv: app('com.amazon.firetv.youtube'),
  },
  {
    id: 'prime',
    label: 'Prime Video',
    section: 'streaming',
    colors: ['#1FA5FF', '#0A4F8C'],
    match: ['Prime Video', 'Amazon Prime Video'],
    roku: app('13'),
    firetv: app('com.amazon.avod'),
  },
  {
    id: 'max',
    label: 'Max',
    section: 'streaming',
    colors: ['#2E5BFF', '#0A1470'],
    match: ['Max', 'HBO Max'],
    roku: app('61322'),
    firetv: app('com.wbd.stream'),
  },
  {
    id: 'hulu',
    label: 'Hulu',
    section: 'streaming',
    colors: ['#1CE783', '#0B7A43'],
    textColor: '#03140B',
    roku: app('2285'),
    firetv: app('com.hulu.plus'),
  },
  {
    id: 'paramount',
    label: 'Paramount+',
    section: 'streaming',
    colors: ['#1A73FF', '#00287A'],
    match: ['Paramount+', 'Paramount Plus'],
    roku: app('31440'),
    firetv: app('com.cbs.ott'),
  },
  {
    id: 'disney',
    label: 'Disney+',
    section: 'streaming',
    colors: ['#1F4FE0', '#0A1650'],
    roku: app('291097'),
    firetv: app('com.disney.disneyplus'),
  },
  {
    id: 'peacock',
    label: 'Peacock',
    section: 'streaming',
    colors: ['#3A3A3A', '#050505'],
    roku: app('593099'),
    firetv: app('com.peacocktv.peacockandroid'),
  },
  {
    id: 'appletv',
    label: 'Apple TV',
    section: 'streaming',
    colors: ['#5A5A5E', '#0A0A0A'],
    roku: app('551012'),
    firetv: app('com.apple.atve.amazon.appletv'),
  },
  {
    id: 'tubi',
    label: 'Tubi',
    section: 'streaming',
    colors: ['#8A2BFF', '#3D0089'],
    roku: app('41468'),
    firetv: app('com.tubitv'),
  },
  {
    id: 'pluto',
    label: 'Pluto TV',
    section: 'streaming',
    colors: ['#FFF23A', '#B8A800'],
    textColor: '#141200',
    roku: app('74519'),
    firetv: app('tv.pluto.android'),
  },
  {
    id: 'spotify',
    label: 'Spotify',
    section: 'streaming',
    colors: ['#1ED760', '#0D6B30'],
    textColor: '#03140B',
    roku: app('22297'),
    firetv: app('com.spotify.tv.android'),
  },
  {
    id: 'plex',
    label: 'Plex',
    section: 'streaming',
    colors: ['#F5B21B', '#8A5F00'],
    textColor: '#1A1200',
    roku: app('13535'),
    firetv: app('com.plexapp.android'),
  },

  // ── Sports ────────────────────────────────────────────────────────────
  {
    id: 'espn',
    label: 'ESPN',
    section: 'sports',
    colors: ['#E4002B', '#5E0012'],
    icon: 'trophy',
    roku: app('34376'),
    firetv: app('com.espn.gtv'),
  },
  {
    id: 'nfl',
    label: 'NFL',
    section: 'sports',
    colors: ['#1B4B9B', '#001A36'],
    icon: 'american-football',
    match: ['NFL', 'NFL+'],
  },
  {
    id: 'nba',
    label: 'NBA',
    section: 'sports',
    colors: ['#1D428A', '#A50D26'],
    icon: 'basketball',
    match: ['NBA', 'NBA App'],
  },
  {
    id: 'mlb',
    label: 'MLB',
    section: 'sports',
    colors: ['#0A3D91', '#B3002D'],
    icon: 'baseball',
    match: ['MLB', 'MLB.TV'],
  },
  {
    id: 'nhl',
    label: 'NHL',
    section: 'sports',
    colors: ['#4A4A4A', '#0A0A0A'],
    icon: 'snow',
    match: ['NHL', 'NHL.TV'],
  },
  {
    id: 'foxsports',
    label: 'FOX Sports',
    section: 'sports',
    colors: ['#0A5CC2', '#001F4D'],
    icon: 'flash',
    match: ['FOX Sports', 'FOX One'],
  },
  {
    id: 'fifa',
    label: 'FIFA+',
    section: 'sports',
    colors: ['#2A7DE1', '#0B2A55'],
    icon: 'football',
    match: ['FIFA+', 'FIFA Plus'],
  },
  {
    id: 'dazn',
    label: 'DAZN',
    section: 'sports',
    colors: ['#F2F600', '#8F9100'],
    textColor: '#111100',
    icon: 'football',
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
    colors: ['#7B2FD6', '#2E0A5E'],
    icon: 'home',
    roku: key('Home'),
  },
  {
    id: 'rokuchannel',
    label: 'The Roku Channel',
    section: 'system',
    colors: ['#6C2BD9', '#1F0A45'],
    icon: 'tv',
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
