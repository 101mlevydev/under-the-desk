import React from 'react';
import { useStore } from '../state/store.jsx';
import { Roster } from '../components/InvitePanel.jsx';
import ConnectionStatus, { StatusPill } from '../components/ConnectionStatus.jsx';

/* Joiner waiting room: shows connection state + roster; the host's "התחל" auto-advances
   everyone into the game (handled by the session listener). Broker failure → fallback. */
export default function Lobby() {
  const { state, navigate, resetSession, fallbackToSoloMode } = useStore();

  return (
    <>
      <div className="top">
        <StatusPill status={state.connection} />
        <span>חדר {state.roomCode}</span>
      </div>

      <ConnectionStatus
        status={state.connection}
        onFallback={fallbackToSoloMode}
        onRetry={() => { resetSession(); navigate('home'); }}
      />

      {state.connection !== 'failed' && (
        <>
          <div className="home-hero" style={{ marginTop: 12 }}>
            <div className="badge" style={{ fontSize: 30 }}>🤫</div>
            <div className="h-screen">
              {state.connection === 'connected' ? 'מחכים שהמנחה יתחיל…' : 'מתחברים לחדר…'}
            </div>
            <div className="sub-screen">
              {state.connection === 'connected' ? 'אתם בפנים. אל תזוזו.' : 'רגע, מוצאים את החדר.'}
            </div>
          </div>

          {state.roster.length > 0 && <Roster roster={state.roster} freshId={state.freshJoinId} />}

          <div className="spacer" />
          <button className="btn dim" onClick={() => { resetSession(); navigate('home'); }}>יציאה</button>
        </>
      )}
    </>
  );
}
