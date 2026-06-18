import React, { useEffect, useState } from 'react';
import { buzz } from '../../lib/haptics.js';
import { sfx } from '../../lib/audio.js';

/* Poll player view. Tap an option to lock your single vote; until the host reveals, you only see
   how many have voted (suspense). On reveal, animated bars show the distribution. The host gets
   "חשיפה" + "סיום" controls and can vote too. */
export default function Poll({ link, me, isHost }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const off = link.onMessage((msg) => {
      if (msg.t === 'poll') {
        setQuestion(msg.question || '');
        setOptions(msg.options || []);
        setTotal(msg.total || 0);
        setRevealed(!!msg.revealed);
        setCounts(msg.counts || null);
        if (!msg.revealed) setMyVote(null);
      } else if (msg.t === 'voted') {
        setTotal(msg.total);
      } else if (msg.t === 'revealed') {
        setRevealed(true);
        setCounts(msg.counts || []);
        setTotal(msg.total);
        buzz([20, 40]);
        sfx('reveal');
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function vote(i) {
    if (myVote != null || revealed) return;
    setMyVote(i);
    setTotal((t) => t + 1); // optimistic
    buzz([14, 22]);
    sfx('lock');
    link.send({ t: 'vote', option: i });
  }

  const grandTotal = counts ? counts.reduce((a, b) => a + b, 0) : 0;
  const maxCount = counts ? Math.max(1, ...counts) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="game-top">
        <div className="game-ico">🗳️</div>
        <div>
          <div className="gt">מי צודק</div>
          <div className="gs">{revealed ? 'התוצאות' : `${total} הצביעו`}</div>
        </div>
        <div className="live">● LIVE</div>
      </div>

      <div className="poll-q" dir="auto">{question}</div>

      <div className="poll-opts">
        {options.map((opt, i) => {
          const c = counts ? counts[i] : 0;
          const pct = revealed && grandTotal ? Math.round((c / grandTotal) * 100) : 0;
          const isMine = myVote === i;
          const isTop = revealed && c === maxCount && c > 0;
          const cls = ['poll-opt'];
          if (isMine) cls.push('mine');
          if (revealed) cls.push('revealed');
          if (isTop) cls.push('top');
          return (
            <button
              key={i}
              className={cls.join(' ')}
              onClick={() => vote(i)}
              disabled={myVote != null || revealed}
              dir="auto"
            >
              {revealed && <span className="poll-bar" style={{ width: `${maxCount ? (c / maxCount) * 100 : 0}%` }} />}
              <span className="poll-opt-label">{opt}{isMine ? ' ✓' : ''}</span>
              {revealed && <span className="poll-opt-pct">{pct}%</span>}
            </button>
          );
        })}
      </div>

      {!revealed && myVote != null && (
        <div className="presence">ננעל ✓ מחכים לחשיפה…</div>
      )}

      {isHost && (
        <div className="bingo-cta">
          {!revealed
            ? <button className="claim" onClick={() => link.send({ t: 'reveal' })}>✦ חשיפת התוצאות</button>
            : <button className="btn ghost" onClick={() => link.send({ t: 'finish' })}>סיכום ←</button>}
        </div>
      )}
    </div>
  );
}
