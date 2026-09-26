# Clicker (working name) — universal TV remote

iPhone remote for Fire TV and Roku over home Wi-Fi. Built with Expo (SDK 57), TypeScript and Expo Router.
Full brief and milestone plan: [`CLAUDE.md`](CLAUDE.md).

## Status

| Milestone                  | State                                                          |
| -------------------------- | -------------------------------------------------------------- |
| M1 — Scaffold              | Implemented, **untested on hardware** (no build installed yet) |
| M2 — Roku                  | Not started                                                    |
| M3 — Fire TV ADB client    | Not started                                                    |
| M4 — Fire TV remote + apps | Not started                                                    |
| M5 — Devices + polish      | Not started                                                    |
| M6 — Paywall               | Not started                                                    |
| M7 — TestFlight + Store    | Not started                                                    |

**Blockers for the first iPhone build:** Apple Developer Program enrollment and `EXPO_TOKEN` in the environment. (Final app name is chosen at M7.)

## What M1 contains

- Dark-only theme, Remote / Apps / Devices tabs, Settings screen
- Remote tab: full button layout (D-pad, OK, Power, Back, Home, Menu, media, volume). No device control yet — every button gives haptic feedback only
- Hidden Diagnostics screen: Settings → tap **Version** 5× → shows build number, update channel and update ID
- Local-network permission text and Fire TV Bonjour service declared in `app.json`
- `eas.json` with `preview` (internal / ad-hoc, update channel `preview`) and `production` profiles

## Commands

```bash
npm install
npm run check        # typecheck + lint + format check + tests
npx expo-doctor      # Expo dependency / config health
npx eas-cli@latest build --profile preview --platform ios --non-interactive   # needs EXPO_TOKEN + Apple account
npx eas-cli@latest update --branch preview                                    # JS-only changes
```
