import { buildCard, FREE } from './card.js';

/* Same-device seat bot: marks cells at a human-ish pace so the board feels alive
   ("3 שחקנים סימנו …"). Bots never claim, so the human always gets the בינגו! moment. */
export function createBingoBot(seat, config) {
  let card = null;
  const unmarked = [];
  let timer = null;
  let stopped = false;

  const off = seat.onMessage((msg) => {
    if (msg.t === 'state') {
      card = buildCard(msg.words || [], msg.seed, seat.id);
      unmarked.length = 0;
      for (let i = 0; i < 25; i++) if (i !== FREE) unmarked.push(i);
      // shuffle the order a little so bots diverge
      unmarked.sort(() => Math.random() - 0.5);
      schedule();
    } else if (msg.t === 'win') {
      stop();
    }
  });

  function schedule() {
    if (stopped) return;
    timer = setTimeout(tick, 1200 + Math.random() * 2600);
  }
  function tick() {
    if (stopped || !unmarked.length) return;
    const cell = unmarked.pop();
    seat.send({ t: 'mark', cell, on: true });
    schedule();
  }
  function stop() {
    stopped = true;
    if (timer) clearTimeout(timer);
    off();
  }
  return stop;
}
