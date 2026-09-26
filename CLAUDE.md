# Clicker — Universal TV Remote (Fire TV + Roku)

**Claude Code Project Brief & Build Guide — Rev 3 (phone-only workflow)**
Status: IN DEVELOPMENT — M1 (scaffold) implemented, untested on hardware. Working name "Clicker" — final app name and bundle ID still to be chosen by ED (see §9).
Rev 3 changes: repo is `ernie4625/Tv-Controller-app` (not `clicker-remote`); routes live in `src/app/` (Expo SDK 57 template); Expo working notes added (§10); Apple Developer enrollment noted as a blocker for installable builds. Prior revisions are kept unchanged in `docs/spec/`.

---

## 0. How to use this file

1. This file lives at the root of `ernie4625/Tv-Controller-app` as `CLAUDE.md`. Claude Code reads it automatically at the start of every session. Older revisions live in `docs/spec/` — never overwrite them; bump the Rev here instead.
2. Open Claude Code on the web, select the repo, and say: **"Start Milestone N."**
3. Work one milestone at a time. Do not let Claude Code skip ahead.
4. Claude Code works on a branch and opens a pull request per milestone; ED reviews and merges it in the GitHub app.
5. Every milestone ends with a cloud build ED installs on the iPhone.

The **Step-by-Step Guide** for you (the human) is in Section 8. The rest of this file is instructions for Claude Code.

**Environment note for Claude Code:** you are running in Anthropic's cloud sandbox. You cannot reach ED's home network, his iPhone, or the Fire TV Cube. All hardware testing is done by ED on the phone; you ship builds via EAS. `EXPO_TOKEN` is provided as an environment variable (**not set yet as of Rev 3** — check with `[ -n "$EXPO_TOKEN" ]` before any `eas` command and tell ED if it is missing); `expo.dev`, `registry.npmjs.org`, and `api.revenuecat.com` are on the network allow-list.

---

## 1. Product summary

A clean, fast iPhone remote app that controls **Amazon Fire TV** and **Roku** devices over the local Wi-Fi network. Competitors are cluttered, ad-heavy, and use aggressive weekly subscriptions. We win on UI quality, speed, and fair pricing.

**v1 scope**

- Discover Fire TV and Roku devices on the LAN
- Full remote: D-pad, OK, Back, Home, Menu, Play/Pause, Rewind, Fast-forward, Volume ±, Mute, Power
- Keyboard text entry (type search terms from the phone)
- App launcher: list installed apps, tap to launch
- Multiple saved devices, quick switcher
- Haptic feedback on every press
- Dark-mode-first UI
- Paywall: free tier (D-pad + OK + Back + Home only) → one-time "Lifetime" unlock **and** an annual subscription option

**Out of scope for v1:** Samsung, LG, Apple TV, Android TV, IR blaster, Android app, widgets, Siri Shortcuts (v2).

---

## 2. Tech stack (fixed — do not change without asking)

| Layer      | Choice                                                                                    | Notes                                                             |
| ---------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Framework  | React Native + Expo (latest stable SDK), TypeScript strict                                | Expo **dev build** (EAS), NOT Expo Go — we need native networking |
| Navigation | Expo Router                                                                               |                                                                   |
| State      | Zustand                                                                                   | Keep it simple                                                    |
| Storage    | `expo-secure-store` for keys, `@react-native-async-storage/async-storage` for device list |                                                                   |
| Networking | `react-native-tcp-socket` (Fire TV ADB), `fetch` (Roku HTTP)                              |                                                                   |
| Discovery  | `react-native-zeroconf` (mDNS) + manual SSDP via `react-native-udp`                       |                                                                   |
| Crypto     | `node-forge` (RSA for ADB auth)                                                           | Pure JS, works in RN                                              |
| Haptics    | `expo-haptics`                                                                            |                                                                   |
| Payments   | RevenueCat (`react-native-purchases`)                                                     | Products: `clicker_lifetime`, `clicker_annual`                    |
| Builds     | EAS Build + EAS Submit                                                                    | No Mac required                                                   |
| Testing    | Jest + React Native Testing Library; protocol unit tests with recorded fixtures           |                                                                   |

