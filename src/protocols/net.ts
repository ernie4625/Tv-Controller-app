/** Small networking helpers shared by the protocols. */

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function isValidIPv4(ip: string): boolean {
  return IPV4.test(ip.trim());
}

/** Private (home-network) ranges: 10/8, 172.16/12, 192.168/16. */
export function isPrivateIPv4(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

/** "192.168.1.3" → "192.168.1" */
export function subnetOf(ip: string): string {
  return ip.split('.').slice(0, 3).join('.');
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms} ms`);
    this.name = 'TimeoutError';
  }
}

/** fetch with a hard timeout (RN's fetch has none by default). */
export async function fetchWithTimeout(
  fetchFn: FetchLike,
  url: string,
  init: RequestInit = {},
  ms = 3000,
): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(ms));
    }, ms);
  });
  try {
    return await Promise.race([fetchFn(url, { ...init, signal: controller.signal }), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
