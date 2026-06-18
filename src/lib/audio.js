/* Asset-free SFX via the Web Audio API (synthesized tones) — keeps the app fully static and
   zero-backend (no audio files to bundle). The AudioContext is created lazily and resumed on the
   first user gesture (every sfx() in gameplay follows a tap). Silent by default is wrong here —
   audio is OFF unless the user opts in *and* "מצב חשאי" (stealth) is fine with quiet rooms, so we
   persist the choice to localStorage. Respects a global mute and degrades to a no-op where Web
   Audio is unavailable. */

const MUTE_KEY = 'utd:muted:v1';

let ctx = null;
let muted = readMuted();
const listeners = new Set();

function readMuted() {
  try {
    // default: muted (covert by nature) — the user flips it on from Home.
    const raw = localStorage.getItem(MUTE_KEY);
    return raw == null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(m) {
  muted = !!m;
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* ignore */ }
  if (!muted) unlock(); // resume the context on the same gesture that unmutes
  listeners.forEach((fn) => { try { fn(muted); } catch { /* */ } });
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

// Subscribe to mute changes (returns an unsubscribe). Used by the Home toggle.
export function onMuteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function ac() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Resume the context on a user gesture (call from a click/touch handler).
export function unlock() {
  const c = ac();
  if (c && c.state === 'suspended') c.resume();
}

function tone(freq, dur, type = 'sine', gain = 0.16, when = 0) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + when;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.04);
}

// A short upward sweep on a single oscillator — used for "reveal"/"join".
function sweep(f0, f1, dur, type = 'sine', gain = 0.14, when = 0) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + when;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.04);
}

export function sfx(kind) {
  if (muted) return;
  switch (kind) {
    // a soft, dry tick for marks/taps — deliberately quiet so it's covert-friendly
    case 'tap':
      tone(420, 0.045, 'sine', 0.09);
      break;
    // a confident two-note lock for a committed vote/answer/prediction
    case 'lock':
      tone(540, 0.06, 'triangle', 0.12);
      tone(760, 0.09, 'triangle', 0.12, 0.06);
      break;
    // a bright rising sweep when results/answers are revealed
    case 'reveal':
      sweep(420, 940, 0.26, 'triangle', 0.14);
      break;
    // a little ascending arpeggio when someone joins the room
    case 'join':
      tone(660, 0.08, 'sine', 0.12);
      tone(990, 0.11, 'sine', 0.12, 0.08);
      break;
    // a periodic milestone burst (Counter every 10)
    case 'milestone':
      [660, 880, 1100].forEach((f, i) => tone(f, 0.12, 'triangle', 0.15, i * 0.06));
      break;
    // the big payoff: a four-note major fanfare
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.17, i * 0.085));
      tone(1568, 0.22, 'sine', 0.1, 0.34);
      break;
    default:
      break;
  }
}
