// node --test tests/room-scan.test.mjs   (Node 22.6+ strips the types; no build step)
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import {
  ROOM_SCAN_BRIDGE_SCHEMA, createRoomScanController, parseRoomScanMessage, resolveMergeScript, rejectMergeScript,
} from '../src/roomScan.ts';

const fx = JSON.parse(readFileSync(new URL('./fixtures/reference/room-scan-messages.json', import.meta.url), 'utf8'));
const msg = (o) => JSON.stringify({ schema: ROOM_SCAN_BRIDGE_SCHEMA, ...o });
const event = (o) => ({ nativeEvent: { data: msg(o) } });

function fakeClient(impl) {
  const calls = [];
  return { calls, vastuOperation: async (operation, params, options) => { calls.push({ operation, params, options }); return impl ? impl(calls.length, operation) : { ok: calls.length }; } };
}

test('fixture schema is the bridge schema', () => assert.equal(fx.schema, ROOM_SCAN_BRIDGE_SCHEMA));

for (const c of fx.parseCases) {
  test(`parse: ${c.name}`, () => {
    const got = parseRoomScanMessage(c.raw);
    assert.equal(got.kind, c.expect.kind);
    for (const [k, v] of Object.entries(c.expect)) {
      if (k === 'captureId') assert.equal(got.capture.captureId, v);
      else assert.equal(got[k], v);
    }
  });
}

test('parse never throws on junk', () => {
  for (const junk of [undefined, null, 5, [], {}, '', '{', { schema: ROOM_SCAN_BRIDGE_SCHEMA }]) assert.equal(parseRoomScanMessage(junk).kind, 'invalid');
});

test('scan then upload: typed result, one idempotency key kept across a failed retry', async () => {
  const client = fakeClient((n) => { if (n === 1) throw Object.assign(new Error('network down'), { statusCode: 503 }); return { success: true, data: { zones: 8 } }; });
  let n = 0;
  const ctl = createRoomScanController({ client, zoneResolution: 16, newIdempotencyKey: () => `key-${++n}-padding` });
  const seen = [];
  ctl.subscribe((s) => seen.push(s.phase));
  await ctl.handleMessage(event({ type: 'ready' }));
  await ctl.handleMessage(event({ type: 'state', state: 'active' }));
  assert.equal(ctl.snapshot().phase, 'scanning');
  await ctl.handleMessage(event({ type: 'capture', capture: fx.validCapture }));
  assert.equal(ctl.snapshot().phase, 'captured');
  await ctl.handleMessage(event({ type: 'state', state: 'ended' }));
  assert.equal(ctl.snapshot().phase, 'captured', 'a later ended state does not discard a held capture');

  await assert.rejects(ctl.upload(), /network down/);
  assert.equal(ctl.snapshot().phase, 'captured');
  assert.equal(ctl.snapshot().capture.captureId, fx.validCapture.captureId);
  const result = await ctl.upload();
  assert.deepEqual(result, { success: true, data: { zones: 8 } });
  assert.equal(ctl.snapshot().phase, 'uploaded');
  assert.equal(n, 1, 'one key minted for the capture');
  assert.deepEqual(client.calls.map((c) => c.options.idempotencyKey), ['key-1-padding', 'key-1-padding']);
  assert.deepEqual(client.calls.map((c) => c.operation), ['ar/room-capture', 'ar/room-capture']);
  assert.deepEqual(client.calls[1].params, { capture: fx.validCapture, zoneResolution: 16 });
  assert.deepEqual(seen.filter((p) => p === 'uploading'), ['uploading', 'uploading']);
});

test('a new scan after reset gets a new key', async () => {
  let n = 0;
  const client = fakeClient();
  const ctl = createRoomScanController({ client, newIdempotencyKey: () => `key-${++n}-padding` });
  await ctl.handleMessage(event({ type: 'capture', capture: fx.validCapture }));
  await ctl.upload();
  ctl.reset();
  await ctl.handleMessage(event({ type: 'capture', capture: fx.magneticCapture }));
  await ctl.upload();
  assert.deepEqual(client.calls.map((c) => c.options.idempotencyKey), ['key-1-padding', 'key-2-padding']);
});

test('untagged capture is held but never uploaded', async () => {
  const client = fakeClient();
  const ctl = createRoomScanController({ client });
  await ctl.handleMessage(event({ type: 'capture', capture: fx.untaggedCapture }));
  assert.equal(ctl.snapshot().phase, 'captured');
  await assert.rejects(ctl.upload(), /Tag at least one room/);
  assert.equal(client.calls.length, 0);
});

test('upload with nothing scanned is refused', async () => {
  const ctl = createRoomScanController({ client: fakeClient() });
  await assert.rejects(ctl.upload(), /finish a scan first/);
});

test('cancellation: ended before any capture is cancelled, and cancel() is a no-op after one', async () => {
  const ctl = createRoomScanController({ client: fakeClient() });
  await ctl.handleMessage(event({ type: 'state', state: 'active' }));
  await ctl.handleMessage(event({ type: 'state', state: 'ended' }));
  assert.equal(ctl.snapshot().phase, 'cancelled');
  assert.equal(ctl.snapshot().capture, undefined);
  ctl.reset();
  ctl.cancel();
  assert.equal(ctl.snapshot().phase, 'cancelled');
  ctl.reset();
  await ctl.handleMessage(event({ type: 'capture', capture: fx.validCapture }));
  ctl.cancel();
  assert.equal(ctl.snapshot().phase, 'captured');
});

