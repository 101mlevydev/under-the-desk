import React, { useEffect, useRef, useState } from 'react';
import { buzz } from '../../lib/haptics.js';
import { sfx } from '../../lib/audio.js';

/* Event Counter player view. A big shared total + a giant tap target: every time the lecturer
   says the tracked phrase, everyone taps. The host counts authoritatively; we bump the number
   optimistically for instant feel and reconcile to the host's total on the next broadcast.
   Milestones (every 10) burst. The host also gets a "סיום" control to settle the round. */
export default function Counter({ link, me, isHost }) {
  const [phrase, setPhrase] = useState('');
  const [total, setTotal] = useState(0);
  const [tally, setTally] = useState([]);
  const [mine, setMine] = useState(0);
  const [burst, setBurst] = useState(null); // milestone number
  const [pulse, setPulse] = useState(false);
  const burstTimer = useRef(null);

  useEffect(() => {
    const off = link.onMessage((msg) => {
      if (msg.t === 'state') {
        setPhrase(msg.phrase || '');
        setTotal(msg.total || 0);
        setTally(msg.tally || []);
        const me_ = (msg.tally || []).find((s) => s.id === me.id);
        setMine(me_ ? me_.n : 0);
      } else if (msg.t === 'count') {
        setTotal(msg.total);
        setTally(msg.tally || []);
        const me_ = (msg.tally || []).find((s) => s.id === me.id);
        if (me_) setMine(me_.n);
      } else if (msg.t === 'milestone') {
        setBurst(msg.total);
        buzz([20, 40, 80]);
        sfx('milestone');
        if (burstTimer.current) clearTimeout(burstTimer.current);
        burstTimer.current = setTimeout(() => setBurst(null), 1500);
      }
    });
    return () => { off(); if (burstTimer.current) clearTimeout(burstTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap() {
    setTotal((t) => t + 1); // optimistic
    setMine((m) => m + 1);
    setPulse(true);
    buzz(14);
    sfx('tap');
    link.send({ t: 'tap' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="game-top">
        <div className="game-ico">🔢</div>
        <div>
          <div className="gt">מונה אירועים</div>
          <div className="gs" dir="auto">{phrase ? `סופרים: "${phrase}"` : 'כל פעם שזה קורה — טאפ'}</div>
        </div>
        <div className="live">● LIVE</div>
      </div>

      <button
        className={`counter-stage${pulse ? ' pulse' : ''}`}
        onPointerDown={tap}
        onAnimationEnd={() => setPulse(false)}
        aria-label="ספירה"
      >
        <div className="counter-total">{total}</div>
        <div className="counter-phrase" dir="auto">{phrase ? `"${phrase}"` : ''}</div>
        <div className="counter-tap-hint">הקישו כשזה קורה{mine > 0 ? ` · אתם: ${mine}` : ''}</div>
      </button>

      {tally.length > 0 && (
        <div className="board-scores counter-tally">
          {tally.slice(0, 5).map((s, i) => (
            <div className={`row${s.id === me.id ? ' first' : ''}`} key={s.id}>
              <span className="rk">{i + 1}</span>
              <span className="av" style={{ background: s.color || 'var(--poll)' }}>{(s.name || '?').trim().charAt(0)}</span>
              <span className="nm" dir="auto">{s.name}</span>
              <span className="pts">{s.n}</span>
            </div>
          ))}
        </div>
      )}

      {isHost && (
        <div className="bingo-cta"><button className="btn ghost" onClick={() => link.send({ t: 'finish' })}>סיום וסיכום ←</button></div>
      )}

      {burst != null && (
        <div className="confetti win-overlay" aria-live="assertive">
          <div className="win-card milestone-zoom">
            <div className="res-banner milestone-num" style={{ fontSize: 64 }}>{burst}!</div>
            <div className="res-sub">עוד עשרה 🎉</div>
          </div>
        </div>
      )}
    </div>
  );
}
