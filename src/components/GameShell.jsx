import React, { useEffect, useRef } from 'react';
import { useStore } from '../state/store.jsx';
import { gameRegistry, GAME_META } from '../games/gameRegistry.js';

/* Mounts the active game's player component against the room link. The HOST also starts the
   game (and, in loopback, seeds companion seats + bots). A JOINER just mounts the same
   component with its JoinRoom link — the host drives start/end. Roster + end are handled by the
   centralized session listener (store.wireSession). */
export default function GameShell() {
  const { state, ensureHost, controllerRef } = useStore();
  const gameId = state.selectedGame;
  const meta = GAME_META[gameId];
  const entry = gameRegistry[gameId] || meta;
  const startedRef = useRef(false);

  const ctrl = state.role === 'join' ? controllerRef.current : ensureHost();

  useEffect(() => {
    if (!ctrl || state.role === 'join') return; // joiner waits for the host's broadcasts
    if (startedRef.current) return;
    startedRef.current = true;
    const config = state.config[gameId] || entry.defaultConfig || {};
    if (state.mode === 'loopback') {
      ctrl.seedDemoSeats();
      ctrl.startBots(entry.createBot, config);
    }
    ctrl.startGame(gameId, config, entry.createHostLogic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Joiner: pull the current game state on mount, in case we mounted a beat after the
  // host's initial broadcast and missed it. The host replies targeted (to us only), so
  // this can never reset another player's board.
  useEffect(() => {
    if (!ctrl || state.role !== 'join') return;
    ctrl.link.send({ t: 'sync' });
    const id = setTimeout(() => ctrl.link.send({ t: 'sync' }), 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ctrl || !meta) {
    return <div className="reaction-stage idle"><div className="hint">טוען…</div></div>;
  }

  const GameComponent = entry.Component;
  const config = state.config[gameId] || entry.defaultConfig || {};
  const isHost = state.role !== 'join';
  const me = isHost
    ? { ...state.me, id: 'host', name: state.me.name || 'מנחה' }
    : { ...state.me, id: ctrl.transport && ctrl.transport.id ? ctrl.transport.id : 'me' };

  return (
    <div data-accent={gameId} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {GameComponent ? (
        <GameComponent link={ctrl.link} isHost={isHost} me={me} players={state.roster} config={config} controller={ctrl} />
      ) : (
        <StubBoard meta={meta} isHost={isHost} onEnd={() => ctrl.endGame(stubResults(state.roster, meta))} />
      )}
    </div>
  );
}

function stubResults(players, meta) {
  const scores = (players || []).map((p) => ({ id: p.id, name: p.name, color: p.color, pts: 0, detail: '—' }));
  return { banner: meta.title, sub: 'דמו', scores, winnerId: scores[0] && scores[0].id };
}

function StubBoard({ meta, onEnd, isHost }) {
  return (
    <>
      <div className="game-top">
        <div className="game-ico">{meta.icon}</div>
        <div><div className="gt">{meta.title}</div><div className="gs">{meta.tagline}</div></div>
        <div className="live">● LIVE</div>
      </div>
      <div className="reaction-stage idle">
        <div className="big" style={{ fontSize: 30 }}>{meta.icon}</div>
        <div className="hint">המשחק הזה בבנייה</div>
      </div>
      {isHost && (
        <div className="bingo-cta"><button className="btn primary" onClick={onEnd}>סיום ←</button></div>
      )}
    </>
  );
}
