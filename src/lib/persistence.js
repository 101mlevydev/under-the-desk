/* localStorage persistence: player identity, user-authored content packs per game, and the last
   config used per game (so a room is instantly replayable). All reads are defensive (corrupt or
   absent storage never crashes — graceful per QUALITY-BAR). */

const ME_KEY = 'utd:me:v1';
const PACKS_KEY = 'utd:packs:v1';
const LAST_KEY = 'utd:last:v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / blocked — non-fatal */
  }
}

export function loadMe() {
  return read(ME_KEY, null);
}
export function saveMe(me) {
  write(ME_KEY, { name: me.name || '', color: me.color });
}

// User-authored packs: { [gameId]: [ { id, name, ...content } ] }
export function loadUserPacks() {
  return read(PACKS_KEY, {});
}
export function saveUserPack(gameId, pack) {
  const all = loadUserPacks();
  const list = all[gameId] || [];
  const idx = list.findIndex((p) => p.id === pack.id);
  if (idx >= 0) list[idx] = pack;
  else list.push(pack);
  all[gameId] = list;
  write(PACKS_KEY, all);
  return all;
}
export function deleteUserPack(gameId, id) {
  const all = loadUserPacks();
  all[gameId] = (all[gameId] || []).filter((p) => p.id !== id);
  write(PACKS_KEY, all);
  return all;
}

// Last config used per game.
export function loadLastConfig(gameId) {
  return read(LAST_KEY, {})[gameId] || null;
}
export function saveLastConfig(gameId, config) {
  const all = read(LAST_KEY, {});
  all[gameId] = config;
  write(LAST_KEY, all);
}
