import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store.jsx';
import { gameRegistry, GAME_META } from '../games/gameRegistry.js';

/* Mounts the active game's player component against the room link. The host additionally runs
   the game's authoritative hostLogic inside HostRoom. Joiner wiring (live P2P) reuses the same
   component with a JoinRoom link in Step 09 — the component never knows the difference. */
export default function GameShell() {
  const { state, set, navigate, ensureHost } = useStore();
  const gameId = state.selectedGame;
  const meta = GAME_META[gameId];
  const entry = gameRegistry[gameId] || meta;
  const startedRef = useRef(false);

  const [players, setPlayers] = useState([]);

  // For now the device is always the host (loopback). Live joiners arrive in Step 09.
  const ctrl = ensureHost();
  const link = ctrl.link;

  useEffect(() => {
    const off = ctrl.onRoster(setPlayers);
    const offMsg = link.onMessage((msg) => {
      if (msg.t === 'end') {
        ctrl.stopBots();
        set({
          results: {
            game: gameId,
            accent: gameId,
            title: meta.title,
            icon: meta.icon,
            ...msg.results,
          },
        });
        navigate('results');
      }
    });

    if (!startedRef.current) {
      startedRef.current = true;
      const config = state.config[gameId] || entry.defaultConfig || {};
      // same-device: seat companions + start their bots (subscribe) BEFORE the host broadcast.
      if (state.mode === 'loopback') {
        ctrl.seedDemoSeats();
        ctrl.startBots(entry.createBot, config);
      }
      ctrl.startGame(gameId, config, entry.createHostLogic);
    }

    // NOTE: do not stop bots here. Effect cleanup also runs under StrictMode's double-invoke,
    // which would kill the bots while startedRef blocks the restart. Bots are stopped on 'end'
    // and on controller.destroy()/resetSession.
    return () => {
      off();
      offMsg();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GameComponent = entry.Component;
  const config = state.config[gameId] || entry.defaultConfig || {};
  // The device is the host for now; its player id/name must match HostRoom's host identity.
  const me = { ...state.me, id: 'host', name: state.me.name || 'מנחה' };

  return (
    <div data-accent={gameId} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {GameComponent ? (
        <GameComponent
          link={link}
          isHost={true}
          me={me}
          players={players}
          config={config}
          controller={ctrl}
        />
      ) : (
        <StubBoard meta={meta} onEnd={() => ctrl.endGame(stubResults(players, meta))} onBack={() => navigate('pick')} />
      )}
    </div>
  );
}

function stubResults(players, meta) {
  const scores = players.map((p, i) => ({ id: p.id, name: p.name, color: p.color, pts: 0, detail: '—' }));
  return { banner: meta.title, sub: 'דמו', scores, winnerId: scores[0] && scores[0].id };
}

function StubBoard({ meta, onEnd, onBack }) {
  return (
    <>
      <div className="game-top">
        <div className="game-ico">{meta.icon}</div>
        <div>
          <div className="gt">{meta.title}</div>
          <div className="gs">{meta.tagline}</div>
        </div>
        <div className="live">● LIVE</div>
      </div>
      <div className="reaction-stage idle">
        <div className="big" style={{ fontSize: 30 }}>{meta.icon}</div>
        <div className="hint">המשחק הזה בבנייה</div>
      </div>
      <div className="bingo-cta">
        <button className="btn primary" onClick={onEnd}>סיום ←</button>
        <button className="btn dim" onClick={onBack}>חזרה</button>
      </div>
    </>
  );
}
