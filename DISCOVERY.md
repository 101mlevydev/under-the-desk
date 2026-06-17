# DISCOVERY — מתחת לשולחן (Under the Desk) · Product & UX/UI

> **How to use this doc.** Product-vision & UX/UI questions only (no tech). Each has my
> **Recommendation + why**, and an **Answer** slot — confirm ("✅") or redirect. Unanswered =
> agreed. Your answers drive the deep design/spec pass.

**The app in one line:** spin up a room, pick & customize a mini-game, invite friends by QR/link,
play phone-to-phone during a lecture. **Emotional target: mischief/togetherness.** **Context:
phone, mid-lecture, social & covert.** **Six games:** Bingo · Counter · Trivia · Poll · Reaction
· Predictions.

---

## A. Vision & positioning

🎯 *Changes:* how hard we lean into the "covert lecture rebellion" identity.

**QA.1 — Core identity — "covert game we play to survive a boring lecture," or a neutral
"multiplayer party games" app?**
- *Recommendation:* **Lean all the way into covert lecture-survival** — the "under the desk"
  identity is the whole personality. — *why:* it's funnier, more shareable, and uniquely BGU/
  student.
- **Answer:** ▮

**QA.2 — Is the comedy at the *lecturer's* expense (buzzwords, "will they go overtime"), and how
far does that go?**
- *Recommendation:* **Gentle, affectionate ribbing of generic lecturer behavior; never a named,
  identifiable person.** — *why:* relatable and safe; naming a real professor is a real risk.
- **Answer:** the user can customize the games based on the relevant lecture

**QA.3 — What is it explicitly NOT?**
- *Recommendation:* Not a study/quiz-for-learning tool, not a big-room Kahoot competitor — a
  **small-group, in-the-moment laugh.** — *why:* matches the zero-infra small-room reality.
- **Answer:** ▮

---

## B. User & context

🎯 *Changes:* group size assumptions, glanceability, noise.

**QB.1 — Typical group size we design for?**
- *Recommendation:* **2–6 friends sitting together.** — *why:* honest to the manual-handshake
  constraint and the social reality of a friend cluster.
- **Answer:** ▮

**QB.2 — Must it be *discreet* (quiet, glanceable, no sound, dark) because they're mid-lecture?**
- *Recommendation:* **Yes — silent by default, dark, big tap targets, glanceable state, fast
  interactions.** — *why:* the context demands not getting caught; this is a real UX constraint.
- **Answer:** ▮

**QB.3 — Does the host need to be physically present with joiners, or could friends be in
different rooms?**
- *Recommendation:* **Assume same room** (they hear the same lecturer). — *why:* the games (Bingo
  on real buzzwords, counting real events) only make sense co-located.
- **Answer:** not mandatory, can be sent via a url link or invitation code of 6 numbers and letters like kahoot to hoin a room

---

## C. The magic moment

🎯 *Changes:* whether the wow is the *connecting* or the *playing*.

**QC.1 — The single best beat — the *joining* ("we're all in!"), or a *win* ("בינגו!")?**
- *Recommendation:* **The shared win moment** (someone shouts "בינגו!" and everyone reacts). —
  *why:* the social payoff is the point; connecting is just the setup.
- **Answer:** ▮

**QC.2 — Should joining a room feel *delightful* (a fun QR scan animation, instant "X joined!"),
or just fast/utilitarian?**
- *Recommendation:* **Fast first, with one small delight** — a satisfying "🎉 דנה הצטרפה" pop. —
  *why:* the handshake is the riskiest UX; keep it quick, reward success lightly.
- **Answer:** ▮

**QC.3 — First 10 seconds for a brand-new host?**
- *Recommendation:* **Big "צור חדר" → pick a game → a pre-filled starter pack so they can invite
  immediately** without typing content first. — *why:* content-entry friction is the #1 drop-off
  risk.
- **Answer:** ▮

---

## D. Journey, screen by screen

🎯 *Changes:* the create/join/lobby/play/results flow.