---

## 3. Protocol reference

### 3.1 Roku — External Control Protocol (ECP)

Documented, open, no pairing. Base URL: `http://<ip>:8060`

| Action      | Request                                                                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Discovery   | SSDP M-SEARCH to `239.255.255.250:1900`, `ST: roku:ecp` — reply `LOCATION` header gives base URL                                                                                       |
| Device info | `GET /query/device-info` (XML)                                                                                                                                                         |
| Key press   | `POST /keypress/<Key>` — keys: `Home Rev Fwd Play Select Left Right Down Up Back InstantReplay Info Backspace Search Enter VolumeUp VolumeDown VolumeMute PowerOff PowerOn Lit_<char>` |
| Key down/up | `POST /keydown/<Key>` / `POST /keyup/<Key>` (use for hold-to-repeat)                                                                                                                   |
| Text entry  | `POST /keypress/Lit_<url-encoded char>` per character                                                                                                                                  |
| List apps   | `GET /query/apps` (XML)                                                                                                                                                                |
| App icon    | `GET /query/icon/<appId>`                                                                                                                                                              |
| Launch app  | `POST /launch/<appId>`                                                                                                                                                                 |

Roku must have "Control by mobile apps" enabled (default on; Settings → System → Advanced → Control by mobile apps → Enabled / Permissive).

### 3.2 Fire TV — ADB over Wi-Fi

Fire TV's own remote protocol is proprietary. We use **ADB over TCP, port 5555**, which is stable and documented.

**User must enable once on the Fire TV:** Settings → My Fire TV → Developer Options → ADB Debugging **ON**. (If Developer Options is hidden: Settings → My Fire TV → About → tap "Fire TV Stick/Cube" name 7×.) First connection shows an "Allow USB debugging?" prompt on the TV — user ticks "Always allow" and OK.

**Implementation:** implement the ADB wire protocol client in TypeScript over `react-native-tcp-socket`.

- Messages: 24-byte header (`command, arg0, arg1, data_length, data_crc32, magic`) + payload
- Handshake: `CNXN` → device replies `AUTH` (type TOKEN) → sign token with our RSA key (`AUTH` type SIGNATURE) → if rejected, send public key (`AUTH` type RSAPUBLICKEY) which triggers the on-screen prompt → `CNXN` from device = connected
- Generate one RSA-2048 keypair per install (node-forge), persist in SecureStore. Public key must be in Android's `adbkey.pub` format (base64 of ADB-specific key struct + ` clicker@iphone`)
- Open a stream: `OPEN` with `shell:<command>` → read `WRTE` data → `CLSE`
- Keep one persistent TCP connection per device; reconnect on drop with backoff

**Commands (shell):**

| Action      | Shell command                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Key press   | `input keyevent <KEYCODE>`                                                                                                                                                           |
| Text entry  | `input text '<escaped text>'`                                                                                                                                                        |
| Launch app  | `monkey -p <package> -c android.intent.category.LAUNCHER 1` or `am start -n <package>/<activity>`                                                                                    |
| List apps   | `pm list packages -3` (plus a curated label map for common apps: Netflix, Prime Video, YouTube, Disney+, Hulu, Max, Plex, Spotify, Apple TV, Peacock, Paramount+, ESPN, Tubi, Pluto) |
| Device name | `getprop ro.product.model`                                                                                                                                                           |

**Keycodes:** `KEYCODE_DPAD_UP 19, DOWN 20, LEFT 21, RIGHT 22, CENTER 23, BACK 4, HOME 3, MENU 82, MEDIA_PLAY_PAUSE 85, MEDIA_REWIND 89, MEDIA_FAST_FORWARD 90, VOLUME_UP 24, VOLUME_DOWN 25, VOLUME_MUTE 164, POWER 26, SLEEP 223, WAKEUP 224, DEL 67, ENTER 66`

**Discovery:** mDNS service `_amzn-wplay._tcp.local` (Fire TV advertises this), plus SSDP fallback, plus a "Enter IP manually" field. Also try port-5555 TCP probe on discovered hosts.

