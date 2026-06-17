import React from 'react';
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

export default function AppRouter() {
  const { state } = useStore();

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

  const wide = WIDE_SCREENS.has(state.screen) && state.role === 'host';

  return (
    <div className="app" data-accent={accent}>
      <div className={`shell${wide ? ' wide' : ''}`}>
        <div className="screen-anim" key={state.screen}>
          {screen}
        </div>
      </div>
      {state.toast && <div className="toast">{state.toast}</div>}
    </div>
  );
}
