import React, { useEffect, useRef, useState } from 'react';
import { buzz } from '../../lib/haptics.js';
import { sfx } from '../../lib/audio.js';

/* Reaction Race player view. Big tap stage: wait (don't touch) → "עכשיו!" → tap. Shows your
   ms instantly (local) while the host ranks authoritatively. Early taps are flagged. */
export default function Reaction({ link, me }) {
  const [phase, setPhase] = useState('wait'); // wait | go | tapped | early | result
  const [round, setRound] = useState({ round: 1, total: 3 });
  const [myMs, setMyMs] = useState(null);
  const [result, setResult] = useState(null); // { order, winnerId }
  const goAtRef = useRef(0);
  const goIdRef = useRef(0);

  useEffect(() => {
    const off = link.onMessage((msg) => {
      if (msg.t === 'arm') {
        setRound({ round: msg.round, total: msg.total });
        setPhase('wait');
        setMyMs(null);
        setResult(null);
      } else if (msg.t === 'go') {
        goAtRef.current = performance.now();
        goIdRef.current = msg.goId;
        setPhase('go');
        buzz(20);
        sfx('reveal');
      } else if (msg.t === 'falsestart') {
        if (msg.id === me.id) setPhase('early');
      } else if (msg.t === 'roundresult') {
        setResult({ order: msg.order, winnerId: msg.winnerId, penalized: msg.penalized });
        setPhase((p) => (p === 'early' ? 'early' : 'result'));
        sfx(msg.winnerId === me.id ? 'win' : 'lock');
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap() {
    if (phase === 'go') {
      const ms = Math.round(performance.now() - goAtRef.current);
      setMyMs(ms);
      setPhase('tapped');
      buzz([15, 25]);
      sfx('tap');
      link.send({ t: 'tap', goId: goIdRef.current });
    } else if (phase === 'wait') {
      // jumped early — let the host penalize; show locally too
      setPhase('early');
      link.send({ t: 'tap', goId: goIdRef.current });
    }
  }

  const myPlace = result && result.order ? result.order.findIndex((o) => o.id === me.id) : -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="game-top">
        <div className="game-ico">⚡</div>
        <div>
          <div className="gt">מי ראשון</div>
          <div className="gs">סיבוב {round.round}/{round.total}</div>
        </div>
        <div className="live">● LIVE</div>
      </div>

      <div
        className={`reaction-stage ${phase === 'go' ? 'go' : phase === 'wait' ? 'wait' : 'idle'}`}
        onPointerDown={tap}
        role="button"
        aria-label="אזור תגובה"
      >
        {phase === 'wait' && (<><div className="big" style={{ fontSize: 26 }}>התכוננו…</div><div className="hint">אל תיגעו עד "עכשיו!"</div></>)}
        {phase === 'go' && (<div className="big">עכשיו!</div>)}
        {phase === 'tapped' && (<><div className="reaction-ms">{myMs}ms</div><div className="hint">מחכים לשאר…</div></>)}
        {phase === 'early' && (<><div className="big" style={{ fontSize: 28, color: 'var(--poll)' }}>מוקדם מדי!</div><div className="hint">פסילה — סיבוב הבא</div></>)}
        {phase === 'result' && result && (
          <>
            <div className="big" style={{ fontSize: 26 }}>{myPlace === 0 ? 'הכי מהיר! ⚡' : myMs != null ? `מקום ${myPlace + 1}` : 'לא הספקת'}</div>
            <div className="hint">{result.order[0] ? `${result.order[0].name} — ${result.order[0].ms}ms` : ''}</div>
          </>
        )}
      </div>

      {result && (
        <div className="board-scores" style={{ maxHeight: 150, overflowY: 'auto' }}>
          {result.order.map((o, i) => (
            <div className={`row${o.id === result.winnerId ? ' first' : ''}`} key={o.id}>
              <span className="rk">{i + 1}</span>
              <span className="nm" dir="auto">{o.name}</span>
              <span className="pts">{o.ms}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
