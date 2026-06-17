# Step 06 — Bingo (same-device, signature) — card + mark + verified "בינגו!"

**Phase:** Core games · **Status:** done · **Depends on:** 05

## Goal
The **signature** game, fully playable same-device. This is the identity of the app — make it feel
great. (Live-sync version is automatic once Step 08 lands; build it against `Transport` now.)

## Do
- `src/games/bingo/` — board component (5×5, **free center**), tap-to-mark, win modes
  (row/col/diag/full), claim → **host verifies** the line.
- `src/lib/seededShuffle.js` — deterministic per-player card from the host's word list (so the host
  re-derives the card to verify a claim; no trust in the client).
- The **"בינגו!"** win moment: contained burst + the winner's name broadcast to all
  (`{t:"win", winner, line}`). Glanceable marks; user words render `dir="auto"` (mixed He/En).
- Needs ≥24 words for a full 5×5; wire a temporary word list (real packs in Step 10).

## Files
- `src/games/bingo/Bingo.jsx`, `src/games/bingo/hostLogic.js`, `src/lib/seededShuffle.js`

## Done-when
- [ ] Same-device: mark cells, complete a line, get a **verified "בינגו!"** win with the name; a
      false claim is rejected by the host. Feels snappy on touch.

## Verify
- **Emulated phone (touch) AND laptop (click).** Tune mark/win feel. Commit `step 06: bingo`.
