import React, { useEffect, useState } from 'react';
import { buzz } from '../../lib/haptics.js';
import { sfx } from '../../lib/audio.js';

/* Trivia player view. Lock one answer per question (fast + correct = more points). On reveal the
   correct option glows green, a wrong pick goes red, your points-gained pops, and a live scoreboard
   shows between questions. The host drives "חשיפה" → "הבאה" and can answer too. */
export default function Trivia({ link, me, isHost }) {
  const [view, setView] = useState({ phase: 'question', index: 0, total: 0, q: '', options: [], scores: [] });
  const [correct, setCorrect] = useState(null);
  const [dist, setDist] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    const off = link.onMessage((msg) => {
      if (msg.t === 'question') {
        setView({ phase: 'question', index: msg.index, total: msg.total, q: msg.q, options: msg.options, scores: msg.scores || [] });
        setCorrect(null);
        setDist(null);
        setMyAnswer(null);
        setAnsweredCount(0);
      } else if (msg.t === 'answered') {
        setAnsweredCount(msg.count);
      } else if (msg.t === 'reveal') {
        setView({ phase: 'reveal', index: msg.index, total: msg.total, q: msg.q, options: msg.options, scores: msg.scores || [] });
        setCorrect(msg.correct);
        setDist(msg.dist || null);
        buzz([20, 40]);
        sfx('reveal');
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealed = view.phase === 'reveal';
  const myGain = revealed ? (view.scores.find((s) => s.id === me.id) || {}).gained : null;
  const isLast = view.index + 1 >= view.total;

  function answer(i) {
    if (myAnswer != null || revealed) return;
    setMyAnswer(i);
    buzz([14, 22]);
    sfx('lock');
    link.send({ t: 'answer', index: view.index, option: i });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="game-top">
        <div className="game-ico">🧠</div>
        <div>
          <div className="gt">חידון</div>
          <div className="gs">שאלה {Math.min(view.index + 1, view.total || 1)}/{view.total || 1}{!revealed && answeredCount ? ` · ${answeredCount} ענו` : ''}</div>
        </div>
        <div className="live">● LIVE</div>
      </div>

      <div className="poll-q" dir="auto">{view.q}</div>

      <div className="poll-opts">
        {view.options.map((opt, i) => {
          const isMine = myAnswer === i;
          const isCorrect = revealed && correct === i;
          const isWrongMine = revealed && isMine && correct !== i;
          const c = dist ? dist[i] : 0;
          const cls = ['poll-opt', 'trivia-opt'];
          if (isMine && !revealed) cls.push('mine');
          if (isCorrect) cls.push('correct');
          if (isWrongMine) cls.push('wrong');
          return (
            <button key={i} className={cls.join(' ')} onClick={() => answer(i)} disabled={myAnswer != null || revealed} dir="auto">
              <span className="poll-opt-label">{opt}{isMine ? ' ✓' : ''}{isCorrect ? ' ✔' : ''}</span>
              {revealed && <span className="poll-opt-pct">{c}</span>}
            </button>
          );
        })}
      </div>

      {revealed && myGain != null && (
        <div className="presence" style={{ fontWeight: 800 }}>{myGain > 0 ? `+${myGain} נקודות! ⚡` : 'הפעם לא… 😬'}</div>
      )}
      {!revealed && myAnswer != null && (<div className="presence">ננעל ✓ מחכים לשאר…</div>)}

      {revealed && view.scores.length > 0 && (
        <div className="board-scores" style={{ maxHeight: 150, overflowY: 'auto' }}>
          {view.scores.map((s, i) => (
            <div className={`row${s.id === me.id ? ' first' : ''}`} key={s.id}>
              <span className="rk">{i + 1}</span>
              <span className="av" style={{ background: s.color || 'var(--poll)' }}>{(s.name || '?').trim().charAt(0)}</span>
              <span className="nm" dir="auto">{s.name}</span>
              <span className="pts">{s.pts}{s.gained ? ` (+${s.gained})` : ''}</span>
            </div>
          ))}
        </div>
      )}

      {isHost && (
        <div className="bingo-cta">
          {!revealed
            ? <button className="claim" onClick={() => link.send({ t: 'reveal' })}>✦ חשיפת התשובה</button>
            : <button className="btn primary" onClick={() => link.send({ t: 'next' })}>{isLast ? 'סיכום ←' : 'שאלה הבאה ←'}</button>}
        </div>
      )}
    </div>
  );
}
