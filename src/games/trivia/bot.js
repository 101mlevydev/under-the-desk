/* Same-device seat bot for Trivia: answers each question after a varied delay. It doesn't get the
   correct index (never broadcast), so it guesses — a leaning toward the first couple of options
   keeps scores believable without making bots unbeatable. The human can always win. */
export function createTriviaBot(seat) {
  let timer = null;
  let stopped = false;

  const off = seat.onMessage((msg) => {
    if (msg.t === 'question' && (msg.options || []).length) {
      if (timer) clearTimeout(timer);
      const n = msg.options.length;
      // mild bias toward earlier options (often the "obvious" answer), still fallible
      const pick = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * n);
      const index = msg.index;
      timer = setTimeout(() => {
        if (!stopped) seat.send({ t: 'answer', index, option: pick });
      }, 900 + Math.random() * 4200);
    }
  });

  return function stop() {
    stopped = true;
    if (timer) clearTimeout(timer);
    off();
  };
}
