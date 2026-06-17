# Step 16 — Resilience — broker-blocked→same-device, disconnect/rejoin

**Phase:** Polish (the crux) · **Status:** todo · **Depends on:** 08, 09, 15

## Goal
The demo survives a hostile network. **Never an error wall** — the fallback feels intentional.

## Do
- **Broker blocked / connect fails / no network:** detect (`ConnectionStatus` → `FAILED`) → offer
  **"רשת חסומה — לשחק על מכשיר אחד?"** → swap to `LoopbackTransport` (one-line via the seam) →
  identical games. Also auto-suggest "מצב מכשיר אחד" up front.
- **Peer drops mid-game:** show **"דנה התנתקה"**, game continues for the rest, **rejoin allowed
  within the session** (same code reconnects to the host).
- Code-collision + retry-on-taken-id surfaced gracefully.

## Files
- fallback routing in `AppRouter`/transport seam, `ConnectionStatus` prompts, `HostRoom` rejoin

## Done-when
- [ ] Simulate broker blocked → auto-prompt → same-device plays the same game; kill a peer →
      "התנתקה" + others continue + rejoin works. No dead-ends, no crashes.

## Verify
- Browser MCP: block the broker endpoint (CSP/offline) and force a disconnect. Commit
  `step 16: resilience`.
