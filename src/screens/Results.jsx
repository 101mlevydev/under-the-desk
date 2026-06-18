import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store.jsx';
import Scoreboard from '../components/Scoreboard.jsx';
import { sfx } from '../lib/audio.js';

const CONFETTI = ['🎉', '✨', '🎊', '⭐', '🟩', '🎈', '💫', '🏆', '🥳', '🎉', '✨', '⭐'];

const SHARE_URL_OVERRIDE = '';
const shareUrl = (extra = '') => (SHARE_URL_OVERRIDE || (location.origin + location.pathname)) + extra;
const shareWhatsApp = (msg, url) => window.open('https://wa.me/?text=' + encodeURIComponent(msg + ' ' + url), '_blank');

export default function Results() {
  const { state, navigate, resetSession } = useStore();
  const r = state.results || { banner: 'סיבוב הסתיים', scores: [] };
  const winner = (r.scores || []).find((s) => s.id === r.winnerId) || (r.scores || [])[0];
  const [sharePrompt, setSharePrompt] = useState(false);

  // the big payoff — sound the fanfare once when the results screen lands, then slide up a
  // dismissible "spread it" share prompt a beat later (the virality nudge, never blocking).
  useEffect(() => {
    sfx('win');
    const id = setTimeout(() => setSharePrompt(true), 1200);
    return () => clearTimeout(id);
  }, []);

  // punchy, demo-ready WhatsApp copy — names the moment, not just "we played a game"
  const shareMsg = winner
    ? `${winner.name} ניצח/ה אצלנו ב"מתחת לשולחן" 😏 בהרצאה הכי משעממת. בואו תנצחו אתכם:`
    : 'שיחקנו עכשיו "מתחת לשולחן" באמצע ההרצאה 😏 בואו לשחק גם:';

  function doShare() {
    sfx('lock');
    shareWhatsApp(shareMsg, shareUrl());
    setSharePrompt(false);
  }

  function anotherRound() {
    // back to pick a game in the same room/session (the controller stays open)
    navigate('pick');
  }
  function home() {
    resetSession();
    navigate('home');
  }

  return (
    <div data-accent={r.accent || 'bingo'} style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
      <div className="confetti rich" aria-hidden>
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            style={{
              insetInlineStart: `${4 + (i * 8.1) % 92}%`,
              animationDelay: `${(i * 0.21) % 2.4}s`,
              animationDuration: `${2.2 + (i % 4) * 0.5}s`,
              fontSize: `${13 + (i % 3) * 5}px`,
            }}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="res-top">
        <div className="res-banner res-pop">{r.banner || 'סיום'}</div>
        {r.sub && <div className="res-sub">{r.sub}</div>}
      </div>

      <div className="winner winner-celebrate">
        <div className="crown">👑</div>
        {winner && <div className="winner-name" dir="auto">{winner.name}</div>}
      </div>

      <Scoreboard scores={r.scores || []} winnerId={r.winnerId} />

      <div className="spacer" />

      {sharePrompt && (
        <div className="share-prompt" role="dialog" aria-label="שיתוף">
          <button className="share-x" onClick={() => setSharePrompt(false)} aria-label="סגירה">×</button>
          <div className="share-emoji">📣</div>
          <div className="share-copy">
            <b>תפיצו את זה.</b>
            <span>שלחו לחבר/ה שתקוע/ה בהרצאה אחרת — שייכנסו לסיבוב הבא.</span>
          </div>
          <button className="btn primary share-go" onClick={doShare}>שלח בוואטסאפ 📤</button>
        </div>
      )}

      <div className="stack">
        <button className="btn dim" onClick={doShare}>📤 שתף</button>
        <button className="btn primary" onClick={anotherRound}>סיבוב נוסף ↻</button>
        <button className="btn dim" onClick={home}>חזרה הביתה · <u>בחרו משחק אחר</u></button>
      </div>
    </div>
  );
}
