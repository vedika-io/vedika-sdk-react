// Checks the built package, not the source: `npm test` builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const built = require('../dist/index.js');

test('room scan API is exported from the package root', () => {
  for (const name of ['useRoomScan', 'createRoomScanController', 'parseRoomScanMessage', 'resolveMergeScript', 'rejectMergeScript']) {
    assert.equal(typeof built[name], 'function', name);
  }
  assert.equal(built.ROOM_SCAN_BRIDGE_SCHEMA, 'vedika.roomScanBridge/1');
});

test('the room scan controller from the built package parses a bridge message', () => {
  const message = built.parseRoomScanMessage(JSON.stringify({ schema: built.ROOM_SCAN_BRIDGE_SCHEMA, type: 'ready' }));
  assert.equal(message.kind, 'ready');
});

test('VERSION matches package.json', () => {
  assert.equal(built.VERSION, pkg.version);
});

test('room scan types are declared in the built typings', () => {
  const dts = readFileSync(new URL('../dist/index.d.ts', import.meta.url), 'utf8');
  for (const name of ['useRoomScan', 'createRoomScanController', 'RoomScanSnapshot', 'RoomScanPhase', 'RoomScanController', 'UseRoomScan']) {
    assert.match(dts, new RegExp(`\\b${name}\\b`), name);
  }
});
