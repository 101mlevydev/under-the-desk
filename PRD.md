# PRD — מתחת לשולחן (Under the Desk)

**Document owner:** Product
**Status:** Draft for review (v2 — renamed; six mini-games)
**Phase:** Pre-build (planning)

---

## 1. Problem & opportunity

Lectures are long, and students are already on their phones under the desk. There's a rich social
ritual of quietly mocking a lecturer's verbal tics ("אז…", "בעצם", "שאלה טובה") and counting how
many times the projector dies — but it's unstructured and solo.

**Opportunity:** give friends a shared, low-effort game layer over the same boring lecture — a
small suite of mini-games they create and customize in seconds and play together across their
phones. It turns a private eye-roll into a social game and a bonding moment, **under the desk**.

### Why it's in the suite
- **Virality / social wow.** Multiplayer-in-the-room is the most "alive" demo if it lands.
- **User-generated content = infinite replay.** Every professor, every course, a new game.
- **Showcases real tech** (browser-to-browser WebRTC P2P; a free public broker only does
  matchmaking — we run no backend).
- **Breadth.** Six small games off one shared core demonstrate range cheaply.

### The signaling approach
Joining is **Kahoot-style**: a 6-char room code + link, brokered by the **free PeerJS public
service** (it introduces peers by code, then gameplay flows peer-to-peer). This enables **remote
join** and an easy UX without us hosting anything. The honest cost is a dependency on that broker
being reachable from the BGU sandbox — so we ship a **same-device fallback** that needs no network.
Rooms stay **small (~2–8)** because the host is an authoritative star hub. (See ARCHITECTURE §2.)

---

## 2. Ideal Customer Profile (ICP)

**Primary:** BGU students attending the same lecture together, 18–25, phones out, looking for a
shared low-effort laugh. One is **host**; 1–5 friends **join**.

**Jobs to be done**
- "Give us a fun, quiet game to play together right now."
- "Let me make it about *our* professor."
- "Let me invite my friends in two taps."

**Secondary:** study groups, club icebreakers, anyone wanting a quick shared mini-game.

**Anti-persona:** a 200-person hall trying to all join one room (out of scope — the host is a
single star hub, so we keep rooms to a friend-group size).

---

## 3. Core flow: create → customize → invite → play

1. **Create.** Host opens the app → "צור חדר" → picks a mini-game.
2. **Customize.** Host enters the content (buzzwords, questions, the event to count, prediction
   prompts). Saved to localStorage for reuse next lecture.
3. **Invite.** Host gets a **6-char room code + a link (+ QR)**. A joiner types the code or opens
   the link; the PeerJS broker connects them directly to the host (works remotely too). See
   ARCHITECTURE §2.
4. **Play.** The chosen mini-game runs, host-authoritative, synced over the data channel.
5. **Fallback (always available).** "מצב מכשיר אחד" (single-device mode) plays any game on one
   phone passed around — zero network needed.

---

## 4. The six mini-games

All games share the same room/connection/sync core; each adds a board + rules. **MVP priority
order** is annotated.

### 4.1 Buzzword Bingo · בינגו מילים — *MVP core*
Host-defined word list (≥24 for a full 5×5 with free center). Per-player **deterministic** card
(seeded shuffle so the host can verify a win). Tap-to-mark; win mode (row/col/diag/full); win
broadcast with the winner's name.

### 4.2 Event Counter · מונה אירועים — *MVP core*
Host-defined phrase/event. Big tap target; each tap increments a **shared** counter (synced);
per-player contribution tracked for a local leaderboard; milestone celebrations (every 10).

### 4.3 Trivia / Quiz · חידון — *should-have*
Host authors questions (text + options + correct answer). Host reveals one at a time; players
answer; **score = correct × speed** (faster correct = more points). Live scoreboard between
questions. (Kahoot-style; host drives pacing.)

