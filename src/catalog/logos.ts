import type { ImageSourcePropType } from 'react-native';

/**
 * Brand logo artwork for shortcut tiles: white-on-transparent PNGs, tinted at runtime.
 * Source: simple-icons (CC0 artwork). The marks are trademarks of their owners; ED chose to show
 * real logos during development — review before the App Store submission (M7, guideline 5.2).
 * Brands simple-icons doesn't carry (Prime Video, Hulu, Disney+, Peacock, Pluto TV, ESPN, NFL) use
 * styled wordmarks from the catalog until official files are supplied.
 * Regenerate: see assets/logos/README.md.
 */

export type Logo = { source: ImageSourcePropType; /** width ÷ height */ aspect: number };

export const LOGOS: Readonly<Record<string, Logo>> = {
  netflix: { source: require('../../assets/logos/netflix.png'), aspect: 0.552 },
  youtube: { source: require('../../assets/logos/youtube.png'), aspect: 1.417 },
  max: { source: require('../../assets/logos/max.png'), aspect: 3.656 },
  paramount: { source: require('../../assets/logos/paramount.png'), aspect: 1.25 },
  appletv: { source: require('../../assets/logos/appletv.png'), aspect: 2.042 },
  tubi: { source: require('../../assets/logos/tubi.png'), aspect: 3.49 },
  spotify: { source: require('../../assets/logos/spotify.png'), aspect: 1 },
  plex: { source: require('../../assets/logos/plex.png'), aspect: 2.146 },
  nba: { source: require('../../assets/logos/nba.png'), aspect: 0.438 },
  mlb: { source: require('../../assets/logos/mlb.png'), aspect: 1.854 },
  nhl: { source: require('../../assets/logos/nhl.png'), aspect: 0.885 },
  fifa: { source: require('../../assets/logos/fifa.png'), aspect: 3.052 },
  dazn: { source: require('../../assets/logos/dazn.png'), aspect: 1 },
  foxsports: { source: require('../../assets/logos/foxsports.png'), aspect: 2.365 },
  roku: { source: require('../../assets/logos/roku.png'), aspect: 3.208 },
};