Note: volume keycodes work on Fire TV Cube and Fire TV Edition TVs; on a Fire TV Stick they may only work with HDMI-CEC. Surface this in the UI as a tooltip, not an error.

---

## 4. Repo structure

```
Tv-Controller-app/
  CLAUDE.md                  ← this file
  docs/spec/                 ← prior spec revisions (read-only history)
  src/
    app/                     ← Expo Router screens (every file here is a route)
      _layout.tsx            ← root Stack
      (tabs)/_layout.tsx     ← Remote / Apps / Devices tabs
      (tabs)/remote.tsx
      (tabs)/apps.tsx
      (tabs)/devices.tsx
      settings.tsx
      diagnostics.tsx        ← hidden: Settings → tap Version 5×
      paywall.tsx            ← M6
      onboarding/            ← M4
    config/app-info.ts       ← app name + build/update info
    protocols/
      types.ts               ← RemoteDevice interface (common to both)
      roku/ecp.ts
      roku/discovery.ts
      firetv/adb-client.ts   ← wire protocol
      firetv/adb-auth.ts     ← RSA key gen + signing
      firetv/adb-remote.ts   ← RemoteDevice impl over adb-client
      firetv/discovery.ts
      firetv/app-catalog.ts  ← package → label/icon map
    store/                   ← Zustand stores
    ui/                      ← components, theme, haptics
    billing/                 ← RevenueCat wrapper + entitlement gate
  __tests__/
  types/                     ← ambient type declarations
  assets/                    ← icon, splash (NO Roku/Amazon/Fire branding)
  eas.json
  app.json
```

**Common interface every protocol must implement:**

```ts
interface RemoteDevice {
  id: string;
  name: string;
  ip: string;
  kind: 'roku' | 'firetv';
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  press(key: RemoteKey): Promise<void>;
  hold?(key: RemoteKey, down: boolean): Promise<void>;
  typeText(text: string): Promise<void>;
  listApps(): Promise<AppInfo[]>;
  launchApp(appId: string): Promise<void>;
}
```

---

## 5. Milestones (Claude Code works these in order)

Each milestone ends with: tests passing, `README.md` updated, a pull request titled `M<n>: <summary>`, an EAS build kicked off (`eas build --profile preview --platform ios --non-interactive`) with the install link posted in the PR description, and a short status note to ED that says exactly what works and what is untested on real hardware.

Use `eas update --branch preview` instead of a full build when a milestone changes only JS/TS (no new native packages) — ED gets it on next app launch, no reinstall.

**M1 — Scaffold**

- `npx create-expo-app` with TypeScript + Expo Router; strict TS; ESLint + Prettier; Jest
- `eas.json` with `preview` (internal distribution, ad-hoc) and `production` profiles; enable EAS Update on the `preview` branch
- Register ED's iPhone for ad-hoc builds (`eas device:create` → give ED the QR/link to open on the phone)
- Theme (dark-first), haptics helper, empty tab screens, hidden Diagnostics screen (Settings → tap version 5×)
- Deliverable: preview build installs and boots on ED's iPhone

**M2 — Roku end-to-end**

- SSDP discovery + manual IP
- `ecp.ts` with full key map, text entry, app list/launch
- Remote screen wired to a Roku `RemoteDevice`
- Unit tests with mocked HTTP
- Status: "Roku — implemented, UNTESTED on hardware" unless ED has a Roku

**M3 — Fire TV ADB client**

- `adb-auth.ts`: keypair generation, ADB pubkey encoding, token signing (unit-test against known vectors)
- `adb-client.ts`: header pack/unpack, CNXN/AUTH/OPEN/WRTE/OKAY/CLSE, persistent connection, reconnect
- In-app **ADB Diagnostics** screen (hidden, see M1): enter IP → shows each handshake step (TCP open / CNXN sent / AUTH token / signed / pubkey sent / CONNECTED) with pass/fail and a copyable log. ED runs it against the Cube and pastes the log back into Claude Code. This replaces a CLI harness because the cloud sandbox cannot reach the Cube.

**M4 — Fire TV remote + apps**

