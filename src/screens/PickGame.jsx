import React from 'react';
import { useStore } from '../state/store.jsx';
import { GAME_META, GAME_ORDER } from '../games/gameRegistry.js';

export default function PickGame() {
  const { state, set, navigate, controllerRef } = useStore();
  const roomOpen = !!controllerRef.current; // a peerjs room already gathered players

  function pick(id) {
    const meta = GAME_META[id];
    set({ selectedGame: id, results: null });
    if (meta.needsContent) {
      navigate('customize');
    } else if (state.mode === 'peerjs' && !roomOpen) {
      navigate('invite'); // first game: gather players
    } else {
      navigate('game'); // same-device, or another round in an open room
    }
  }

  return (
    <>
      <div className="top">
        <span className="stealth"><span className="dot" />{state.mode === 'loopback' ? 'מצב מכשיר אחד' : 'בחירת משחק'}</span>
        <span>בחרו משחק</span>
      </div>
      <h2 className="h-screen">מה משחקים?</h2>
      <p className="sub-screen">שישה משחקים. כל אחד עם צבע משלו.</p>

      <div className="card-grid" style={{ marginTop: 14 }}>
        {GAME_ORDER.map((id) => {
          const m = GAME_META[id];
          return (
            <button key={id} className="gcard" data-accent={id} onClick={() => pick(id)}>
              <div className="gico">{m.icon}</div>
              <div className="gname">{m.title}</div>
              <div className="gdesc">{m.tagline}</div>
            </button>
          );
        })}
      </div>

      <div className="spacer" />
      <button className="btn dim" onClick={() => navigate('home')}>חזרה</button>
    </>
  );
}
