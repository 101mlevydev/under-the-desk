/* Authoritative Trivia ("חידון"). Questions are revealed one at a time; the host clock decides
   correctness AND speed (first answer per player is locked), so score = correct × speed — fast
   right answers beat slow ones (Kahoot-style). Between questions a live scoreboard is broadcast.
   The host advances with "הבאה"; the final question rolls into results. */

const ANSWER_WINDOW = 10000; // ms over which the speed bonus decays to zero

export function createTriviaHostLogic(config, ctx) {
  const questions = (config.questions || [])
    .map((q) => ({ q: String(q.q || ''), options: (q.options || []).map(String), correct: q.correct | 0 }))
    .filter((q) => q.q && q.options.length >= 2);
  const total = questions.length;
  const totals = new Map(); // playerId -> cumulative score
  const lastGain = new Map(); // playerId -> points from the current question
  let index = -1;
  let phase = 'idle'; // idle | question | reveal
  let qStart = 0;
  let answers = new Map(); // playerId -> { option, ms }
  let autoTimer = null;

  function scoreList() {
    const players = ctx.getPlayers();
    return players
      .map((p) => ({ id: p.id, name: p.name, color: p.color, pts: totals.get(p.id) || 0, gained: lastGain.get(p.id) || 0 }))
      .sort((a, b) => b.pts - a.pts);
  }

  function ask(i) {
    clearAuto();
    index = i;
    phase = 'question';
    answers = new Map();
    lastGain.clear();
    qStart = Date.now();
    const q = questions[i];
    ctx.broadcast({ t: 'question', index, total, q: q.q, options: q.options, scores: scoreList() });
  }

  function reveal() {
    if (phase !== 'question') return;
    clearAuto();
    phase = 'reveal';
    const q = questions[index];
    const dist = q.options.map(() => 0);
    for (const [pid, a] of answers) {
      if (a.option >= 0 && a.option < dist.length) dist[a.option] += 1;
      if (a.option === q.correct) {
        const speed = Math.max(0, 1 - a.ms / ANSWER_WINDOW);
        const pts = Math.round(500 + 500 * speed);
        totals.set(pid, (totals.get(pid) || 0) + pts);
        lastGain.set(pid, pts);
      } else {
        lastGain.set(pid, 0);
      }
    }
    ctx.broadcast({ t: 'reveal', index, total, q: q.q, options: q.options, correct: q.correct, dist, scores: scoreList() });
  }

  function next() {
    if (index + 1 < total) ask(index + 1);
    else finish();
  }

  function finish() {
    const list = scoreList();
    const top = list[0];
    ctx.end({
      banner: 'חידון!',
      sub: top && top.pts > 0 ? `${top.name} — ${top.pts} נק׳` : 'אין מנצח הפעם',
      scores: list.map((s) => ({ id: s.id, name: s.name, color: s.color, pts: s.pts, detail: `${s.pts}` })),
      winnerId: top && top.pts > 0 ? top.id : null,
    });
  }

  function clearAuto() { if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; } }

  return {
    start() {
      if (!total) { finish(); return; }
      ask(0);
    },
    snapshot() {
      if (phase === 'idle' || index < 0) return { t: 'question', index: 0, total, q: questions[0] ? questions[0].q : '', options: questions[0] ? questions[0].options : [], scores: scoreList() };
      const q = questions[index];
      if (phase === 'reveal') {
        const dist = q.options.map(() => 0);
        for (const a of answers.values()) if (a.option >= 0 && a.option < dist.length) dist[a.option] += 1;
        return { t: 'reveal', index, total, q: q.q, options: q.options, correct: q.correct, dist, scores: scoreList() };
      }
      return { t: 'question', index, total, q: q.q, options: q.options, scores: scoreList() };
    },
    onInput(fromId, msg) {
      if (msg.t === 'answer') {
        if (phase !== 'question' || msg.index !== index || answers.has(fromId)) return;
        const opt = msg.option | 0;
        answers.set(fromId, { option: opt, ms: Date.now() - qStart });
        ctx.broadcast({ t: 'answered', count: answers.size });
        if (answers.size >= ctx.getPlayers().length) {
          clearAuto();
          autoTimer = setTimeout(reveal, 700);
        }
      } else if (msg.t === 'reveal') {
        reveal();
      } else if (msg.t === 'next') {
        next();
      }
    },
    stop() { clearAuto(); },
  };
}
