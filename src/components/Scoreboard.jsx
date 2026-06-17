import React from 'react';

/* Scoreboard — ranked rows. `scores` = [{ id, name, color, pts, detail }] already ordered.
   `winnerId` highlights first place. Numbers/codes stay LTR; user names render dir="auto". */
export default function Scoreboard({ scores = [], winnerId }) {
  return (
    <div className="board-scores">
      {scores.map((s, i) => {
        const first = winnerId ? s.id === winnerId : i === 0;
        return (
          <div className={`row${first ? ' first' : ''}`} key={s.id || i}>
            <span className="rk">{i + 1}</span>
            <span className="av" style={{ background: s.color || 'var(--poll)' }}>
              {(s.name || '?').trim().charAt(0)}
            </span>
            <span className="nm" dir="auto">{s.name}</span>
            <span className="pts">{s.detail != null ? s.detail : s.pts}</span>
          </div>
        );
      })}
    </div>
  );
}
