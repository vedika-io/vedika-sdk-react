# Changelog

All notable changes to `@vedika-io/react` are recorded here.

## 1.0.2 - 2026-10-14

### Added
- Room scan, exported from the package root: the `useRoomScan` hook, which drives a WebView scan page and uploads the finished capture, and `createRoomScanController`, `parseRoomScanMessage`, `resolveMergeScript`, `rejectMergeScript` and `ROOM_SCAN_BRIDGE_SCHEMA` for apps that wire the bridge themselves. The types `UseRoomScan`, `UseRoomScanOptions`, `RoomScanController`, `RoomScanControllerOptions`, `RoomScanSnapshot`, `RoomScanPhase`, `RoomScanMessage`, `RoomScanCapture` and `RoomScanApiClient` are exported too. The code was already in the repository but was not exported, so 1.0.1 did not ship it.
- A `test` script that builds the package and runs the tests in `tests/`.

### Changed
- README: documents the room scan, and the note about error fields now names `@vedika-io/sdk` 3.1.2, the release that carries them (3.1.1 was never published).

## 1.0.1

Earlier release; no changelog was kept.
