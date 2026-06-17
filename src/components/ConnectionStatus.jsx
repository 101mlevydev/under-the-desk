import React from 'react';

/* The connection state machine, surfaced plainly (ARCHITECTURE §5). On 'failed' it offers the
   same-device fallback instead of a dead-end. */
const LABELS = {
  idle: { dot: 'off', text: '—' },
  opening: { dot: 'warn', text: 'פותח חדר…' },
  waiting: { dot: 'on', text: 'מחכים לשחקנים' },
  connecting: { dot: 'warn', text: 'מתחבר…' },
  connected: { dot: 'on', text: 'מחובר' },
  'peer-left': { dot: 'warn', text: 'מישהו התנתק' },
  failed: { dot: 'off', text: 'הרשת חסומה' },
};

export function StatusPill({ status }) {
  const s = LABELS[status] || LABELS.idle;
  return (
    <span className="stealth">
      <span className={`dot ${s.dot}`} />
      {s.text}
    </span>
  );
}

export default function ConnectionStatus({ status, onFallback, onRetry }) {
  if (status !== 'failed') return null;
  return (
    <div className="banner-fallback">
      <b>הרשת חסומה כאן.</b> אפשר לשחק <u>במצב מכשיר אחד</u> — בלי רשת בכלל, אותם משחקים.
      <div className="stack" style={{ marginTop: 10 }}>
        <button className="btn primary" onClick={onFallback}>למצב מכשיר אחד 📱</button>
        {onRetry && <button className="btn dim" onClick={onRetry}>נסו שוב להתחבר</button>}
      </div>
    </div>
  );
}
