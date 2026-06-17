import React from 'react';
import { useStore } from '../state/store.jsx';

// Stub — real six-card picker lands in Step 05.
export default function PickGame() {
  const { navigate } = useStore();
  return (
    <>
      <div className="top"><span className="stealth"><span className="dot" />בחירת משחק</span></div>
      <h2 className="h-screen">בחרו משחק</h2>
      <p className="sub-screen">בקרוב — שישה משחקים.</p>
      <div className="spacer" />
      <button className="btn dim" onClick={() => navigate('home')}>חזרה</button>
    </>
  );
}