### 4.4 Live Poll · מי צודק — *should-have (cheapest to add)*
Host poses a question with options; everyone votes once; host reveals the live tally. No
"correct" answer — pure opinion/snap-debate. Essentially Trivia minus scoring → reuses most of
the Trivia board.

### 4.5 Reaction Race · מי ראשון — *should-have (tiny)*
Host arms a round; after a random delay shows "עכשיו!"; **first peer to tap wins**. Host
timestamps arrivals (authoritative) to rank. Best-of-N for a match. Detect/penalize early taps.

### 4.6 Lecturer Predictions · ניחושים — *should-have*
Host sets prediction prompts ("האם המרצה יחרוג מהזמן?", "יתקלקל המקרן?") before/early in class.
Each player locks a yes/no (or multiple-choice) prediction. At lecture's end the host marks
outcomes; the app scores correct predictions and shows a leaderboard. **Explicitly no betting, no
stakes, no currency** — bragging rights only (this is the compliant reincarnation of the dropped
prediction-market idea).

> **Shared engine note:** Bingo & Counter are the live-sync core. Trivia/Poll share a
> question→answer→reveal pattern. Reaction & Predictions are thin variations on
> timestamped/locked inputs. This is why six games is cheap once the core exists.

---

## 5. Feature set

### Must-have (MVP)
- Create room → pick game → customize content.
- **Same-device fallback** for every game (the guaranteed path — build first).
- P2P connect via **6-char code / link (PeerJS broker)**; remote join.
- **Bingo + Counter** fully working (the core two).
- Hebrew RTL UI; customizations persisted in localStorage; connection-status UI.

### Should-have
- **Trivia, Live Poll, Reaction Race, Lecturer Predictions** (all four — they're cheap on the
  shared core).
- Player name + color; reconnect/rejoin within a session.
- Starter packs (buzzwords / questions / predictions) for instant demo.

### Could-have (stretch)
- More games (Doodle & Guess, live "react" taps).
- Host kick / room lock; shareable result card.

### Won't-have
- **Any backend, DB, or server we operate** (the free public broker only matches peers — we host
  nothing); accounts; large-room scale; persistent global leaderboards; payment logic; any
  real-money/betting mechanic.

---

## 6. Success & judging criteria

| Judging dimension | How this app scores |
|---|---|
| **Wow / social** | Live multiplayer in the room — highest ceiling of the suite. |
| **Breadth** | Six mini-games off one core — visible range. |
| **Technical depth** | Real WebRTC P2P (broker-matched, then direct) — genuinely hard. |
| **UGC / replay** | Players make their own games — strong. |
| **Demo risk** | High *if* relying on live network → mitigated by same-device fallback. |

**Demo metric:** two judges' phones join the host's room and complete a Bingo round; if the
network blocks it, same-device mode demos the identical game with no degradation in the story.

---

## 7. Paywall placement (informational — not our code)

Original framing: spectating is free; **generating a card / locking a prediction** triggers the
paywall. **We implement none of it.** We assume **"in the app = paid"** — create/customize/join/
play all work freely. The hub owns payment. Listed only to show where a gate would conceptually
sit.

---

## 8. Risks (product)
- **Live P2P fails in front of judges.** *Highest risk.* *Mitigation:* build same-device fallback
  FIRST; rehearse so the fallback is a seamless plan B, not an apology.
- **Six games dilute polish.** *Mitigation:* Bingo + Counter are the polished MVP; the other four
  ship on the shared core only if they don't compromise the core two.
- **Broker blocked by the sandbox.** *Mitigation:* detect and auto-route to same-device mode;
  optionally self-host a tiny PeerServer later. (Join UX itself is easy — just a code/link.)
- **Empty-content friction.** *Mitigation:* starter packs + remember last lists.
- **Inappropriate UGC about a named professor.** *Mitigation:* everything stays client-local
  (nothing published anywhere); frame packs as affectionate.
