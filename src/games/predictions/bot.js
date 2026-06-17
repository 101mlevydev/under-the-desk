/* Same-device seat bot for Predictions: locks a random guess on every prompt shortly after they
   appear, so the "סיימו לנחש" progress climbs during the demo. Bots never lock the round or mark
   outcomes — only the host does that. */
export function createPredictionsBot(seat) {
  let timer = null;
  let stopped = false;

  const off = seat.onMessage((msg) => {
    if (msg.t === 'prompts' && (msg.items || []).length && msg.phase === 'predicting') {
      const items = msg.items;
      items.forEach((it, i) => {
        const opt = Math.floor(Math.random() * it.options.length);
        timer = setTimeout(() => {
          if (!stopped) seat.send({ t: 'predict', index: i, option: opt });
        }, 600 + Math.random() * 3200 + i * 200);
      });
    }
  });

  return function stop() {
    stopped = true;
    if (timer) clearTimeout(timer);
    off();
  };
}
