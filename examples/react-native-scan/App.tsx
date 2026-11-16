/**
 * Room scan in a React Native app: a WebView loads the Vedika room-scan page, the page posts
 * its progress and the finished capture to the app, and the app uploads it through your server.
 *
 * Copy this file into an Expo or bare React Native app and install
 *   npm install @vedika-io/react @vedika-io/sdk react-native-webview
 * Set SCAN_PAGE_URL to the room-scan page you host or the one Vedika gives you, and API_PROXY to
 * your server. The Vedika API key stays on that server: the SDK sends keys only to the official
 * API origin, so a shipped app talks to your proxy through the small client below
 * (README.md shows the server side). `createRoomScanController` takes any object with a
 * `vastuOperation` method, which is why this file does not need `VedikaProvider`.
 *
 * On a phone whose WebView has no WebXR the page reports `unsupported`. Feed a native scanner's
 * capture to `controller.acceptCapture(capture)` instead.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { createRoomScanController, type RoomScanApiClient } from '@vedika-io/react';

const SCAN_PAGE_URL = 'https://vedika.io/vastu-ar/host.html';
const API_PROXY = 'https://app.example.com/api/vedika';

/** Sends each room-scan call to your server, which adds the API key and forwards it to the Vedika API. */
const serverClient: RoomScanApiClient = {
  async vastuOperation(operation, params, options) {
    const response = await fetch(`${API_PROXY}/vastu/${operation}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Add your own session credential here: the proxy relays a billed call with your API key.
        // Replay-safe: a retry of one capture sends the same key, so it is not billed twice.
        ...(options?.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : {}),
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw Object.assign(new Error(`Room scan request failed (${response.status})`), { statusCode: response.status });
    }
    return response.json();
  },
};

export default function App() {
  const webView = useRef<{ injectJavaScript(script: string): void } | null>(null);
  const controller = useMemo(
    () =>
      createRoomScanController({
        client: serverClient,
        zoneResolution: 16,
        inject: (script) => webView.current?.injectJavaScript(script),
      }),
    []
  );
  const [snapshot, setSnapshot] = useState(controller.snapshot());
  useEffect(() => controller.subscribe(setSnapshot), [controller]);
  const { phase } = snapshot;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        ref={webView as never}
        source={{ uri: SCAN_PAGE_URL }}
        onMessage={(event) => void controller.handleMessage(event)}
        javaScriptEnabled
        allowsInlineMediaPlayback
        style={{ flex: 1 }}
      />
      <View style={{ padding: 16 }}>
        <Text testID="scan-phase">Scan: {phase}</Text>
        {snapshot.error ? <Text>{snapshot.error}</Text> : null}
        {phase === 'captured' ? (
          <Button title="Upload scan" onPress={() => void controller.upload().catch(() => undefined)} />
        ) : null}
        {phase === 'scanning' ? <Button title="Cancel" onPress={() => controller.cancel()} /> : null}
        {phase === 'uploaded' || phase === 'cancelled' || phase === 'unsupported' || phase === 'failed' ? (
          <Button title="Scan again" onPress={() => controller.reset()} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
