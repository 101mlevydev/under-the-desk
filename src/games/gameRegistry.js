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
