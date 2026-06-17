# DESIGN-SPEC — מתחת לשולחן (Under the Desk)

> The deep build spec: **what it takes, the components, how it works, how it's designed, and the
> finalized stack.** Builds on PRD.md / ARCHITECTURE.md and folds in the DISCOVERY answers.
>
> ⚠️ **This supersedes the "no broker / pure zero-infra" sections of the older docs.** Per the
> latest decision we now use the **PeerJS public broker** for signaling, which enables the
> Kahoot-style join you asked for (6-char code + link + remote join). See §2.

---

## 0. Locked decisions

- **Signaling:** **PeerJS public broker.** Clean **6-char room code** + shareable **link** +
  **remote join** (players don't have to be co-located). We host & pay for nothing; gameplay
  stays peer-to-peer. **Same-device mode** remains the guaranteed fallback if the broker is
  blocked.
- **Customization:** the host tailors each game to the specific lecture (own buzzwords, questions,
  prompts). Optional **starter packs** for instant play.
- **Six games:** Bingo · Counter · Trivia · Poll · Reaction · Predictions. **Demo-critical two:**
  Bingo (signature) + Reaction Race (zero setup). Predictions = first to cut if needed.
- **Identity:** lean into covert lecture-survival; gentle, generic lecturer ribbing — **never a
  named person** (the *host* customizes per their own lecture).
- **Discreet UX:** silent by default, dark, big tap targets, glanceable, fast; contained
  celebrations with haptic buzz (optional "go loud").
- **Visual:** sleek dark "stealth" base + neon game-show accents in play; one shared shell, each
  game a signature accent color + icon.
- **Voice:** deadpan-conspiratorial in chrome, upbeat at wins; BGU/engineering-flavored starter
  packs.
- **Responsive:** mobile + tablet/iPad + laptop (see §4).

---

## 1. The finalized stack

| Layer | Choice | Role |
|---|---|---|
| Build/dev | **Vite** | static output, CSP-safe |
| UI | **React 18** | room/lobby/game state; six games on one shell |
| Transport | **PeerJS** (`peerjs`) over its **public broker** | signaling + WebRTC data channels with a clean room-code API |
| Topology | **star** (joiners → host; host relays) | linear connections, simple authoritative state |
| QR | small QR generate + (optional) scanner | encodes the **join link** for fast in-person joins |
| Persistence | **localStorage** | saved content packs, player name, local scores |
| Same-device | **LoopbackTransport** (in-memory) | fallback when broker/WebRTC blocked |

> **Dropped vs the old plan:** the manual SDP copy/paste handshake and `lz-string` SDP
> compression are **no longer needed** — the PeerJS broker performs signaling. QR now just carries
> the join URL (a convenience), not a giant SDP blob.

---

## 2. The signaling rework (centerpiece)

**How a Kahoot-style code works with PeerJS:**

1. **Host creates a room.** App generates a **6-char code** (e.g., `K7QF2P`) and opens a PeerJS
   `Peer` whose id is a namespaced form of it (e.g., `utd-K7QF2P`) via the public broker.
2. **Invite.** Host shares the code and/or a link `https://app/?room=K7QF2P` (and a QR of that
   link). Because the broker is reachable over the internet, **joiners can be anywhere** — same
   room or remote.
3. **Join.** A joiner types the code (or opens the link) → the app does
   `peer.connect('utd-K7QF2P')` → the broker introduces them → a **direct data channel** opens to
   the host. The broker then steps out; gameplay is peer-to-peer.
4. **Relay.** Host is authoritative; joiners only connect to the host (star). Host validates and
   re-broadcasts game state.

**Why this satisfies the brief:** short typeable code ✔, shareable link ✔, remote join ✔, we run
no server ✔, gameplay stays P2P ✔.

**Failure handling (the crux):** if the broker is unreachable (sandbox `connect-src`/CSP blocks
it, or no network), we **detect the connection failure and route to same-device mode** — never an
error wall. Same-device needs nothing and demos the identical games. Host can also retry / show a
"network blocked, play on one device?" prompt.

**Code-collision safety:** namespaced ids + retry-on-taken-id (regenerate the 6-char code if the
broker reports the id is in use).

---

## 3. Screens (information architecture)

| Screen | Job |
|---|---|
| **Home** | two actions: **צור חדר (Create)** / **הצטרף (Join by code)**; deep-link `?room=CODE` jumps straight to Join; "no friends? **מצב מכשיר אחד**" nudge |
| **Pick game** | choose one of six (signature accent + icon each) |
| **Customize** | enter content (buzzwords / questions / prompts) or load a **starter pack** |
| **Invite** | big room **code** + link + QR; live "מי הצטרף" roster |
| **Lobby** | roster, host "התחל"; players see "מחכים למנחה…" |
| **Game** | the active mini-game board (per-game UI) |
| **Results** | scores/winner → back to lobby (host can launch another game in the same room) |

---

## 4. Responsive / adaptive design

- **Phone (primary):** the player device — dark, one-thumb taps, glanceable, big targets, silent.
- **Tablet/iPad:** same UI scaled; comfortable for content authoring (typing buzzwords/questions).
- **Laptop/desktop:** great as the **host/MC screen** — show the room code/QR big for others to
  scan, drive the lobby and game pacing; also fully playable. Click = tap; hover affordances on
  menus.
- A common pattern we explicitly support: **host on a laptop projects the code; players join on
  phones.** Layout adapts the Invite/Lobby to be "presentation-sized" on large screens.
- One responsive React shell; per-game boards use a fluid layout grid; no separate mobile build.

---

## 5. Component inventory

**Transport (the seam)**
- `Transport` interface — `send`, `onMessage`, `onPeerChange`.
- `PeerJSTransport` — wraps PeerJS; host opens room id, joiners connect; star relay.
- `LoopbackTransport` — same-device, in-memory.
- `roomCode` — 6-char generation, namespacing, collision retry; link/QR encode-decode.

**Rooms**
- `HostRoom` — authoritative state + relay + roster.
- `JoinRoom` — connect, send inputs, render broadcast state.

**Shell & flow**
- `AppRouter` — Home → Pick → Customize → Invite → Lobby → Game → Results; handles `?room=` deep
  link.
- `ConnectionStatus` — connecting / connected / peer-left / broker-blocked → fallback prompt.
- `ContentEditor` — per-game content authoring + starter-pack loader.
- `InvitePanel` — code + link + QR + live roster.
- `Lobby` — roster, host start.
- `Scoreboard` / `ResultsScreen`.
- `gameRegistry` — `id → { component, hostLogic, defaultConfig, accent, icon }` (the plug-in seam).

**Games** (each a folder under `games/`): `bingo`, `counter`, `trivia`, `poll`, `reaction`,
`predictions`.

**Lib:** `persistence` (packs/scores), `seededShuffle` (verifiable Bingo cards), `haptics`,
`copy` (Hebrew deadpan strings).

---

## 6. The six mini-games

| Game | Host state | Player action | Content |
|---|---|---|---|
| **Bingo** (signature) | word list, per-player card seeds, marks | tap to mark; claim line | user word list / starter pack |
| **Reaction** (demo-safe) | round id, arrival timestamps | tap on "עכשיו!" | none (zero setup) |
| **Counter** | shared total + per-player tally | tap to increment | user phrase |
| **Poll** | question, options, live tally | one vote | user question/options |
| **Trivia** | questions, current qid, scores | answer; speed-scored | user questions (+correct) |
| **Predictions** | prompts, locked choices, outcomes | lock yes/no early; revealed at end | user prompts (no stakes) |

- **Bingo cards** are a seeded shuffle of the host's list → the host re-derives a card to verify a
  claimed line (no trust in the client).
- **Reaction** is the safety demo: no content to type, connects and plays in seconds.
- Shared patterns: Poll↔Trivia (question→answer→reveal), Counter↔Reaction (tap inputs) — cheap to
  build once the core exists.

---

## 7. How it works — key flows

**Create→play:** Home → Create → Pick game → Customize (or starter pack) → Invite (code/link/QR) →
players join via code/link (PeerJS connects them to host) → Lobby → host "התחל" → Game →
Results → (host launches another game in the same room).

**Join (remote or in person):** type 6-char code or open link → `PeerJSTransport` connects to
`utd-<code>` → lobby.

**Live presence:** host broadcasts roster + state; players feel each other (counter jumps,
"3 שחקנים סימנו") — togetherness is the product.

**Disconnect:** peer drops → "דנה התנתקה", game continues for the rest, rejoin allowed in-session.

**Broker blocked / no network:** detect → offer **מצב מכשיר אחד** (LoopbackTransport) → identical
games on one passed-around phone.

---

## 8. Content & copy
- **Starter packs** (`public/starter-packs.json`): a generic **"כל מרצה"** buzzword set + sample
  trivia Qs + sample predictions, BGU/engineering-flavored ("בעצם", "טריוויאלי", "נשאיר כתרגיל
  לבית") — removes cold-start friction for the demo.
- **Voice:** deadpan-conspiratorial in chrome ("הם לא ישימו לב"), upbeat only at wins. Central
  `copy` module; native-Hebrew pass recommended (no AI-sounding text).

---

## 9. What it will take (build breakdown)

| # | Block | Components | Risk |
|---|---|---|---|
| 1 | Shell + Transport seam + Loopback | AppRouter, Transport, LoopbackTransport, gameRegistry | low |
| 2 | **Core two games (same-device)** | bingo, reaction, Scoreboard | med (fun) |
| 3 | **PeerJS transport + room codes** | PeerJSTransport, roomCode, ConnectionStatus | **high** |
| 4 | Invite/join UX | InvitePanel (code/link/QR), JoinRoom deep-link, Lobby | med |
| 5 | Other four games | counter, poll, trivia, predictions | med |
| 6 | Polish + resilience + responsive | haptics, disconnect/rejoin, fallback prompt, large-screen host layout | med |

**Critical path:** Block 3 (PeerJS room codes). **Fallback-first principle stays:** Blocks 1–2
deliver complete same-device games before networking, so a working demo never depends on the
broker.

---

## 10. Open items
- ✅ **Older UtD docs reconciled** to the PeerJS model (README/PRD/ARCHITECTURE/ROADMAP updated;
  the manual-SDP/lz-string/QR-scanner model removed). `DISCOVERY.md` is left as the historical Q&A
  record.
- Confirm PeerJS **public** broker is acceptable, or whether to self-host a tiny PeerServer later
  (still no app backend, but more reliable than the public one).
- Native-Hebrew copy pass.
- Final starter-pack content.
