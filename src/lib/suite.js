// BGU suite cross-promo. Fill each url with the app's hub sandbox URL at launch
// (one-line swap). Empty url = pill rendered but inert (not clickable).
export const SUITE = [
  { id: 'nuschaon', name: 'נוסחאון',      emoji: '📄', url: '' },
  { id: 'gold',     name: 'מכרה הזהב',     emoji: '⛏️', url: '' },
  { id: 'desk',     name: 'מתחת לשולחן',   emoji: '🎮', url: '' },
  { id: 'beit',     name: 'בית הסטודנט',   emoji: '🏠', url: '' },
];

// This app's own id — used to exclude itself from the footer.
export const SELF_ID = 'desk';
