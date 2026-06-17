/* Authoritative Event Counter. The host owns the running total and every player's tally, so the
   number on screen is the same for everyone (no double-count, no drift). Each tap is a {t:'tap'}
   input; the host increments, broadcasts the new total + per-player tally, and fires a celebration
   on every 10th hit. The host ends the round on demand → results are each player's contribution. */
export function createCounterHostLogic(config, ctx) {
  const phrase = (config.phrase || '').toString().trim() || 'זה';
  const counts = new Map(); // playerId -> number of taps
  let total = 0;

  function tally() {
    const players = ctx.getPlayers();
    return players
      .map((p) => ({ id: p.id, name: p.name, color: p.color, n: counts.get(p.id) || 0 }))
      .sort((a, b) => b.n - a.n);
  }

  return {
    start() {
      ctx.broadcast({ t: 'state', phrase, total, tally: tally() });
    },
    snapshot() {
      return { t: 'state', phrase, total, tally: tally() };
    },
    onInput(fromId, msg) {
      if (msg.t === 'tap') {
        counts.set(fromId, (counts.get(fromId) || 0) + 1);
        total += 1;
        ctx.broadcast({ t: 'count', total, by: fromId, tally: tally() });
        if (total % 10 === 0) ctx.broadcast({ t: 'milestone', total });
      } else if (msg.t === 'finish') {
        finish();
      }
    },
    stop() {},
  };

  function finish() {
    const list = tally();
    const top = list[0];
    ctx.end({
      banner: total ? `${total}×` : 'סיום',
      sub: `"${phrase}" נספר ${total} פעמים`,
      scores: list.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        pts: s.n,
        detail: `${s.n}`,
      })),
      winnerId: top && top.n > 0 ? top.id : null,
    });
  }
}
