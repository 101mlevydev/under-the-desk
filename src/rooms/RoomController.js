import { createLoopbackHub } from '../transport/LoopbackTransport.js';
import { PeerJSHostTransport, PeerJSJoinerTransport } from '../transport/PeerJSTransport.js';
import { generateCode } from '../transport/roomCode.js';
import { HostRoom } from './HostRoom.js';
import { JoinRoom } from './JoinRoom.js';

/* RoomController — owns the transport + room for one session and exposes a uniform surface to
   React, regardless of role/mode:
     - host + loopback : same-device (the floor); seeds companion seats + bots
     - host + peerjs   : opens a 6-char room over the broker; real joiners connect
     - join + peerjs   : connects to a host by code
   `link` is always a PlayerLink ({ send, onMessage }) the games consume identically. */
export class RoomController {
  constructor({ mode = 'loopback', role = 'host', me, roomCode = null, onStatus = () => {} } = {}) {
    this.mode = mode;
    this.role = role;
    this.me = me || { id: 'host', name: 'מנחה', color: 'var(--bingo)' };
    this.roomCode = roomCode;
    this.status = mode === 'loopback' ? 'connected' : 'idle';
    this._onStatus = onStatus;
    this.seats = [];
    this._seeded = false;
    this._botStops = [];

    if (role === 'host') {
      if (mode === 'peerjs') {
        this.transport = new PeerJSHostTransport(roomCode || generateCode(), {
          onStatus: (s, r) => this._status(s, r),
          onCodeChange: (c) => { this.roomCode = c; },
        });
      } else {
        this.hub = createLoopbackHub();
        this.transport = this.hub._host;
      }
      this.host = new HostRoom(this.transport, {
        hostId: 'host',
        hostName: this.me.name || 'מנחה',
        color: this.me.color,
      });
      this.link = this.host.selfLink();
    } else {
      this.transport = new PeerJSJoinerTransport(roomCode, {
        onStatus: (s, r) => this._status(s, r),
      });
      this.joinRoom = new JoinRoom(this.transport, { name: this.me.name, color: this.me.color });
      this.link = this.joinRoom;
    }
  }

  _status(status, reason) {
    this.status = status;
    if (this.role === 'join' && status === 'connected') {
      // announce ourselves to the host once the data channel is open
      this.joinRoom.join();
    }
    this._onStatus(status, reason);
  }

  getInitialRoster() {
    return this.host ? this.host.getRoster() : [];
  }

  // ---- same-device companions (loopback only) ----
  seedDemoSeats() {
    if (this._seeded || this.mode !== 'loopback' || !this.hub) return;
    this._seeded = true;
    [
      { name: 'דנה', color: 'var(--poll)' },
      { name: 'עידו', color: 'var(--counter)' },
      { name: 'נועה', color: 'var(--trivia)' },
    ].forEach((s) => this.addSeat(s));
  }

  addSeat({ id, name, color }) {
    const t = this.hub.addJoiner({ id, name });
    const jr = new JoinRoom(t, { name, color });
    jr.join();
    this.seats.push(jr);
    return jr;
  }

  startBots(createBot, config) {
    this.stopBots();
    if (!createBot || this.mode !== 'loopback') return;
    this._botStops = this.seats.map((s) => createBot(s, config)).filter(Boolean);
  }

  stopBots() {
    this._botStops.forEach((f) => f && f());
    this._botStops = [];
  }

  // ---- game lifecycle (host only) ----
  startGame(gameId, config, hostLogicFactory) {
    if (this.host) this.host.startGame(gameId, config, hostLogicFactory);
  }
  endGame(results) {
    if (this.host) this.host.endGame(results);
  }

  destroy() {
    this.stopBots();
    this.seats.forEach((s) => s.destroy());
    this.seats = [];
    if (this.host) this.host.destroy();
    else if (this.transport && this.transport.destroy) this.transport.destroy();
  }
}
