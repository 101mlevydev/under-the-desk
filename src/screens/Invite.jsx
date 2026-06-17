import React, { useEffect } from 'react';
import { useStore } from '../state/store.jsx';
import InvitePanel from '../components/InvitePanel.jsx';
import ConnectionStatus, { StatusPill } from '../components/ConnectionStatus.jsx';
import { GAME_META } from '../games/gameRegistry.js';

/* Host gathering screen: opens the room over the broker, shows code + link + QR + live roster,
   and starts the game for everyone. On broker failure → same-device fallback (never a wall). */
export default function Invite() {
  const { state, navigate, ensureHost, fallbackToSoloMode } = useStore();
  const meta = GAME_META[state.selectedGame];

  // open the room (PeerJS host) on mount
  useEffect(() => {
    ensureHost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start() {
    navigate('game');
  }

  return (
    <>
      <div className="top">
        <StatusPill status={state.connection} />
        <span>{meta ? `${meta.title} ${meta.icon}` : ''}</span>
      </div>

      <ConnectionStatus status={state.connection} onFallback={fallbackToSoloMode} />

      {state.connection !== 'failed' && (
        <>
          <InvitePanel code={state.roomCode} roster={state.roster} />
          <button className="btn primary" style={{ marginTop: 'auto' }} onClick={start} disabled={!state.roomCode}>
            התחל ▸
          </button>
          <button className="btn dim" onClick={fallbackToSoloMode}>אין רשת? <u>מצב מכשיר אחד</u></button>
        </>
      )}
    </>
  );
}
