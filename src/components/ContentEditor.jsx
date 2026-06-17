import React, { useEffect, useMemo, useState } from 'react';
import { GAME_META } from '../games/gameRegistry.js';
import { loadUserPacks, saveUserPack, loadLastConfig } from '../lib/persistence.js';

/* Per-lecture content authoring + starter-pack loader. Each content game gets a tailored editor
   (Bingo words, Counter phrase, Poll question, Trivia questions, Predictions prompts) but they all
   share the same shell: a starter-pack chip row up top, a body, and a validated "המשך" footer.
   User content is rendered dir="auto" so mixed Hebrew/English displays correctly. */
export default function ContentEditor({ gameId, onContinue, onBack }) {
  const meta = GAME_META[gameId];
  const [packs, setPacks] = useState([]);
  const [config, setConfig] = useState(null);
  const [savedNote, setSavedNote] = useState('');

  const editor = EDITORS[gameId];

  useEffect(() => {
    let alive = true;
    const url = (import.meta.env.BASE_URL || './') + 'starter-packs.json';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const starter = (data[gameId] || []).map((p) => ({ ...p, kind: 'starter' }));
        const user = (loadUserPacks()[gameId] || []).map((p) => ({ ...p, kind: 'user' }));
        const all = [...starter, ...user];
        setPacks(all);
        const last = loadLastConfig(gameId);
        if (editor) {
          if (last) setConfig(editor.fromConfig(last));
          else if (all[0]) setConfig(editor.fromPack(all[0]));
          else setConfig(editor.empty());
        }
      })
      .catch(() => { if (alive && editor) setConfig((c) => c || editor.empty()); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Games without a dedicated editor fall back to their default config.
  if (!editor) {
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

  if (config == null) {
    return (<><Header meta={meta} /><div className="reaction-stage idle"><div className="hint">טוען…</div></div></>);
  }

  const valid = editor.valid(config);

  function savePack() {
    const name = (prompt('שם לחבילה:', editor.defaultPackName) || '').trim();
    if (!name) return;
    const id = 'u-' + Date.now().toString(36);
    const pack = { id, name, ...editor.toPack(config) };
    saveUserPack(gameId, pack);
    setPacks((prev) => [...prev, { ...pack, kind: 'user' }]);
    setSavedNote('נשמר ✓');
    setTimeout(() => setSavedNote(''), 1600);
  }

  const Body = editor.Body;

  return (
    <>
      <Header meta={meta} />

      {packs.length > 0 && (
        <div className="field" style={{ marginBottom: 8 }}>
          <label>חבילות מוכנות</label>
          <div className="chiprow">
            {packs.map((p) => (
              <button key={p.id} className="tagchip" onClick={() => setConfig(editor.fromPack(p))} dir="auto">
                {p.kind === 'user' ? '★ ' : ''}{p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Body config={config} setConfig={setConfig} />

      <div className="spacer" />
      <div className="stack">
        <button className="btn primary" onClick={() => onContinue(editor.toConfig(config))} disabled={!valid}>המשך ▸</button>
        <div className="joinrow">
          <button className="btn ghost" onClick={savePack} disabled={!valid}>{savedNote || 'שמירת חבילה'}</button>
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

/* ---- per-game editors ---------------------------------------------------------------------
   Each editor is a small adapter: how to seed from a pack / saved config, validate, render its
   body, and serialize back out. `config` here is editor-local UI state; `toConfig` produces the
   game config object passed to the host logic. */

const bingoEditor = {
  defaultPackName: 'הרשימה שלי',
  empty: () => ({ words: [] }),
  fromPack: (p) => ({ words: p.words || [] }),
  fromConfig: (c) => ({ words: c.words || [] }),
  toPack: (c) => ({ words: c.words.filter((w) => w.trim()) }),
  toConfig: (c) => ({ words: c.words.filter((w) => w.trim()) }),
  valid: (c) => c.words.filter((w) => w && w.trim()).length >= 24,
  Body: function BingoBody({ config, setConfig }) {
    const text = useMemo(() => config.words.join('\n'), [config.words]);
    const count = config.words.filter((w) => w && w.trim()).length;
    const enough = count >= 24;
    return (
      <div className="field">
        <label>מילים (אחת בכל שורה) · צריך לפחות 24 ללוח מלא</label>
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setConfig({ words: e.target.value.split('\n').map((s) => s.replace(/\s+/g, ' ').trimStart()) })}
          dir="auto"
          placeholder="בעצם&#10;שאלה טובה&#10;טריוויאלי&#10;…"
        />
        <div className="sub-screen" style={{ color: enough ? 'var(--reaction)' : 'var(--counter)' }}>
          {count} מילים {enough ? '✓' : `· עוד ${24 - count} בשביל לוח מלא`}
        </div>
      </div>
    );
  },
};

const counterEditor = {
  defaultPackName: 'הביטוי שלי',
  empty: () => ({ phrase: '' }),
  fromPack: (p) => ({ phrase: p.phrase || '' }),
  fromConfig: (c) => ({ phrase: c.phrase || '' }),
  toPack: (c) => ({ phrase: c.phrase.trim() }),
  toConfig: (c) => ({ phrase: c.phrase.trim() }),
  valid: (c) => c.phrase.trim().length > 0,
  Body: function CounterBody({ config, setConfig }) {
    return (
      <div className="field">
        <label>איזה ביטוי סופרים? (המילה שהמרצה חוזר עליה)</label>
        <input
          className="input"
          value={config.phrase}
          onChange={(e) => setConfig({ phrase: e.target.value })}
          dir="auto"
          placeholder='למשל: "בעצם"'
          maxLength={40}
        />
        <div className="sub-screen">כל פעם שזה נאמר — כולם מקישים. המונה משותף.</div>
      </div>
    );
  },
};

const pollEditor = {
  defaultPackName: 'הסקר שלי',
  empty: () => ({ question: '', options: ['', ''] }),
  fromPack: (p) => ({ question: p.question || '', options: (p.options && p.options.length ? p.options : ['', '']).slice() }),
  fromConfig: (c) => ({ question: c.question || '', options: (c.options && c.options.length ? c.options : ['', '']).slice() }),
  toPack: (c) => ({ question: c.question.trim(), options: c.options.map((o) => o.trim()).filter(Boolean) }),
  toConfig: (c) => ({ question: c.question.trim(), options: c.options.map((o) => o.trim()).filter(Boolean) }),
  valid: (c) => c.question.trim().length > 0 && c.options.map((o) => o.trim()).filter(Boolean).length >= 2,
  Body: function PollBody({ config, setConfig }) {
    function setOpt(i, v) {
      const options = config.options.slice();
      options[i] = v;
      setConfig({ ...config, options });
    }
    function addOpt() { if (config.options.length < 8) setConfig({ ...config, options: [...config.options, ''] }); }
    function removeOpt(i) { if (config.options.length > 2) setConfig({ ...config, options: config.options.filter((_, k) => k !== i) }); }
    return (
      <>
        <div className="field">
          <label>השאלה</label>
          <input className="input" value={config.question} onChange={(e) => setConfig({ ...config, question: e.target.value })} dir="auto" placeholder="מה יותר חשוב לפני בוחן?" />
        </div>
        <div className="field">
          <label>אפשרויות (2–8)</label>
          {config.options.map((opt, i) => (
            <div className="opt-row" key={i}>
              <input className="input" value={opt} onChange={(e) => setOpt(i, e.target.value)} dir="auto" placeholder={`אפשרות ${i + 1}`} />
              {config.options.length > 2 && <button className="opt-x" onClick={() => removeOpt(i)} aria-label="הסרה">×</button>}
            </div>
          ))}
          {config.options.length < 8 && <button className="btn ghost" style={{ minHeight: 42, padding: 10 }} onClick={addOpt}>+ אפשרות</button>}
        </div>
      </>
    );
  },
};

const blankQuestion = () => ({ q: '', options: ['', '', '', ''], correct: 0 });
const cleanQuestions = (qs) => qs
  .map((q) => ({ q: (q.q || '').trim(), options: q.options.map((o) => (o || '').trim()).filter(Boolean), correct: q.correct | 0 }))
  .filter((q) => q.q && q.options.length >= 2)
  .map((q) => ({ ...q, correct: Math.min(q.correct, q.options.length - 1) }));

const triviaEditor = {
  defaultPackName: 'החידון שלי',
  empty: () => ({ questions: [blankQuestion()] }),
  fromPack: (p) => ({ questions: (p.questions && p.questions.length ? p.questions : [blankQuestion()]).map((q) => ({ q: q.q || '', options: [...(q.options || []), '', '', '', ''].slice(0, Math.max(4, (q.options || []).length)), correct: q.correct | 0 })) }),
  fromConfig: function (c) { return this.fromPack(c); },
  toPack: (c) => ({ questions: cleanQuestions(c.questions) }),
  toConfig: (c) => ({ questions: cleanQuestions(c.questions) }),
  valid: (c) => cleanQuestions(c.questions).length >= 1,
  Body: function TriviaBody({ config, setConfig }) {
    function patch(qi, fn) {
      const questions = config.questions.map((q, i) => (i === qi ? fn(q) : q));
      setConfig({ questions });
    }
    function addQ() { setConfig({ questions: [...config.questions, blankQuestion()] }); }
    function removeQ(qi) { if (config.questions.length > 1) setConfig({ questions: config.questions.filter((_, i) => i !== qi) }); }
    return (
      <div className="field">
        <label>שאלות · סמנו את התשובה הנכונה (◯)</label>
        {config.questions.map((q, qi) => (
          <div className="q-card" key={qi}>
            <div className="opt-row">
              <input className="input" value={q.q} onChange={(e) => patch(qi, (x) => ({ ...x, q: e.target.value }))} dir="auto" placeholder={`שאלה ${qi + 1}`} />
              {config.questions.length > 1 && <button className="opt-x" onClick={() => removeQ(qi)} aria-label="הסרת שאלה">×</button>}
            </div>
            {q.options.map((opt, oi) => (
              <label className={`q-opt${q.correct === oi ? ' is-correct' : ''}`} key={oi}>
                <input type="radio" name={`correct-${qi}`} checked={q.correct === oi} onChange={() => patch(qi, (x) => ({ ...x, correct: oi }))} />
                <input className="input" value={opt} onChange={(e) => patch(qi, (x) => ({ ...x, options: x.options.map((o, k) => (k === oi ? e.target.value : o)) }))} dir="auto" placeholder={`תשובה ${oi + 1}`} />
              </label>
            ))}
          </div>
        ))}
        <button className="btn ghost" style={{ minHeight: 42, padding: 10 }} onClick={addQ}>+ שאלה</button>
      </div>
    );
  },
};

const EDITORS = {
  bingo: bingoEditor,
  counter: counterEditor,
  poll: pollEditor,
  trivia: triviaEditor,
};
