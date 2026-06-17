/* 6-char room codes for the Kahoot-style join. Unambiguous charset (no 0/O/1/I/L), namespaced
   to a PeerJS id, with a shareable link + ?room= deep-link parsing. */

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no I, L, O, 0, 1
const PREFIX = 'utd-';

export function generateCode(len = 6) {
  let out = '';
  const n = CHARSET.length;
  const rand = (max) => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] % max;
    }
    return Math.floor(Math.random() * max);
  };
  for (let i = 0; i < len; i++) out += CHARSET[rand(n)];
  return out;
}

export function normalizeCode(input) {
  return String(input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    // map common look-alikes a user might type into our charset
    .replace(/0/g, 'O').replace(/O/g, 'Q').replace(/1/g, 'J').replace(/I/g, 'J').replace(/L/g, 'J')
    .slice(0, 6);
}

export function isValidCode(code) {
  return typeof code === 'string' && code.length === 6 && [...code].every((c) => CHARSET.includes(c));
}

export function toPeerId(code) {
  return PREFIX + code;
}
export function fromPeerId(peerId) {
  return peerId && peerId.startsWith(PREFIX) ? peerId.slice(PREFIX.length) : peerId;
}

export function buildJoinLink(code) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?room=${code}`;
}

export function parseRoomParam() {
  try {
    const code = new URLSearchParams(window.location.search).get('room');
    return code ? code.toUpperCase().slice(0, 6) : null;
  } catch {
    return null;
  }
}
