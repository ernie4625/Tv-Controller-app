# Clicker — Session Handoff — Rev 1

**Date:** 2026-09-26 **From:** session "Read this please" **Repo:** `ernie4625/Tv-Controller-app`
**Read this first, then `CLAUDE.md` (spec Rev 4).** This file says where the project stands and what to do next.

---

## 1. Where we are

| Item                 | Status                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 — Scaffold        | **Implemented, untested on hardware.** Pushed to branch `claude/read-this-please-98vdx6` (commits `dac9f6b`, `022837e`, `743e9eb`). Not merged. |
| `main` branch        | **Does not exist.** The only branch on GitHub is `claude/read-this-please-98vdx6` (so it is the default). No PR opened yet.                     |
| `EXPO_TOKEN`         | ED says it was added to the environment. **Not yet verified.**                                                                                  |
| Apple Developer      | **ED is not enrolled.** Blocks device registration and every `eas build`. ED was given the steps (Individual, $99/yr).                          |
| Expo project link    | Not done (`eas init` never run; no `extra.eas.projectId` in `app.json`).                                                                        |
| App name / bundle ID | Placeholder `Clicker` / `com.ernie4625.clicker`. **ED decides the final name at M7**, after home beta testing. Don't ask again before then.     |
| Checks               | `npm run check` (typecheck, lint, Prettier, 12 Jest tests) and `npx expo-doctor` (21/21) all pass. iOS bundle exports cleanly.                  |

## 2. What M1 contains

- Expo SDK 57, React Native 0.86, TypeScript strict, Expo Router, **routes in `src/app/`** (not root `app/`)
- Dark-only theme (`src/ui/theme.ts`), haptics helper (`src/ui/haptics.ts`), `RemoteButton` that always fires a haptic
- Tabs: Remote (full button layout, haptic-only, no device), Apps (empty), Devices (empty); Settings screen
- Hidden Diagnostics: Settings → tap Version 5× (`src/ui/use-tap-counter.ts`); shows build / update channel / update ID
- `app.json`: local-network permission text, Bonjour `_amzn-wplay._tcp`, `runtimeVersion` policy `appVersion`
- `eas.json`: `preview` (internal distribution, channel `preview`) and `production` (channel `production`, auto-increment)
- `src/protocols/types.ts`: `RemoteDevice` / `RemoteKey` / `AppInfo` interface from the spec
- Placeholder icon/splash are Expo's stock art: replace in M5

## 3. Gotchas already solved (don't re-break)

- `@testing-library/react-native` must stay on **v13**: `expo-router/testing-library` doesn't support v14's async `render`.
- TypeScript 6: `tsconfig.json` needs `"types": ["jest", "node"]`; router matcher types live in `types/jest-expo-router.d.ts`.
- `docs/spec/` is in `.prettierignore`: prior spec revisions must stay byte-for-byte unchanged. Never overwrite a Rev; copy to `docs/spec/` and bump.
- `react-native-web` is **not** a dependency. For screenshots only: `npm install --no-save react-native-web@~0.21.0`, `npx expo export --platform web`, then Playwright (global install) at iPhone 13 size. Don't commit it.
- Commit trailer and branch rules come from the session's system instructions. Never force-push.

## 4. Next steps (in order)

1. **Verify the token:** `[ -n "$EXPO_TOKEN" ] && npx eas-cli@latest whoami`. If it's missing or fails, tell ED (environment menu in the session title bar → Edit → env var `EXPO_TOKEN`, then a new session). Never ask for the token in chat.
2. **Link the Expo project:** `npx eas-cli@latest init --non-interactive` (adds `extra.eas.projectId`), then `npx eas-cli@latest update:configure` if needed for the `preview` channel. Commit.
3. **Branching:** ask ED once: "Create `main` from M1 and open PRs from now on?" (ED reviews and merges in the GitHub app.) Still unanswered from the last session.
4. **Start M2 — Roku** (doesn't need Apple): SSDP discovery + manual IP, `src/protocols/roku/ecp.ts`, `roku/discovery.ts`, wire the Remote tab to a Roku `RemoteDevice`, mocked-HTTP unit tests. Label: "Roku — implemented, UNTESTED on hardware" (ED has no Roku; ED's device is a **Fire TV Cube at 192.168.1.3**).
5. **When ED says Apple is approved:** `eas device:create` (send ED the link), then `eas build --profile preview --platform ios --non-interactive`, and post the install link.

## 5. How to work with ED

- ED isn't a developer. Plain language, concise, give him finished results and exact taps.
- Complex steps: plan first, ask numbered questions, wait. Simple things: just do them.
- Honest status labels only: **implemented / tested-on-hardware / untested**.
- Personal project: **no VaCom branding or footer.**

---

_Rev 1 — handoff after M1. Nothing tested on hardware yet._
