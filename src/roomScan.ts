/**
 * Room scan bridge for React and React Native.
 *
 * The scan itself runs in a page (`mountRoomCapture`) inside a WebView. That
 * page posts `vedika.roomScanBridge/1` messages; this controller reads them,
 * tracks the scan, uploads the finished capture and answers merge requests.
 * It imports nothing from React or React Native, so it runs the same in a
 * WebView `onMessage`, a test, or a plain browser iframe listener.
 *
 * Honest by construction: a capture only exists if the page sent one. With no
 * WebView (or a platform that cannot scan) call `markUnsupported()`; nothing is
 * ever invented.
 */

export const ROOM_SCAN_BRIDGE_SCHEMA = 'vedika.roomScanBridge/1';
export const ROOM_CAPTURE_SCHEMA = 'vedika.roomCapture/1';

export type RoomScanPageState =
  | 'unsupported' | 'idle' | 'requesting' | 'active' | 'ended' | 'failed' | 'captured' | 'plan';

const PAGE_STATES: readonly string[] = ['unsupported', 'idle', 'requesting', 'active', 'ended', 'failed', 'captured', 'plan'];
const ID_RE = /^[\x21-\x7e]{1,128}$/;
const KEY_RE = /^[\x21-\x7e]{1,256}$/;

/** The fields of a `vedika.roomCapture/1` this bridge reads; the rest is passed through untouched. */
export interface RoomScanCapture {
  schema: typeof ROOM_CAPTURE_SCHEMA;
  captureId: string;
  quality: { roomsTagged: number; [key: string]: unknown };
  rooms: unknown[];
  [key: string]: unknown;
}

