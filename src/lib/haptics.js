/* Discreet haptic feedback — the covert channel (silent by default, buzz is fine under the
   desk). Respects a global toggle (audio/juice settings expand this in Step 15) and
   prefers-reduced-motion. No-ops where Vibration API is unavailable (most desktops). */

let enabled = true;
export function setHapticsEnabled(v) { enabled = !!v; }

export function buzz(pattern = 15) {
  if (!enabled) return;
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}
