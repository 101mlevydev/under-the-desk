# MASTER-PLAN — מתחת לשולחן (Under the Desk)

> The orchestrator. Build this app from empty repo → finished product by executing the step files
> in `./steps/` **in order, one at a time**. Each step file is a small, self-contained task with
> its own done-when + verify. This plan is the index + the rules; the steps are the work.

**Source of truth for detail:** `DESIGN-SPEC.md` · `PRD.md` · `ARCHITECTURE.md` (DISCOVERY.md = the
historical Q&A record).

---

## Locked context (decided with the owner)
- **Signaling = PeerJS public broker.** Kahoot-style join: a clean **6-char room code** + a
  shareable **link** (+ **QR** of the link) + **remote join** (players need not be co-located). We
  host and pay for **nothing**; once peers meet, gameplay is **peer-to-peer** (WebRTC data
  channels, star topology, host-authoritative). ⚠️ This **supersedes** the old manual-SDP /
  QR-of-SDP / `lz-string` handshake — that model is gone.
- **Same-device fallback is the floor.** `LoopbackTransport` (in-memory) runs the **identical**
  game logic on one passed-around phone. **"מצב מכשיר אחד"** is a first-class mode, always visible,
  and auto-offered if the broker/WebRTC is blocked — never an error wall.
- **Six games, one shell:** בינגו (Bingo) · מונה (Counter) · חידון (Trivia) · מי צודק (Poll) ·
  מי ראשון (Reaction) · ניחושים (Predictions). **Demo-critical two: Bingo (signature) + Reaction
  (zero-setup, demo-safe).** Predictions is first to cut if time is tight.
- **Look:** sleek **dark "stealth"** base + **neon game-show** accents in play; one shared shell,
  each game a **signature accent color + icon**. Silent by default, **glanceable**, big tap
  targets, fast.
- **Voice:** deadpan-conspiratorial in the chrome ("הם לא ישימו לב"), upbeat only at win moments.
  BGU/engineering-flavored starter packs. Native-Hebrew — **must never read as AI**.
- **Responsive:** phone (primary player device) · tablet/iPad (comfortable authoring) · **laptop as
  the host/MC screen** (projects the room code/QR big, drives lobby + pacing). One responsive React
  shell, no separate mobile build.
- **Stack:** Vite + **React 18** + `peerjs` (bundled, no CDN) + a small QR generator + localStorage.
  Assumptions until told otherwise: BGU hub serves static files in a **sandboxed iframe** under a
  **strict CSP**; **"in app = paid"** (no paywall code). Hebrew **RTL**.

## Approval gates (these pause the run)
- **Step 01 — DESIGN GATE** ⛔ produce the visual mockup → owner approves the look (dark stealth +
  neon, RTL, key screens) BEFORE any UI is built.
- **Step 18 — COPY GATE** ⛔ Hebrew deadpan-conspiratorial copy + starter packs drafted →
  owner/native speaker approves (must not read as AI).
Everything else runs autonomously between/after the gates.

## How to execute (rules)
1. Do steps **in numeric order**. Open the step file, do it, run its **Verify**, tick its
   **Done-when**, mark its `Status: done`, then move on.
2. At a **GATE**, produce the artifact and **STOP for owner approval**; resume only when approved.
3. After each step: `git add -A && git commit` on the app branch with `step NN: <title>`.
4. **Fallback-first, always.** Build same-device (`LoopbackTransport`) + the core two games to a
   playable, polished state **before** any networking. A working demo must never depend on the
   broker.
5. **Every game talks only to the `Transport` interface** — never to PeerJS directly. Swapping live
   P2P ↔ same-device is then a one-line change; that's what bulletproofs the fallback.
6. Self-verify with the **`run`/`verify`** skills + browser MCP (Playwright/Chrome): test on an
   **emulated phone AND a laptop width**, and simulate the sandbox with a **strict-CSP local serve**.
7. If a Verify fails → fix → re-verify before advancing. If blocked → stop and report.
8. Finish when the **Definition of Done** is fully green.

