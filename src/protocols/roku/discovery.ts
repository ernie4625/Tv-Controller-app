/**
 * Finding Rokus on the home network.
 *
 * 1. **Subnet scan (used now):** probe `/query/device-info` on port 8060 across the /24. Pure
 *    `fetch`, so it needs no native package and no Apple multicast entitlement.
 * 2. **SSDP (`ST: roku:ecp`, CLAUDE.md §3.1):** message builder and parser are here and tested;
 *    the UDP transport needs `react-native-udp` plus Apple's multicast entitlement
 *    (com.apple.developer.networking.multicast), which Apple grants on request. Wire it once both exist.
 *
 * Status: implemented, UNTESTED on hardware.
 */

import { isPrivateIPv4, subnetOf, type FetchLike } from '../net';
import { fetchRokuInfo } from './ecp';
import type { RokuDeviceInfo } from './xml';

export const SSDP_ADDRESS = '239.255.255.250';
export const SSDP_PORT = 1900;

export function buildMSearch(mx = 2): string {
  return [
    'M-SEARCH * HTTP/1.1',
    `HOST: ${SSDP_ADDRESS}:${SSDP_PORT}`,
    'MAN: "ssdp:discover"',
    `MX: ${mx}`,
    'ST: roku:ecp',
    '',
    '',
  ].join('\r\n');
}

export type SsdpHit = { ip: string; location: string; usn?: string };

/** Parses an SSDP reply; returns null unless it's a Roku ECP answer with a usable LOCATION. */
export function parseSsdpResponse(text: string): SsdpHit | null {
  const headers: Record<string, string> = {};
  for (const line of text.split(/\r?\n/).slice(1)) {
    const i = line.indexOf(':');
    if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  if (headers.st?.toLowerCase() !== 'roku:ecp') return null;
  const m = headers.location?.match(/^http:\/\/([\d.]+):(\d+)\/?/i);
  if (!m) return null;
  return { ip: m[1], location: headers.location, usn: headers.usn };
}

export type Found = { ip: string; info: RokuDeviceInfo };

type ScanOptions = {
  fetch?: FetchLike;
  timeoutMs?: number;
  concurrency?: number;
  onFound?: (hit: Found) => void;
  signal?: { aborted: boolean };
};

/** Probes x.x.x.1–254 of one /24. Resolves with every Roku that answered. */
export async function scanSubnet(subnet: string, opts: ScanOptions = {}): Promise<Found[]> {
  const hosts = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);
  const found: Found[] = [];
  let next = 0;
  const worker = async () => {
    while (next < hosts.length && !opts.signal?.aborted) {
      const ip = hosts[next++];
      try {
        const info = await fetchRokuInfo(ip, {
          fetch: opts.fetch,
          timeoutMs: opts.timeoutMs ?? 1200,
        });
        const hit = { ip, info };
        found.push(hit);
        opts.onFound?.(hit);
      } catch {
        // Nothing there, or not a Roku.
      }
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency ?? 32 }, worker));
  return found;
}

/** Most home routers use one of these. */
export const COMMON_SUBNETS = ['192.168.1', '192.168.0', '10.0.0', '10.0.1', '192.168.86'];

/** Subnets to scan, most likely first: those of devices we already know, then the common ones. */
export function subnetsToScan(knownIps: readonly string[]): string[] {
  const known = knownIps.filter(isPrivateIPv4).map(subnetOf);
  return [...new Set([...known, ...COMMON_SUBNETS])];
}
