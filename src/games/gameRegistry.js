/* The plug-in seam: id → { id, title, tagline, icon, accent, component, hostLogic, defaultConfig }.
   Adding a game = adding a folder + an entry here; room/transport/lobby code is untouched.
   Components & hostLogic are filled in per-game in their steps (06+); metadata is defined now. */

export const GAME_META = {
  bingo: {
    id: 'bingo',
    title: 'בינגו מילים',
    tagline: 'סמנו כשהמרצה אומר',
    icon: '🟩',
    accentVar: '--bingo',
    needsContent: true,
  },
  reaction: {
    id: 'reaction',
    title: 'מי ראשון',
    tagline: 'אצבע על המסך, מחכים ל"עכשיו!"',
    icon: '⚡',
    accentVar: '--reaction',
    needsContent: false,
  },
  counter: {
    id: 'counter',
    title: 'מונה אירועים',
    tagline: 'כל פעם שזה קורה — טאפ',
    icon: '🔢',
    accentVar: '--counter',
    needsContent: true,
  },
  poll: {
    id: 'poll',
    title: 'מי צודק',
    tagline: 'שאלה, מצביעים, חושפים',
    icon: '🗳️',
    accentVar: '--poll',
    needsContent: true,
  },
  trivia: {
    id: 'trivia',
    title: 'חידון',
    tagline: 'מהיר יותר = יותר נקודות',
    icon: '🧠',
    accentVar: '--trivia',
    needsContent: true,
  },
  predictions: {
    id: 'predictions',
    title: 'ניחושים',
    tagline: 'נועלים ניחוש, מגלים בסוף',
    icon: '🔮',
    accentVar: '--predict',
    needsContent: true,
  },
};

export const GAME_ORDER = ['bingo', 'reaction', 'counter', 'poll', 'trivia', 'predictions'];

/* gameRegistry is the runtime registry; component + hostLogic are registered by each
   game module as they are built. Until then a game falls back to its metadata only. */
export const gameRegistry = { ...GAME_META };

export function registerGame(id, impl) {
  gameRegistry[id] = { ...gameRegistry[id], ...impl };
}

/* ---- game implementations (each registers component + host logic + optional bot) ---- */
import Bingo from './bingo/Bingo.jsx';
import { createBingoHostLogic } from './bingo/hostLogic.js';
import { createBingoBot } from './bingo/bot.js';

// Temporary "כל מרצה" buzzword list (placeholder copy — final pack + native review at Step 18).
export const TEMP_BINGO_WORDS = [
  'בעצם', 'שאלה טובה', 'טריוויאלי', 'אז…', 'נמשיך', 'ברור', 'המקרן נתקע', '"זוכרים?"',
  'תרגיל לבית', 'בגדול', 'סליחה', 'שנייה', 'נחזור לזה', 'אינטואיטיבי', '"כמובן"', 'יבש',
  'מובן מאליו', 'נגזרת', 'בקיצור', 'לכן', 'מצוין', 'חורג מהזמן', 'בהמשך', 'סוף סוף',
  'נשאיר כתרגיל', 'אינטגרל', 'בלי הוכחה', 'מי שאל?',
];

registerGame('bingo', {
  Component: Bingo,
  createHostLogic: createBingoHostLogic,
  createBot: createBingoBot,
  defaultConfig: { words: TEMP_BINGO_WORDS },
});

import Reaction from './reaction/Reaction.jsx';
import { createReactionHostLogic } from './reaction/hostLogic.js';
import { createReactionBot } from './reaction/bot.js';

registerGame('reaction', {
  Component: Reaction,
  createHostLogic: createReactionHostLogic,
  createBot: createReactionBot,
  defaultConfig: { rounds: 3 },
});
