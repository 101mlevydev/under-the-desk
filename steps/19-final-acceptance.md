# Step 19 — Final: CSP/offline rehearsal + acceptance + demo

**Phase:** Acceptance · **Status:** todo · **Depends on:** all

## Goal
Prove the finished product against the Definition of Done, with the same-device backup rehearsed.

## Do
- Build (`npm run build`); serve `dist/` behind a **strict CSP** header; confirm PeerJS + QR are
  **bundled locally** (no CDN) and only the **broker endpoint** needs allow-listing.
- **Offline test:** load once, kill network → **same-device mode** plays all six games.
- **Live P2P rehearsal:** two devices join by **code AND link/QR** → lobby → synced Bingo round →
  someone wins "בינגו!" live.
- Walk the **demo script** (DESIGN-SPEC §7): create → starter pack → invite (code/QR) → judges'
  phones join → Bingo win — **with same-device as the rehearsed plan B** if the network is hostile.

## Files
- (config) strict-CSP serve script; any final tuning

## Done-when
- [ ] Every **MASTER-PLAN Definition of Done** box is checked; demo runs in ~2 min with a seamless
      same-device fallback.

## Verify
- Browser MCP under strict CSP + offline + two-device live run. Final commit `step 19: acceptance`.
