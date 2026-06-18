import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/store.jsx';
import { normalizeCode, isValidCode, parseRoomParam } from '../transport/roomCode.js';
import { saveMe } from '../lib/persistence.js';
import SuiteFooter from '../components/SuiteFooter.jsx';
import { isMuted, toggleMuted, onMuteChange, sfx } from '../lib/audio.js';

export default function Home() {
  const { state, set, navigate, toast, joinAsPlayer } = useStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState(state.me.name || '');
  const inputRef = useRef(null);
  const clock = useClock();
  const muted = useMuted();

  // pick up a ?room=CODE deep link into the join field
  useEffect(() => {
    const room = parseRoomParam();
    if (room) {
      setCode(normalizeCode(room));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  function rememberName() {
    const n = name.trim();
    const me = { ...state.me, name: n };
    set({ me });
    saveMe(me);
    return n;
  }

  function createRoom() {
    rememberName();
    set({ role: 'host', mode: 'peerjs', selectedGame: null, results: null });
    navigate('pick');
  }

  function joinRoom() {
    const c = normalizeCode(code);
    if (!isValidCode(c)) {
      toast('צריך קוד תקין בן 6 תווים');
      inputRef.current?.focus();
      return;
    }
    const n = rememberName();
    joinAsPlayer(c, n);
  }

  function soloMode() {
    rememberName();
    set({ role: 'host', mode: 'loopback', selectedGame: null, results: null });
    navigate('pick');
  }

  return (
    <>
      <div className="top">
        <span className="stealth"><span className="dot" />שקט · מצב חשאי</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="sound-toggle"
            onClick={() => { const m = toggleMuted(); if (!m) sfx('lock'); }}
            aria-pressed={!muted}
            aria-label={muted ? 'הפעלת צלילים' : 'השתקה'}
            title={muted ? 'צלילים כבויים — הקישו להפעלה' : 'צלילים פעילים'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <span>{clock} ▮▮▮</span>
        </span>
      </div>

      <div className="home-hero">
        <div className="badge">🤫</div>
        <div className="wordmark">מתחת <span className="u">לשולחן</span></div>
        <div className="tag">משחקים קטנים. הרצאה אחת ארוכה. הם לא ישימו לב.</div>
      </div>

      <div className="home-actions">
        <input
          className="input"
          placeholder="איך לקרוא לך? (לא חובה)"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 14))}
          aria-label="השם שלך"
          dir="auto"
        />
        <button className="btn primary" onClick={createRoom}>צור חדר</button>
        <div className="joinrow">
          <input
            ref={inputRef}
            className="code-in"
            placeholder="קוד חדר"
            value={code}
            onChange={(e) => setCode(normalizeCode(e.target.value))}
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

      <SuiteFooter />
    </>
  );
}

function useMuted() {
  const [m, setM] = useState(() => isMuted());
  useEffect(() => onMuteChange(setM), []);
  return m;
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
