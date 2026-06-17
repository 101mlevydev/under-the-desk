# ARCHITECTURE — מתחת לשולחן (Under the Desk)

**Status:** Draft for review (v3 — PeerJS broker signaling; six games on one core)
**Constraint envelope:** no backend we run · signaling via the **free PeerJS public broker** ·
no app DB · gameplay peer-to-peer (WebRTC) · static hosting in the BGU sandbox · Hebrew RTL.

---

## 1. System overview

Browsers connect over WebRTC data channels in a **star** (joiners ↔ host). The only piece of
infrastructure is the **PeerJS public broker**, used solely to introduce peers by a short room
code; it never sees or relays gameplay. A same-device mode bypasses networking entirely.

```
                         PeerJS public broker
                       (matchmaker only — free)
                              ▲        ▲
                  open "K7QF2P"│        │connect "K7QF2P"
                              │        │
        Host device ──────────┘        └────────── Joiner device(s)
   ┌───────────────────┐                       ┌───────────────────┐
   │ Create room        │                       │ Enter code / open  │
   │ pick + customize   │                       │ link (?room=K7QF2P)│
   │ game → code K7QF2P  │                       │                    │
   │  RTCPeerConnection ◀════ direct data channel ════▶ RTCPeerConnection │
   └───────────────────┘   (gameplay is P2P; broker steps out)  └────────┘

   Fallback: "single-device mode" → no PeerConnection, all state local (LoopbackTransport).
```

---

## 2. Signaling: the PeerJS broker model (read first)

WebRTC always needs a **signaling** step (exchange connection info) before peers talk directly.
We don't run a server for that — we use the **PeerJS public broker** as a free matchmaker:

1. **Host** generates a **6-char room code** (e.g., `K7QF2P`) and opens a PeerJS `Peer` whose id
   is a namespaced form of it (e.g., `utd-K7QF2P`).
2. **Invite** = the code + a link `…/?room=K7QF2P` (+ a QR of that link).
3. **Joiner** enters the code or opens the link → `peer.connect('utd-K7QF2P')` → the broker
   introduces the two → a **direct data channel** opens to the host.
4. **From then on, gameplay is peer-to-peer.** The broker is out of the loop.

**Why this is the chosen model:** it delivers the Kahoot-style UX the product needs — short
typeable code, shareable link, **remote join** (players need not be co-located) — while we still
**host and pay for nothing**, and gameplay stays P2P.

**What it costs us (honest):**
- A **dependency on a third-party broker** being reachable from inside the BGU sandbox
  (`connect-src`/CSP). Public PeerJS reliability varies.
- NAT traversal still uses free public **STUN**; symmetric NATs that need **TURN** (which we
  cannot host) may fail to establish a direct channel.

**Mitigation (the crux):** if the broker is blocked/unreachable or a peer can't connect, we
**detect the failure and route to same-device mode** — never an error wall. Same-device needs no
network and demos the identical games. (Optional later upgrade: self-host a tiny PeerServer — still
no app backend, just a more reliable matchmaker — see §10.)

**Room-code safety:** namespaced ids + regenerate-on-collision if the broker reports the id is
taken.

---

## 3. Tech stack & rationale

| Concern | Choice | Why |
|---|---|---|
| Build / dev | **Vite** | Static output, CSP-friendly. |
| UI | **React 18** | Room/lobby/game state; reuse across six games. |
| Transport | **PeerJS** (`peerjs`) over its public broker | clean room-code API; broker does signaling; data channels for gameplay. |
| QR | small **QR generate** | encodes the **join link** for fast in-person joins (no SDP blobs anymore). |
| Persistence | **localStorage** | Saved content packs, last game, local scores. |
| Same-device | **LoopbackTransport** (in-memory) | fallback when broker/WebRTC blocked. |

> **Dropped vs the earlier design:** raw `RTCPeerConnection` manual handshake, **`lz-string`** SDP
> compression, and the **camera QR-scanner of SDP blobs** are gone — the broker handles signaling,
> so joining is just a code/link. QR now only carries the join URL (a convenience).

---

## 4. The `Transport` abstraction (key design choice)

One interface, two implementations. **Every game talks only to `Transport`**, so swapping live
P2P ↔ same-device is a one-line change — that's what makes the fallback bulletproof and the live
mode a clean upgrade.

```
Transport {
  send(msg)            // to host (or broadcast if host)
  onMessage(cb)
  onPeerChange(cb)
}
  ├─ PeerJSTransport    // PeerJS data channels via the public broker (star topology)
  └─ LoopbackTransport  // same-device: in-memory, synchronous
```

**Topology:** **star** — joiners connect only to the host; the host relays game messages and is
the single source of truth. Modest room sizes (~2–8) keep the host's relay load light.

---

## 5. Connection state machine

