import { seededShuffle } from '../../lib/seededShuffle.js';

export const FREE = 12; // center cell (free)

/* The 12 winning lines on a 5×5 board (positions 0..24, row-major). */
export const LINES = [
  { id: 'r0', cells: [0, 1, 2, 3, 4] },
  { id: 'r1', cells: [5, 6, 7, 8, 9] },
  { id: 'r2', cells: [10, 11, 12, 13, 14] },
  { id: 'r3', cells: [15, 16, 17, 18, 19] },
  { id: 'r4', cells: [20, 21, 22, 23, 24] },
  { id: 'c0', cells: [0, 5, 10, 15, 20] },
  { id: 'c1', cells: [1, 6, 11, 16, 21] },
  { id: 'c2', cells: [2, 7, 12, 17, 22] },
  { id: 'c3', cells: [3, 8, 13, 18, 23] },
  { id: 'c4', cells: [4, 9, 14, 19, 24] },
  { id: 'd0', cells: [0, 6, 12, 18, 24] },
  { id: 'd1', cells: [4, 8, 12, 16, 20] },
];

export const LINE_BY_ID = Object.fromEntries(LINES.map((l) => [l.id, l.cells]));

/* Build a player's 5×5 card: a seeded shuffle of the word list with a free center.
   Same (words, seed, playerId) always yields the same card, so the host can re-derive it. */
export function buildCard(words, seed, playerId) {
  const pool = (words || []).filter((w) => w && String(w).trim());
  const shuffled = seededShuffle(pool, `${seed}:${playerId}`);
  const picked = shuffled.slice(0, 24);
  const cells = [];
  let k = 0;
  for (let i = 0; i < 25; i++) {
    if (i === FREE) cells.push({ word: '', free: true });
    else cells.push({ word: picked[k++] || '—', free: false });
  }
  return cells;
}

/* All currently-complete lines given a set of marked positions (free center counts). */
export function completedLines(marks) {
  const m = new Set(marks);
  m.add(FREE);
  return LINES.filter((l) => l.cells.every((c) => m.has(c)));
}
