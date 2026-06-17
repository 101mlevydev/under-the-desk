/* Authoritative Predictions ("ניחושים"). Players lock a guess on each prompt BEFORE outcomes are
   known; the host then closes guessing ("נעילה") and, as the lecture/event plays out, marks the
   actual outcome of each prompt. Score = number of correct predictions. No stakes — bragging
   rights only. The host owns the prompt set + the official outcomes (no client trust). */
export function createPredictionsHostLogic(config, ctx) {
  const items = (config.items || [])
    .map((it) => ({ text: String(it.text || ''), options: (it.options && it.options.length >= 2 ? it.options.map(String) : ['כן', 'לא']) }))
    .filter((it) => it.text);
  const preds = new Map(); // playerId -> { [index]: optionIndex }
  const actual = items.map(() => null); // index -> outcome optionIndex (or null = not yet marked)
  let phase = 'predicting'; // predicting | locked

  function ready() {
    let n = 0;
    for (const m of preds.values()) if (Object.keys(m).length >= items.length) n += 1;
    return n;
  }

  return {
    start() {
      ctx.broadcast({ t: 'prompts', items, phase, actual: actual.slice() });
    },
    snapshot() {
      return { t: 'prompts', items, phase, actual: actual.slice() };
    },
    onInput(fromId, msg) {
      if (msg.t === 'predict') {
        if (phase !== 'predicting') return;
        const i = msg.index | 0;
        const opt = msg.option | 0;
        if (i < 0 || i >= items.length || opt < 0 || opt >= items[i].options.length) return;
        if (!preds.has(fromId)) preds.set(fromId, {});
        preds.get(fromId)[i] = opt;
        ctx.broadcast({ t: 'progress', ready: ready(), total: ctx.getPlayers().length });
      } else if (msg.t === 'lock') {
        if (phase !== 'predicting') return;
        phase = 'locked';
        ctx.broadcast({ t: 'locked' });
      } else if (msg.t === 'outcome') {
        if (phase !== 'locked') return;
        const i = msg.index | 0;
        const opt = msg.option | 0;
        if (i < 0 || i >= items.length || opt < 0 || opt >= items[i].options.length) return;
        actual[i] = opt;
        ctx.broadcast({ t: 'outcomes', actual: actual.slice() });
      } else if (msg.t === 'finish') {
        finish();
      }
    },
    stop() {},
  };

  function scoreFor(pid) {
    const m = preds.get(pid) || {};
    let correct = 0;
    for (let i = 0; i < items.length; i++) if (actual[i] != null && m[i] === actual[i]) correct += 1;
    return correct;
  }

  function finish() {
    const decided = actual.filter((a) => a != null).length;
    const list = ctx.getPlayers()
      .map((p) => ({ id: p.id, name: p.name, color: p.color, pts: scoreFor(p.id) }))
      .sort((a, b) => b.pts - a.pts);
    const top = list[0];
    ctx.end({
      banner: 'הנביא/ה',
      sub: top && top.pts > 0 ? `${top.name} צדק${top.name.trim().endsWith('ה') ? 'ה' : ''} ב-${top.pts}` : 'אף ניחוש לא צלח',
      scores: list.map((s) => ({ id: s.id, name: s.name, color: s.color, pts: s.pts, detail: `${s.pts}/${decided || items.length}` })),
      winnerId: top && top.pts > 0 ? top.id : null,
    });
  }
}
