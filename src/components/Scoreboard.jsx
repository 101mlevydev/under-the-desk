import React, { useEffect, useRef, useState } from 'react';

const REDUCED = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* Animate an integer from 0 → target with an ease-out, so the scoreboard "tallies up" on reveal.
   Falls back to the final value instantly for non-numeric details or reduced-motion. */
function useCountUp(target, { delay = 0, duration = 900 } = {}) {
  const numeric = typeof target === 'number' && Number.isFinite(target);
  const [val, setVal] = useState(() => (numeric && !REDUCED ? 0 : target));
  const raf = useRef(0);
  useEffect(() => {
    if (!numeric || REDUCED) { setVal(target); return; }
    let start = 0;
    const tick = (t) => {
      if (!start) start = t + delay;
      const p = Math.min(1, Math.max(0, (t - start) / duration));
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, numeric, delay, duration]);
  return numeric ? val : target;
}

function ScoreRow({ s, rank, first }) {
  const raw = s.detail != null ? s.detail : s.pts;
  const shown = useCountUp(raw, { delay: rank * 90 });
  return (
    <div className={`row${first ? ' first' : ''}`} style={{ animationDelay: `${rank * 60}ms` }}>
      <span className="rk">{rank + 1}</span>
      <span className="av" style={{ background: s.color || 'var(--poll)' }}>
        {(s.name || '?').trim().charAt(0)}
      </span>
      <span className="nm" dir="auto">{s.name}</span>
      <span className="pts">{shown}</span>
    </div>
  );
}

/* Scoreboard — ranked rows. `scores` = [{ id, name, color, pts, detail }] already ordered.
   `winnerId` highlights first place. Numbers/codes stay LTR; user names render dir="auto".
   Numeric scores count up on mount; rows stagger in (reduced-motion safe). */
export default function Scoreboard({ scores = [], winnerId }) {
  return (
    <div className="board-scores tally-in">
      {scores.map((s, i) => (
        <ScoreRow key={s.id || i} s={s} rank={i} first={winnerId ? s.id === winnerId : i === 0} />
      ))}
    </div>
  );
}
