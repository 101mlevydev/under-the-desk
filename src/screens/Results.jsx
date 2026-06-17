import React from 'react';
import { useStore } from '../state/store.jsx';
import Scoreboard from '../components/Scoreboard.jsx';

const CONFETTI = ['🎉', '✨', '🎊', '⭐', '🟩'];

const SHARE_URL_OVERRIDE = '';
const shareUrl = (extra = '') => (SHARE_URL_OVERRIDE || (location.origin + location.pathname)) + extra;
const shareWhatsApp = (msg, url) => window.open('https://wa.me/?text=' + encodeURIComponent(msg + ' ' + url), '_blank');

export default function Results() {
  const { state, navigate, resetSession } = useStore();
  const r = state.results || { banner: 'סיבוב הסתיים', scores: [] };
  const winner = (r.scores || []).find((s) => s.id === r.winnerId) || (r.scores || [])[0];

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
      <div className="confetti" aria-hidden>
        {CONFETTI.map((c, i) => (
          <span key={i} style={{ insetInlineStart: `${12 + i * 19}%`, animationDelay: `${i * 0.45}s` }}>{c}</span>
        ))}
      </div>

      <div className="res-top">
        <div className="res-banner">{r.banner || 'סיום'}</div>
        {r.sub && <div className="res-sub">{r.sub}</div>}
      </div>

      <div className="winner"><div className="crown">👑</div></div>
      {winner && <div className="res-sub" style={{ textAlign: 'center' }}>{winner.name}</div>}

      <Scoreboard scores={r.scores || []} winnerId={r.winnerId} />

      <div className="spacer" />
      <div className="stack">
        <button
          className="btn dim"
          onClick={() => shareWhatsApp('שיחקנו עכשיו מתחת לשולחן 😏 בואו לשחק גם:', shareUrl())}
        >
          📤 שתף
        </button>
        <button className="btn primary" onClick={anotherRound}>סיבוב נוסף ↻</button>
        <button className="btn dim" onClick={home}>חזרה הביתה · <u>בחרו משחק אחר</u></button>
      </div>
    </div>
  );
}
