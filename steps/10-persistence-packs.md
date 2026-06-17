# Step 10 — Persistence + starter packs + ContentEditor

**Phase:** Content · **Status:** todo · **Depends on:** 06, 07

## Goal
Remove cold-start friction: author content per lecture, save it, or load a starter pack and play
instantly.

## Do
- `src/lib/persistence.js` — `localStorage["utd:packs:v1"]` (per-game content packs) + player
  name/color + local scores; remember last lists.
- `src/components/ContentEditor.jsx` — per-game authoring (buzzwords / questions+correct / phrase /
  prompts) with a **starter-pack loader**; user content rendered `dir="auto"`.
- `public/starter-packs.json` — a generic **"כל מרצה"** buzzword set + sample trivia Qs + sample
  predictions, **BGU/engineering-flavored** ("בעצם", "טריוויאלי", "נשאיר כתרגיל לבית"). Final copy
  lands at the Step 18 gate; seed reasonable placeholders now.

## Files
- `src/lib/persistence.js`, `src/components/ContentEditor.jsx`, `public/starter-packs.json`

## Done-when
- [ ] Author a pack → it persists across reload; load a starter pack → room is instantly playable;
      name/color remembered.

## Verify
- Browser MCP: author, reload, confirm persisted; load a pack. Commit `step 10: persistence + packs`.
