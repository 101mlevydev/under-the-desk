import React, { useEffect, useState } from 'react';
import QrCode from '../components/QrCode.jsx';
import { Roster } from '../components/InvitePanel.jsx';
import { buildJoinLink } from '../transport/roomCode.js';
import { useStore } from '../state/store.jsx';

/* מצב מקרן — the host's big-screen spectator layout (classroom virality). Players still join on
   their phones; this is what the room sees on the projector: a giant join CODE + QR + live
   roster pinned in a rail, with the main stage (gather hero or the live game board) beside it.
   Gated to host + wide viewport by useWideHost(); the phone layout is never touched. */

export function useWideHost(minWidth = 900) {
  const { state } = useStore();
  const isHost = state.role !== 'join';
  const [wide, setWide] = useState(() => measure(minWidth));
  useEffect(() => {
    const onResize = () => setWide(measure(minWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [minWidth]);
  return isHost && wide;
}

function measure(minWidth) {
  return typeof window !== 'undefined' && window.innerWidth >= minWidth;
}

/* The pinned side rail: code + QR + link + roster. Shared by the gather + in-game projector. */
export function ProjectorRail({ code, roster, freshId, compact = false }) {
  const link = code ? buildJoinLink(code) : '';
  return (
    <aside className={`proj-rail${compact ? ' compact' : ''}`}>
      <div className="proj-join">
        <div className="proj-join-cap">הצטרפו עכשיו · מתחת לשולחן 🤫</div>
        <div className="proj-code" dir="ltr">{code || '••••••'}</div>
        <div className="proj-join-sub">היכנסו לאתר והקלידו את הקוד</div>
      </div>
      <div className="proj-qr">{code ? <QrCode value={link} size={compact ? 132 : 188} /> : null}</div>
      <div className="proj-link" dir="ltr">{link.replace(/^https?:\/\//, '')}</div>
      <div className="proj-roster">
        <Roster roster={roster} freshId={freshId} />
      </div>
    </aside>
  );
}

/* Gather screen projector: a hero "join us" panel beside the rail, with the host's start control. */
export function ProjectorInvite({ onStart, canStart }) {
  const { state } = useStore();
  const count = state.roster.length;
  return (
    <div className="proj-wrap">
      <ProjectorRail code={state.roomCode} roster={state.roster} freshId={state.freshJoinId} />
      <main className="proj-stage gather">
        <div className="proj-badge">🤫</div>
        <div className="proj-title">מתחת <span className="u">לשולחן</span></div>
        <div className="proj-tag">משחקים קטנים. הרצאה אחת ארוכה. הם לא ישימו לב.</div>
        <div className={`proj-count${count ? ' live' : ''}`}>
          <span className="n">{count}</span>
          <span className="lbl">{count === 1 ? 'שחקן/ית בחדר' : 'שחקנים בחדר'}</span>
        </div>
        <button className="btn primary proj-start" onClick={onStart} disabled={!canStart}>
          התחל ▸
        </button>
        <div className="proj-hint">סורקים את ה-QR או מקלידים את הקוד — מצטרפים מהטלפון</div>
      </main>
    </div>
  );
}

/* In-game projector: the live board on the big stage, the rail pinned so latecomers can still join. */
export function ProjectorGame({ children }) {
  const { state } = useStore();
  return (
    <div className="proj-wrap game">
      <main className="proj-stage board">{children}</main>
      <ProjectorRail code={state.roomCode} roster={state.roster} freshId={state.freshJoinId} compact />
    </div>
  );
}
