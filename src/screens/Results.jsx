import React from 'react';
import { useStore } from '../state/store.jsx';

// Stub — scoreboard + winner land in Step 05.
export default function Results() {
  const { navigate } = useStore();
  return (
    <>
      <div className="res-top">
        <div className="res-banner">סיבוב הסתיים</div>
      </div>
      <div className="spacer" />
      <button className="btn primary" onClick={() => navigate('lobby')}>סיבוב נוסף ↻</button>
      <button className="btn dim" onClick={() => navigate('home')}>חזרה הביתה</button>
    </>
  );
}
