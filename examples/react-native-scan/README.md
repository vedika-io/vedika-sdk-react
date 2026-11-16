# React Native room scan sample

`App.tsx` is a complete screen: a WebView loads the Vedika room-scan page, `createRoomScanController` reads the
page's messages, and a button uploads the finished capture through your server to
`POST /v2/astrology/vastu/ar/room-capture`.

## Run it

1. `npx create-expo-app scan-sample --template blank-typescript`, then in that folder
   `npm install @vedika-io/react @vedika-io/sdk react-native-webview`.
2. Replace `App.tsx` with this file and set `API_PROXY` to your server.
3. Add the proxy route (below). The API key stays on your server.
4. `npx expo run:android` or `npx expo run:ios` (a device or an emulator with a camera).

The proxy route, in any server framework, takes `POST <API_PROXY>/vastu/ar/room-capture` and
`POST <API_PROXY>/vastu/ar/capture-merge` (a wildcard `vastu/*`, because the operation contains a slash).
It checks your own user session (add the credential in `serverClient`'s headers), refuses every other
operation, and forwards the JSON body and the `Idempotency-Key` header to
`POST https://api.vedika.io/v2/astrology/vastu/<operation>` with `Authorization: Bearer <your key>`.
It relays a billed call with your key, so it must not be open to anyone.

For a quick try with a test key and no server, wrap the screen in `<VedikaProvider apiKey="vk_test_...">` and
use `useRoomScan()` (it uploads through the provider's client). The SDK only sends keys to
`https://api.vedika.io`, so that setup is for development: a shipped app keeps the key off the device.

## What the screen shows

The phase line (`snapshot.phase`) moves `idle` -> `scanning` -> `captured` -> `uploading` -> `uploaded`. A scan the user
closes before a capture exists is `cancelled`, and a scan that cannot continue is `failed` (offer "Scan again"). A phone whose WebView has no WebXR is `unsupported`: that
is the honest answer, not a failure. Android WebView generally has no `immersive-ar`, so on many phones
this sample ends at `unsupported`; use a native scanner (iOS RoomPlan, Android ARCore) and hand its
capture to `createRoomScanController({ client, inject }).acceptCapture(capture)`, then `upload()`.

Every `upload()` retry of one capture reuses one idempotency key, so a retry does not charge twice.

## Device receipt

An upload is billed. Fill this in after a device run and keep it with the pilot-test records:

| Field | Value |
|---|---|
| Date and tester | |
| Device and OS | |
| Scan page URL | |
| Phase reached (`uploaded`, `unsupported`, `cancelled`, `failed`) | |
| Rooms tagged | |
| Idempotency-Key the proxy forwarded | |
| Screenshot of the phase line | |

The checks in `sdks/react/tests/rn-sample.test.mjs` keep this file in step with the package exports.
It does not replace a run on a phone.
