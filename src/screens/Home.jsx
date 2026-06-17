import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/store.jsx';

export default function Home() {
  const { state, set, navigate, toast } = useStore();
  const [code, setCode] = useState('');
  const inputRef = useRef(null);

  // pick up a ?room=CODE deep link into the join field
  useEffect(() => {
    const room = new URLSearchParams(window.location.search).get('room');
    if (room) setCode(room.toUpperCase().slice(0, 6));
  }, []);

  const clock = useClock();

  function createRoom() {
    set({ role: 'host', mode: 'peerjs', selectedGame: null });
    navigate('pick');
  }

  function joinRoom() {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) {
      toast('צריך קוד בן 6 תווים');
      inputRef.current?.focus();
      return;
    }
    set({ role: 'join', mode: 'peerjs', roomCode: c });
    // Step 09 wires the actual connect; for now land in the join flow.
    navigate('lobby');
  }

  function soloMode() {
    set({ role: 'host', mode: 'loopback', selectedGame: null });
    navigate('pick');
  }

  return (
    <>
      <div className="top">
        <span className="stealth"><span className="dot" />שקט · מצב חשאי</span>
        <span>{clock} ▮▮▮</span>
      </div>

      <div className="home-hero">
        <div className="badge">🤫</div>
        <div className="wordmark">מתחת <span className="u">לשולחן</span></div>
        <div className="tag">משחקים קטנים. הרצאה אחת ארוכה. הם לא ישימו לב.</div>
      </div>

      <div className="home-actions">
        <button className="btn primary" onClick={createRoom}>צור חדר</button>
        <div className="joinrow">
          <input
            ref={inputRef}
            className="code-in"
            placeholder="קוד חדר"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
            inputMode="text"
            autoCapitalize="characters"
            aria-label="קוד חדר"
          />
          <button className="btn ghost" style={{ width: 'auto', paddingInline: 18 }} onClick={joinRoom}>הצטרף</button>
        </div>
        <button className="nudge" onClick={soloMode} aria-label="מצב מכשיר אחד">
          <span className="e">📱</span>
          <div>
            <b>אין עם מי? מצב מכשיר אחד</b>
            <span>מעבירים טלפון אחד בשולחן — בלי רשת בכלל.</span>
          </div>
        </button>
      </div>
    </>
  );
}

function useClock() {
  const [t, setT] = useState(() => formatTime());
  useEffect(() => {
    const id = setInterval(() => setT(formatTime()), 1000 * 20);
    return () => clearInterval(id);
  }, []);
  return t;
}
function formatTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
