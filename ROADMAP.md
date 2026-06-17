# ROADMAP — מתחת לשולחן (Under the Desk)

**Status:** Draft for review (v2 — six games on one core)
**Assumption:** small team, time-compressed hackathon. Effort blocks, not wall-clock.

**Guiding principle:** **fallback-first, core-two-first.** Build a complete, fun, same-device
experience for Bingo + Counter before touching WebRTC, then add the other four games on the
shared core, then layer live P2P. This makes the demo un-killable and the breadth cheap.

---

## 0. Pre-flight
- [ ] Confirm optional starter packs (generic "כל מרצה" buzzwords, a few trivia Qs, sample
      predictions).
- [ ] Confirm the **PeerJS public broker** is reachable from the sandbox (else plan a self-hosted
      PeerServer or rely on same-device).
- [ ] Scaffold: `npm create vite@latest under-the-desk`; add `peerjs` + a QR-generate lib.

---

## 1. Build order

### Block 1 — Shell + transport interface
- [ ] Vite + React; `<html dir="rtl" lang="he">`; routing home → create/join → lobby → game →
      results.
- [ ] `Transport` interface; implement **LoopbackTransport** (same-device) first.
- [ ] `gameRegistry` seam (id → component/hostLogic/defaultConfig).
- **Exit:** full flow navigates on one device via loopback.

### Block 2 — Core two games (FUN, same-device)
- [ ] **Bingo:** content editor, seeded card gen, board, marking, win detection + broadcast.
- [ ] **Counter:** content editor, big tap target, shared tally + per-player tracking.
- [ ] Persist packs + last game to localStorage.
- **Exit:** Bingo + Counter fully playable in same-device mode — a complete demo on their own.

### Block 3 — PeerJS transport + room codes (the upgrade)
- [ ] **PeerJSTransport:** open a `Peer` with a namespaced room id; joiners `peer.connect`; data
      channels; public STUN via PeerJS defaults.
- [ ] `roomCode.js`: 6-char code gen + namespacing + regenerate-on-collision; link/QR encode.
- [ ] Host star-relay; connection state machine + status UI; FAILED/broker-blocked → offer
      same-device.
- **Exit:** two tabs → two real phones join by code and play a real Bingo round.

### Block 4 — Invite / join UX
- [ ] Host **InvitePanel**: big code + link + QR + live roster. Joiner: enter code or open
      `?room=CODE` deep link.
- [ ] Lobby; "peer left"; basic rejoin within the session.
- **Exit:** a non-technical tester joins by typing a 6-char code, on a phone.

### Block 5 — The other four games (cheap on the core)
- [ ] **Live Poll** (cheapest: question→vote→reveal).
- [ ] **Trivia** (Poll + correct answer + speed scoring + scoreboard).
- [ ] **Reaction Race** (arm→go→first-tap, host-timestamped; early-tap penalty).
- [ ] **Lecturer Predictions** (lock prompts → mark outcomes → score; no stakes).
- **Exit:** all six selectable from the picker and playable in both transports.

### Block 6 — Polish & resilience
- [ ] Player names/colors; win/celebration animations; scoreboards.
- [ ] Connection-failure → graceful switch to same-device.
- [ ] Starter packs in pickers; mute/settings.
- **Exit:** smooth end-to-end on two phones; clean fallback when network refuses.

---

## 2. Component reuse / shared-with-suite notes
- **Within repo:** all six games plug into one room/transport/relay layer via `gameRegistry` —
  that's the whole architecture. Poll↔Trivia and Counter↔Reaction share most UI.
- **Across the suite:** the **localStorage persistence helper** and **RTL shell CSS** match the
  patterns in Daf Nuschaot / Gold Miner — copy the small helpers, don't link (repos standalone).

---

## 3. Testing strategy (sandbox-aware) — this app needs the most
- **Two real devices early** (Block 3): tab-to-tab is necessary but NOT sufficient — test phone↔
  phone on the same Wi-Fi and on cellular to exercise real NAT and the broker.
- **Broker + NAT reality:** if the broker is blocked or a direct connect fails (symmetric NAT, no
  TURN), confirm detection + clean routing to same-device mode. We can't host TURN — failing
  gracefully is the requirement.
- **CSP rehearsal:** serve `vite build` under strict CSP; check the **PeerJS broker + STUN**
  (`connect-src`); confirm same-device works with everything blocked.
- **Per-game correctness:** Bingo win verification, Trivia speed-scoring, Reaction timestamp
  ordering + early-tap penalty, Predictions outcome scoring.
- **Offline + persistence:** same-device playable offline; packs survive reload.
- **RTL + mixed content:** Hebrew UI with mixed-language content renders correctly (`dir=auto`).

---

## 4. Demo script (with a built-in escape hatch)
**Plan A (live P2P):**
1. Host: צור חדר → Bingo → load "כל מרצה" pack → show the **room code + QR**.
2. Two judges type the code (or scan) → join → unique cards each.
3. Host calls a buzzword; everyone taps; first line → "בינגו!" broadcasts the winner.
4. (If time) flip to **Trivia** or **Reaction Race** to show breadth on the same room.

**Plan B (if the sandbox blocks WebRTC) — seamless, not an apology:**
1. Tap "מצב מכשיר אחד" → same game, same content, on one phone passed between judges.
2. Narrate: "Same engine — only the transport layer changed. Zero backend either way." (True,
   thanks to the `Transport` abstraction.)

Rehearse both so switching is a confident pivot.

---

## 5. Risk register
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Live P2P fails at demo (broker/NAT/CSP) | **High** | High | **Fallback-first**; same-device is a complete demo; rehearse the pivot. |
| Six games dilute polish | Med | Med | Bingo+Counter polished first; the four extras only ship if they don't hurt the core. |
| PeerJS public broker blocked/flaky | Med | High | Detect → same-device; option to self-host a tiny PeerServer (signaling only). |
| Symmetric NAT (no TURN) | Med | High | Detect → route to same-device; by design. |
| Scope creep (mesh, more games) | Med | Med | Star topology only; six games fixed; extras are stretch. |

---

## 6. Definition of done (hackathon)
- Bingo + Counter fully playable in **same-device mode** (the guaranteed demo).
- All six games selectable; live P2P works between two real phones on a friendly network; fails
  *gracefully* into same-device otherwise.
- Hebrew RTL throughout; user content persists.
- No app backend we run (signaling via free public broker), zero paywall code, no betting mechanic.
