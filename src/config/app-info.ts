import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

/** Single place to read the app's display name — rename in app.json, not here. */
export const APP_NAME = Constants.expoConfig?.name ?? 'Clicker';

export type BuildInfo = {
  appVersion: string;
  buildNumber: string;
  bundleId: string;
  runtimeVersion: string;
  updateChannel: string;
  updateId: string;
  launchSource: 'embedded' | 'ota-update';
};

export function getBuildInfo(): BuildInfo {
  return {
    appVersion: Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? 'dev',
    buildNumber: Application.nativeBuildVersion ?? 'dev',
    bundleId: Application.applicationId ?? 'unknown',
    runtimeVersion: Updates.runtimeVersion || 'n/a',
    updateChannel: Updates.channel || 'n/a',
    updateId: Updates.updateId || 'n/a',
    launchSource: Updates.isEmbeddedLaunch ? 'embedded' : 'ota-update',
  };
}
