/* Authoritative live Poll ("מי צודק"). The host owns the question + options; each player casts a
   single locked vote (re-votes are ignored). While voting is open everyone sees only how many have
   voted — the distribution is hidden until the host reveals it, so there's a real "drumroll" beat.
   Results present the options as a ranked board (the winning option wears the crown). */
export function createPollHostLogic(config, ctx) {
  const question = (config.question || 'מה דעתכם?').toString();
  const options = (config.options || []).map((o) => String(o)).filter((o) => o.trim()).slice(0, 8);
  const votes = new Map(); // playerId -> option index
  let revealed = false;

  function counts() {
    const c = options.map(() => 0);
    for (const idx of votes.values()) if (idx >= 0 && idx < c.length) c[idx] += 1;
    return c;
  }

  return {
    start() {
      ctx.broadcast({ t: 'poll', question, options, total: 0, revealed: false });
    },
    snapshot() {
      return { t: 'poll', question, options, total: votes.size, revealed, counts: revealed ? counts() : null };
    },
    onInput(fromId, msg) {
      if (msg.t === 'vote') {
        if (revealed || votes.has(fromId)) return;
        const idx = msg.option | 0;
        if (idx < 0 || idx >= options.length) return;
        votes.set(fromId, idx);
        ctx.broadcast({ t: 'voted', total: votes.size, lastBy: fromId });
      } else if (msg.t === 'reveal') {
        if (revealed) return;
        revealed = true;
        ctx.broadcast({ t: 'revealed', counts: counts(), total: votes.size });
      } else if (msg.t === 'finish') {
        finish();
      }
    },
    stop() {},
  };

  function finish() {
    const c = counts();
    const total = votes.size || 1;
    const ranked = options
      .map((label, i) => ({ id: `opt${i}`, name: label, idx: i, votes: c[i] }))
      .sort((a, b) => b.votes - a.votes);
    const top = ranked[0];
    ctx.end({
      banner: 'התוצאות',
      sub: top && top.votes > 0 ? `הכי הרבה: ${top.name}` : 'אף אחד לא הצביע',
      scores: ranked.map((r) => ({
        id: r.id,
        name: r.name,
        color: 'var(--poll)',
        pts: r.votes,
        detail: `${r.votes} · ${Math.round((r.votes / total) * 100)}%`,
      })),
      winnerId: top && top.votes > 0 ? top.id : null,
    });
  }
}
