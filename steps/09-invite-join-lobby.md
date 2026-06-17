# Step 09 — Invite/join UX — code + link + QR + deep-link + Lobby roster

**Phase:** Networking · **Status:** todo · **Depends on:** 08

## Goal
The Kahoot-style invite + join + gather experience — fast first, with one small delight.

## Do
- `src/components/InvitePanel.jsx` — big **6-char code** (tap to copy) + **link** (share/copy) +
  **QR** of the link; live **"מי הצטרף"** roster that pops **"🎉 דנה הצטרפה"** on each join.
- `src/components/QrCode.jsx` — renders the join-link QR (bundled lib).
- `JoinRoom` deep-link: opening `?room=CODE` jumps straight to Join and connects.
- `src/screens/Lobby.jsx` — roster + host **"התחל"**; players see **"מחכים למנחה…"**.
- On large screens the Invite/Lobby go **presentation-sized** (host/MC screen) — code/QR big.

## Files
- `src/components/InvitePanel.jsx`, `src/components/QrCode.jsx`, `src/screens/Lobby.jsx`,
  deep-link wiring in `AppRouter`/`JoinRoom`

## Done-when
- [ ] Host sees code + link + QR; a second device joins **by typing the code AND by opening the
      link/QR**, appears in the roster with a pop; host "התחל" starts the game for all.

## Verify
- Browser MCP two pages: join by code, then by `?room=` link; scan-equivalent via the link.
  Commit `step 09: invite + join + lobby`.
