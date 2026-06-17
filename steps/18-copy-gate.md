# Step 18 — Copy gate (Hebrew deadpan slang + starter packs) ⛔ APPROVAL

**Phase:** Gate · **Status:** todo · **Depends on:** 16, 17

## Goal
All player-facing text in authentic, natural Hebrew with a **deadpan-conspiratorial** voice (upbeat
only at wins) — **must never read as AI**.

## Do
- `src/lib/copy.js` — centralize every string: chrome/status ("הם לא ישימו לב", "פותח חדר…",
  "מחכים למנחה…", "דנה התנתקה"), the six game labels/prompts, win lines ("בינגו!"), the
  same-device nudge, error/fallback prompts.
- Finalize `public/starter-packs.json` — the **"כל מרצה"** buzzword set + sample trivia +
  predictions, BGU/engineering-flavored insider humor ("בעצם", "טריוויאלי", "נשאיר כתרגיל לבית").
- Produce `design/copy-review.md` listing all strings for the owner / a native speaker to edit.

## Files
- `src/lib/copy.js`, `public/starter-packs.json`, `design/copy-review.md`

## Done-when
- [ ] All strings centralized; one consistent voice; **owner/native speaker approved** the Hebrew +
      packs.

## Verify
- Present `copy-review.md`; apply edits. ⛔ STOP for approval before final acceptance. Commit
  `step 18: copy`.

## ⛔ STOP — do not proceed to Step 19 until the owner approves the copy.
