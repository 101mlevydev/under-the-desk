import { createLoopbackHub } from '../transport/LoopbackTransport.js';
import { HostRoom } from './HostRoom.js';
import { JoinRoom } from './JoinRoom.js';

/* RoomController — owns the transport + room for a session and exposes a uniform surface to
   React. In same-device (loopback) mode it can also seed virtual "seats" (other players on the
   one device) so games feel alive. PeerJS host/join is wired in Steps 08–09 by swapping the
   transport here; nothing else changes. */

export class RoomController {
  constructor({ mode = 'loopback', me, roomCode = null } = {}) {
    this.mode = mode;
    this.me = me || { id: 'host', name: 'מנחה', color: 'var(--bingo)' };
    this.roomCode = roomCode;
    this.role = 'host';

    // Loopback host (peerjs swaps the transport in Step 08).
    this.hub = createLoopbackHub();
    this.host = new HostRoom(this.hub._host, {
      hostId: 'host',
      hostName: this.me.name || 'מנחה',
      color: this.me.color,
    });
    this.link = this.host.selfLink();
    this.seats = []; // virtual JoinRooms (same-device extra players)
    this._seeded = false;
    this._botStops = [];
  }

  /* Seed a small table of same-device companions so games feel multiplayer on one phone. */
  seedDemoSeats() {
    if (this._seeded || this.mode !== 'loopback') return;
    this._seeded = true;
    const table = [
      { name: 'דנה', color: 'var(--poll)' },
      { name: 'עידו', color: 'var(--counter)' },
      { name: 'נועה', color: 'var(--trivia)' },
    ];
    table.forEach((s) => this.addSeat(s));
  }

  startBots(createBot, config) {
    this.stopBots();
    if (!createBot) return;
    this._botStops = this.seats.map((s) => createBot(s, config)).filter(Boolean);
  }

  stopBots() {
    this._botStops.forEach((f) => f && f());
    this._botStops = [];
  }

  /* Add a same-device seat (a virtual player on this one device). Returns its JoinRoom so a
     game's host logic can drive it (e.g. a bot tap) through the real Transport path. */
  addSeat({ id, name, color }) {
    const t = this.hub.addJoiner({ id, name });
    const jr = new JoinRoom(t, { name, color });
    jr.join();
    this.seats.push(jr);
    return jr;
  }

  clearSeats() {
    this.seats.forEach((s) => s.destroy());
    this.seats = [];
  }

  startGame(gameId, config, hostLogicFactory) {
    this.host.startGame(gameId, config, hostLogicFactory);
  }

  endGame(results) {
    this.host.endGame(results);
  }

  getRoster() {
    return this.host.getRoster();
  }
  onRoster(cb) {
    return this.host.onRoster(cb);
  }
  onPeerLeft(cb) {
    return this.host.onPeerLeft(cb);
  }

  destroy() {
    this.stopBots();
    this.clearSeats();
    this.host.destroy();
  }
}
