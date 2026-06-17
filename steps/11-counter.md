# Step 11 — Counter (shared tally + milestones)

**Phase:** Other games · **Status:** todo · **Depends on:** 05, 10

## Goal
Event Counter — a shared, live-syncing tap counter. Cheap on the core; strong live-presence beat.

## Do
- `src/games/counter/` — host-defined phrase/event; big tap target; each tap increments a **shared**
  total (`{t:"tick"}` → host → `{t:"count", total, byPlayer}`); per-player contribution for a local
  leaderboard; **milestone celebration every 10** (contained).
- Live presence: the total visibly **jumps** when friends tap.

## Files
- `src/games/counter/Counter.jsx`, `src/games/counter/hostLogic.js`

## Done-when
- [ ] Same-device + (post-08) P2P: taps increment the shared total live; per-player tally tracked;
      milestone fires every 10.

## Verify
- Browser MCP phone + laptop; watch the shared total jump. Commit `step 11: counter`.
