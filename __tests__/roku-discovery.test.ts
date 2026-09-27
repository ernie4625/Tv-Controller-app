import { readFileSync } from 'fs';
import { join } from 'path';

import {
  buildMSearch,
  parseSsdpResponse,
  scanSubnet,
  subnetsToScan,
} from '@/protocols/roku/discovery';

const DEVICE_INFO = readFileSync(join(__dirname, 'fixtures/roku/device-info.xml'), 'utf8');

describe('SSDP', () => {
  it('builds a roku:ecp M-SEARCH', () => {
    const msg = buildMSearch();
    expect(msg.startsWith('M-SEARCH * HTTP/1.1\r\n')).toBe(true);
    expect(msg).toContain('HOST: 239.255.255.250:1900\r\n');
    expect(msg).toContain('MAN: "ssdp:discover"\r\n');
    expect(msg).toContain('ST: roku:ecp\r\n');
    expect(msg.endsWith('\r\n\r\n')).toBe(true);
  });

  it('parses a Roku reply', () => {
    const reply =
      'HTTP/1.1 200 OK\r\nCache-Control: max-age=3600\r\nST: roku:ecp\r\n' +
      'Location: http://192.168.1.50:8060/\r\nUSN: uuid:roku:ecp:X01900ABCDEF\r\n\r\n';
    expect(parseSsdpResponse(reply)).toEqual({
      ip: '192.168.1.50',
      location: 'http://192.168.1.50:8060/',
      usn: 'uuid:roku:ecp:X01900ABCDEF',
    });
  });

  it('ignores other devices', () => {
    expect(
      parseSsdpResponse(
        'HTTP/1.1 200 OK\r\nST: upnp:rootdevice\r\nLocation: http://192.168.1.9/\r\n',
      ),
    ).toBeNull();
  });
});

describe('subnet scan', () => {
  it('finds the Rokus that answer and skips everything else', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (url.startsWith('http://192.168.1.50:8060/')) return new Response(DEVICE_INFO);
      if (url.startsWith('http://192.168.1.1:8060/')) return new Response('<html>router</html>');
      throw new TypeError('Network request failed');
    });
    const onFound = jest.fn();
    const found = await scanSubnet('192.168.1', { fetch: fetchFn, onFound, concurrency: 16 });
    expect(fetchFn).toHaveBeenCalledTimes(254);
    expect(found.map((f) => f.ip)).toEqual(['192.168.1.50']);
    expect(found[0].info.name).toBe('Living Room TV');
    expect(onFound).toHaveBeenCalledTimes(1);
  });

  it('stops early when aborted', async () => {
    const signal = { aborted: false };
    const fetchFn = jest.fn(async () => {
      signal.aborted = true;
      throw new TypeError('Network request failed');
    });
    await scanSubnet('10.0.0', { fetch: fetchFn, signal, concurrency: 4 });
    expect(fetchFn.mock.calls.length).toBeLessThanOrEqual(4);
  });

  it('scans known device subnets first, then common home ranges, without duplicates', () => {
    const order = subnetsToScan(['192.168.50.7', '8.8.8.8', '192.168.1.3']);
    expect(order.slice(0, 3)).toEqual(['192.168.50', '192.168.1', '192.168.0']);
    expect(new Set(order).size).toBe(order.length);
    expect(order).not.toContain('8.8.8');
  });
});
