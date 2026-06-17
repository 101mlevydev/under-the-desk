/* Same-device seat bot for Reaction: taps a short, varied time after "עכשיו!" — never early,
   so it gives the human a real race they can win. */
export function createReactionBot(seat) {
  let timer = null;
  let stopped = false;
  const base = 280 + Math.random() * 320; // this bot's personality (ms)

  const off = seat.onMessage((msg) => {
    if (msg.t === 'go') {
      const delay = base + (Math.random() - 0.5) * 160;
      timer = setTimeout(() => {
        if (!stopped) seat.send({ t: 'tap', goId: msg.goId });
      }, Math.max(120, delay));
    }
  });

  return function stop() {
    stopped = true;
    if (timer) clearTimeout(timer);
    off();
  };
}