**QD.1 — Host and joiner: same entry screen with two buttons (Create / Join), or detect from a
link?**
- *Recommendation:* **One screen, two clear buttons; an invite link deep-links straight to Join.**
  — *why:* lowest cognitive load; links "just work."
- **Answer:** ▮

**QD.2 — Is there a lobby (see who's in, host starts), or does play begin on connect?**
- *Recommendation:* **A lightweight lobby** — roster + "התחל" — so the host controls the start. —
  *why:* groups need a beat to gather; host-as-MC fits the games.
- **Answer:** ▮

**QD.3 — After a game ends — results screen then back to lobby to pick another game, or one-and-
done?**
- *Recommendation:* **Results → back to lobby; host can launch another game in the same room.** —
  *why:* keeps the group together across multiple rounds/games.
- **Answer:** ▮

---

## E. UX & interactions

🎯 *Changes:* the handshake feel and in-game inputs.

**QE.1 — The invite/handshake: QR-scan primary, link primary, or both equal?**
- *Recommendation:* **QR primary (they're side by side), link as the share-it-in-WhatsApp
  fallback, paste-code as the last resort.** — *why:* QR is fastest in person; covers the cases.
- **Answer:** ▮

**QE.2 — The manual two-way handshake (host shows code → joiner scans → joiner shows code back →
host scans) is unusual. Hide it behind a slick wizard, or make it a playful "secret handshake"?**
- *Recommendation:* **A guided 2-step wizard with clear status, lightly themed as a "secret
  handshake."** — *why:* turns a technical necessity into on-brand mischief and reduces confusion.
- **Answer:** ▮

**QE.3 — In-game inputs must be one-thumb and discreet — confirm big tap targets, no typing during
play?**
- *Recommendation:* **Yes — all in-game actions are taps; typing only happens in setup.** —
  *why:* discretion + speed mid-lecture.
- **Answer:** ▮

**QE.4 — Should players feel each other's presence live (see others marking, the counter ticking
up from friends)?**
- *Recommendation:* **Yes — subtle live presence** (counter jumps, "3 שחקנים סימנו"). — *why:*
  the togetherness *is* the product; solo-feeling multiplayer is flat.
- **Answer:** ▮

---

## F. UI look & feel

🎯 *Changes:* the visual personality and whether games share a look.

**QF.1 — Visual vibe: sleek dark "stealth mode," playful neon game-show, or cute/handdrawn?**
- *Recommendation:* **Sleek dark stealth-mode base with neon game-show accents during play.** —
  *why:* dark = discreet for the context; neon pops bring the party energy when it's go-time.
- **Answer:** ▮

**QF.2 — Do all six games share one consistent look, or does each get its own color/personality?**
- *Recommendation:* **One shared shell; each game gets a signature accent color + icon.** — *why:*
  cohesion + quick recognition, cheap to build on the shared core.
- **Answer:** ▮

**QF.3 — How "loud" are wins/celebrations given the covert context — full-screen confetti, or
contained?**
- *Recommendation:* **Contained-but-satisfying** (a quick burst, haptic buzz, no blaring sound) —
  with an optional "go loud" only if they're not hiding. — *why:* respects the don't-get-caught
  reality.
- **Answer:** ▮

**QF.4 — Reference apps for the feel (Kahoot, Jackbox, Among Us lobby, iMessage games)?**
- *Recommendation:* **Jackbox's room/lobby energy + Kahoot's answer clarity, toned darker.** —
  *why:* proven party-game patterns students recognize.
- **Answer:** ▮ *(name any)*

---

## G. Content & tone

🎯 *Changes:* starter packs and copy voice.

**QG.1 — Ship starter content so a room is instantly playable (generic buzzwords, sample trivia,
sample predictions)?**
- *Recommendation:* **Yes — a generic "כל מרצה" buzzword pack + a few sample Qs/predictions.** —
  *why:* removes the cold-start typing friction that would kill a live demo.
- **Answer:** ▮

**QG.2 — Should starter packs be BGU-flavored (CS/engineering lecturer clichés) or generic?**
- *Recommendation:* **BGU/engineering-flavored** ("בעצם", "טריוויאלי", "נשאיר כתרגיל לבית"). —
  *why:* insider specificity is the laugh.
- **Answer:** ▮

**QG.3 — Copy voice — deadpan-conspiratorial ("they'll never know"), or upbeat party-host?**
- *Recommendation:* **Deadpan-conspiratorial** in chrome, upbeat only at win moments. — *why:*
  matches the covert identity and is funnier.
- **Answer:** ▮

---

## H. Onboarding & first run

🎯 *Changes:* how the host learns the unusual flow.

**QH.1 — Does the host need a quick "how rooms work" explainer, or learn by doing?**
- *Recommendation:* **Learn by doing**, with the handshake wizard doing the teaching inline. —
  *why:* the only non-obvious part is the handshake; teach it exactly when it happens.
- **Answer:** ▮

**QH.2 — Should the very first launch nudge "no friends nearby? try מצב מכשיר אחד"?**
- *Recommendation:* **Yes — surface same-device mode early** as a no-setup way to try it solo. —
  *why:* lets a lone user (or a judge) experience a game instantly.
- **Answer:** ▮

---

## I. Edge & failure UX (this app's crux)

🎯 *Changes:* how gracefully the demo survives a hostile network.

**QI.1 — When P2P fails (blocked/NAT), how do we present the same-device fallback — as an error
recovery, or as a first-class "mode"?**
- *Recommendation:* **A first-class "מצב מכשיר אחד" always visible, that we also auto-suggest on
  failure** — never an error wall. — *why:* makes the fallback feel intentional, not broken;
  bulletproofs the demo.
- **Answer:** ▮

**QI.2 — If a peer disconnects mid-game, what happens?**
- *Recommendation:* **Game continues for the rest; show "דנה התנתקה"; allow rejoin within the
  session.** — *why:* flaky phone connections shouldn't end the fun.
- **Answer:** ▮

**QI.3 — Camera blocked (can't scan QR) — how visible is the paste-code path?**
- *Recommendation:* **A quiet "אין מצלמה? הדבק קוד" link under the scanner.** — *why:* covers the
  iframe-camera-blocked case without cluttering the happy path.
- **Answer:** ▮

---

## J. Scope & priorities

🎯 *Changes:* which of the six games are core vs nice.

**QJ.1 — Of the six, which TWO must be perfect for the demo?**
- *Recommendation:* **Bingo (signature) + Reaction Race (instant, no content needed, demos fast).**
  — *why:* Bingo is the identity; Reaction needs zero setup so it never stalls a demo.
- **Answer:** ▮

**QJ.2 — Rank the other four to cut first (1=keep, 4=cut first): Trivia · Poll · Counter ·
Predictions.**
- *Recommendation:* keep **Counter** & **Poll** (cheap), then **Trivia**, cut **Predictions**
  first if needed. — *why:* effort-to-payoff; Predictions needs an end-of-lecture loop that's
  harder to demo.
- **Answer:** ▮

**QJ.3 — Is the live P2P essential to the demo, or is a polished same-device suite an acceptable
"win" if networking is too risky?**
- *Recommendation:* **Same-device polished is the floor; live P2P is the ceiling we attempt.** —
  *why:* guarantees a working demo while reaching for the wow.
- **Answer:** ▮

---

## K. Success & demo feel

🎯 *Changes:* the demo script and the participatory beat.

**QK.1 — The demo "wow" — judges' own phones joining, or the host screen driving a shared game?**
- *Recommendation:* **Judges' phones join a Bingo room and one of them wins live.** — *why:*
  participation is the most memorable beat in the whole suite.
- **Answer:** ▮

**QK.2 — One sentence: how should the room feel after the demo?**
- *Recommendation:* "That was genuinely fun — I'd actually do this in a boring lecture." — *why:*
  the social-fun win condition.
- **Answer:** ▮

---

### Done? Confirm/edit above. Pair with `PRODUCT-VISION.md` and the other two `DISCOVERY.md` files.