- `adb-remote.ts` implementing `RemoteDevice`
- Discovery (mDNS + SSDP + probe) and the "enable ADB Debugging" onboarding screens with the exact menu path
- App catalog + launcher screen
- Real-hardware test checklist (Section 7) — ED runs it on the Cube

**M5 — Devices, switching, polish**

- Saved devices, last-used auto-connect, quick switcher in header
- Keyboard entry sheet, hold-to-repeat on D-pad
- Connection status indicator, friendly error states
- App icon + splash (original design, no brand marks)

**M6 — Paywall + billing**

- RevenueCat setup, `clicker_lifetime` (non-consumable) and `clicker_annual` (auto-renew)
- Entitlement gate: free = D-pad/OK/Back/Home; Pro = everything
- Restore purchases, Settings screen with legal links

**M7 — TestFlight + Store**

- Privacy manifest, local-network usage description string, App Store screenshots
- `eas build --profile production` → `eas submit`
- App Store listing copy (no "Roku"/"Fire TV" in the app name or icon; allowed in description as compatibility statements)

---

## 6. Rules for Claude Code

1. TypeScript strict. No `any` without a comment.
2. Never claim something works on hardware unless ED ran it. Use the labels: **implemented / tested-on-hardware / untested**.
3. Protocol code gets unit tests. UI gets at least smoke tests.
4. One milestone per session. Summarize at the end: what was built, what's untested, what ED needs to do next.
5. No brand names or logos (Roku, Amazon, Fire TV, Alexa) in the app name, icon, splash, or bundle ID. Bundle ID: `com.ernie4625.clicker` is a **placeholder** until ED picks the final name — it must be final before the first EAS build, because it cannot change after App Store submission.
6. No analytics or tracking SDKs in v1. Local-network permission prompt text must clearly explain why.
7. Keep dependencies minimal; prefer Expo-maintained packages.
8. Commit after every milestone with message `M<n>: <summary>`; never force-push.

---

## 7. Hardware test checklist (ED runs on the Fire TV Cube)

- [ ] Cube shows up in discovery within 10 s (note the IP: currently 192.168.1.3)
- [ ] First connect triggers "Allow USB debugging" on the TV; "Always allow" sticks after app restart
- [ ] D-pad + OK navigate the Fire TV home screen with no visible lag (< 150 ms)
- [ ] Back, Home, Menu behave like the physical remote
- [ ] Play/Pause, Rewind, FF work inside Prime Video and Netflix
- [ ] Volume ± and Mute change TV volume
- [ ] Power puts the Cube to sleep and wakes it
- [ ] Typing "netflix" from the phone keyboard lands in the Fire TV search box
- [ ] Apps tab lists installed apps with correct labels; tapping launches
- [ ] Kill the app, relaunch → auto-reconnects to the Cube
- [ ] Reboot the Cube → app reconnects without re-pairing
- [ ] Phone on cellular / other Wi-Fi → clear "not on the same network" message, no crash

---

## 8. Step-by-step guide for ED — iPhone only

### A. One-time setup (start today; some take days to approve)

