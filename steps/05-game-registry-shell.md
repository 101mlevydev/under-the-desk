# Step 05 — `gameRegistry` + game shell + Scoreboard / Results

**Phase:** Core (plug-in seam) · **Status:** done · **Depends on:** 04

## Goal
The plug-in seam so adding a game = adding a folder + a registry entry; the room/transport/lobby
code is never touched.

## Do
- `src/games/gameRegistry.js` — `id → { component, hostLogic, defaultConfig, accent, icon, title }`
  for all six (accents from the mockup chips). Pick-game screen renders from this.
- `src/screens/PickGame.jsx` — the six cards (signature accent + icon each).
- A `GameShell` that mounts the active game's component + host logic against `Transport`.
- `src/components/Scoreboard.jsx` + `src/screens/Results.jsx` — winner/scores → back to lobby
  (host can launch another game in the same room).

## Files
- `src/games/gameRegistry.js`, `src/screens/PickGame.jsx`, `src/screens/Results.jsx`,
  `src/components/Scoreboard.jsx`, `src/components/GameShell.jsx`

## Done-when
- [ ] Pick-game shows six accent cards; selecting one mounts its (stub) board; Results renders a
      scoreboard and returns to lobby. No console errors.

## Verify
- Browser MCP: pick each game, see its accent + a stub board, hit Results. Commit `step 05: registry`.
