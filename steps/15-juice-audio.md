# Step 15 — Juice + haptics + silent-by-default audio

**Phase:** Polish · **Status:** todo · **Depends on:** 06, 07, 11, 12, 13, 14

## Goal
The craft pass that makes it feel shipped — within the covert, silent-by-default context.

## Do
- `src/lib/haptics.js` — tasteful buzz on marks/wins/taps (where supported).
- Motion: buttons press, items pop, the **"בינגו!"** + Reaction winner moments get a **contained**
  neon burst + haptic (anticipation/follow-through, not linear). Live-presence micro-animations
  ("3 שחקנים סימנו", counter jump).
- Audio: **silent by default** (covert context); an optional **"go loud"** toggle with layered SFX,
  unlock-on-gesture, mute control. Honor `prefers-reduced-motion`.

## Files
- `src/lib/haptics.js`, `src/lib/sfx.js`, motion across game components

## Done-when
- [ ] Every key action has motion + (optional) haptic; wins land with a contained celebration;
      audio is off by default and toggleable; **60fps, no jank** on a mid phone.

## Verify
- Browser MCP phone: feel the win beats; confirm silent default + reduced-motion. Commit
  `step 15: juice + audio`.
