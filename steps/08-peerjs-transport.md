# Step 08 — `PeerJSTransport` + `roomCode` (6-char) + ConnectionStatus state machine

**Phase:** Networking (critical path) · **Status:** todo · **Depends on:** 04

## Goal
The Kahoot-style live transport over the **PeerJS public broker** — the highest-risk block. Same
`Transport` interface as Loopback, so games are untouched.

## Do
- `src/transport/roomCode.js` — **6-char code** generation (unambiguous charset), namespacing to a
  PeerJS id (`utd-<CODE>`), **regenerate-on-collision** if the broker reports the id is taken;
  link/QR encode-decode (`?room=CODE`).
- `src/transport/PeerJSTransport.js` — host opens `utd-<CODE>`; joiners `peer.connect('utd-<CODE>')`;
  **star** relay (host re-broadcasts authoritative state). PeerJS bundled locally (no CDN).
- `src/components/ConnectionStatus.jsx` — the state machine (ARCHITECTURE §5):
  `פותח חדר… → מחכים לשחקנים → מתחבר… → מחובר → (החבר התנתק | נכשל)`. On `FAILED` it sets up the
  Step-16 same-device prompt.

## Files
- `src/transport/roomCode.js`, `src/transport/PeerJSTransport.js`,
  `src/components/ConnectionStatus.jsx`

## Done-when
- [ ] Two browser contexts: host opens a room (gets a 6-char code) → second connects by code → a
      **direct data channel** opens → roster + a synced round play over PeerJS. Collision regenerates.

## Verify
- Browser MCP, **two pages/profiles**; watch the data channel open + state labels. Commit
  `step 08: peerjs transport`.
