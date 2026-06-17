# Step 14 — Predictions (lock → outcome → leaderboard)

**Phase:** Other games · **Status:** todo · **Depends on:** 05, 10

## Goal
Lecturer Predictions — lock yes/no early, host marks outcomes at the end, app scores correct
predictions. **Explicitly no betting, no stakes, no currency** — bragging rights only. (First to
cut if time is tight.)

## Do
- `src/games/predictions/` — host sets prompts ("האם המרצה יחרוג מהזמן?", "יתקלקל המקרן?"); each
  player **locks** a yes/no early; at the end the host marks outcomes; app scores + shows a
  leaderboard (`{t:"prompts"}` / `{t:"lock"}` / `{t:"outcome", scores}`).

## Files
- `src/games/predictions/Predictions.jsx`, `src/games/predictions/hostLogic.js`

## Done-when
- [ ] Players lock predictions; host marks outcomes; correct locks score and a leaderboard shows.
      **No stakes/currency anywhere.**

## Verify
- Browser MCP two pages: lock, mark outcomes, see scores. Commit `step 14: predictions`.
