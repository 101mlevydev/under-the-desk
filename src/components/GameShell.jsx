import React from 'react';
import { useStore } from '../state/store.jsx';

// Stub — mounts the active game component against the room in Step 05.
export default function GameShell() {
  const { navigate } = useStore();
  return (
    <>
      <div className="top"><span className="stealth"><span className="dot" />משחק</span></div>
      <h2 className="h-screen">משחק</h2>
      <p className="sub-screen">בקרוב.</p>
      <div className="spacer" />
      <button className="btn primary" onClick={() => navigate('results')}>סיום</button>
    </>
  );
}