1. **Apple Developer Program** — enroll in the Apple Developer app or developer.apple.com ($99/yr). Approval 1–2 days. Needed for ad-hoc builds, TestFlight, and the App Store.
2. **Expo account** — sign up at expo.dev in Safari. Then: Account → Access tokens → create a token named `claude-code`. Copy it (you'll add it once in step 9).
3. **RevenueCat account** — revenuecat.com, free tier. Not needed until M6.
4. **On the Fire TV Cube:** Settings → My Fire TV → Developer Options → ADB Debugging → ON. Leave it on.
5. **On the iPhone:** install TestFlight from the App Store (used from M7 on).

### B. Repo (done)

6. Repo `ernie4625/Tv-Controller-app` exists and holds this file as `CLAUDE.md`.

### C. Connect Claude Code on the web

8. Done — Claude Code on the web is connected to `Tv-Controller-app`.
9. In the session's cloud environment settings (environment menu in the title bar → Edit): add environment variable `EXPO_TOKEN` = the token from step 2. Never paste the token into chat. `expo.dev`, `registry.npmjs.org`, and `api.revenuecat.com` are already reachable.
10. Start a new session so it picks up the token, then say: _"Start Milestone N."_

### D. Build loop (repeat per milestone)

11. Claude Code works on a branch and opens a PR. You get a notification in the GitHub app.
12. Before M1 finishes it will hand you a device-registration link — open it on the iPhone, install the profile. One time only.
13. When the PR says "build ready," tap the EAS install link on the iPhone, install, open the app. (JS-only milestones arrive as an update on next launch instead.)
14. Test. Come back to the same Claude Code session and say what worked and what didn't — screenshots help. For Fire TV, paste the Diagnostics log.
15. When satisfied, merge the PR in the GitHub app. Then: _"Start Milestone N+1."_

### E. Fire TV validation (after M4)

16. Run the Section 7 checklist on the Cube. Paste results into Claude Code before M5.

### F. Beta and release

17. After M6, tell Claude Code: _"Ship the production build and submit to TestFlight."_ (It runs `eas build --profile production` and `eas submit`; the first submit needs an App Store Connect API key — Claude Code will tell you the 3 taps to create it.)
18. In the App Store Connect app / TestFlight, add yourself and a few friends as testers. Beta at least one week.
19. Create the two in-app products in App Store Connect and link them in RevenueCat (exact names/prices supplied at M6).
20. Claude Code writes the listing copy; you upload screenshots (it generates them) and submit for review. Typical review 1–3 days.

### G. Costs to expect

- Apple Developer: $99/yr
- EAS: free tier covers this project; ~$19/mo only if builds queue too long
- RevenueCat: free until real revenue
- Total to first App Store submission: ~$100 cash + your evenings

### H. Where things live

- Code and PRs: GitHub app
- Build/session status: Claude iPhone app → Code tab
- Installable builds: expo.dev → project → Builds (also linked in each PR)
- Purchases/analytics: RevenueCat dashboard (M6+)

---

## 9. Open items / risks (honest)

- **Fire TV ADB is the risk.** Amazon firmware updates occasionally change ADB behavior. Plan for maintenance releases.
- **Roku is untested** until ED has a Roku device or a friend beta-tests one.
- **Fire TV Stick volume** may need HDMI-CEC; Cube is fine.
- **Local Network permission** on iOS: if the user denies it, discovery silently fails — the app must detect this and show the fix.
- **Cloud sandbox limits:** Claude Code cannot reach the Cube or your phone; every hardware result comes from you. Expect a few more build round-trips than a PC setup.
- **Name check:** confirm the final name is not already taken on the App Store before the first EAS build; have two backups ready.
- **Apple Developer Program (blocker for installable builds):** ED is not enrolled yet. Ad-hoc `preview` builds, device registration, TestFlight, and the App Store all require it. Code work can continue; `eas build` cannot until enrollment is approved.

---

## 10. Expo working notes (for Claude Code)

- **Expo SDK 57.** Expo ships breaking changes every SDK. Before touching an Expo, EAS, or React Native API, check the installed version in `package.json` and read the matching docs (`https://docs.expo.dev/versions/v57.0.0/`, index at `https://docs.expo.dev/llms.txt`), or read the package's `.d.ts` files in `node_modules`. Do not trust memory.
- Add packages with `npx expo install <pkg>` (dev deps: `npx expo install -- --save-dev <pkg>`), never plain `npm install`, so versions match the SDK.
- `ios/` and `android/` are generated (Continuous Native Generation) and git-ignored. Never create or edit them; configure native behaviour in `app.json` and config plugins.
- Run `npx eas-cli@latest <command>` for EAS commands.
- **Before every commit:** `npm run check` (typecheck + lint + Prettier + Jest) and `npx expo-doctor` must pass.
- Tests use `jest-expo` and `expo-router/testing-library` (`renderRouter`). Keep `@testing-library/react-native` on v13 — `expo-router`'s test helper does not support v14's async `render` yet.

---

_Rev 3 — in development, phone-only workflow. M1 implemented; nothing tested on hardware yet._
