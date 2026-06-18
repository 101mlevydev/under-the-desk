import React, { useEffect, useState } from 'react';
import { buzz } from '../../lib/haptics.js';
import { sfx } from '../../lib/audio.js';

/* Predictions player view. While guessing is open, lock a pick on each prompt. After the host
   locks, picks freeze; as the host marks each real outcome, your right guesses light up green,
   wrong ones dim, and a running tally shows how prophetic you were. The host gets a "נעילה"
   control during guessing and per-prompt outcome chips while locked, then "תוצאות". */
export default function Predictions({ link, me, isHost }) {
  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState('predicting');
  const [actual, setActual] = useState([]);
  const [myPreds, setMyPreds] = useState({});
  const [progress, setProgress] = useState({ ready: 0, total: 0 });

  useEffect(() => {
    const off = link.onMessage((msg) => {
      if (msg.t === 'prompts') {
        setItems(msg.items || []);
        setPhase(msg.phase || 'predicting');
        setActual(msg.actual || (msg.items || []).map(() => null));
        if (msg.phase === 'predicting') setMyPreds({});
      } else if (msg.t === 'progress') {
        setProgress({ ready: msg.ready, total: msg.total });
      } else if (msg.t === 'locked') {
        setPhase('locked');
      } else if (msg.t === 'outcomes') {
        setActual(msg.actual || []);
        buzz([18, 30]);
        sfx('reveal');
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locked = phase === 'locked';

  function predict(i, opt) {
    if (locked) return;
    setMyPreds((p) => ({ ...p, [i]: opt }));
    buzz(14);
    sfx('tap');
    link.send({ t: 'predict', index: i, option: opt });
  }

  const decided = actual.filter((a) => a != null).length;
  let myCorrect = 0;
  items.forEach((_, i) => { if (actual[i] != null && myPreds[i] === actual[i]) myCorrect += 1; });
  const allMine = items.length > 0 && Object.keys(myPreds).length >= items.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="game-top">
        <div className="game-ico">🔮</div>
        <div>
          <div className="gt">ניחושים</div>
          <div className="gs">{locked ? (decided ? `${myCorrect} נכונים · ${decided}/${items.length} הוכרעו` : 'ננעל — מחכים לתוצאות') : 'נעלו ניחוש לכל שורה'}</div>
        </div>
        <div className="live">● LIVE</div>
      </div>

      <div className="predict-list">
        {items.map((it, i) => {
          const mine = myPreds[i];
          const out = actual[i];
          const decidedItem = out != null;
          const hit = decidedItem && mine === out;
          return (
            <div className={`predict-card${decidedItem ? (hit ? ' hit' : ' miss') : ''}`} key={i}>
              <div className="predict-text" dir="auto">
                {it.text}
                {decidedItem && <span className="predict-mark">{mine == null ? '—' : hit ? '✓' : '✗'}</span>}
              </div>
              <div className="predict-opts">
                {it.options.map((opt, oi) => {
                  const selected = mine === oi;
                  const isOutcome = out === oi;
                  const cls = ['predict-chip'];
                  if (selected) cls.push('mine');
                  if (decidedItem && isOutcome) cls.push('actual');
                  return (
                    <button key={oi} className={cls.join(' ')} onClick={() => predict(i, oi)} disabled={locked} dir="auto">
                      {opt}{decidedItem && isOutcome ? ' ←' : ''}
                    </button>
                  );
                })}
              </div>

              {isHost && locked && out == null && (
                <div className="predict-host-mark">
                  <span className="predict-host-q">מה קרה בפועל?</span>
                  <div className="predict-opts">
                    {it.options.map((opt, oi) => (
                      <button key={oi} className="predict-chip host" onClick={() => link.send({ t: 'outcome', index: i, option: oi })} dir="auto">{opt}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!locked && (
        <div className="presence">{allMine ? 'כל הניחושים שלך נעולים ✓' : `${progress.ready}/${progress.total || '?'} סיימו לנחש`}</div>
      )}

      {isHost && (
        <div className="bingo-cta">
          {!locked
            ? <button className="claim" onClick={() => link.send({ t: 'lock' })}>🔒 נעילת הניחושים</button>
            : <button className="btn primary" onClick={() => link.send({ t: 'finish' })} disabled={decided === 0}>תוצאות סופיות ←</button>}
        </div>
      )}
    </div>
  );
}
