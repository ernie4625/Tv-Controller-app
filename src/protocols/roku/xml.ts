/**
 * Minimal readers for Roku's ECP XML (flat, well-formed, no namespaces). A full XML parser
 * would be a new dependency for two tiny documents.
 */

import type { AppInfo } from '../types';

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

export function decodeXml(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Text of the first `<name>…</name>`, or undefined. */
export function tagText(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  const v = m ? decodeXml(m[1].trim()) : undefined;
  return v === '' ? undefined : v;
}

export type RokuDeviceInfo = {
  deviceId?: string;
  serial?: string;
  name: string;
  model?: string;
  isTv: boolean;
  powerMode?: string;
};

export function parseDeviceInfo(xml: string): RokuDeviceInfo {
  if (!/<device-info[\s>]/i.test(xml)) throw new Error('Not a Roku device-info response');
  const model = tagText(xml, 'model-name');
  return {
    deviceId: tagText(xml, 'device-id'),
    serial: tagText(xml, 'serial-number'),
    name:
      tagText(xml, 'user-device-name') ??
      tagText(xml, 'friendly-device-name') ??
      tagText(xml, 'default-device-name') ??
      model ??
      'Roku',
    model,
    isTv: tagText(xml, 'is-tv') === 'true',
    powerMode: tagText(xml, 'power-mode'),
  };
}

/** `<app id="12" type="appl" version="4.2">Netflix</app>` → AppInfo. Skips non-app entries (menus, TV inputs). */
export function parseApps(xml: string, iconBase?: string): AppInfo[] {
  const apps: AppInfo[] = [];
  const re = /<app\s([^>]*)>([\s\S]*?)<\/app>/gi;
  for (let m = re.exec(xml); m; m = re.exec(xml)) {
    const attrs = m[1];
    const id = attrs.match(/\bid="([^"]*)"/i)?.[1];
    const type = attrs.match(/\btype="([^"]*)"/i)?.[1];
    if (!id || (type && type !== 'appl')) continue;
    apps.push({
      id: decodeXml(id),
      name: decodeXml(m[2].trim()),
      iconUri: iconBase ? `${iconBase}/query/icon/${encodeURIComponent(id)}` : undefined,
    });
  }
  return apps;
}
