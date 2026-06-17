# Step 01 — Design gate (visual mockup) ⛔ APPROVAL

**Phase:** Gate · **Status:** todo · **Depends on:** none

## Goal
Produce an approvable visual of the app's look BEFORE building any UI. Owner signs off on the dark
"stealth" + neon-accent system, RTL layout, the six game accent chips, and the key screens.

## Do
- Create `design/mockup.html` — a single self-contained static page (no build, inline CSS) in the
  locked style (**dark stealth base + neon game-show accents**, big tap targets, glanceable, RTL),
  showing the key screens:
  **(a) Home** — `צור חדר` / `הצטרף` + a "מצב מכשיר אחד" nudge.
  **(b) Invite** — a big **6-char room code** + **QR** + live "מי הצטרף" roster.
  **(c) Bingo board** — 5×5 with a marked cell + free center.
  **(d) Results / scoreboard.**
- Show small **phone + laptop framings** (laptop = host/MC screen showing the code big).
- Give each of the six games a **signature accent color chip** (Bingo · Counter · Trivia · Poll ·
  Reaction · Predictions).

## Files
- `design/mockup.html` (+ optional `design/palette.md` with hex tokens)

## Done-when
- [ ] Mockup opens in a browser and shows all four screens + game accent chips + phone/laptop
      framings, RTL, in one consistent dark+neon style.
- [ ] **Owner has approved** the look (palette/type/accents/layout).

## Verify
- Open `design/mockup.html` via browser MCP; screenshot at phone + laptop widths; present to owner.

## ⛔ STOP — do not proceed to Step 02+ until the owner approves.
