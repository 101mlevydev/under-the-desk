import React from 'react';
import { useStore } from '../state/store.jsx';

// Stub — code + link + QR + roster land in Step 09.
export default function Invite() {
  const { navigate } = useStore();
  return (
    <>
      <div className="top"><span className="stealth"><span className="dot" />החדר פתוח</span></div>
      <h2 className="h-screen">הזמנה</h2>
      <p className="sub-screen">בקרוב — קוד, קישור ו-QR.</p>
      <div className="spacer" />
      <button className="btn primary" onClick={() => navigate('lobby')}>ללובי</button>
      <button className="btn dim" onClick={() => navigate('pick')}>חזרה</button>
    </>
  );
}
