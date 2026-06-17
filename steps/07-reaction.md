# Step 07 — Reaction Race (same-device, demo-safe) — arm → go → ranked tap

**Phase:** Core games · **Status:** done · **Depends on:** 05

## Goal
The **demo-safe** game: zero content to type, connects and plays in seconds. The guaranteed "it
works" beat if anything else stalls.

## Do
- `src/games/reaction/` — host arms a round → after a **random delay** shows big **"עכשיו!"** →
  first peer to tap wins; host timestamps arrivals (authoritative) to rank.
- **Early-tap detection/penalty** (tapped before "עכשיו!" → "פסילה" / wait next round).
- Best-of-N for a match; reaction times shown in ms; ranked result `{t:"result", order:[…]}`.

## Files
- `src/games/reaction/Reaction.jsx`, `src/games/reaction/hostLogic.js`

## Done-when
- [ ] Same-device: arm → random "עכשיו!" → tap ranks by ms; early tap is penalized; best-of-N picks
      a winner. Latency feels immediate.

## Verify
- **Emulated phone + laptop;** check the random delay and early-tap path. Commit `step 07: reaction`.
