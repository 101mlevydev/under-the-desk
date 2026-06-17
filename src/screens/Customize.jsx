import React from 'react';
import { useStore } from '../state/store.jsx';
import ContentEditor from '../components/ContentEditor.jsx';
import { saveLastConfig } from '../lib/persistence.js';

export default function Customize() {
  const { state, set, navigate, controllerRef } = useStore();
  const gameId = state.selectedGame;
  const roomOpen = !!controllerRef.current;
  const next = state.mode === 'peerjs' && !roomOpen ? 'invite' : 'game';

  function onContinue(config) {
    saveLastConfig(gameId, config);
    set({ config: { ...state.config, [gameId]: config } });
    navigate(next);
  }

  return <ContentEditor gameId={gameId} onContinue={onContinue} onBack={() => navigate('pick')} />;
}