```
Host:   IDLE → OPENING_ROOM(broker) → WAITING_FOR_PLAYERS → CONNECTED → (CLOSED|FAILED)
Joiner: ENTER_CODE → CONNECTING(broker) → CONNECTED → (CLOSED|FAILED)
```
UI surfaces each plainly ("פותח חדר…", "מתחבר…", "מחובר", "החבר התנתק"). On FAILED (broker
blocked / can't connect) → prompt to switch to **same-device mode**.

---

## 6. Message protocol (over the data channel)

Compact JSON, host-authoritative. Shared envelope `{ t, ...payload }`.

```jsonc
// lobby (all games)
{ "t": "join",   "name": "דנה" }
{ "t": "roster", "players": [ {"id":"p1","name":"דנה"} ] }     // host → all
{ "t": "start",  "game": "bingo", "config": { ... } }          // host → all
{ "t": "end",    "results": { ... } }                          // host → all

// bingo
{ "t": "mark", "cell": 12 }                 // peer → host
{ "t": "claim", "line": "row2" }            // peer → host
{ "t": "win", "winner": "דנה", "line": "row2" }   // host → all (verified)

// counter
{ "t": "tick" }                             // peer → host
{ "t": "count", "total": 37, "byPlayer": {"p1": 12} }   // host → all

// trivia / poll
{ "t": "question", "qid": 3, "text": "...", "options": ["א","ב","ג"] }  // host → all
{ "t": "answer", "qid": 3, "choice": 1, "tMs": 820 }                    // peer → host
{ "t": "reveal", "qid": 3, "correct": 2, "tally": [4,1,7], "scores": {...} } // host → all

// reaction race
{ "t": "arm" }                              // host → all (round starting)
{ "t": "go", "goId": 5 }                    // host → all (tap now!)
{ "t": "tap", "goId": 5 }                   // peer → host (host timestamps arrival)
{ "t": "result", "order": ["דנה","עידו"] }  // host → all

// predictions
{ "t": "prompts", "items": [ {"pid":1,"text":"חריגה מהזמן?"} ] }   // host → all
{ "t": "lock", "pid": 1, "choice": "yes" }                         // peer → host
{ "t": "outcome", "pid": 1, "actual": "yes", "scores": {...} }     // host → all
```

**Host validates** wins/answers/timestamps and broadcasts authoritative state → prevents desync
and trivial cheating. Messages are tiny; no compression needed.

---

## 7. Per-game state & content

| Game | Host state | Player state | Content source |
|---|---|---|---|
| Bingo | word list, per-player card seeds, marks | own card + marks | user word list |
| Counter | shared total, per-player tally | local taps | user phrase |
| Trivia | questions, current qid, scores | own answers | user questions (text/options/correct) |
| Poll | question, options, tally | own vote | user question/options |
| Reaction | round id, arrival timestamps | tap intent | none (pure timing) |
| Predictions | prompts, locked choices, outcomes | own locks | user prompts |

- **Determinism for verification:** Bingo cards = seeded shuffle of the list per player, so the
  host re-derives a card to verify a claimed line without trusting the client.
- **Content & persistence:** user-typed packs (per lecture) saved to `localStorage["utd:packs:v1"]`
  keyed by game type, for reuse. Optional bundled **starter packs** (`public/starter-packs.json`)
  seed the pickers so a room is instantly playable.

---

## 8. Same-device fallback (guaranteed path)

"מצב מכשיר אחד": no PeerJS, no broker. The exact same game logic runs against `LoopbackTransport`
(in-memory loopback). Hot-seat / pass-the-phone or shared-screen play. Reuses 100% of game logic
and UI — only the transport swaps. Building games against `Transport` from day one makes this free.

---

## 9. "No app backend / no paywall code" statement
- **No server, DB, API, or auth that we run.** The only external touch is the **PeerJS public
  broker for signaling** (a free matchmaker, not our infrastructure) + free public STUN; once peers
  connect, gameplay is P2P. Same-device mode needs nothing at all.
- **No payment/entitlement/spectator-gate code.** Everything works; we assume access = paid. The
  hub owns monetization. No real-money or betting mechanic anywhere (incl. Predictions).

---

## 10. Sandbox / CSP considerations
- Vite static build, no `eval` → `script-src 'self'` friendly.
- **PeerJS needs `connect-src` to allow the broker** (its API host + WebSocket) **and STUN/ICE.**
  If the sandbox CSP blocks these → detect → **same-device fallback** (needs nothing).
- Bundle the PeerJS + QR libs locally (no CDN) so only the broker endpoint needs allow-listing.
- **Open questions for the hub:** does the sandbox iframe allow outbound to the PeerJS broker +
  STUN (`connect-src`)? If unknown, the demo defaults to same-device.
- **Reliability upgrade (optional, still no app backend):** self-host a tiny **PeerServer**
  (signaling only) if the public broker proves flaky in the sandbox.

---

## 11. Proposed project structure
```
under-the-desk/
  public/
    starter-packs.json       # optional buzzwords / questions / predictions
  src/
    main.jsx
    App.jsx                  # home → create/join → customize → invite → lobby → game → results
    transport/
      Transport.js           # interface
      PeerJSTransport.js     # PeerJS data channels via public broker (star)
      LoopbackTransport.js   # same-device
      roomCode.js            # 6-char code gen + namespacing + collision retry; link/QR encode
    rooms/
      HostRoom.js            # authoritative state + relay + roster
      JoinRoom.js
    games/
      bingo/  counter/  trivia/  poll/  reaction/  predictions/
      gameRegistry.js        # id → {component, hostLogic, defaultConfig, accent, icon}
    components/
      QrCode.jsx  InvitePanel.jsx  ConnectionStatus.jsx  ContentEditor.jsx  Scoreboard.jsx
    lib/
      persistence.js  seededShuffle.js  haptics.js
    styles/app.css           # RTL
  index.html                 # <html dir="rtl" lang="he">
```
`gameRegistry.js` is the plug-in seam: adding a game = adding a folder + a registry entry; the
room/transport/lobby code is untouched.

---

## 12. RTL / i18n specifics
- `<html dir="rtl" lang="he">`; logical CSS properties.
- Connection/status, lobby, and game UI in Hebrew.
- User content (buzzwords, questions) may be any language → render in `dir="auto"` containers so
  mixed Hebrew/English displays correctly.