test('unsupported: page-reported and app-declared', async () => {
  const a = createRoomScanController({ client: fakeClient() });
  await a.handleMessage(event({ type: 'state', state: 'unsupported' }));
  assert.equal(a.snapshot().phase, 'unsupported');
  a.cancel();
  assert.equal(a.snapshot().phase, 'unsupported', 'cancel does not hide unsupported');
  const b = createRoomScanController({ client: fakeClient() });
  b.markUnsupported('no WebView on this platform');
  assert.deepEqual(b.snapshot(), { phase: 'unsupported', error: 'no WebView on this platform' });
});

test('page errors and failed state surface without inventing a capture', async () => {
  const ctl = createRoomScanController({ client: fakeClient() });
  await ctl.handleMessage(event({ type: 'error', message: 'AR session refused' }));
  assert.equal(ctl.snapshot().phase, 'failed');
  assert.equal(ctl.snapshot().error, 'AR session refused');
  assert.equal(ctl.snapshot().capture, undefined);
});

test('invalid and foreign messages change nothing', async () => {
  const ctl = createRoomScanController({ client: fakeClient() });
  await ctl.handleMessage({ nativeEvent: { data: 'hello' } });
  await ctl.handleMessage(msg({ type: 'capture', capture: { schema: 'other' } }));
  assert.deepEqual(ctl.snapshot(), { phase: 'idle' });
});

test('merge request keeps the page key and answers the page', async () => {
  const injected = [];
  const client = fakeClient(() => ({ success: true, data: { floors: 1 } }));
  const ctl = createRoomScanController({ client, inject: (s) => injected.push(s) });
  const raw = fx.parseCases.find((c) => c.name === 'merge request').raw;
  await ctl.handleMessage({ nativeEvent: { data: raw } });
  assert.equal(client.calls[0].operation, 'ar/capture-merge');
  assert.equal(client.calls[0].options.idempotencyKey, 'idem-0001');
  assert.deepEqual(client.calls[0].params, fx.mergeBody);
  assert.equal(injected.length, 1);
  assert.equal(injected[0], resolveMergeScript('m-1', { success: true, data: { floors: 1 } }));
});

test('a merge retried with the same request id while in flight is one call', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const client = { calls: [], async vastuOperation(...a) { this.calls.push(a); await gate; return { ok: true }; } };
  const injected = [];
  const ctl = createRoomScanController({ client, inject: (s) => injected.push(s) });
  const raw = fx.parseCases.find((c) => c.name === 'merge request').raw;
  const first = ctl.handleMessage(raw);
  const second = ctl.handleMessage(raw);
  release();
  await Promise.all([first, second]);
  assert.equal(client.calls.length, 1);
  assert.equal(injected.length, 1);
});

test('merge failure is passed back with status and message', async () => {
  const injected = [];
  const client = fakeClient(() => { throw Object.assign(new Error('insufficient balance'), { statusCode: 402 }); });
  const ctl = createRoomScanController({ client, inject: (s) => injected.push(s) });
  await ctl.handleMessage(fx.parseCases.find((c) => c.name === 'merge request').raw);
  assert.equal(injected[0], rejectMergeScript('m-1', { status: 402, message: 'insufficient balance' }));
});

test('merge without an inject hook does not call the API', async () => {
  const client = fakeClient();
  const ctl = createRoomScanController({ client });
  await ctl.handleMessage(fx.parseCases.find((c) => c.name === 'merge request').raw);
  assert.equal(client.calls.length, 0);
});

test('injected script literals survive line separators and quotes', () => {
  const s = resolveMergeScript('m"1', { t: 'a\u2028b\u2029c' });
  assert.ok(!s.includes('\u2028') && !s.includes('\u2029'));
  assert.ok(s.endsWith(';true;'));
});

test('against the published @vedika-io/sdk client: right path, key header', async () => {
  const require = createRequire(import.meta.url);
  const { VedikaClient } = require('@vedika-io/sdk');
  const client = new VedikaClient({ apiKey: 'vk_test_x' });
  const seen = [];
  client.client.defaults.adapter = async (config) => {
    seen.push({ url: config.url, headers: { ...config.headers }, body: JSON.parse(config.data) });
    return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
  };
  const injected = [];
  const ctl = createRoomScanController({ client, inject: (s) => injected.push(s), newIdempotencyKey: () => 'published-key-0001' });
  await ctl.handleMessage(event({ type: 'capture', capture: fx.validCapture }));
  await ctl.upload();
  await ctl.handleMessage(fx.parseCases.find((c) => c.name === 'merge request').raw);
  assert.deepEqual(seen.map((s) => s.url), ['/v2/astrology/vastu/ar/room-capture', '/v2/astrology/vastu/ar/capture-merge']);
  const key = (h) => Object.entries(h).find(([k]) => k.toLowerCase() === 'idempotency-key')?.[1];
  assert.deepEqual(seen.map((s) => key(s.headers)), ['published-key-0001', 'idem-0001']);
  assert.equal(injected.length, 1);
});

test('a native scanner can hand in a capture; junk is refused and stores nothing', async () => {
  const client = fakeClient();
  const ctl = createRoomScanController({ client, newIdempotencyKey: () => 'native-key-0001' });
  assert.throws(() => ctl.acceptCapture({ schema: 'other' }), /nothing was stored/);
  assert.equal(ctl.snapshot().phase, 'idle');
  ctl.acceptCapture(fx.validCapture);
  assert.equal(ctl.snapshot().phase, 'captured');
  await ctl.upload();
  assert.equal(client.calls[0].options.idempotencyKey, 'native-key-0001');
  assert.deepEqual(client.calls[0].params, { capture: fx.validCapture });
});
