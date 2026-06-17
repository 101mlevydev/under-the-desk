/* Throwaway harness (Step 04 verify): two virtual players over LoopbackTransport.
   join → roster updates → start → end, all host-authoritative, zero networking.
   Run: node src/transport/__harness.mjs */
import { createLoopbackHub } from './LoopbackTransport.js';
import { HostRoom } from '../rooms/HostRoom.js';
import { JoinRoom } from '../rooms/JoinRoom.js';

const log = (...a) => console.log(...a);
let pass = true;
const assert = (c, m) => { if (!c) { pass = false; console.error('  ✗ FAIL:', m); } else log('  ✓', m); };

const hub = createLoopbackHub();
const host = new HostRoom(hub._host, { hostName: 'מיכל' });

// host self-player observes broadcasts
const hostRosters = [];
const hostEvents = [];
const self = host.selfLink();
self.onMessage((m) => {
  if (m.t === 'roster') hostRosters.push(m.players.map((p) => p.name));
  else hostEvents.push(m);
});

// a dummy game logic to prove host-authoritative flow
function dummyLogic(config, ctx) {
  let total = 0;
  return {
    start() { ctx.broadcast({ t: 'state', total }); },
    onInput(from, msg) {
      if (msg.t === 'tick') {
        total += 1;
        ctx.broadcast({ t: 'state', total });
        if (total >= config.target) ctx.end({ total, winner: from });
      }
    },
    snapshot() { return { t: 'state', total }; },
  };
}

// two virtual joiners
const tDana = hub.addJoiner({ name: '' });
const tIdo = hub.addJoiner({ name: '' });
const dana = new JoinRoom(tDana, { name: 'דנה' });
const ido = new JoinRoom(tIdo, { name: 'עידו' });

const danaEvents = [];
dana.onMessage((m) => danaEvents.push(m));

log('— join —');
dana.join();
ido.join();
const lastRoster = hostRosters[hostRosters.length - 1];
assert(lastRoster && lastRoster.length === 3, `roster has host + 2 joiners (got ${lastRoster})`);
assert(lastRoster.includes('דנה') && lastRoster.includes('עידו'), 'joiner names present');

log('— start —');
host.startGame('demo', { target: 3 }, dummyLogic);
assert(hostEvents.some((e) => e.t === 'start' && e.game === 'demo'), 'start broadcast received by host self');
assert(danaEvents.some((e) => e.t === 'start'), 'start broadcast received by joiner');

log('— play (host-authoritative count) —');
dana.send({ t: 'tick' });
ido.send({ t: 'tick' });
self.send({ t: 'tick' }); // host is also a player; this should hit target and end
const lastState = [...hostEvents].reverse().find((e) => e.t === 'state');
assert(lastState && lastState.total === 3, `authoritative total = 3 (got ${lastState && lastState.total})`);

log('— end —');
const end = hostEvents.find((e) => e.t === 'end');
assert(end && end.results.total === 3, 'end broadcast with authoritative results');
assert(danaEvents.some((e) => e.t === 'end'), 'joiner received end');

log('— leave —');
const before = host.getRoster().length;
ido.leave();
assert(host.getRoster().length === before - 1, 'roster shrinks on leave');

log(pass ? '\nHARNESS PASS ✓' : '\nHARNESS FAIL ✗');
process.exit(pass ? 0 : 1);
