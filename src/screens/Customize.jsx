import React from 'react';
import { useStore } from '../state/store.jsx';

// Stub — content authoring + starter packs land in Step 10.
export default function Customize() {
  const { navigate } = useStore();
  return (
    <>
      <div className="top"><span className="stealth"><span className="dot" />התאמה אישית</span></div>
      <h2 className="h-screen">תוכן המשחק</h2>
      <p className="sub-screen">בקרוב — עריכת תוכן וחבילות מוכנות.</p>
      <div className="spacer" />
      <button className="btn primary" onClick={() => navigate('invite')}>המשך</button>
      <button className="btn dim" onClick={() => navigate('pick')}>חזרה</button>
    </>
  );
}
