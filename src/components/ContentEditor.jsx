import React, { useEffect, useMemo, useState } from 'react';
import { GAME_META } from '../games/gameRegistry.js';
import { loadUserPacks, saveUserPack, loadLastConfig } from '../lib/persistence.js';

/* Per-lecture content authoring + starter-pack loader. Bingo (the signature game) gets a full
   word editor; other content games reuse the same shell as they come online. User content is
   rendered dir="auto" so mixed Hebrew/English displays correctly. */
export default function ContentEditor({ gameId, onContinue, onBack }) {
  const meta = GAME_META[gameId];
  const [packs, setPacks] = useState({ starter: [], user: [] });
  const [words, setWords] = useState([]);
  const [savedNote, setSavedNote] = useState('');

  useEffect(() => {
    let alive = true;
    const url = (import.meta.env.BASE_URL || './') + 'starter-packs.json';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const starter = (data[gameId] || []).map((p) => ({ ...p, kind: 'starter' }));
        const user = (loadUserPacks()[gameId] || []).map((p) => ({ ...p, kind: 'user' }));
        setPacks({ starter, user });
        // seed from last-used, else the first starter pack
        const last = loadLastConfig(gameId);
        if (last && last.words) setWords(last.words);
        else if (starter[0] && starter[0].words) setWords(starter[0].words);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [gameId]);

  const text = useMemo(() => words.join('\n'), [words]);
  const count = words.filter((w) => w && w.trim()).length;
  const enough = count >= 24;

  function loadPack(p) {
    if (p.words) setWords(p.words);
  }
  function onText(v) {
    setWords(v.split('\n').map((s) => s.replace(/\s+/g, ' ').trimStart()));
  }
  function savePack() {
    const name = (prompt('שם לחבילה:', 'הרשימה שלי') || '').trim();
    if (!name) return;
    const id = 'u-' + Date.now().toString(36);
    saveUserPack(gameId, { id, name, words: words.filter((w) => w.trim()) });
    setPacks((prev) => ({ ...prev, user: [...prev.user, { id, name, words, kind: 'user' }] }));
    setSavedNote('נשמר ✓');
    setTimeout(() => setSavedNote(''), 1600);
  }
  function cont() {
    onContinue({ words: words.filter((w) => w.trim()) });
  }

  // Bingo is the only content game built so far; others continue with their defaults for now.
  if (gameId !== 'bingo') {
    return (
      <>
        <Header meta={meta} />
        <p className="sub-screen">המשחק הזה ישתמש בחבילת ברירת המחדל בינתיים.</p>
        <div className="spacer" />
        <button className="btn primary" onClick={() => onContinue({})}>המשך</button>
        <button className="btn dim" onClick={onBack}>חזרה</button>
      </>
    );
  }

  const allPacks = [...packs.starter, ...packs.user];

  return (
    <>
      <Header meta={meta} />

      {allPacks.length > 0 && (
        <>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>חבילות מוכנות</label>
            <div className="chiprow">
              {allPacks.map((p) => (
                <button key={p.id} className="tagchip" onClick={() => loadPack(p)} dir="auto">
                  {p.kind === 'user' ? '★ ' : ''}{p.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="field">
        <label>מילים (אחת בכל שורה) · צריך לפחות 24 ללוח מלא</label>
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => onText(e.target.value)}
          dir="auto"
          placeholder="בעצם&#10;שאלה טובה&#10;טריוויאלי&#10;…"
        />
        <div className="sub-screen" style={{ color: enough ? 'var(--reaction)' : 'var(--counter)' }}>
          {count} מילים {enough ? '✓' : `· עוד ${24 - count} בשביל לוח מלא`}
        </div>
      </div>

      <div className="spacer" />
      <div className="stack">
        <button className="btn primary" onClick={cont} disabled={!enough}>המשך ▸</button>
        <div className="joinrow">
          <button className="btn ghost" onClick={savePack} disabled={count === 0}>{savedNote || 'שמירת חבילה'}</button>
          <button className="btn dim" style={{ width: 'auto', paddingInline: 18 }} onClick={onBack}>חזרה</button>
        </div>
      </div>
    </>
  );
}

function Header({ meta }) {
  return (
    <>
      <div className="top"><span className="stealth"><span className="dot" />התאמה אישית</span><span>{meta ? `${meta.title} ${meta.icon}` : ''}</span></div>
      <h2 className="h-screen">תוכן המשחק</h2>
    </>
  );
}
