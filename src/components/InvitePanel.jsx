import React from 'react';
import QrCode from './QrCode.jsx';
import { useStore } from '../state/store.jsx';
import { buildJoinLink } from '../transport/roomCode.js';

/* Kahoot-style invite: big tap-to-copy code + shareable link + QR + live "מי הצטרף" roster
   that pops on each join. */
export default function InvitePanel({ code, roster }) {
  const { state, toast } = useStore();
  const link = code ? buildJoinLink(code) : '';

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} הועתק 📋`);
    } catch {
      toast('לא הצלחנו להעתיק');
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'מתחת לשולחן', text: `הצטרפו עם הקוד ${code}`, url: link });
        return;
      } catch { /* user cancelled */ }
    }
    copy(link, 'הקישור');
  }

  return (
    <>
      <button className="codebox" onClick={() => code && copy(code, 'הקוד')} disabled={!code}>
        <div className="cap">קוד חדר — תנו לחברים להקליד</div>
        <div className="code">{code || '••••••'}</div>
        <div className="copy">הקש להעתקה · 📋</div>
      </button>

      <div className="qrwrap">
        <div className="qr">{code ? <QrCode value={link} size={96} /> : null}</div>
        <div className="qmeta">
          <b>או לסרוק</b>
          <span>שולחים בוואטסאפ? יש קישור.</span>
          <div className="link">{link.replace(/^https?:\/\//, '')}</div>
          <button className="btn dim" style={{ textAlign: 'start', padding: '6px 0' }} onClick={share}>
            <u>שיתוף הקישור</u>
          </button>
        </div>
      </div>

      <Roster roster={roster} freshId={state.freshJoinId} />
    </>
  );
}

export function Roster({ roster = [], freshId }) {
  return (
    <>
      <div className="roster-h">
        <span className="ttl">מי הצטרף</span>
        <span className="cnt">{roster.length} בחדר</span>
      </div>
      <div>
        {roster.map((p) => (
          <div className={`pill${p.isHost ? ' host' : ''}${p.id === freshId ? ' fresh' : ''}`} key={p.id}>
            <span className="av" style={p.isHost ? undefined : { background: p.color || 'var(--poll)' }}>
              {(p.name || '?').trim().charAt(0)}
            </span>
            <span dir="auto">{p.name}</span>
            <span className="role">{p.isHost ? 'מנחה' : p.id === freshId ? '🎉 הרגע הצטרף' : 'מוכן/ה'}</span>
          </div>
        ))}
      </div>
    </>
  );
}
