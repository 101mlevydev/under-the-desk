# מתחת לשולחן — Under the Desk

> Covert multiplayer mini-games for surviving lectures. A host spins up a room, picks a game,
> customizes it with their own lecturer's vocabulary, and friends join with a **6-character code
> or a link** — Kahoot-style. Play under the desk while the lecture drones on.

**Role in the suite:** the live "theater" piece. A few phones joining a room and playing together
is the most memorable demo moment. Joining is brokered by the free **PeerJS** public service, so
codes/links/remote-join "just work"; gameplay then runs **peer-to-peer**. A bulletproof
**same-device fallback** means a locked-down network can never kill the demo.

---

## At a glance

| | |
|---|---|
| **Audience** | BGU students sitting through lectures together |
| **Language / direction** | Hebrew, **RTL** UI |
| **Backend** | **None that we run.** Signaling via the free **PeerJS public broker**; gameplay is peer-to-peer (WebRTC). |
| **Joining** | **Kahoot-style 6-char room code + shareable link + QR**; remote join works |
| **Persistence** | `localStorage` (saved content packs, local scores) |
| **Content** | **User-created** per lecture (+ optional starter packs) |
| **Core stack** | Vite + React · **PeerJS** (public broker) · QR (for the link) · localStorage |
| **Multiplayer scope** | **Small rooms (~2–8)** — host is an authoritative star hub |
| **Fallback** | **Same-device hot-seat / pass-the-phone** — works fully offline if the broker is blocked |
| **Paywall** | Out of our scope — the hub gates payment; we assume "in the app = paid" |
| **Device** | **Mobile-first**; tablet/laptop friendly (laptop makes a great host/MC screen) |

---

## The six mini-games

All six share one room/connection/sync core (the `Transport` layer + `gameRegistry`), so each new
game is mostly just its own board + rules.

| Game | Hebrew | What happens |
|---|---|---|
| **Buzzword Bingo** | בינגו מילים | Each player gets a random 5×5 card from the host's buzzword list; mark words as the lecturer says them; first line/full card wins. |
| **Event Counter** | מונה אירועים | A shared tally everyone increments when a tracked phrase is said; per-player contribution leaderboard. |
| **Trivia / Quiz** | חידון | Host poses questions; players answer; fastest correct scores most (Kahoot-style). |
| **Live Poll** | מי צודק | Host asks; everyone votes; results revealed live. |
| **Reaction Race** | מי ראשון | Host triggers "now!"; first to tap wins the round. |
| **Lecturer Predictions** | ניחושים | Everyone predicts ("will the lecturer go overtime? projector fail?"); reveal & score at the end. **No betting / no stakes.** |

---

> 🏆 **Built to win.** Held to the suite-wide **[QUALITY-BAR.md](../QUALITY-BAR.md)** —
> top-quality, demo-flawless, zero rough edges. Signature moment: judges' phones join and the live
> **"בינגו!"** lands.

## Documents

1. **[PRD.md](./PRD.md)** — concept, ICP, the create→customize→invite→play flow, all six games,
   judging, paywall note.
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — the PeerJS signaling model, room codes/links, the
   `Transport` abstraction, same-device fallback, per-game state & protocol, CSP notes.
3. **[ROADMAP.md](./ROADMAP.md)** — build order (fallback-first), two-device testing, demo script
   with a network-failure escape hatch, risk register.
4. **[DESIGN-SPEC.md](./DESIGN-SPEC.md)** — the deep build spec (stack, components, screens,
   responsive, how it works).

---

## The one-sentence pitch

> "Turn any boring lecture into a game between your phones: spin up a room, share a 6-letter code,
> load your lecturer's favorite buzzwords, and battle it out — bingo, trivia, predictions — no app
> install, nothing we host."

---

## How joining works (the honest version)

We host **no backend**. To let two phones connect with a short code, the app uses the **free
PeerJS public broker** purely as a matchmaker: the host opens room `K7QF2P`, a joiner enters that
code (or opens the link), the broker introduces them, and from then on **gameplay flows directly
phone-to-phone** — the broker stops mattering. If the BGU sandbox blocks the broker, the app
falls back to **same-device mode** (one phone, passed around), which needs no network at all. See
ARCHITECTURE §2.

---

## Status

📄 **Design phase.** Docs only — no code yet.

## Open content TODOs (tracked, non-blocking)
- Optional **starter packs** for instant demo: a generic "כל מרצה" buzzword set, a few trivia
  questions, sample predictions. Content is otherwise user-generated per lecture.
