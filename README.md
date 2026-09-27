# Clicker (working name) — universal TV remote

iPhone remote for Fire TV and Roku over home Wi-Fi. Built with Expo (SDK 57), TypeScript and Expo Router.
Full brief and milestone plan: [`CLAUDE.md`](CLAUDE.md).

## Status

| Milestone                     | State                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------- |
| M1 — Scaffold                 | Implemented, **untested on hardware** (no build installed yet)                    |
| UI refresh — Neon + shortcuts | Implemented, **untested on hardware** (web screenshots only)                      |
| UI round 2 — 3D + brands      | Implemented, **untested on hardware** (web screenshots only)                      |
| M2 — Roku                     | Implemented, **UNTESTED on hardware** (no Roku available; mocked-HTTP tests only) |
| M3 — Fire TV ADB client       | Not started                                                                       |
| M4 — Fire TV remote + apps    | Not started                                                                       |
| M5 — Devices + polish         | Not started                                                                       |
| M6 — Paywall                  | Not started                                                                       |
| M7 — TestFlight + Store       | Not started                                                                       |

**Blockers for the first iPhone build:** Apple Developer Program enrollment, and the environment's network policy must allow `api.expo.dev` (`EXPO_TOKEN` is set). (Final app name is chosen at M7.)

## What M1 contains

- Dark-only theme, Remote / Apps / Devices tabs, Settings screen
- Remote tab: full button layout (D-pad, OK, Power, Back, Home, Menu, media, volume). No device control yet — every button gives haptic feedback only
- Hidden Diagnostics screen: Settings → tap **Version** 5× → shows build number, update channel and update ID
- Local-network permission text and Fire TV Bonjour service declared in `app.json`
- `eas.json` with `preview` (internal / ad-hoc, update channel `preview`) and `production` profiles

## UI refresh (after M1)

- **Neon theme:** electric purple / pink / cyan on near-black; glowing buttons colored by function (cyan D-pad and volume, purple nav, pink media, red power), gradient OK and Play buttons. Built-in RN gradients and shadows, no extra packages
- **Quick launch strip** on the Remote screen: the user's own shortcuts (default 8, max 12). **Edit** opens the Apps tab in edit mode
- **Apps tab:** On your remote (reorder with ◀ ▶), Streaming (13), Sports (8: ESPN, NFL, NBA, MLB, NHL, FOX Sports, FIFA+, DAZN), TV & System (TV Settings, Quick Settings, Fire TV Home, Roku Home, The Roku Channel, Sleep)
- Tiles show the service **name on its signature color, never its logo** (App Store guideline 5.2). Catalog: `src/catalog/shortcuts.ts`; launch IDs are best-known values, verified on hardware in M2/M4
- Shortcuts don't launch yet (no device connection until M2/M4); tapping one shows "Connect a device"
- **Known gap:** shortcut edits are in memory only (reset when the app closes) until AsyncStorage is added

## UI round 2

- **Classic 3D remote:** domed plastic keys (lit top, shadow skirt, sink when pressed) on a drawn remote body; red Power, violet OK, pink Play, graphite keys with colored icons, volume rocker
- **Real brand looks** on shortcut tiles: official logo artwork from [simple-icons](https://simpleicons.org) (CC0 files, trademarks belong to their owners) for 15 brands; styled wordmarks for Prime Video, Hulu, Disney+, Peacock, Pluto TV, ESPN and NFL. See `assets/logos/README.md`. Review before App Store submission (M7)
- **Settings:** devices, Works with, haptic feedback on/off + strength (Soft / Normal / Strong), quick-launch edit/reset, privacy note, version (tap 5× for Diagnostics)
- **Works with** screen (`src/app/compatible.tsx`, data in `src/catalog/compatibility.ts`): Fire TV and Roku models, setup steps, coming-later list. Nothing verified on hardware yet
- **Devices tab:** Find your TV (search arrives with M2/M4), saved devices, manual IP, Works with links
- Settings, like shortcuts, reset when the app closes until AsyncStorage is added

## M2 — Roku

- `src/protocols/roku/ecp.ts`: ECP client (`RokuDevice`) with full key map, power toggle, keydown/keyup for hold, text entry (`Lit_` per character), app list with icons, app launch, friendly errors (unreachable, timeout, 403 "Control by mobile apps")
- `src/protocols/roku/discovery.ts`: **Search Wi-Fi** scans the likely /24 subnets for port 8060 (plain `fetch`, no native package). SSDP message builder and parser are ready; the UDP transport needs `react-native-udp` **and** Apple's multicast entitlement (requested from Apple) — wired later
- `src/protocols/launch.ts`: shortcut tiles open the catalog channel ID, or fall back to matching the app name in the TV's app list
- `src/store/devices.ts`: saved TVs, current connection, status (connecting / connected / not responding) — in memory until AsyncStorage is added
- UI: Remote keys and quick-launch tiles control the connected Roku; status bar shows name, IP, errors (tap to reconnect); Devices tab has working search, manual IP (Roku), saved TVs with forget; Apps tab shows the TV's own installed apps with icons
- `app.json`: `NSAllowsLocalNetworking` so iOS permits HTTP to the TV
- Tests: `__tests__/roku-*.test.ts`, `launch.test.ts`, `devices-store.test.ts` with fixtures in `__tests__/fixtures/roku/` (written from Roku's docs, **not** recorded from a device)

## Commands

```bash
npm install
npm run check        # typecheck + lint + format check + tests
npx expo-doctor      # Expo dependency / config health
npx eas-cli@latest build --profile preview --platform ios --non-interactive   # needs EXPO_TOKEN + Apple account
npx eas-cli@latest update --branch preview                                    # JS-only changes
```
