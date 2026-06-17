# Step 03 — Design tokens + RTL shell + AppRouter

**Phase:** Setup · **Status:** done · **Depends on:** 02

## Goal
The shared dark+neon design system and the screen-flow shell, matching the approved mockup.

## Do
- `src/styles/app.css` — design tokens from the mockup: dark stealth base, neon accents, type
  scale, spacing, radii, soft shadows/glows. **Logical CSS properties** for RTL. Respect
  `prefers-reduced-motion`. Tap targets ≥44px.
- `src/App.jsx` / `src/AppRouter.jsx` — the flow shell:
  **Home → Pick game → Customize → Invite → Lobby → Game → Results**, with eased transitions (no
  hard cuts). Handle a `?room=CODE` deep link → jump straight to Join (wired fully in Step 09).
- Home screen: two actions **`צור חדר`** / **`הצטרף`** + an always-visible **"מצב מכשיר אחד"** nudge.

## Files
- `src/styles/app.css`, `src/AppRouter.jsx`, `src/screens/Home.jsx`

## Done-when
- [ ] All screens reachable via the router with smooth transitions; Home matches the mockup; RTL
      flawless; no console errors.

## Verify
- Browser MCP at phone + laptop widths; tab through the flow. Commit `step 03: tokens + shell`.
