/** Logical keys shared by every protocol. Each protocol maps these to its own codes. */
export type RemoteKey =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'select'
  | 'back'
  | 'home'
  | 'menu'
  | 'playPause'
  | 'rewind'
  | 'fastForward'
  | 'volumeUp'
  | 'volumeDown'
  | 'mute'
  | 'power';

export type DeviceKind = 'roku' | 'firetv';

export interface AppInfo {
  id: string;
  name: string;
  iconUri?: string;
}

/** Common interface every protocol must implement (see CLAUDE.md §4). */
export interface RemoteDevice {
  id: string;
  name: string;
  ip: string;
  kind: DeviceKind;
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  press(key: RemoteKey): Promise<void>;
  hold?(key: RemoteKey, down: boolean): Promise<void>;
  typeText(text: string): Promise<void>;
  listApps(): Promise<AppInfo[]>;
  launchApp(appId: string): Promise<void>;
}
