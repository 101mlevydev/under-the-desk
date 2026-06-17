/* Same-device seat bot for the Poll: casts one vote for a random option a short, human-ish moment
   after the question appears, so the "X הצביעו" counter ticks up live during the demo. */
export function createPollBot(seat) {
  let timer = null;
  let stopped = false;
  let voted = false;

  const off = seat.onMessage((msg) => {
    if (msg.t === 'poll' && (msg.options || []).length && !msg.revealed) {
      voted = false;
      if (timer) clearTimeout(timer);
      const pick = Math.floor(Math.random() * msg.options.length);
      timer = setTimeout(() => {
        if (!stopped && !voted) { voted = true; seat.send({ t: 'vote', option: pick }); }
      }, 700 + Math.random() * 2600);
    }
  });

  return function stop() {
    stopped = true;
    if (timer) clearTimeout(timer);
    off();
  };
}
