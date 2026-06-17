import React from 'react';
import { useStore } from '../state/store.jsx';

// Stub — roster + host start land in Step 09.
export default function Lobby() {
  const { state, navigate } = useStore();
  return (
    <>
      <div className="top"><span className="stealth"><span className="dot" />בלובי</span></div>
      <h2 className="h-screen">לובי</h2>
      <p className="sub-screen">{state.role === 'host' ? 'מחכים לשחקנים…' : 'מחכים למנחה…'}</p>
      <div className="spacer" />
      {state.role === 'host' && (
        <button className="btn primary" onClick={() => navigate('game')}>התחל ▸</button>
      )}
      <button className="btn dim" onClick={() => navigate('home')}>יציאה</button>
    </>
  );
}
