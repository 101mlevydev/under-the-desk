/* Same-device seat bot for the Event Counter: taps every so often so the shared total climbs
   and the room feels populated. Each bot has its own cadence; none of them ever ends the round
   (only the host does that), so the demo stays in the host's hands. */
export function createCounterBot(seat) {
  let timer = null;
  let stopped = false;
  const cadence = 2600 + Math.random() * 4200; // this bot's tap rhythm (ms)

  function schedule() {
    if (stopped) return;
    timer = setTimeout(() => {
      if (stopped) return;
      seat.send({ t: 'tap' });
      schedule();
    }, cadence * (0.6 + Math.random() * 0.8));
  }
  schedule();

  return function stop() {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
