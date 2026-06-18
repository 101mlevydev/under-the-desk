import React, { useEffect, useState } from 'react';
import { useStore } from './state/store.jsx';
import Home from './screens/Home.jsx';
import PickGame from './screens/PickGame.jsx';
import Customize from './screens/Customize.jsx';
import Invite from './screens/Invite.jsx';
import Lobby from './screens/Lobby.jsx';
import GameShell from './components/GameShell.jsx';
import Results from './screens/Results.jsx';
import { gameRegistry } from './games/gameRegistry.js';

const WIDE_SCREENS = new Set(['invite', 'lobby']);

// Host on a wide viewport gets the "מצב מקרן" projector shell on the gather + game screens.
// Pure width/role read here (no resize subscription needed — useWideHost drives the actual
// layout switch inside the screens; this only widens the shell so it isn't a lonely strip).
function isProjector(state) {
  if (state.role === 'join') return false;
  const wide = typeof window !== 'undefined' && window.innerWidth >= 900;
  if (!wide) return false;
  if (state.screen === 'invite' || state.screen === 'lobby') return true;
  return state.screen === 'game' && state.mode === 'peerjs';
}

export default function AppRouter() {
  const { state } = useStore();

  // re-render on viewport changes so the projector shell engages/releases live
  const [, force] = useState(0);
  useEffect(() => {
    const onResize = () => force((n) => n + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const accent = state.selectedGame && gameRegistry[state.selectedGame]
    ? gameRegistry[state.selectedGame].id
    : 'bingo';

  let screen;
  switch (state.screen) {
    case 'home': screen = <Home />; break;
    case 'pick': screen = <PickGame />; break;
    case 'customize': screen = <Customize />; break;
    case 'invite': screen = <Invite />; break;
    case 'lobby': screen = <Lobby />; break;
    case 'game': screen = <GameShell />; break;
    case 'results': screen = <Results />; break;
    default: screen = <Home />;
  }

  const projector = isProjector(state);
  const wide = projector || (WIDE_SCREENS.has(state.screen) && state.role === 'host');

  return (
    <div className="app" data-accent={accent}>
      <div className={`shell${wide ? ' wide' : ''}${projector ? ' projector' : ''}`}>
        <div className="screen-anim" key={state.screen}>
          {screen}
        </div>
      </div>
      {state.toast && <div className="toast">{state.toast}</div>}
    </div>
  );
}
