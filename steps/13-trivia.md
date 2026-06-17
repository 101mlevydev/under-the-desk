# Step 13 — Trivia (speed-scored quiz)

**Phase:** Other games · **Status:** todo · **Depends on:** 12

## Goal
Trivia / Quiz — host-driven, Kahoot-style, **score = correct × speed**. Extends the Poll
question→answer→reveal pattern with a correct answer + scoring.

## Do
- `src/games/trivia/` — host authors questions (text + options + correct); reveals one at a time;
  players answer; faster-correct = more points; **live scoreboard** between questions
  (`{t:"reveal", correct, tally, scores}`).

## Files
- `src/games/trivia/Trivia.jsx`, `src/games/trivia/hostLogic.js`

## Done-when
- [ ] Host runs a multi-question round; correct + speed scores; scoreboard updates between
      questions and crowns a winner at the end.

## Verify
- Browser MCP two pages: answer fast vs slow, confirm scoring. Commit `step 13: trivia`.