## Definition of Done
> **Inherits [QUALITY-BAR.md](../QUALITY-BAR.md).** "Builds and runs" is the floor. Visual craft,
> motion/juice, feel, silent-by-default audio, native-Hebrew copy, and a flawless rehearsed demo
> (with a same-device backup) are **gates**, not extras.
- [ ] Meets the QUALITY-BAR standard (cohesive dark+neon design system · motion/juice · glanceable ·
      ≥44px targets · `prefers-reduced-motion` · 60fps · **no console errors**).
- [ ] `npm run build` → static output; loads with **no console errors**; runs **offline after load**
      and under a **strict CSP** (PeerJS + QR bundled locally; only the broker endpoint needs allow).
- [ ] **Same-device mode** plays **all six** games on one device with zero network (the guaranteed path).
- [ ] **Live P2P:** host creates a room → **6-char code + link + QR** → a second device **joins by
      code AND by link** → lands in the lobby roster → plays a synced round.
- [ ] **Bingo** (seeded per-player card, host-verified line, broadcast **"בינגו!"** win) and
      **Reaction** (arm → "עכשיו!" → first-tap ranked, early-tap penalized) are **flawless** —
      these are the signature moments.
- [ ] The other four games (Counter, Poll, Trivia, Predictions) play on the shared core.
- [ ] **Broker blocked / peer drop** → auto-route to "מצב מכשיר אחד" + "X התנתקה" + in-session
      rejoin — never a dead-end.
- [ ] **Responsive** on phone, tablet, and **laptop-as-host-screen** (presentation-sized code/QR);
      tap + click inputs.
- [ ] Live presence felt (roster pops "X הצטרף", counter jumps, "3 שחקנים סימנו"); contained
      celebration with optional haptic/"go loud".
- [ ] Starter packs seed instant play; content + name persisted in localStorage; **native-reviewed
      Hebrew copy**; no paywall code.
- [ ] Demo script runs in ~2 min (DESIGN-SPEC §7), **with same-device as the rehearsed plan B**.

## Step index
| # | Step | Gate |
|---|---|---|
| 01 | Design gate — visual mockup (dark stealth + neon, RTL) | ⛔ approve |
| 02 | Scaffold (Vite + React) + git + env check | |
| 03 | Design tokens + RTL shell + AppRouter | |
| 04 | `Transport` interface + `LoopbackTransport` (same-device) + Host/Join seam | |
| 05 | `gameRegistry` + game shell + Scoreboard / Results | |
| 06 | **Bingo** (same-device, signature) — card + mark + verified "בינגו!" | |
| 07 | **Reaction** (same-device, demo-safe) — arm → go → ranked tap | |
| 08 | `PeerJSTransport` + `roomCode` (6-char) + ConnectionStatus state machine | |
| 09 | Invite/join UX — code + link + QR + deep-link + Lobby roster | |
| 10 | Persistence + starter packs + ContentEditor | |
| 11 | Counter (shared tally + milestones) | |
| 12 | Poll (question → vote → reveal) | |
| 13 | Trivia (speed-scored quiz) | |
| 14 | Predictions (lock → outcome → leaderboard) | |
| 15 | Juice + haptics + silent-by-default audio | |
| 16 | Resilience — broker-blocked→same-device, disconnect/rejoin | |
| 17 | Responsive — phone / tablet / laptop-as-host-screen | |
| 18 | Copy gate — Hebrew deadpan slang + starter packs | ⛔ approve |
| 19 | Final — CSP/offline rehearsal + acceptance + demo | |

## What the owner must do
- **Approve Step 01 mockup** (the look) and **Step 18 copy** (the deadpan Hebrew + starter packs).
  Everything else is autonomous.
- Confirm whether the **PeerJS public broker** is reachable from the BGU sandbox (`connect-src`).
  If unknown, the demo **defaults to same-device**; optional later upgrade is a self-hosted tiny
  PeerServer (still no app backend).
