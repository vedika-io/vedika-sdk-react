import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVedikaClient } from './provider';
import {
  createRoomScanController,
  type RoomScanApiClient,
  type RoomScanController,
  type RoomScanSnapshot,
} from './roomScan';

export interface UseRoomScanOptions {
  zoneResolution?: 8 | 16 | 32;
  /** Fresh idempotency key per capture (default: random UUID). */
  newIdempotencyKey?: () => string;
}

export interface UseRoomScan {
  snapshot: RoomScanSnapshot;
  /** Pass to `<WebView onMessage={...}>`. */
  onMessage: (event: unknown) => void;
  /** Pass to `<WebView ref={...}>`; it needs an `injectJavaScript(script)` method. */
  webViewRef: { current: { injectJavaScript(script: string): void } | null };
  upload: RoomScanController['upload'];
  cancel: RoomScanController['cancel'];
  reset: RoomScanController['reset'];
  markUnsupported: RoomScanController['markUnsupported'];
}

/**
 * Drives one room scan from a WebView that loads the Vedika room-scan page.
 * Must be used inside <VedikaProvider>.
 *
 * @example
 * ```tsx
 * const scan = useRoomScan();
 * <WebView ref={scan.webViewRef} source={{ uri: scanPageUrl }} onMessage={scan.onMessage} />
 * // scan.snapshot.phase: idle | scanning | captured | uploading | uploaded | cancelled | unsupported | failed
 * ```
 */
export function useRoomScan(options: UseRoomScanOptions = {}): UseRoomScan {
  const client = useVedikaClient();
  const webViewRef = useRef<{ injectJavaScript(script: string): void } | null>(null);
  const { zoneResolution, newIdempotencyKey } = options;
  const controller = useMemo(
    () => createRoomScanController({
      client: client as unknown as RoomScanApiClient,
      zoneResolution,
      newIdempotencyKey,
      inject: (script) => webViewRef.current?.injectJavaScript(script),
    }),
    [client, zoneResolution, newIdempotencyKey]
  );
  const [snapshot, setSnapshot] = useState<RoomScanSnapshot>(controller.snapshot());
  useEffect(() => {
    setSnapshot(controller.snapshot());
    return controller.subscribe(setSnapshot);
  }, [controller]);
  const onMessage = useCallback((event: unknown) => { void controller.handleMessage(event); }, [controller]);
  return {
    snapshot,
    onMessage,
    webViewRef,
    upload: controller.upload,
    cancel: controller.cancel,
    reset: controller.reset,
    markUnsupported: controller.markUnsupported,
  };
}
