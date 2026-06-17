# Step 12 — Poll (question → vote → reveal)

**Phase:** Other games · **Status:** todo · **Depends on:** 05, 10

## Goal
Live Poll — the cheapest game: question → one vote each → host reveals the live tally. No "correct"
answer. Reuses most of the Trivia board (build the shared question→answer→reveal pattern here).

## Do
- `src/games/poll/` — host poses a question + options; each player votes once; host reveals the
  **live tally** (`{t:"question"}` / `{t:"answer"}` / `{t:"reveal", tally}`); clear Kahoot-style
  option clarity, toned dark.

## Files
- `src/games/poll/Poll.jsx`, `src/games/poll/hostLogic.js`

## Done-when
- [ ] Host poses a question; players vote once; host reveals a tally that matches the votes.

## Verify
- Browser MCP two pages: vote + reveal. Commit `step 12: poll`.
