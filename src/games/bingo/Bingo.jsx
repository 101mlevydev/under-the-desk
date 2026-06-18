import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildCard, completedLines, FREE } from './card.js';
import { buzz } from '../../lib/haptics.js';
import { sfx } from '../../lib/audio.js';

/* Bingo player view (host and joiner alike). Derives its own card from the broadcast seed,
   marks cells optimistically + reports to the host, surfaces the claim CTA when a line is
   complete, and celebrates the host-verified "בינגו!". */
export default function Bingo({ link, me }) {
  const [seed, setSeed] = useState(null);
  const [words, setWords] = useState([]);
  const [marks, setMarks] = useState(() => new Set([FREE]));
  const [presence, setPresence] = useState('');
  const [win, setWin] = useState(null);
  const [reject, setReject] = useState(false);
  const [poppingCell, setPoppingCell] = useState(null);
  const claimedRef = useRef(false);

  useEffect(() => {
    const off = link.onMessage((msg) => {
      if (msg.t === 'state') {
        setSeed(msg.seed);
        setWords(msg.words || []);
        setMarks(new Set([FREE]));
        setWin(null);
        claimedRef.current = false;
      } else if (msg.t === 'presence') {
        if (msg.count >= 2) setPresence(`⌁ ${msg.count} שחקנים סימנו "${msg.word}"`);
      } else if (msg.t === 'win') {
        setWin({ name: msg.winner, mine: msg.winnerId === me.id });
        buzz(msg.winnerId === me.id ? [40, 60, 120] : 30);
        sfx('win');
      } else if (msg.t === 'reject') {
        if (msg.to === me.id) {
          setReject(true);
          setTimeout(() => setReject(false), 1400);
        }
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = useMemo(() => (seed != null ? buildCard(words, seed, me.id) : null), [seed, words, me.id]);

  const lines = useMemo(() => completedLines(marks), [marks]);
  const lineCells = useMemo(() => new Set(lines.flatMap((l) => l.cells)), [lines]);
  const hasLine = lines.length > 0;

  function toggle(i) {
    if (i === FREE || win) return;
    const next = new Set(marks);
    const on = !next.has(i);
    if (on) next.add(i);
    else next.delete(i);
    setMarks(next);
    setPoppingCell(on ? i : null);
    if (on) { buzz(12); sfx('tap'); }
    link.send({ t: 'mark', cell: i, on });
  }

  function claim() {
    if (!hasLine || claimedRef.current || win) return;
    claimedRef.current = true;
    buzz([30, 40, 60]);
    sfx('lock');
    link.send({ t: 'claim', line: lines[0].id });
    // allow a re-claim shortly if host rejects (e.g. line changed)
    setTimeout(() => { claimedRef.current = false; }, 1500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="game-top">
        <div className="game-ico">🟩</div>
        <div>
          <div className="gt">בינגו מילים</div>
          <div className="gs">סמנו כשהמרצה אומר</div>
        </div>
        <div className="live">● LIVE</div>
      </div>

      <div className="presence">{reject ? 'עוד לא — חסר לכם תא בשורה' : presence}</div>

      {card ? (
        <div className="board">
          {card.map((c, i) => {
            const marked = marks.has(i) || c.free;
            const cls = ['cell'];
            if (c.free) cls.push('free');
            else if (marked) cls.push('mark');
            if (lineCells.has(i)) cls.push('line');
            if (poppingCell === i) cls.push('pop');
            return (
              <button
                key={i}
                className={cls.join(' ')}
                onClick={() => toggle(i)}
                onAnimationEnd={() => poppingCell === i && setPoppingCell(null)}
                dir="auto"
              >
                {c.free ? 'חינם ✦' : c.word}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="reaction-stage idle"><div className="hint">מכינים לוח…</div></div>
      )}

      <div className="bingo-cta">
        {hasLine && !win && (
          <button className="claim" onClick={claim}>✦ שורה שלמה! לחצו לקריאת בינגו</button>
        )}
      </div>

      {win && (
        <div className="confetti win-overlay" aria-live="assertive">
          <div className="win-card">
            <div className="res-banner" style={{ fontSize: 44 }}>בינגו!</div>
            <div className="res-sub">{win.mine ? 'השלמת שורה ראשונה 🎉' : `${win.name} השלים${win.name.endsWith('ה') ? 'ה' : ''} שורה`}</div>
          </div>
        </div>
      )}
    </div>
  );
}
