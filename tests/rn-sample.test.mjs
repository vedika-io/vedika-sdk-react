// The React Native sample must only use what the built package exports, keep the API key off
// the device, and carry the device receipt a pilot run is recorded in. Run after `npm run build`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const built = require('../dist/index.js');
const dts = readFileSync(new URL('../dist/index.d.ts', import.meta.url), 'utf8');
const app = readFileSync(new URL('../examples/react-native-scan/App.tsx', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../examples/react-native-scan/README.md', import.meta.url), 'utf8');

function namedImports(source, from) {
  const found = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*'${from}'`).exec(source);
  assert.ok(found, `no import from ${from}`);
  return found[1].split(',').map((s) => s.trim()).filter(Boolean);
}

test('every name the sample imports from @vedika-io/react is exported', () => {
  for (const item of namedImports(app, '@vedika-io/react')) {
    if (item.startsWith('type ')) assert.match(dts, new RegExp(`\\b${item.slice(5)}\\b`), item);
    else assert.ok(item in built, item);
  }
});

test('the sample drives the scan through the controller and the WebView', () => {
  for (const needle of ['createRoomScanController', 'controller.handleMessage', 'injectJavaScript', 'controller.upload', 'controller.subscribe', 'idempotencyKey']) {
    assert.ok(app.includes(needle), needle);
  }
  for (const phase of ['captured', 'scanning', 'uploaded', 'unsupported', 'cancelled']) {
    assert.ok(app.includes(`'${phase}'`), phase);
  }
});

test('the sample ships no API key and sends nothing to a Vedika host from the device', () => {
  assert.doesNotMatch(app, /vk_(live|test|ent)_/);
  assert.doesNotMatch(app, /apiKey/);
  assert.doesNotMatch(app, /api\.vedika\.io/);
});

test('the README names the proxy route and keeps the device receipt table', () => {
  assert.match(readme, /<API_PROXY>\/vastu\/ar\/room-capture/);
  assert.match(readme, /<API_PROXY>\/vastu\/ar\/capture-merge/);
  assert.match(readme, /refuses every other\s+operation/);
  assert.match(readme, /Idempotency-Key/);
  for (const field of ['Device and OS', 'Phase reached', 'Rooms tagged', 'Screenshot of the phase line']) {
    assert.ok(readme.includes(field), field);
  }
});

test('the controller from the built package runs the sample flow against a stub client', async () => {
  const calls = [];
  const client = { async vastuOperation(operation, params, options) { calls.push({ operation, options }); return { ok: true }; } };
  const controller = built.createRoomScanController({ client, zoneResolution: 16, newIdempotencyKey: () => 'k-1' });
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/reference/room-scan-messages.json', import.meta.url), 'utf8'));
  await controller.handleMessage(JSON.stringify({ schema: built.ROOM_SCAN_BRIDGE_SCHEMA, type: 'capture', capture: fixture.validCapture }));
  assert.equal(controller.snapshot().phase, 'captured');
  await controller.upload();
  assert.equal(controller.snapshot().phase, 'uploaded');
  assert.deepEqual(calls.map((c) => [c.operation, c.options.idempotencyKey]), [['ar/room-capture', 'k-1']]);
});