export type RoomScanMessage =
  | { kind: 'ready' }
  | { kind: 'state'; state: RoomScanPageState }
  | { kind: 'capture'; capture: RoomScanCapture }
  | { kind: 'error'; message: string }
  | { kind: 'merge-request'; requestId: string; idempotencyKey: string; body: Record<string, unknown> }
  | { kind: 'invalid'; reason: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Classifies one message from the page. Never throws; anything unexpected is `invalid`. */
export function parseRoomScanMessage(raw: unknown): RoomScanMessage {
  let msg: unknown = raw;
  if (typeof raw === 'string') {
    try { msg = JSON.parse(raw); } catch { return { kind: 'invalid', reason: 'not JSON' }; }
  }
  if (!isObject(msg) || msg.schema !== ROOM_SCAN_BRIDGE_SCHEMA) return { kind: 'invalid', reason: 'wrong schema' };
  switch (msg.type) {
    case 'ready':
      return { kind: 'ready' };
    case 'state':
      return typeof msg.state === 'string' && PAGE_STATES.includes(msg.state)
        ? { kind: 'state', state: msg.state as RoomScanPageState }
        : { kind: 'invalid', reason: 'unknown state' };
    case 'capture': {
      const c = msg.capture;
      return isObject(c) && c.schema === ROOM_CAPTURE_SCHEMA && typeof c.captureId === 'string' && isObject(c.quality)
        && typeof c.quality.roomsTagged === 'number' && Array.isArray(c.rooms)
        ? { kind: 'capture', capture: c as RoomScanCapture }
        : { kind: 'invalid', reason: 'capture is not a vedika.roomCapture/1' };
    }
    case 'error':
      return { kind: 'error', message: typeof msg.message === 'string' ? msg.message : 'room scan failed' };
    case 'merge-request':
      return typeof msg.requestId === 'string' && ID_RE.test(msg.requestId)
        && typeof msg.idempotencyKey === 'string' && KEY_RE.test(msg.idempotencyKey) && isObject(msg.body)
        ? { kind: 'merge-request', requestId: msg.requestId, idempotencyKey: msg.idempotencyKey, body: msg.body }
        : { kind: 'invalid', reason: 'merge-request needs requestId, idempotencyKey and body' };
    default:
      return { kind: 'invalid', reason: 'unknown type' };
  }
}

export type RoomScanPhase = 'idle' | 'scanning' | 'captured' | 'uploading' | 'uploaded' | 'cancelled' | 'unsupported' | 'failed';

export interface RoomScanSnapshot {
  phase: RoomScanPhase;
  capture?: RoomScanCapture;
  /** Server answer to `ar/room-capture`, once uploaded. */
  result?: unknown;
  /** Idempotency key the upload used; kept so a retry of the same capture reuses it. */
  uploadKey?: string;
  error?: string;
}

/**
 * The one client method used. A `VedikaClient` from @vedika-io/sdk has it
 * (`useRoomScan` passes one in). Typed loosely because the published 3.1.0
 * contract map lists `ar/room-capture` but not `ar/capture-merge`, though its
 * runtime posts any `/v2/astrology/vastu/<operation>` path.
 */
export interface RoomScanApiClient {
  vastuOperation(
    operation: string,
    params: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options?: { idempotencyKey?: string }
  ): Promise<unknown>;
}

export interface RoomScanControllerOptions {
  client: RoomScanApiClient;
  /** Runs JavaScript in the WebView (`webViewRef.current.injectJavaScript`). Needed to answer merges. */
  inject?: (script: string) => void;
  /** Fresh idempotency key per capture; default is a random UUID. */
  newIdempotencyKey?: () => string;
  zoneResolution?: 8 | 16 | 32;
}

function defaultKey(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** JSON literal that is safe inside injected JavaScript. */
function literal(value: unknown): string {
  return JSON.stringify(value).split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');
}

export function resolveMergeScript(requestId: string, result: unknown): string {
  return `window.__vedikaRoomCaptureHost&&window.__vedikaRoomCaptureHost.resolveMerge(${literal(requestId)},${literal(result)});true;`;
}

export function rejectMergeScript(requestId: string, failure: { status?: number; message: string }): string {
  return `window.__vedikaRoomCaptureHost&&window.__vedikaRoomCaptureHost.rejectMerge(${literal(requestId)},${literal(failure)});true;`;
}

export interface RoomScanController {
  snapshot(): RoomScanSnapshot;
  subscribe(listener: (snapshot: RoomScanSnapshot) => void): () => void;
  /** Feed a WebView `onMessage` event (`{nativeEvent:{data}}`) or the raw string. */
  handleMessage(event: unknown): Promise<void>;
  /** The user closed the scan before a capture existed. No-op once a capture is held. */
  cancel(): void;
  /** No WebView or no scanning on this platform. */
  markUnsupported(reason?: string): void;
  /**
   * Hands in a capture a native scanner (RoomPlan, ARCore) produced instead of the
   * WebView page. It must be a `vedika.roomCapture/1`; anything else throws and stores nothing.
   */
  acceptCapture(capture: unknown): void;
  /** Uploads the held capture to `ar/room-capture`. Retrying reuses the same idempotency key. */
  upload(): Promise<unknown>;
  /** Back to idle for a new scan; drops the capture and its key. */
  reset(): void;
}

export function createRoomScanController(options: RoomScanControllerOptions): RoomScanController {
  const mkKey = options.newIdempotencyKey || defaultKey;
  let state: RoomScanSnapshot = { phase: 'idle' };
  const listeners = new Set<(s: RoomScanSnapshot) => void>();
  const mergeFlights = new Map<string, Promise<void>>();

  function set(next: RoomScanSnapshot) {
    state = next;
    listeners.forEach((l) => l(state));
  }

  async function merge(requestId: string, idempotencyKey: string, body: Record<string, unknown>) {
    if (!options.inject) return;
    try {
      const result = await options.client.vastuOperation('ar/capture-merge', body, { idempotencyKey });
      options.inject(resolveMergeScript(requestId, result));
    } catch (e) {
      const err = e as { statusCode?: number; status?: number; message?: string };
      const status = Number.isInteger(err.statusCode) ? err.statusCode : Number.isInteger(err.status) ? err.status : undefined;
      options.inject(rejectMergeScript(requestId, { ...(status === undefined ? {} : { status }), message: err.message || 'merge failed' }));
    }
  }

  return {
    snapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    async handleMessage(event) {
      const data = isObject(event) && isObject(event.nativeEvent) ? event.nativeEvent.data : event;
      const msg = parseRoomScanMessage(data);
      switch (msg.kind) {
        case 'state': {
          if (state.capture) return; // a held capture is never taken back by a later state
          if (msg.state === 'unsupported') set({ phase: 'unsupported' });
          else if (msg.state === 'requesting' || msg.state === 'active') set({ phase: 'scanning' });
          else if (msg.state === 'ended') set({ phase: 'cancelled' });
          else if (msg.state === 'failed') set({ phase: 'failed', error: 'The scan could not continue.' });
          else if (msg.state === 'idle') set({ phase: 'idle' });
          return;
        }
        case 'capture':
          set({ phase: 'captured', capture: msg.capture });
          return;
        case 'error':
          set({ ...state, phase: state.capture ? state.phase : 'failed', error: msg.message });
          return;
        case 'merge-request': {
          // Same request id twice (a page retry) joins the call already in flight.
          const flying = mergeFlights.get(msg.requestId);
          if (flying) return flying;
          const run = merge(msg.requestId, msg.idempotencyKey, msg.body).finally(() => mergeFlights.delete(msg.requestId));
          mergeFlights.set(msg.requestId, run);
          return run;
        }
        default:
          return;
      }
    },
    cancel() {
      if (!state.capture && state.phase !== 'unsupported') set({ phase: 'cancelled' });
    },
    markUnsupported(reason) {
      set({ phase: 'unsupported', ...(reason ? { error: reason } : {}) });
    },
    acceptCapture(capture) {
      const msg = parseRoomScanMessage({ schema: ROOM_SCAN_BRIDGE_SCHEMA, type: 'capture', capture });
      if (msg.kind !== 'capture') throw new Error('Not a vedika.roomCapture/1 capture; nothing was stored.');
      set({ phase: 'captured', capture: msg.capture });
    },
    async upload() {
      const capture = state.capture;
      if (!capture) throw new Error('No room scan to upload: finish a scan first.');
      if (!(capture.quality.roomsTagged > 0)) {
        throw new Error('Tag at least one room before uploading: the API refuses a capture with no labelled room.');
      }
      if (state.phase === 'uploading') throw new Error('Upload already in progress.');
      const uploadKey = state.uploadKey || mkKey();
      set({ phase: 'uploading', capture, uploadKey });
      try {
        const params: Record<string, unknown> = { capture };
        if (options.zoneResolution !== undefined) params.zoneResolution = options.zoneResolution;
        const result = await options.client.vastuOperation('ar/room-capture', params, { idempotencyKey: uploadKey });
        set({ phase: 'uploaded', capture, uploadKey, result });
        return result;
      } catch (e) {
        // Keep the capture and the key: the next upload() is the same logical call.
        set({ phase: 'captured', capture, uploadKey, error: (e as Error).message || 'upload failed' });
        throw e;
      }
    },
    reset() {
      set({ phase: 'idle' });
    },
  };
}
