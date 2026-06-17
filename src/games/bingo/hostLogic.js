import { buildCard, LINE_BY_ID, LINES, FREE } from './card.js';

/* Authoritative Bingo brain. Tracks each player's marks (the host re-derives each player's
   card from seed+id, so a claimed line is verified independently — no trust in the client).
   Broadcasts presence ("3 שחקנים סימנו …") and the verified win. */
export function createBingoHostLogic(config, ctx) {
  const words = (config.words || []).filter((w) => w && String(w).trim());
  const seed = (config.seed != null ? config.seed : (Math.random() * 1e9) | 0) >>> 0;
  const marks = new Map(); // playerId -> Set of positions
  const wordPlayers = new Map(); // word -> Set of playerIds
  const cards = new Map(); // playerId -> derived card (lazy)
  let winner = null;
  let endTimer = null;

  function cardFor(pid) {
    if (!cards.has(pid)) cards.set(pid, buildCard(words, seed, pid));
    return cards.get(pid);
  }
  function ensure(pid) {
    if (!marks.has(pid)) marks.set(pid, new Set([FREE]));
    return marks.get(pid);
  }
  function linesFor(pid) {
    const m = ensure(pid);
    return LINES.filter((l) => l.cells.every((c) => m.has(c))).length;
  }

  function finish(fromId) {
    winner = fromId;
    const players = ctx.getPlayers();
    const wp = players.find((p) => p.id === fromId);
    ctx.broadcast({ t: 'win', winnerId: fromId, winner: wp ? wp.name : 'מישהו' });
    // let the "בינגו!" beat land, then settle to results
    endTimer = setTimeout(() => {
      const scores = players
        .map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          pts: linesFor(p.id),
          detail: p.id === fromId ? 'בינגו' : `${linesFor(p.id)} שורות`,
        }))
        .sort((a, b) => (a.id === fromId ? -1 : b.id === fromId ? 1 : b.pts - a.pts));
      ctx.end({ banner: 'בינגו!', sub: `${wp ? wp.name : 'מישהו'} השלימ${nuTail(wp)} שורה`, scores, winnerId: fromId });
    }, 1900);
  }

  return {
    start() {
      ctx.broadcast({ t: 'state', seed, words, winnerId: null });
    },
    snapshot() {
      return { t: 'state', seed, words, winnerId: winner };
    },
    onInput(fromId, msg) {
      if (winner) return;
      if (msg.t === 'mark') {
        const s = ensure(fromId);
        const card = cardFor(fromId);
        const word = card[msg.cell] && !card[msg.cell].free ? card[msg.cell].word : null;
        if (msg.on) {
          s.add(msg.cell);
          if (word) {
            if (!wordPlayers.has(word)) wordPlayers.set(word, new Set());
            wordPlayers.get(word).add(fromId);
            ctx.broadcast({ t: 'presence', word, count: wordPlayers.get(word).size });
          }
        } else if (msg.cell !== FREE) {
          s.delete(msg.cell);
          if (word && wordPlayers.has(word)) wordPlayers.get(word).delete(fromId);
        }
      } else if (msg.t === 'claim') {
        const s = ensure(fromId);
        const cells = LINE_BY_ID[msg.line];
        if (cells && cells.every((c) => s.has(c) || c === FREE)) {
          finish(fromId);
        } else {
          ctx.broadcast({ t: 'reject', to: fromId });
        }
      }
    },
    stop() {
      if (endTimer) clearTimeout(endTimer);
    },
  };
}

function nuTail(p) {
  // crude gender-neutral verb tail; names ending in ה default to feminine "ה".
  return p && p.name && p.name.trim().endsWith('ה') ? 'ה' : '';
}
