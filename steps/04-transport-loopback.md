# Step 04 — `Transport` interface + `LoopbackTransport` (same-device) + Host/Join seam

**Phase:** Core (the seam) · **Status:** todo · **Depends on:** 03

## Goal
The transport abstraction that makes the same-device fallback bulletproof and live P2P a clean
upgrade. **Build the fallback transport FIRST.**

## Do
- `src/transport/Transport.js` — the interface: `send(msg)`, `onMessage(cb)`, `onPeerChange(cb)`.
- `src/transport/LoopbackTransport.js` — same-device, in-memory, synchronous: host + virtual
  joiners on one device (hot-seat / pass-the-phone), implementing the full interface.
- `src/rooms/HostRoom.js` — authoritative state + relay + roster, talking **only** to `Transport`.
- `src/rooms/JoinRoom.js` — send inputs, render broadcast state.
- Message envelope `{ t, ...payload }` per ARCHITECTURE §6 (lobby: `join`/`roster`/`start`/`end`).

## Files
- `src/transport/Transport.js`, `src/transport/LoopbackTransport.js`, `src/rooms/HostRoom.js`,
  `src/rooms/JoinRoom.js`

## Done-when
- [ ] A throwaway harness drives two virtual players over `LoopbackTransport`: join → roster
      updates → start → end, all host-authoritative, with no networking.

## Verify
- Unit-style harness in the browser console / a temp screen. Commit `step 04: transport + loopback`.
