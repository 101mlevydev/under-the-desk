# Step 17 — Responsive — phone / tablet / laptop-as-host-screen

**Phase:** Polish · **Status:** todo · **Depends on:** 09, 15

## Goal
One responsive React shell that's flawless on phone, tablet, and **laptop-as-the-host-screen**.

## Do
- Fluid layout grid per game board; **logical CSS**, safe-area insets, sensible orientation.
- **Phone (primary):** dark, one-thumb taps, glanceable, big targets, silent.
- **Tablet/iPad:** same UI scaled; comfortable content authoring.
- **Laptop/desktop:** **presentation-sized** Invite/Lobby — room **code/QR big** for others to scan;
  drives lobby + pacing; hover affordances on menus; click = tap. Fully playable too.
- Verify the explicit pattern: **host on laptop projects the code; players join on phones.**

## Files
- responsive layout across screens/components; `src/styles/app.css` breakpoints

## Done-when
- [ ] Flawless on emulated phone, tablet, and laptop; laptop shows a big code/QR host screen; all
      inputs (tap + click) work; ≥44px targets.

## Verify
- Browser MCP at 3 viewport sizes + touch & click. Commit `step 17: responsive`.
