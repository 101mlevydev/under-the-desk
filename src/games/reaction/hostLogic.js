/* Authoritative Reaction Race. Host arms each round, waits a random delay, fires "עכשיו!",
   timestamps tap arrivals (the host clock is the source of truth → no client cheating), and
   penalizes taps that land before "go". Best-of-N decides the match. */
export function createReactionHostLogic(config, ctx) {
  const totalRounds = config.rounds || 3;
  let round = 0;
  let goId = 0;
  let goTime = 0;
  let phase = 'idle'; // idle | armed | go | resolved
  let arrivals = new Map(); // id -> ms
  let penalized = new Set();
  const wins = new Map();
  const bestMs = new Map();
  const timers = new Set();

  function later(fn, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  }
  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  }

  function armRound() {
    round += 1;
    goId += 1;
    phase = 'armed';
    arrivals = new Map();
    penalized = new Set();
    ctx.broadcast({ t: 'arm', round, total: totalRounds });
    // random suspense delay
    later(fire, 1500 + Math.random() * 3000);
  }

  function fire() {
    phase = 'go';
    goTime = Date.now();
    ctx.broadcast({ t: 'go', goId });
    // cap: resolve even if someone never taps
    later(resolveRound, 2600);
  }

  function eligibleCount() {
    return ctx.getPlayers().length;
  }

  function resolveRound() {
    if (phase === 'resolved') return;
    phase = 'resolved';
    clearTimers();
    const players = ctx.getPlayers();
    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    const order = [...arrivals.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([id, ms]) => ({ id, name: byId[id] ? byId[id].name : '?', ms }));
    const winnerId = order.length ? order[0].id : null;
    if (winnerId) wins.set(winnerId, (wins.get(winnerId) || 0) + 1);
    for (const { id, ms } of order) {
      if (!bestMs.has(id) || ms < bestMs.get(id)) bestMs.set(id, ms);
    }
    ctx.broadcast({
      t: 'roundresult',
      round,
      order,
      penalized: [...penalized],
      winnerId,
      scores: scoreList(players),
    });
    if (round >= totalRounds) {
      later(finish, 2400);
    } else {
      later(armRound, 2600);
    }
  }

  function scoreList(players) {
    return players
      .map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        wins: wins.get(p.id) || 0,
        best: bestMs.get(p.id) || null,
      }))
      .sort((a, b) => b.wins - a.wins || (a.best || 9e9) - (b.best || 9e9));
  }

  function finish() {
    const players = ctx.getPlayers();
    const list = scoreList(players);
    const top = list[0];
    ctx.end({
      banner: 'מהיר!',
      sub: top ? `${top.name} — ${top.wins} נצחונות` : '',
      scores: list.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        pts: s.wins,
        detail: `${s.wins} • ${s.best != null ? s.best + 'ms' : '—'}`,
      })),
      winnerId: top ? top.id : null,
    });
  }

  return {
    start() {
      armRound();
    },
    snapshot() {
      return { t: 'arm', round: round || 1, total: totalRounds };
    },
    onInput(fromId, msg) {
      if (msg.t !== 'tap') return;
      if (phase === 'armed') {
        // jumped the gun
        penalized.add(fromId);
        ctx.broadcast({ t: 'falsestart', id: fromId });
      } else if (phase === 'go' && msg.goId === goId && !arrivals.has(fromId) && !penalized.has(fromId)) {
        arrivals.set(fromId, Date.now() - goTime);
        if (arrivals.size + penalized.size >= eligibleCount()) resolveRound();
      }
    },
    stop() {
      clearTimers();
    },
  };
}
