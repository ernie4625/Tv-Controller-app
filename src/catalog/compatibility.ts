import type { DeviceKind } from '@/protocols/types';

/**
 * Devices Clicker is designed to control, shown on the "Works with" screen.
 *
 * Coverage follows from the protocols (CLAUDE.md §3): every Roku runs ECP; every Fire TV runs
 * Fire OS with ADB debugging. None of these are tested on hardware yet — the Fire TV Cube is the
 * first test device (M4). Do not add "verified" wording until ED has run the §7 checklist.
 */

export type DeviceFamily = {
  kind: DeviceKind;
  title: string;
  color: string;
  summary: string;
  groups: readonly { title: string; models: readonly string[] }[];
  setup: readonly string[];
  notes?: readonly string[];
};

export const FAMILIES: readonly DeviceFamily[] = [
  {
    kind: 'firetv',
    title: 'Fire TV',
    color: '#FF9900',
    summary: 'All Fire TV streaming devices and Fire TV smart TVs. One-time setup on the TV.',
    groups: [
      {
        title: 'Streaming devices',
        models: [
          'Fire TV Stick (2nd gen and newer)',
          'Fire TV Stick Lite',
          'Fire TV Stick 4K / 4K Max',
          'Fire TV Cube (all generations)',
        ],
      },
      {
        title: 'Smart TVs with Fire TV built in',
        models: [
          'Amazon Fire TV Omni, 4-Series and 2-Series',
          'Insignia Fire TV',
          'Toshiba Fire TV',
          'Hisense Fire TV',
          'Pioneer Fire TV',
          'Panasonic Fire TV',
        ],
      },
    ],
    setup: [
      'On the TV open Settings → My Fire TV → Developer Options.',
      'Turn ADB Debugging ON.',
      'No Developer Options? Go to Settings → My Fire TV → About and tap the device name 7 times.',
      'The first time Clicker connects, the TV asks "Allow USB debugging?". Tick "Always allow" and press OK.',
    ],
    notes: [
      'Volume buttons on a Fire TV Stick may need HDMI-CEC turned on for your TV. Fire TV Cube and Fire TV smart TVs work directly.',
    ],
  },
  {
    kind: 'roku',
    title: 'Roku',
    color: '#9B5CE6',
    summary: 'All Roku players and Roku TVs. Works out of the box on most models.',
    groups: [
      {
        title: 'Streaming players',
        models: [
          'Roku Express / Express 4K',
          'Roku Streaming Stick / Streaming Stick 4K',
          'Roku Ultra',
          'Roku Streambar',
        ],
      },
      {
        title: 'Roku TVs',
        models: [
          'Roku Pro Series and Select Series',
          'TCL Roku TV',
          'Hisense Roku TV',
          'onn. Roku TV',
          'Sharp, Philips, JVC and Westinghouse Roku TVs',
        ],
      },
    ],
    setup: [
      'Nothing to install on the TV.',
      "If Clicker can't connect: on the Roku open Settings → System → Advanced system settings → Control by mobile apps.",
      'Set Network access to Enabled or Permissive.',
    ],
  },
];

/** Planned after v1; listed so users know what's coming. */
export const COMING_LATER: readonly string[] = [
  'Samsung TVs',
  'LG TVs',
  'Google TV / Android TV',
  'Apple TV',
  'Vizio TVs',
];

export const REQUIREMENTS: readonly string[] = [
  'Your iPhone and TV on the same Wi-Fi network',
  'Allow "Local Network" access when Clicker asks',
];
